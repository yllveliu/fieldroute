from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.job import (
    JobDetailResponse,
    JobRequestCreate,
    JobRequestResponse,
    JobStatusResponse,
    JobTechnicianStatus,
    TechnicianSummary,
)
from app.services.job_service import create_job_request, get_job

router = APIRouter()


@router.post("", response_model=JobRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_job_request(payload: JobRequestCreate, db: Session = Depends(get_db)):
    """Accept a customer service request and persist it as a new job."""
    job = create_job_request(db, payload)
    return JobRequestResponse(
        job_id=job.id,
        status=job.status,
        message="Job request submitted successfully.",
    )


@router.get("/{job_id}/status", response_model=JobStatusResponse)
def get_job_status(job_id: int, db: Session = Depends(get_db)):
    """Return the current status of a job for polling-based customer tracking."""
    job = get_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    technician = None
    if job.technician is not None:
        technician = JobTechnicianStatus(
            name=job.technician.name,
            status=job.technician.status,
        )

    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        eta_message=job.eta_message,
        service=job.service.name if job.service is not None else None,
        technician=technician,
    )


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job_detail(job_id: int, db: Session = Depends(get_db)):
    """Return the rich detail for a single job."""
    job = get_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    technician = None
    if job.technician is not None:
        technician = TechnicianSummary(
            id=job.technician.id,
            name=job.technician.name,
            status=job.technician.status,
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
