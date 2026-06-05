"""Aggregates SQLAlchemy metadata for Alembic.

Importing this module pulls in the declarative ``Base`` and (once they exist)
every ORM model, so that ``Base.metadata`` is fully populated. Alembic imports
this module from ``alembic/env.py`` to discover the schema for ``--autogenerate``.

When the data models land (KAN-2), import each model below so its table is
registered on ``Base.metadata``, e.g.::

    from app.models.user import User
    from app.models.customer import Customer
    from app.models.technician import Technician
    from app.models.service import Service
    from app.models.part import Part
    from app.models.job import Job
    from app.models.job_part import JobPart
"""

from app.db.session import Base  # noqa: F401

# NOTE: No models exist yet (KAN-2 not merged). Add the model imports above once
# they are available so Alembic autogenerate can detect their tables.
