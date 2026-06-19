from datetime import date

from sqlalchemy import cast, func
from sqlalchemy.orm import Session
from sqlalchemy import Date

from app.models.job import Job
from app.models.technician import Technician
from app.schemas.analytics import AnalyticsResponse


def get_analytics(db: Session) -> AnalyticsResponse:
    today = date.today()

    jobs_today: int = (
        db.query(func.count(Job.id))
        .filter(cast(Job.created_at, Date) == today)
        .scalar()
        or 0
    )

    status_rows = (
        db.query(Job.status, func.count(Job.id))
        .group_by(Job.status)
        .all()
    )
    jobs_by_status: dict[str, int] = {status: count for status, count in status_rows}

    available_technicians: int = (
        db.query(func.count(Technician.id))
        .filter(Technician.status == "available")
        .scalar()
        or 0
    )

    # Job has no completed_at column; migration is out of scope, so this is always null.
    avg_resolution_hours: float | None = None

    total: int = db.query(func.count(Technician.id)).scalar() or 0
    on_job: int = (
        db.query(func.count(Technician.id))
        .filter(Technician.status == "on_job")
        .scalar()
        or 0
    )
    technician_utilization_pct: float | None = (
        round(on_job / total * 100, 2) if total > 0 else None
    )

    return AnalyticsResponse(
        jobs_today=jobs_today,
        jobs_by_status=jobs_by_status,
        available_technicians=available_technicians,
        avg_resolution_hours=avg_resolution_hours,
        technician_utilization_pct=technician_utilization_pct,
    )
