from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.part import Part
from app.models.technician import Technician
from app.schemas.part import PartAdminResponse, PartCreateRequest, PartUpdateRequest
from app.schemas.technician import (
    TechnicianAdminResponse,
    TechnicianCreateRequest,
    TechnicianUpdateRequest,
)

router = APIRouter(dependencies=[Depends(require_role("dispatcher"))])


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
    technician = Technician(
        name=payload.name,
        skills=payload.skills,
        status=payload.status,
        is_active=True,
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
def deactivate_technician(
    technician_id: int,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")

    technician.is_active = False
    db.commit()

    return {"message": f"Technician {technician_id} deactivated successfully."}


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
