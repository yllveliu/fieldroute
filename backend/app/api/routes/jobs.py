from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.job import JobRequestCreate, JobRequestResponse
from app.services.job_service import create_job_request

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
