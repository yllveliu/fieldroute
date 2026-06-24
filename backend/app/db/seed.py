from app.core.roles import ApplicationStatus, Role
from app.core.security import hash_password
from app.db.base import Base  # noqa: F401 — registers all model metadata
from app.db.session import SessionLocal, engine
from app.models.customer import Customer
from app.models.job import Job
from app.models.job_part import JobPart
from app.models.part import Part
from app.models.service import Service
from app.models.technician import Technician
from app.models.user import User

# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

TECHNICIANS = [
    {"name": "Diego Ramos",   "skills": ["plumbing", "pipework"],     "status": "available"},
    {"name": "Aisha Khan",    "skills": ["electrical", "wiring"],     "status": "available"},
    {"name": "Sam Whitfield", "skills": ["HVAC", "refrigeration"],    "status": "available"},
    {"name": "Priya Nair",    "skills": ["plumbing", "drainage"],     "status": "on_job"},
    {"name": "Marcus Lee",    "skills": ["electrical", "solar"],      "status": "available"},
    {"name": "Nina Costa",    "skills": ["HVAC", "ventilation"],      "status": "available"},
]

PARTS = [
    {"name": "PVC Pipe 2in",        "sku": "SKU-PVC-075", "stock_quantity": 50,  "reserved_qty": 0,  "low_stock_threshold": 5},
    {"name": "Copper Wire 12AWG",   "sku": "SKU-CWR-120", "stock_quantity": 200, "reserved_qty": 10, "low_stock_threshold": 20},
    {"name": "HVAC Filter 16x25",   "sku": "SKU-HVF-162", "stock_quantity": 30,  "reserved_qty": 5,  "low_stock_threshold": 5},
    {"name": "Circuit Breaker 20A", "sku": "SKU-CBK-020", "stock_quantity": 15,  "reserved_qty": 2,  "low_stock_threshold": 5},
    {"name": "Drain Snake 25ft",    "sku": "SKU-DRS-025", "stock_quantity": 8,   "reserved_qty": 0,  "low_stock_threshold": 3},
    {"name": "Refrigerant R-410A",  "sku": "SKU-REF-410", "stock_quantity": 12,  "reserved_qty": 3,  "low_stock_threshold": 5},
]

SERVICES = [
    {"name": "Plumbing Repair",       "description": "Pipe repair, leak fixes, and drainage work"},
    {"name": "Electrical Inspection", "description": "Wiring checks, panel inspection, and safety testing"},
    {"name": "HVAC Maintenance",      "description": "Heating and cooling system servicing and repair"},
    {"name": "Drain Cleaning",        "description": "Clearing blocked drains and sewer lines"},
    {"name": "Solar Panel Install",   "description": "Solar panel installation and inspection"},
    {"name": "Ventilation Service",   "description": "Ventilation system inspection and airflow repair"},
]

CUSTOMERS = [
    {"name": "Alice Müller",  "phone": "555-0101", "address": "12 Oak St, Springfield"},
    {"name": "Bob Patel",     "phone": "555-0102", "address": "34 Elm Ave, Shelbyville"},
    {"name": "Carol Ionescu", "phone": "555-0103", "address": "56 Maple Rd, Capital City"},
    {"name": "David Okafor",  "phone": "555-0104", "address": "78 Pine Blvd, Ogdenville"},
]

JOBS = [
    {
        "customer": "Alice Müller",
        "service": "Plumbing Repair",
        "raw_description": "Burst pipe under kitchen sink",
        "status": "new",
        "technician": None,
    },
    {
        "customer": "Bob Patel",
        "service": "Electrical Inspection",
        "raw_description": "Flickering lights, possible short",
        "status": "categorized",
        "technician": None,
    },
    {
        "customer": "Carol Ionescu",
        "service": "HVAC Maintenance",
        "raw_description": "AC unit not cooling properly",
        "status": "assigned",
        "technician": "Sam Whitfield",
    },
    {
        "customer": "David Okafor",
        "service": "Drain Cleaning",
        "raw_description": "Blocked main drain",
        "status": "en_route",
        "technician": "Priya Nair",
    },
    {
        "customer": "Alice Müller",
        "service": "Solar Panel Install",
        "raw_description": "Annual solar panel inspection",
        "status": "done",
        "technician": "Marcus Lee",
    },
    {
        "customer": "Bob Patel",
        "service": "Ventilation Service",
        "raw_description": "Poor airflow in office building",
        "status": "new",
        "technician": None,
    },
]

# Demo login accounts — one per role so a freshly seeded database is usable
# immediately (and to power the "Login as ..." demo buttons in the UI). All
# share one throwaway password: these are public demo credentials, not secrets.
DEMO_PASSWORD = "demo1234"

DEMO_USERS = [
    {"email": "admin@fieldroute.com",      "password": DEMO_PASSWORD, "role": Role.ADMIN.value},
    {"email": "dispatcher@fieldroute.com", "password": DEMO_PASSWORD, "role": Role.DISPATCHER.value},
    {"email": "customer@fieldroute.com",   "password": DEMO_PASSWORD, "role": Role.CUSTOMER.value},
]

# The technician demo account is linked to an existing seeded technician (by
# name) because the technician-only pages require current_user.technician.
DEMO_TECHNICIAN = {
    "email": "technician@fieldroute.com",
    "password": DEMO_PASSWORD,
    "technician": "Diego Ramos",
}


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------


def _seed_technicians(session: object) -> dict[str, Technician]:
    result = {}
    for data in TECHNICIANS:
        obj = session.query(Technician).filter_by(name=data["name"]).first()
        if not obj:
            obj = Technician(**data)
            session.add(obj)
            session.flush()
        else:
            obj.skills = data["skills"]
            obj.status = data["status"]
        result[data["name"]] = obj
    return result


def _seed_parts(session: object) -> dict[str, Part]:
    result = {}
    for data in PARTS:
        obj = session.query(Part).filter_by(sku=data["sku"]).first()
        if not obj:
            obj = Part(**data)
            session.add(obj)
            session.flush()
        else:
            obj.name = data["name"]
            obj.stock_quantity = data["stock_quantity"]
            obj.reserved_qty = data["reserved_qty"]
            obj.low_stock_threshold = data["low_stock_threshold"]
        result[data["sku"]] = obj
    return result


def _seed_services(session: object) -> dict[str, Service]:
    result = {}
    for data in SERVICES:
        obj = session.query(Service).filter_by(name=data["name"]).first()
        if not obj:
            obj = Service(**data)
            session.add(obj)
            session.flush()
        else:
            obj.description = data["description"]
        result[data["name"]] = obj
    return result


def _seed_customers(session: object) -> dict[str, Customer]:
    result = {}
    for data in CUSTOMERS:
        obj = session.query(Customer).filter_by(phone=data["phone"]).first()
        if not obj:
            obj = Customer(**data)
            session.add(obj)
            session.flush()
        else:
            obj.name = data["name"]
            obj.address = data["address"]
        result[data["name"]] = obj
    return result


def _seed_jobs(
    session: object,
    services: dict[str, Service],
    customers: dict[str, Customer],
    technicians: dict[str, Technician],
) -> None:
    # Jobs are test data: clear and re-create on every run for a clean demo state.
    session.query(JobPart).delete()
    session.query(Job).delete()
    session.flush()

    for data in JOBS:
        technician = technicians[data["technician"]] if data["technician"] else None
        job = Job(
            customer_id=customers[data["customer"]].id,
            service_id=services[data["service"]].id,
            technician_id=technician.id if technician else None,
            raw_description=data["raw_description"],
            status=data["status"],
        )
        session.add(job)


def _seed_users(session: object, technicians: dict[str, Technician]) -> None:
    """Create one demo login per role so a freshly deployed instance is usable
    immediately. Idempotent: an account is created only if its email does not
    already exist, so re-running the seed never overwrites changed passwords."""
    for data in DEMO_USERS:
        existing = session.query(User).filter_by(email=data["email"]).first()
        if not existing:
            session.add(
                User(
                    email=data["email"],
                    password_hash=hash_password(data["password"]),
                    role=data["role"],
                )
            )

    # Technician demo account: create the login, then link it to an existing
    # seeded technician so the technician-only pages (which require
    # current_user.technician) work on first login.
    tech_user = session.query(User).filter_by(email=DEMO_TECHNICIAN["email"]).first()
    if tech_user is None:
        tech_user = User(
            email=DEMO_TECHNICIAN["email"],
            password_hash=hash_password(DEMO_TECHNICIAN["password"]),
            role=Role.TECHNICIAN.value,
        )
        session.add(tech_user)
        session.flush()  # assign tech_user.id before linking
    demo_tech = technicians.get(DEMO_TECHNICIAN["technician"])
    if demo_tech is not None and demo_tech.user_id is None:
        demo_tech.user_id = tech_user.id
        demo_tech.application_status = ApplicationStatus.APPROVED.value
        demo_tech.is_active = True


def run() -> None:
    Base.metadata.create_all(engine)

    session = SessionLocal()
    try:
        technicians = _seed_technicians(session)
        _seed_parts(session)
        services = _seed_services(session)
        customers = _seed_customers(session)
        _seed_jobs(session, services, customers, technicians)
        _seed_users(session, technicians)
        session.commit()
        print("Seed complete: technicians=6, parts=6, services=6, customers=4, jobs=6, demo logins=4")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
