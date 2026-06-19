from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.job import Job
from app.models.job_part import JobPart
from app.models.user import User
from app.schemas.job import JobDetailResponse, TechnicianSummary
from app.services.audit import log_job_event

router = APIRouter()

# Statuses a technician is allowed to set via this endpoint.
TECHNICIAN_ALLOWED_STATUSES = {"en_route", "done"}

# Valid preceding status for each target status.
TECHNICIAN_TRANSITIONS = {
    "en_route": "assigned",   # technician must have been assigned first
    "done":     "en_route",   # technician must be en route before marking done
}


class TechnicianJobStatusUpdate(BaseModel):
    status: Literal["en_route", "done"]


def _build_response(job: Job) -> JobDetailResponse:
    technician = (
        TechnicianSummary(id=job.technician.id, name=job.technician.name, status=job.technician.status)
        if job.technician is not None
        else None
    )
    return JobDetailResponse(
        id=job.id,
        status=job.status,
        service_name=job.service.name if job.service is not None else None,
        problem_description=job.raw_description,
        eta_message=job.eta_message,
        technician=technician,
        ai_service_type=job.ai_service_type,
        ai_confidence=job.ai_confidence,
        ai_explanation=job.ai_explanation,
    )


@router.patch(
    "/{job_id}/status",
    response_model=JobDetailResponse,
    summary="Update job status as a technician (en_route or done)",
)
def update_technician_job_status(
    job_id: int,
    body: TechnicianJobStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Load job with all relationships needed for response serialisation and completion logic.
    stmt = (
        select(Job)
        .where(Job.id == job_id)
        .options(
            selectinload(Job.technician),
            selectinload(Job.service),
            selectinload(Job.job_parts).selectinload(JobPart.part),
        )
    )
    job = db.execute(stmt).scalar_one_or_none()

    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    required_current = TECHNICIAN_TRANSITIONS[body.status]
    if job.status != required_current:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot set status to '{body.status}'. "
                f"Job must be '{required_current}' but is currently '{job.status}'."
            ),
        )

    previous_status = job.status
    job.status = body.status

    if body.status == "done":
        # Free the technician so they can be assigned to new jobs.
        if job.technician is not None:
            job.technician.status = "available"

        # Record actual parts used and release their reserved stock.
        for job_part in job.job_parts:
            job_part.qty_used = job_part.qty_needed
            job_part.part.reserved_qty = max(
                0, job_part.part.reserved_qty - job_part.qty_needed
            )

    log_job_event(db, job_id, previous_status, body.status, current_user.id)
    db.commit()
    db.refresh(job)

    return _build_response(job)
