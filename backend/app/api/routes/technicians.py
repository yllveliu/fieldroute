from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import String, cast, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.job import Job
from app.models.technician import Technician
from app.schemas.technician import TechnicianResponse
from app.services.skill_matching import required_skills_for

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
    exclude_job_id: Optional[int] = None,
    assignable_only: bool = False,
    db: Session = Depends(get_db),
):
    stmt = select(Technician)
    if skill:
        stmt = stmt.where(cast(Technician.skills, String).contains(skill))
    if status:
        stmt = stmt.where(Technician.status == status)
    if assignable_only:
        # Only active, approved technicians can be assigned to jobs.
        stmt = stmt.where(
            Technician.is_active.is_(True),
            Technician.application_status == "approved",
        )

    # When listing candidates for a specific job, exclude its requester and keep
    # only technicians whose skills match the job's classified service type.
    required_skills: set[str] = set()
    if exclude_job_id is not None:
        job = db.get(Job, exclude_job_id)
        if job is not None:
            if job.requested_by_technician_id is not None:
                stmt = stmt.where(Technician.id != job.requested_by_technician_id)
            required_skills = required_skills_for(job.ai_service_type)

    technicians = db.execute(stmt).scalars().all()

    if required_skills:
        # Empty required_skills means the service was general/unclassified —
        # in that case show everyone; otherwise only skill-matching technicians.
        technicians = [
            t for t in technicians
            if required_skills & {s.lower() for s in (t.skills or [])}
        ]

    job_map = _current_job_map(db, [t.id for t in technicians])
    return [_serialize(t, job_map.get(t.id)) for t in technicians]


@router.get("/{technician_id}", response_model=TechnicianResponse)
def get_technician(technician_id: int, db: Session = Depends(get_db)):
    tech = db.get(Technician, technician_id)
    if tech is None:
        raise HTTPException(status_code=404, detail="Technician not found")
    job_map = _current_job_map(db, [tech.id])
    return _serialize(tech, job_map.get(tech.id))
