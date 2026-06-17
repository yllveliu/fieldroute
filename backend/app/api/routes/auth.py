from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    CurrentUserResponse,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Hash the password and create the user
    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
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
    "/login",
    response_model=LoginResponse,
    summary="Log in and receive a JWT access token",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Look up the user by email
    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    # Use the same generic error for both wrong email and wrong password.
    # This prevents attackers from knowing whether an email is registered.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue a JWT token valid for 24 hours, as specified for this task.
    token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=timedelta(hours=24),
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Return the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return CurrentUserResponse(
        user_id=current_user.id,
        email=current_user.email,
        role=current_user.role,
    )
