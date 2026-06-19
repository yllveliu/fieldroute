from collections import Counter
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.part import Part
from app.models.technician import Technician
from app.schemas.assign import AssignResponse
from app.services.audit import log_job_event


def assign_job(db: Session, job_id: int, technician_id: int, part_ids: List[int], changed_by: int | None = None) -> AssignResponse:
    """Assign a job to a technician and reserve requested parts atomically."""

    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.status != "categorized":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job must be categorized before assignment. Current status: {job.status}",
        )

    technician = db.get(Technician, technician_id)
    if technician is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")

    if technician.status != "available":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="TECHNICIAN_UNAVAILABLE")

    part_counts = Counter(part_ids)
    parts: List[Part] = []
    if part_counts:
        queried_parts = db.query(Part).filter(Part.id.in_(part_counts.keys())).all()
        found_ids = {part.id for part in queried_parts}
        for part_id in part_counts:
            if part_id not in found_ids:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Part {part_id} not found")

        for part in queried_parts:
            requested_qty = part_counts[part.id]
            available = part.stock_quantity - part.reserved_qty
            if available < requested_qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Part {part.id} has insufficient stock",
                )
            parts.append(part)

    # All validation checks passed; perform writes in a single commit.
    previous_status = job.status
    job.technician_id = technician.id
    job.status = "assigned"
    technician.status = "on_job"

    reserved_part_ids: List[int] = []
    for part in parts:
        increment = part_counts[part.id]
        part.reserved_qty += increment
        reserved_part_ids.append(part.id)

    log_job_event(db, job_id, previous_status, "assigned", changed_by)
    db.commit()
    db.refresh(job)
    db.refresh(technician)

    return AssignResponse(
        job_id=job.id,
        technician_id=technician.id,
        new_job_status=job.status,
        new_technician_status=technician.status,
        reserved_part_ids=reserved_part_ids,
    )
