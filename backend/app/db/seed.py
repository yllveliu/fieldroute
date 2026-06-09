from app.db.base import Base  # noqa: F401 — registers all model metadata
from app.db.session import SessionLocal, engine
from app.models.customer import Customer
from app.models.job import Job
from app.models.job_part import JobPart
from app.models.part import Part
from app.models.service import Service
from app.models.technician import Technician

# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

SERVICES = [
    {"name": "Plumbing", "description": "Pipe repair, installation, and leak fixes"},
    {"name": "Electrical", "description": "Wiring, panel upgrades, and outlet installs"},
    {"name": "HVAC", "description": "Heating, ventilation, and air conditioning service"},
    {"name": "Carpentry", "description": "Structural and finish carpentry work"},
]

TECHNICIANS = [
    {"name": "Marco Rossi",    "skills": ["plumbing", "pipe fitting"],       "status": "available"},
    {"name": "Sara Kelmendi",  "skills": ["electrical", "panel upgrades"],   "status": "available"},
    {"name": "Liam Novak",     "skills": ["hvac", "refrigeration"],          "status": "on_job"},
    {"name": "Ana Ferreira",   "skills": ["plumbing", "hvac"],               "status": "available"},
    {"name": "Jake Thornton",  "skills": ["carpentry", "drywall"],           "status": "available"},
    {"name": "Drita Hoxha",    "skills": ["electrical", "lighting"],         "status": "off"},
]

CUSTOMERS = [
    {"name": "Alice Müller",   "phone": "555-0101", "address": "12 Oak St, Springfield"},
    {"name": "Bob Patel",      "phone": "555-0102", "address": "34 Elm Ave, Shelbyville"},
    {"name": "Carol Ionescu",  "phone": "555-0103", "address": "56 Maple Rd, Capital City"},
    {"name": "David Okafor",   "phone": "555-0104", "address": "78 Pine Blvd, Ogdenville"},
]

PARTS = [
    {"name": "Copper Pipe 1/2\"",       "sku": "PL-001", "stock_quantity": 50, "reserved_qty": 0},
    {"name": "PVC Elbow 90°",           "sku": "PL-002", "stock_quantity": 30, "reserved_qty": 2},
    {"name": "Circuit Breaker 20A",     "sku": "EL-001", "stock_quantity": 20, "reserved_qty": 0},
    {"name": "Wire Nut Assortment",     "sku": "EL-002", "stock_quantity": 100,"reserved_qty": 0},
    {"name": "HVAC Filter 16x20",       "sku": "HV-001", "stock_quantity": 15, "reserved_qty": 1},
    {"name": "Refrigerant R-410A",      "sku": "HV-002", "stock_quantity": 8,  "reserved_qty": 0},
    {"name": "Pipe Wrench 14\"",        "sku": "TL-001", "stock_quantity": 10, "reserved_qty": 0},
    {"name": "Teflon Tape Roll",        "sku": "PL-003", "stock_quantity": 60, "reserved_qty": 0},
    {"name": "Junction Box 4\"",        "sku": "EL-003", "stock_quantity": 25, "reserved_qty": 0},
    {"name": "Wood Screw #8 x 2\"",     "sku": "CP-001", "stock_quantity": 200,"reserved_qty": 0},
]


def _seed_services(session: object) -> dict[str, Service]:
    result = {}
    for data in SERVICES:
        obj = session.query(Service).filter_by(name=data["name"]).first()
        if not obj:
            obj = Service(**data)
            session.add(obj)
            session.flush()
        result[data["name"]] = obj
    return result


def _seed_technicians(session: object) -> None:
    for data in TECHNICIANS:
        if not session.query(Technician).filter_by(name=data["name"]).first():
            session.add(Technician(**data))


def _seed_customers(session: object) -> dict[str, Customer]:
    result = {}
    for data in CUSTOMERS:
        obj = session.query(Customer).filter_by(phone=data["phone"]).first()
        if not obj:
            obj = Customer(**data)
            session.add(obj)
            session.flush()
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
        result[data["sku"]] = obj
    return result


def _seed_jobs(
    session: object,
    services: dict[str, Service],
    customers: dict[str, Customer],
    parts: dict[str, Part],
) -> None:
    if session.query(Job).count() > 0:
        return  # already seeded

    jobs_data = [
        {
            "customer": customers["Alice Müller"],
            "service": services["Plumbing"],
            "raw_description": "Kitchen sink is dripping constantly. Water pressure also seems low.",
            "status": "new",
            "parts": [("PL-001", 2), ("PL-003", 1)],
        },
        {
            "customer": customers["Bob Patel"],
            "service": services["Electrical"],
            "raw_description": "Breaker keeps tripping in the living room. Outlets not working.",
            "status": "categorized",
            "parts": [("EL-001", 1), ("EL-002", 1)],
        },
        {
            "customer": customers["Carol Ionescu"],
            "service": services["HVAC"],
            "raw_description": "AC unit not cooling. Strange noise from the outdoor unit.",
            "status": "new",
            "parts": [("HV-001", 1), ("HV-002", 1)],
        },
        {
            "customer": customers["David Okafor"],
            "service": services["Carpentry"],
            "raw_description": "Front door frame is cracked and door doesn't close properly.",
            "status": "new",
            "parts": [("CP-001", 10)],
        },
        {
            "customer": customers["Alice Müller"],
            "service": services["Plumbing"],
            "raw_description": "Bathroom toilet is running continuously. Needs flapper replaced.",
            "status": "categorized",
            "parts": [],
        },
    ]

    for jd in jobs_data:
        job = Job(
            customer_id=jd["customer"].id,
            service_id=jd["service"].id,
            raw_description=jd["raw_description"],
            status=jd["status"],
        )
        session.add(job)
        session.flush()
        for sku, qty in jd["parts"]:
            session.add(JobPart(job_id=job.id, part_id=parts[sku].id, qty_needed=qty))


def run() -> None:
    Base.metadata.create_all(engine)

    session = SessionLocal()
    try:
        services = _seed_services(session)
        _seed_technicians(session)
        customers = _seed_customers(session)
        parts = _seed_parts(session)
        _seed_jobs(session, services, customers, parts)
        session.commit()
        print("Seed complete: services=4, technicians=6, customers=4, parts=10, jobs=5")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
