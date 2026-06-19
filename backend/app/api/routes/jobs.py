import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.classify import ClassifyResponse
from app.schemas.job import (
    JobDetailResponse,
    JobRequestCreate,
    JobRequestResponse,
    JobStatusResponse,
    JobTechnicianStatus,
    TechnicianSummary,
)
from app.services.ai_classifier import classify_with_claude
from app.services.audit import log_job_event
from app.services.job_service import classify_problem, create_job_request, get_job

logger = logging.getLogger(__name__)

router = APIRouter()

# Used when the keyword fallback runs (it has no eta of its own).
_FALLBACK_ETA = "A technician will follow up to schedule a visit."


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


@router.post("/{job_id}/classify", response_model=ClassifyResponse)
def classify_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("dispatcher")),
):
    """Classify a new job with Claude, falling back to keyword rules on failure."""
    job = get_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.status != "new":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job must be in 'new' status to classify. Current status: {job.status}",
        )

    # Prefer Claude; on missing key, API error, timeout, or any other failure,
    # fall back to the KAN-31 keyword classifier so this endpoint never breaks.
    try:
        classification = classify_with_claude(job.raw_description)
        eta = classification["eta"]
    except Exception as exc:  # noqa: BLE001 — endpoint must never break
        logger.warning(
            "Claude classification failed (%s); falling back to keyword classifier",
            type(exc).__name__,
        )
        fallback = classify_problem(job.raw_description)
        classification = {
            "service_type": fallback["service_type"],
            "confidence": fallback["confidence"],
            "explanation": fallback["explanation"],
        }
        eta = _FALLBACK_ETA

    previous_status = job.status
    job.ai_service_type = classification["service_type"]
    job.ai_confidence = classification["confidence"]
    job.ai_explanation = classification["explanation"]
    job.eta_message = eta
    job.status = "categorized"
    log_job_event(db, job.id, previous_status, "categorized", current_user.id)
    db.commit()
    db.refresh(job)

    return ClassifyResponse(
        job_id=job.id,
        previous_status=previous_status,
        new_status=job.status,
        ai_service_type=job.ai_service_type,
        ai_confidence=job.ai_confidence,
        ai_explanation=job.ai_explanation,
        eta=job.eta_message,
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
