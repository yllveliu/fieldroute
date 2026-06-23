from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.roles import SKILLS


ALLOWED_TECHNICIAN_STATUSES = {"available", "on_job", "offline"}


class TechnicianResponse(BaseModel):
    id: int
    name: str
    skills: List[str]
    status: str
    current_job: Optional[int] = None  # active job id if assigned, else null

    model_config = {"from_attributes": True}


class TechnicianCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    # Login credentials — an admin-created technician gets a real account so
    # they can sign in and see their assigned work.
    email: EmailStr
    password: str = Field(..., min_length=8)
    skills: list[str] = Field(..., min_length=1)
    status: str = "available"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not value.strip():
            raise ValueError("password must not be empty")
        return value

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, value: list[str]) -> list[str]:
        cleaned = [skill.strip().lower() for skill in value]
        invalid = [skill for skill in cleaned if not skill or skill not in SKILLS]
        if invalid:
            raise ValueError(f"Unknown skills: {', '.join(invalid)}")
        return cleaned

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

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        cleaned = [skill.strip().lower() for skill in value]
        invalid = [skill for skill in cleaned if not skill or skill not in SKILLS]
        if invalid:
            raise ValueError(f"Unknown skills: {', '.join(invalid)}")
        return cleaned

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
