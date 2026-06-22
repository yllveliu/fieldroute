"""Shared mapping between the AI classifier's service categories and the
company's hireable skills.

Used both to stop a technician requesting a service they provide, and to show
only skill-matching technicians when a dispatcher assigns a classified job.
"""

from __future__ import annotations

# Classifier category (lowercased) -> company skills it corresponds to.
# Categories not listed (e.g. "general") map to an empty set, meaning
# "no specific skill detected" — callers treat that as "don't filter / don't block".
SERVICE_TYPE_TO_SKILLS: dict[str, set[str]] = {
    "plumbing": {"plumbing", "drain cleaning"},
    "electrical": {"electricity", "solar panel install"},
    "hvac": {"hvac"},
    "carpentry": {"carpentry"},
}


def required_skills_for(service_type: str | None) -> set[str]:
    """Return the company skills a given service category needs (lowercased).
    Empty set means the category is unknown/general — no specific skill."""
    return SERVICE_TYPE_TO_SKILLS.get(str(service_type or "").lower(), set())
