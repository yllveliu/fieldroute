"""Canonical role, application-status, and skill constants for FieldRoute.

Centralising these prevents the privilege-escalation risk of free-form role
strings: every place that creates or checks a role imports from here, and
public self-service registration can never grant a staff role.
"""

from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    """The four authenticated roles in the system.

    - CUSTOMER: self-registers, sees only their own jobs.
    - TECHNICIAN: applies via the register page, gains access only after an
      admin approves their application.
    - DISPATCHER: created by an admin; runs the operational boards.
    - ADMIN: seeded in the database; manages users, parts, jobs, applications.
    """

    CUSTOMER = "customer"
    TECHNICIAN = "technician"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"


class ApplicationStatus(str, Enum):
    """Lifecycle of a technician application."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# The exact skills the company hires for. The technician application form, the
# Technician.skills column, and (later) dispatcher job-matching all reference
# this single list so the vocabulary never drifts.
SKILLS: tuple[str, ...] = (
    "plumbing",
    "electricity",
    "hvac",
    "carpentry",
    "drain cleaning",
    "solar panel install",
)
