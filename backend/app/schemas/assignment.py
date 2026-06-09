from typing import List, Optional

from pydantic import BaseModel, Field


class RequiredPart(BaseModel):
    part_id: int = Field(..., description="Primary key of the required part")
    qty_needed: int = Field(..., ge=1, description="Quantity required for the job")


class AssignJobRequest(BaseModel):
    technician_id: int = Field(..., description="ID of the technician to assign")
    required_parts: List[RequiredPart] = Field(
        default_factory=list, description="List of required parts and quantities"
    )
    eta_message: Optional[str] = Field(None, description="Optional ETA or message for the assignment")


class AssignmentPartPreview(BaseModel):
    part_id: int
    qty_needed: int


class AssignmentGateResponse(BaseModel):
    job_id: int
    technician_id: int
    status: str = Field(..., description="Status of the assignment gate check")
    message: str
    required_parts: List[AssignmentPartPreview] = Field(default_factory=list)

    class Config:
        schema_extra = {
            "example": {
                "job_id": 123,
                "technician_id": 5,
                "status": "assignment_gate_skeleton_ready",
                "message": "Assignment gate skeleton is ready for Sprint 2 implementation.",
                "required_parts": [{"part_id": 10, "qty_needed": 2}],
            }
        }
