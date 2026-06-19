from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.dispatcher import DispatcherJobItem
from app.schemas.job import JobDetailResponse, TechnicianSummary
from app.schemas.status_update import StatusUpdateRequest
from app.services.audit import log_job_event
from app.services.job_service import get_job

router = APIRouter()

# Allowed status transitions for a job. Terminal states map to an empty list.
ALLOWED_TRANSITIONS = {
    "new":         ["categorized", "cancelled"],
    "categorized": ["assigned",    "cancelled"],
    "assigned":    ["en_route",    "cancelled"],
    "en_route":    ["done",        "cancelled"],
    "done":        [],
    "cancelled":   [],
}


def _to_job_detail(job: Job) -> JobDetailResponse:
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


@router.get("/jobs", response_model=List[DispatcherJobItem])
def list_dispatcher_jobs(db: Session = Depends(get_db)):
    stmt = (
        select(Job)
        .options(
            selectinload(Job.customer),
            selectinload(Job.service),
            selectinload(Job.technician),
        )
        .order_by(Job.created_at.desc())
    )
    jobs = db.execute(stmt).scalars().all()

    result = []
    for job in jobs:
        result.append(
            DispatcherJobItem(
                id=job.id,
                status=job.status,
                raw_description=job.raw_description,
                eta_message=job.eta_message,
                created_at=job.created_at,
                customer=job.customer,
                service_name=job.service.name if job.service else None,
                technician=job.technician,
            )
        )
    return result


@router.patch("/jobs/{job_id}/status", response_model=JobDetailResponse)
def update_job_status(
    job_id: int,
    body: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = get_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    current, requested = job.status, body.status
    allowed = ALLOWED_TRANSITIONS.get(current, [])
    if requested not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transition: {current} → {requested}. Allowed: {allowed}",
        )

    job.status = requested
    if requested == "cancelled" and job.technician is not None:
        job.technician.status = "available"
        job.technician_id = None

    log_job_event(db, job_id, current, requested, current_user.id)
    db.commit()
    return _to_job_detail(get_job(db, job_id))
