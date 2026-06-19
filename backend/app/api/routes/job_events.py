from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.job import Job
from app.models.job_event import JobEvent
from app.schemas.job_event import JobEventResponse

router = APIRouter()


@router.get("/{job_id}/events", response_model=List[JobEventResponse])
def get_job_events(job_id: int, db: Session = Depends(get_db)) -> List[JobEventResponse]:
    """Return all status-change events for a job, newest first."""
    if db.get(Job, job_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    events = (
        db.execute(
            select(JobEvent)
            .where(JobEvent.job_id == job_id)
            .order_by(JobEvent.changed_at.desc())
        )
        .scalars()
        .all()
    )
    return events
