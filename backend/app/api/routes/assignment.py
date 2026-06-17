from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.assign import AssignRequest, AssignResponse
from app.services.assignment_service import assign_job

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
) -> AssignResponse:
    """Assign a job to a technician and reserve optional parts atomically."""
    try:
        return assign_job(db=db, job_id=job_id, technician_id=payload.technician_id, part_ids=payload.part_ids)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - keep generic guard
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
