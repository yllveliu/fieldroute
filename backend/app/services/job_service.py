from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.job import Job
from app.schemas.job import JobRequestCreate


def create_job_request(db: Session, payload: JobRequestCreate) -> Job:
    """Store the customer and create a new job for an incoming service request.

    The job is created with status "new". Technician assignment, service-type
    classification and parts handling are intentionally left for later steps.
    """
    customer = Customer(
        name=payload.customer_name,
        phone=payload.phone,
        address=payload.address,
    )
    db.add(customer)
    db.flush()  # populate customer.id without committing the transaction yet

    job = Job(
        customer_id=customer.id,
        raw_description=payload.raw_description,
        status="new",
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: int) -> Job | None:
    """Return the job with the given id, or None if it does not exist."""
    return db.get(
        Job,
        job_id,
        options=[joinedload(Job.technician), joinedload(Job.service)],
    )
