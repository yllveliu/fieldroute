from typing import Any, Dict

from pydantic import BaseModel, Field

from app.core.errors import AssignmentConflictReason


class ConflictResponse(BaseModel):
    error: str = Field(
        "assignment_conflict",
        description="Standard conflict error code",
    )
    reason: AssignmentConflictReason = Field(
        ..., description="Specific assignment conflict reason"
    )
    message: str = Field(..., description="Human readable conflict message")
    details: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional details to help clients understand the conflict",
    )

    class Config:
        schema_extra = {
            "example": {
                "error": "assignment_conflict",
                "reason": "technician_unavailable",
                "message": "The selected technician is not available.",
                "details": {},
            }
        }
