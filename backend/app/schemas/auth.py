from pydantic import BaseModel, EmailStr, field_validator

from app.core.roles import SKILLS


class RegisterRequest(BaseModel):
    """Public self-service registration. Always creates a CUSTOMER account —
    there is deliberately no role field, so the endpoint cannot be used to grant
    a staff role. Staff are created by an admin; technicians apply separately."""

    email: EmailStr
    password: str
    name: str


class RegisterResponse(BaseModel):
    user_id: int
    email: str
    role: str
    message: str


class TechnicianApplicationResponse(BaseModel):
    """Returned after a technician application is submitted. The account exists
    but is inactive (application_status = pending) until an admin approves."""

    user_id: int
    technician_id: int
    email: str
    application_status: str
    ai_match_score: float | None
    message: str


class DispatcherCreateRequest(BaseModel):
    """Admin-only creation of a dispatcher staff account."""

    email: EmailStr
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def validate_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class StaffAccountResponse(BaseModel):
    user_id: int
    email: str
    role: str
    message: str


class StaffListItem(BaseModel):
    user_id: int
    email: str
    role: str

    model_config = {"from_attributes": True}


class DispatcherUpdateRequest(BaseModel):
    """Admin edit of a dispatcher account. Both fields optional — send only what
    changes (e.g. a new password when they forget it)."""

    email: EmailStr | None = None
    password: str | None = None

    @field_validator("password")
    @classmethod
    def validate_length(cls, value: str | None) -> str | None:
        if value is not None and len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    # Only meaningful for technicians; null for everyone else. Lets the frontend
    # route a pending/approved technician to the right screen immediately.
    application_status: str | None = None


class CurrentUserResponse(BaseModel):
    user_id: int
    email: str
    role: str
    name: str | None = None
    application_status: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return value


def validate_skills(skills: list[str]) -> list[str]:
    """Ensure submitted skills are within the company's allowed list."""
    invalid = [s for s in skills if s not in SKILLS]
    if invalid:
        raise ValueError(f"Unknown skills: {', '.join(invalid)}")
    return skills
