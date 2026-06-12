from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import String, cast, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.job import Job
from app.models.technician import Technician
from app.schemas.technician import TechnicianResponse

router = APIRouter()

# Job statuses that mean a technician is currently working that job.
ACTIVE_JOB_STATUSES = ("assigned", "en_route")


def _current_job_map(db: Session, technician_ids: List[int]) -> dict[int, int]:
    """Map technician_id -> active job id for the given technicians (one query)."""
    if not technician_ids:
        return {}
    stmt = (
        select(Job.technician_id, Job.id)
        .where(
            Job.technician_id.in_(technician_ids),
            Job.status.in_(ACTIVE_JOB_STATUSES),
        )
        .order_by(Job.id)
    )
    # Higher (later) job id wins if a technician somehow has more than one.
    return {tech_id: job_id for tech_id, job_id in db.execute(stmt).all()}


def _serialize(tech: Technician, current_job: Optional[int]) -> TechnicianResponse:
    return TechnicianResponse(
        id=tech.id,
        name=tech.name,
        skills=tech.skills or [],
        status=tech.status,
        current_job=current_job,
    )


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
    technicians = db.execute(stmt).scalars().all()
    job_map = _current_job_map(db, [t.id for t in technicians])
    return [_serialize(t, job_map.get(t.id)) for t in technicians]


@router.get("/{technician_id}", response_model=TechnicianResponse)
def get_technician(technician_id: int, db: Session = Depends(get_db)):
    tech = db.get(Technician, technician_id)
    if tech is None:
        raise HTTPException(status_code=404, detail="Technician not found")
    job_map = _current_job_map(db, [tech.id])
    return _serialize(tech, job_map.get(tech.id))
