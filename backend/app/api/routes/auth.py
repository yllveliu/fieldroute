import logging
from datetime import timedelta

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import FRONTEND_URL
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.core.roles import ApplicationStatus, Role
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    unverified_reset_user_id,
    verify_password,
    verify_password_reset_token,
)
from app.db.session import get_db
from app.models.technician import Technician
from app.models.user import User
from app.schemas.auth import (
    CurrentUserResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    TechnicianApplicationResponse,
    validate_skills,
)
from app.services import cv_reviewer
from app.services.email_service import (
    notify_application_received,
    send_password_reset,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# CV upload constraints. PDF only (so the AI reviewer can read it) and capped to
# keep the in-DB blob small.
MAX_CV_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_CV_CONTENT_TYPE = "application/pdf"


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer account",
)
@limiter.limit("10/minute")
def register(
    request: Request,
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Public registration. Always creates a CUSTOMER — staff roles can never be
    self-assigned here. The customer can log in immediately, no verification."""
    existing = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.CUSTOMER.value,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return RegisterResponse(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        message="Account created successfully.",
    )


@router.post(
    "/apply",
    response_model=TechnicianApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply to work as a technician (creates a pending account)",
)
def apply_as_technician(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    skills: list[str] = Form(...),
    cv: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Submit a technician application. Creates an inactive technician account
    (application_status=pending) plus a Technician record holding the CV and an
    automatic AI suitability score. The applicant can log in to see their status
    but gains no technician access until an admin approves."""
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters.",
        )

    try:
        skills = validate_skills(skills)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )

    existing = db.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if cv.content_type != ALLOWED_CV_CONTENT_TYPE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CV must be a PDF file.",
        )
    cv_bytes = cv.file.read()
    if len(cv_bytes) > MAX_CV_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="CV must be 5 MB or smaller.",
        )
    if not cv_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CV file is empty.",
        )

    # Automatic AI review of the CV. Best-effort: a failure must not block the
    # application — the admin can still review the CV manually.
    ai_score: float | None = None
    ai_summary: str | None = None
    try:
        review = cv_reviewer.review_cv(cv_bytes, cv.content_type, skills)
        ai_score = review["match_score"]
        ai_summary = review["summary"]
    except Exception as exc:  # noqa: BLE001
        logger.warning("AI CV review failed for applicant %s: %s", email, exc)

    user = User(
        email=email,
        password_hash=hash_password(password),
        role=Role.TECHNICIAN.value,
    )
    db.add(user)
    db.flush()  # assign user.id without ending the transaction

    technician = Technician(
        user_id=user.id,
        name=name,
        skills=skills,
        status="offline",
        is_active=False,
        application_status=ApplicationStatus.PENDING.value,
        ai_match_score=ai_score,
        ai_match_summary=ai_summary,
        cv_data=cv_bytes,
        cv_filename=cv.filename,
        cv_content_type=cv.content_type,
    )
    db.add(technician)
    db.commit()
    db.refresh(user)
    db.refresh(technician)

    notify_application_received(email, name)

    return TechnicianApplicationResponse(
        user_id=user.id,
        technician_id=technician.id,
        email=user.email,
        application_status=technician.application_status,
        ai_match_score=ai_score,
        message="Application submitted. We will review your CV and email you a decision.",
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Log in and receive a JWT access token",
)
@limiter.limit("10/minute")
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    # Same generic error for wrong email and wrong password (no account enumeration).
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    application_status = (
        user.technician.application_status if user.technician is not None else None
    )

    token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=timedelta(hours=24),
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        application_status=application_status,
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Return the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    technician = current_user.technician
    return CurrentUserResponse(
        user_id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        name=technician.name if technician is not None else None,
        application_status=technician.application_status if technician is not None else None,
    )


@router.post(
    "/forgot-password",
    summary="Request a password-reset email",
)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Always returns the same response whether or not the email exists, so the
    endpoint cannot be used to discover which emails are registered."""
    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    if user is not None:
        token = create_password_reset_token(user.id, user.password_hash)
        reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
        try:
            send_password_reset(user.email, reset_url)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to send password-reset email: %s", exc)

    return {"message": "If an account exists for that email, a reset link has been sent."}


@router.post(
    "/reset-password",
    summary="Set a new password using a reset token",
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This reset link is invalid or has expired.",
    )

    user_id = unverified_reset_user_id(payload.token)
    if user_id is None:
        raise invalid

    user = db.get(User, user_id)
    if user is None:
        raise invalid

    if verify_password_reset_token(payload.token, user.password_hash) != user.id:
        raise invalid

    user.password_hash = hash_password(payload.new_password)
    db.commit()

    return {"message": "Your password has been reset. You can now log in."}
