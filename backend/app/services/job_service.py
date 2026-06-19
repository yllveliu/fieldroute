from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.job import Job
from app.schemas.job import JobRequestCreate
from app.services.email_service import notify_job_submitted


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

    notify_job_submitted(
        job_id=job.id,
        customer_name=customer.name,
        address=customer.address,
        description=job.raw_description,
    )
    return job


def get_job(db: Session, job_id: int) -> Job | None:
    """Return the job with the given id, or None if it does not exist."""
    return db.get(
        Job,
        job_id,
        options=[joinedload(Job.technician), joinedload(Job.service)],
    )


def classify_problem(text: str) -> dict[str, str | float | int]:
    """Classify a problem description using keyword-based service categories."""
    normalized = (text or "").lower()
    categories = {
        "Plumbing": [
            "pipe",
            "leak",
            "drain",
            "water",
            "plumb",
            "sewage",
            "burst",
            "flood",
            "clog",
            "faucet",
            "sink",
            "toilet",
            "shower",
            "valve",
            "pressure",
        ],
        "Electrical": [
            "electric",
            "wire",
            "circuit",
            "outlet",
            "breaker",
            "panel",
            "voltage",
            "power",
            "light",
            "switch",
            "socket",
            "fuse",
            "short",
            "wiring",
            "sparks",
        ],
        "HVAC": [
            "hvac",
            "heat",
            "cool",
            "air",
            "ventilat",
            "refriger",
            "furnace",
            "thermostat",
            "duct",
            "ac",
            "conditioning",
            "compressor",
            "filter",
            "airflow",
            "boiler",
        ],
        "Carpentry": [
            "wood",
            "door",
            "window",
            "cabinet",
            "floor",
            "ceiling",
            "roof",
            "wall",
            "frame",
            "tile",
            "drywall",
            "carpent",
            "hinge",
            "lock",
            "repair",
        ],
    }

    counts = {category: sum(1 for keyword in keywords if keyword in normalized) for category, keywords in categories.items()}
    winner = max(counts, key=lambda category: (counts[category], -list(categories).index(category)))
    winner_count = counts[winner]

    if winner_count == 0:
        return {
            "service_type": "General",
            "confidence": 0.5,
            "explanation": "No specific keywords matched.",
            "count": 0,
        }

    if winner_count >= 3:
        confidence = 0.95
    elif winner_count == 2:
        confidence = 0.80
    else:
        confidence = 0.65

    return {
        "service_type": winner,
        "confidence": confidence,
        "explanation": f"Matched {winner_count} {winner} keyword(s) in problem description.",
        "count": winner_count,
    }
