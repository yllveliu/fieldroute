"""Seed the first admin account.

Admins cannot self-register, so the very first admin is created here. Run once
after migrations:

    cd backend
    ADMIN_EMAIL=admin@yourcompany.com ADMIN_PASSWORD=change-me-now python -m scripts.seed_admin

Idempotent: if an account with ADMIN_EMAIL already exists it is left unchanged.
"""

import os
import sys

from sqlalchemy import select

# Importing app.db.base registers Base and ALL ORM models on the registry, so
# cross-model relationships (e.g. User.technician -> "Technician") can resolve.
import app.db.base  # noqa: F401
from app.core.roles import Role
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def main() -> int:
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        print("ERROR: set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.")
        return 1
    if len(password) < 8:
        print("ERROR: ADMIN_PASSWORD must be at least 8 characters.")
        return 1

    db = SessionLocal()
    try:
        existing = db.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()
        if existing is not None:
            print(f"Admin account already exists for {email}; nothing to do.")
            return 0

        admin = User(
            email=email,
            password_hash=hash_password(password),
            role=Role.ADMIN.value,
        )
        db.add(admin)
        db.commit()
        print(f"Created admin account for {email}.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
