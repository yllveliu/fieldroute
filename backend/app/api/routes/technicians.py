from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import String, cast, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.technician import Technician
from app.schemas.technician import TechnicianResponse

router = APIRouter()


@router.get("/", response_model=List[TechnicianResponse])
def list_technicians(
    skill: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    stmt = select(Technician)
    if skill:
        stmt = stmt.where(cast(Technician.skills, String).contains(skill))
    if status:
        stmt = stmt.where(Technician.status == status)
    return db.execute(stmt).scalars().all()
