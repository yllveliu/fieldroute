from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.part import Part
from app.schemas.part import PartResponse

router = APIRouter()


@router.get("/", response_model=List[PartResponse])
def list_parts(db: Session = Depends(get_db)):
    stmt = select(Part)
    parts = db.execute(stmt).scalars().all()
    return parts


@router.get("/{part_id}", response_model=PartResponse)
def get_part(part_id: int, db: Session = Depends(get_db)):
    stmt = select(Part).where(Part.id == part_id)
    part = db.execute(stmt).scalars().first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part
