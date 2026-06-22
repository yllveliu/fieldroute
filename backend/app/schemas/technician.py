from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator


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
    # Login credentials — an admin-created technician gets a real account so
    # they can sign in and see their assigned work.
    email: EmailStr
    password: str
    skills: list[str]
    status: str = "available"

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value

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


class TechnicianApplicationAdminResponse(BaseModel):
    """A pending technician application as shown in the admin review screen."""

    id: int
    name: str
    email: str
    skills: list[str]
    application_status: str
    ai_match_score: float | None
    ai_match_summary: str | None
    cv_filename: str | None
    has_cv: bool

    class Config:
        from_attributes = True
