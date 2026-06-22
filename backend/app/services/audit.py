from sqlalchemy.orm import Session

from app.models.job_event import JobEvent


def log_job_event(
    db: Session,
    job_id: int,
    from_status: str,
    to_status: str,
    changed_by: int | None,
) -> None:
    """Stage a job status-change event. Caller must commit the session."""
    db.add(JobEvent(
        job_id=job_id,
        from_status=from_status,
        to_status=to_status,
        changed_by=changed_by,
    ))
