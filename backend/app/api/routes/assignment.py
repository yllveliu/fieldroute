from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.assignment import AssignJobRequest, AssignmentGateResponse
from app.schemas.errors import ConflictResponse
from app.services.assignment_service import prepare_assignment_gate

router = APIRouter()


@router.post(
    "/{job_id}/assign",
    response_model=AssignmentGateResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_409_CONFLICT: {"model": ConflictResponse},
    },
    summary="Prepare an assignment gate preview for a job",
)
def assign_job(
    job_id: int,
    payload: AssignJobRequest,
    db: Session = Depends(get_db),
) -> AssignmentGateResponse:
    """Endpoint to prepare an assignment gate for a job.

    This Sprint 1 endpoint returns a safe placeholder response that proves the
    route and service shape are ready for Sprint 2. It does not mutate database
    state or perform locking.
    """

    # Call the service skeleton which returns a preview response.
    try:
        preview = prepare_assignment_gate(
            db=db,
            job_id=job_id,
            technician_id=payload.technician_id,
            required_parts=[p.dict() for p in payload.required_parts],
            eta_message=payload.eta_message,
        )
        return preview
    except HTTPException:
        # Re-raise HTTPExceptions so they are handled normally
        raise
    except Exception as exc:  # pragma: no cover - keep generic guard
        # Unexpected errors => 500
        raise HTTPException(status_code=500, detail=str(exc))
