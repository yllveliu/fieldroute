from app.db.session import Base  # noqa: F401

# Import all models so Alembic can discover metadata
from app.models.user import User  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.technician import Technician  # noqa: F401
from app.models.service import Service  # noqa: F401
from app.models.part import Part  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.job_part import JobPart  # noqa: F401
