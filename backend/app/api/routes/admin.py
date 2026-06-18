from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.technician import Technician
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
