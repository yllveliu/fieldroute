from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.job import Job
from app.schemas.dispatcher import DispatcherJobItem

router = APIRouter()


@router.get("/jobs", response_model=List[DispatcherJobItem])
def list_dispatcher_jobs(db: Session = Depends(get_db)):
    stmt = (
        select(Job)
        .options(
            selectinload(Job.customer),
            selectinload(Job.service),
            selectinload(Job.technician),
        )
        .order_by(Job.created_at.desc())
    )
    jobs = db.execute(stmt).scalars().all()

    result = []
    for job in jobs:
        result.append(
            DispatcherJobItem(
                id=job.id,
                status=job.status,
                raw_description=job.raw_description,
                eta_message=job.eta_message,
                created_at=job.created_at,
                customer=job.customer,
                service_name=job.service.name if job.service else None,
                technician=job.technician,
            )
        )
    return result
