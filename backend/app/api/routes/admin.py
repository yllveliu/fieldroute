import re

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.roles import ApplicationStatus, Role
from app.core.security import hash_password
from app.db.session import get_db
from app.models.part import Part
from app.models.technician import Technician
from app.models.user import User
from app.schemas.auth import (
    DispatcherCreateRequest,
    DispatcherUpdateRequest,
    StaffAccountResponse,
    StaffListItem,
)
from app.models.job import Job
from app.schemas.part import PartAdminResponse, PartCreateRequest, PartUpdateRequest
from app.schemas.technician import (
    TechnicianAdminResponse,
    TechnicianApplicationAdminResponse,
    TechnicianCreateRequest,
    TechnicianUpdateRequest,
)
from app.services.email_service import (
    notify_application_accepted,
    notify_application_declined,
)

router = APIRouter(dependencies=[Depends(require_role("admin"))])


def _safe_download_filename(filename: str | None, fallback: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", filename or fallback).strip("._")
    return cleaned or fallback


def _admin_response(technician: Technician) -> TechnicianAdminResponse:
    return TechnicianAdminResponse(
        id=technician.id,
        name=technician.name,
        skills=technician.skills or [],
        status=technician.status,
        is_active=technician.is_active,
    )


def _part_admin_response(part: Part) -> PartAdminResponse:
    return PartAdminResponse(
        id=part.id,
        name=part.name,
        sku=part.sku,
        stock_quantity=part.stock_quantity,
        reserved_qty=part.reserved_qty,
        low_stock_threshold=part.low_stock_threshold,
    )


@router.post(
    "/technicians",
    response_model=TechnicianAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_technician(
    payload: TechnicianCreateRequest,
    db: Session = Depends(get_db),
) -> TechnicianAdminResponse:
    existing = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Admin-created technicians are pre-approved: they get a login account and
    # full access immediately (no application review needed).
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.TECHNICIAN.value,
    )
    db.add(user)
    db.flush()  # assign user.id

    technician = Technician(
        user_id=user.id,
        name=payload.name,
        skills=payload.skills,
        status=payload.status,
        is_active=True,
        application_status=ApplicationStatus.APPROVED.value,
    )
    db.add(technician)
    db.commit()
    db.refresh(technician)
    return _admin_response(technician)


@router.patch("/technicians/{technician_id}", response_model=TechnicianAdminResponse)
def update_technician(
    technician_id: int,
    payload: TechnicianUpdateRequest,
    db: Session = Depends(get_db),
) -> TechnicianAdminResponse:
    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if value is not None:
            setattr(technician, field, value)

    db.commit()
    db.refresh(technician)
    return _admin_response(technician)


@router.delete("/technicians/{technician_id}")
def delete_technician(
    technician_id: int,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Permanently delete a technician and their login account. Past jobs are
    kept but their technician references are cleared so history stays intact."""
    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")

    # Clear FK references on jobs so the delete doesn't violate constraints and
    # job history is preserved (just unlinked from the removed technician).
    db.query(Job).filter(Job.technician_id == technician_id).update(
        {Job.technician_id: None}, synchronize_session=False
    )
    db.query(Job).filter(Job.requested_by_technician_id == technician_id).update(
        {Job.requested_by_technician_id: None}, synchronize_session=False
    )

    user = db.get(User, technician.user_id) if technician.user_id is not None else None
    db.delete(technician)
    if user is not None:
        db.delete(user)
    db.commit()

    return {"message": f"Technician {technician_id} deleted."}


@router.post(
    "/parts",
    response_model=PartAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_part(
    payload: PartCreateRequest,
    db: Session = Depends(get_db),
) -> PartAdminResponse:
    existing = db.execute(select(Part).where(Part.sku == payload.sku)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Part with SKU {payload.sku} already exists.",
        )

    part = Part(
        name=payload.name,
        sku=payload.sku,
        stock_quantity=payload.stock_quantity,
        reserved_qty=0,
        low_stock_threshold=payload.low_stock_threshold,
    )
    db.add(part)
    db.commit()
    db.refresh(part)
    return _part_admin_response(part)


@router.patch("/parts/{part_id}", response_model=PartAdminResponse)
def update_part(
    part_id: int,
    payload: PartUpdateRequest,
    db: Session = Depends(get_db),
) -> PartAdminResponse:
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if value is not None:
            setattr(part, field, value)

    db.commit()
    db.refresh(part)
    return _part_admin_response(part)


# --- Technician applications -------------------------------------------------

def _application_response(
    technician: Technician, email: str
) -> TechnicianApplicationAdminResponse:
    return TechnicianApplicationAdminResponse(
        id=technician.id,
        name=technician.name,
        email=email,
        skills=technician.skills or [],
        application_status=technician.application_status,
        ai_match_score=technician.ai_match_score,
        ai_match_summary=technician.ai_match_summary,
        cv_filename=technician.cv_filename,
        has_cv=technician.cv_data is not None,
    )


@router.get(
    "/applications",
    response_model=list[TechnicianApplicationAdminResponse],
    summary="List pending technician applications (highest AI match first)",
)
def list_applications(db: Session = Depends(get_db)):
    # Deliberately do not load cv_data here — it is fetched only on download.
    rows = db.execute(
        select(Technician, User.email)
        .join(User, Technician.user_id == User.id)
        .where(Technician.application_status == ApplicationStatus.PENDING.value)
        .order_by(Technician.ai_match_score.desc().nullslast())
    ).all()
    return [_application_response(tech, email) for tech, email in rows]


@router.get(
    "/applications/{technician_id}/cv",
    summary="Download an applicant's CV (admin only)",
)
def download_application_cv(technician_id: int, db: Session = Depends(get_db)):
    technician = db.get(Technician, technician_id)
    if technician is None or technician.cv_data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
    filename = _safe_download_filename(technician.cv_filename, f"cv-{technician_id}.pdf")
    return Response(
        content=technician.cv_data,
        media_type=technician.cv_content_type or "application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.post(
    "/applications/{technician_id}/approve",
    response_model=TechnicianAdminResponse,
    summary="Approve a technician application",
)
def approve_application(technician_id: int, db: Session = Depends(get_db)):
    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if technician.application_status != ApplicationStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This application has already been reviewed.",
        )

    technician.application_status = ApplicationStatus.APPROVED.value
    technician.is_active = True
    technician.status = "available"
    db.commit()
    db.refresh(technician)

    if technician.user is not None:
        notify_application_accepted(technician.user.email, technician.name)

    return _admin_response(technician)


@router.post(
    "/applications/{technician_id}/decline",
    summary="Decline a technician application and delete the account",
)
def decline_application(technician_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if technician.application_status != ApplicationStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This application has already been reviewed.",
        )

    # Capture details before deletion so we can still send the email.
    user = db.get(User, technician.user_id) if technician.user_id is not None else None
    email = user.email if user is not None else None
    name = technician.name

    # A declined applicant has no jobs (never approved), so deleting the
    # technician record and its login account is safe.
    db.delete(technician)
    if user is not None:
        db.delete(user)
    db.commit()

    if email is not None:
        notify_application_declined(email, name)

    return {"message": "Application declined and account removed."}


# --- Staff accounts ----------------------------------------------------------

@router.post(
    "/dispatchers",
    response_model=StaffAccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a dispatcher staff account",
)
def create_dispatcher(
    payload: DispatcherCreateRequest, db: Session = Depends(get_db)
) -> StaffAccountResponse:
    existing = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.DISPATCHER.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return StaffAccountResponse(
        user_id=user.id,
        email=user.email,
        role=user.role,
        message="Dispatcher account created.",
    )


@router.get(
    "/dispatchers",
    response_model=list[StaffListItem],
    summary="List all dispatcher accounts",
)
def list_dispatchers(db: Session = Depends(get_db)) -> list[StaffListItem]:
    users = db.execute(
        select(User).where(User.role == Role.DISPATCHER.value).order_by(User.email)
    ).scalars().all()
    return [
        StaffListItem(user_id=u.id, email=u.email, role=u.role) for u in users
    ]


@router.delete(
    "/dispatchers/{user_id}",
    summary="Delete a dispatcher account",
)
def delete_dispatcher(user_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.get(User, user_id)
    if user is None or user.role != Role.DISPATCHER.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispatcher not found")
    db.delete(user)
    db.commit()
    return {"message": "Dispatcher account deleted."}


@router.patch(
    "/dispatchers/{user_id}",
    response_model=StaffListItem,
    summary="Update a dispatcher's email and/or password",
)
def update_dispatcher(
    user_id: int,
    payload: DispatcherUpdateRequest,
    db: Session = Depends(get_db),
) -> StaffListItem:
    user = db.get(User, user_id)
    if user is None or user.role != Role.DISPATCHER.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispatcher not found")

    if payload.email is not None and payload.email != user.email:
        clash = db.execute(
            select(User).where(User.email == payload.email)
        ).scalar_one_or_none()
        if clash is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        user.email = payload.email

    if payload.password is not None:
        user.password_hash = hash_password(payload.password)

    db.commit()
    db.refresh(user)
    return StaffListItem(user_id=user.id, email=user.email, role=user.role)
