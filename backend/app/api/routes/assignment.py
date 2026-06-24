import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.assign import AssignRequest, AssignResponse
from app.services.assignment_service import assign_job

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/{job_id}/assign",
    response_model=AssignResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign a categorized job to a technician",
)
def assign_job_endpoint(
    job_id: int,
    payload: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignResponse:
    """Assign a job to a technician and reserve optional parts atomically."""
    try:
        return assign_job(db=db, job_id=job_id, technician_id=payload.technician_id, part_ids=payload.part_ids, changed_by=current_user.id)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected error in assign_job_endpoint job_id=%s", job_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during assignment.",
        )
