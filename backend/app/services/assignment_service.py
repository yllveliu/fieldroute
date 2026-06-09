from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.schemas.assignment import AssignmentGateResponse, AssignmentPartPreview


def prepare_assignment_gate(
    db: Session,
    job_id: int,
    technician_id: int,
    required_parts: List[Dict[str, Any]],
    eta_message: str | None = None,
) -> AssignmentGateResponse:
    """Prepare an assignment gate preview.

    This is a Sprint 1 skeleton. Sprint 2 will add the following, in order:
    - technician row locking (SELECT ... FOR UPDATE) to prevent races
    - parts row locking in ascending PK order to avoid deadlocks
    - technician availability and skill checks
    - stock checks for each required part
    - perform these checks and then commit or rollback atomically

    For now this function returns a non-mutating preview object that demonstrates
    the intended response shape.
    """

    part_previews = []
    for p in required_parts:
        part_previews.append(
            AssignmentPartPreview(part_id=int(p.get("part_id")), qty_needed=int(p.get("qty_needed")))
        )

    # NOTE: No DB mutations here; placeholder for Sprint 2 transactional logic.
    return AssignmentGateResponse(
        job_id=job_id,
        technician_id=technician_id,
        status="assignment_gate_skeleton_ready",
        message=(
            "Assignment gate skeleton ready. Sprint 2 will perform locking, availability,"
            " skill and stock checks inside a single transaction."
        ),
        required_parts=part_previews,
    )
