from fastapi import APIRouter, Query, status

from app.core.errors import (
    ASSIGNMENT_CONFLICT_ERROR,
    AssignmentConflictReason,
    DEFAULT_CONFLICT_MESSAGES,
)
from app.schemas.errors import ConflictResponse

router = APIRouter()


@router.get(
    "/conflict-example",
    response_model=ConflictResponse,
    status_code=status.HTTP_409_CONFLICT,
    summary="Temporary debug endpoint for assignment conflict responses",
    description=(
        "Debug-only endpoint that returns a sample 409 assignment conflict response. "
        "Do not use in production logic."
    ),
)
async def conflict_example(
    reason: AssignmentConflictReason = Query(
        AssignmentConflictReason.technician_unavailable,
        description="Conflict reason code for the example response",
    )
) -> ConflictResponse:
    return ConflictResponse(
        reason=reason,
        message=DEFAULT_CONFLICT_MESSAGES.get(
            reason,
            "An assignment conflict occurred.",
        ),
        details={},
    )
