"""
Demo data reset script (KAN-85).

Drops all transient demo data and re-seeds the database to the canonical
demo state defined in backend/app/db/seed.py.

Usage (from repo root):
    cd backend
    python ../scripts/reset_demo.py

Or with a custom DATABASE_URL:
    DATABASE_URL=postgresql+psycopg://... python scripts/reset_demo.py

Completes in < 10 seconds on any reasonable Postgres instance.
"""

import sys
import time
import os

# Allow running from repo root or from backend/
_repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_backend = os.path.join(_repo_root, "backend")
if _backend not in sys.path:
    sys.path.insert(0, _backend)

# Trigger model registration before importing anything that touches the engine
import app.db.base  # noqa: F401

from sqlalchemy import text
from app.db.session import SessionLocal, engine
from app.models.customer import Customer
from app.models.job import Job
from app.models.job_event import JobEvent
from app.models.job_part import JobPart
from app.models.part import Part
from app.models.service import Service
from app.models.technician import Technician
from app.db.seed import run as seed_run


def reset() -> None:
    t0 = time.perf_counter()
    db = SessionLocal()
    try:
        print("Dropping transient demo data…")
        # Delete in FK-safe order
        db.execute(text("DELETE FROM job_events"))
        db.execute(text("DELETE FROM job_parts"))
        db.execute(text("DELETE FROM jobs"))
        db.execute(text("DELETE FROM customers"))
        # Reset stock reservations so seed values are canonical
        db.execute(text("UPDATE parts SET reserved_qty = 0"))
        # Reset technician statuses
        db.execute(text("UPDATE technicians SET status = 'available'"))
        db.commit()
        print("  Done. Re-seeding…")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    seed_run()

    elapsed = time.perf_counter() - t0
    print(f"Reset complete in {elapsed:.2f}s — DB is back to demo state.")


if __name__ == "__main__":
    reset()
