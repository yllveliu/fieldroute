from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.part import Part
from app.schemas.part import PartResponse

router = APIRouter(tags=["parts"])


@router.get(
    "/",
    response_model=List[PartResponse],
    summary="List all parts",
    description="Returns the full parts inventory including stock quantities and low-stock flags. Requires dispatcher, technician, or admin role.",
)
def list_parts(db: Session = Depends(get_db)):
    stmt = select(Part)
    parts = db.execute(stmt).scalars().all()
    return parts


@router.get(
    "/{part_id}",
    response_model=PartResponse,
    summary="Get a single part",
    description="Returns the part with the given ID.",
    responses={404: {"description": "Part not found"}},
)
def get_part(part_id: int, db: Session = Depends(get_db)):
    stmt = select(Part).where(Part.id == part_id)
    part = db.execute(stmt).scalars().first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part
