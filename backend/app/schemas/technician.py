from typing import List, Optional

from pydantic import BaseModel, field_validator


ALLOWED_TECHNICIAN_STATUSES = {"available", "on_job", "offline"}


class TechnicianResponse(BaseModel):
    id: int
    name: str
    skills: List[str]
    status: str
    current_job: Optional[int] = None  # active job id if assigned, else null

    model_config = {"from_attributes": True}


class TechnicianCreateRequest(BaseModel):
    name: str
    skills: list[str]
    status: str = "available"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value != "available":
            raise ValueError("status must be available")
        return value


class TechnicianUpdateRequest(BaseModel):
    name: str | None = None
    skills: list[str] | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_TECHNICIAN_STATUSES:
            raise ValueError("status must be one of: available, on_job, offline")
        return value


class TechnicianAdminResponse(BaseModel):
    id: int
    name: str
    skills: list[str]
    status: str
    is_active: bool

    class Config:
        from_attributes = True
