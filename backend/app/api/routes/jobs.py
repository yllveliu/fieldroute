import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_optional, require_role
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
from app.services.skill_matching import required_skills_for

logger = logging.getLogger(__name__)

router = APIRouter()

# Used when the keyword fallback runs (it has no eta of its own).
_FALLBACK_ETA = "A technician will follow up to schedule a visit."

def _detect_required_skills(description: str) -> set[str]:
    """Detect which company skill(s) a free-text request needs.

    Uses the Claude classifier, falling back to the keyword classifier on any
    failure, then maps the detected service category onto company skills.
    """
    try:
        service_type = classify_with_claude(description)["service_type"]
    except Exception:  # noqa: BLE001 — fall back, never break submission
        service_type = classify_problem(description)["service_type"]
    return required_skills_for(service_type)


@router.post(
    "",
    response_model=JobRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a service request",
    description=(
        "Creates a new job from a customer's free-text description. "
        "Open to all authenticated users. When submitted by a technician the system "
        "checks that the request is for a service they do **not** provide, and tags the "
        "job so that technician is excluded from the assignable list."
    ),
    responses={
        201: {"description": "Job created successfully"},
        422: {"description": "Validation error or technician submitting a job in their own trade"},
    },
)
def submit_job_request(
    payload: JobRequestCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Accept a customer service request and persist it as a new job.

    Anyone can submit. When the submitter is a technician, the AI detects the
    service the request needs and checks it against the technician's own skills:
    if it's something they provide, the request is rejected. Otherwise the job is
    tagged as requested by that technician so they won't be offered as its assignee.
    """
    requested_by_technician_id: int | None = None

    if current_user is not None and current_user.role == "technician":
        technician = current_user.technician
        if technician is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Technician account is incomplete.",
            )
        required_skills = _detect_required_skills(payload.raw_description)
        own_skills = {s.lower() for s in (technician.skills or [])}
        if required_skills & own_skills:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The request should be for a service that you as a technician cannot provide.",
            )
        requested_by_technician_id = technician.id

    job = create_job_request(db, payload, requested_by_technician_id=requested_by_technician_id)
    return JobRequestResponse(
        job_id=job.id,
        status=job.status,
        message="Job request submitted successfully.",
    )


@router.get(
    "/{job_id}/status",
    response_model=JobStatusResponse,
    summary="Get job status (customer tracking)",
    description="Public polling endpoint used by the customer tracking page. Returns status, ETA, and assigned technician summary.",
    responses={404: {"description": "Job not found"}},
)
def get_job_status(job_id: int, db: Session = Depends(get_db)):
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
