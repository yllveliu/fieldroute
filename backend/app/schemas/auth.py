from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.roles import SKILLS


class RegisterRequest(BaseModel):
    """Public self-service registration. Always creates a CUSTOMER account —
    there is deliberately no role field, so the endpoint cannot be used to grant
    a staff role. Staff are created by an admin; technicians apply separately."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("password must not be empty")
        return value


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


class TechnicianApplicationRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    skills: list[str] = Field(..., min_length=1)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("password must not be empty")
        return value

    @field_validator("skills")
    @classmethod
    def skills_are_known(cls, value: list[str]) -> list[str]:
        return validate_skills(value)


class DispatcherCreateRequest(BaseModel):
    """Admin-only creation of a dispatcher staff account."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not value.strip():
            raise ValueError("password must not be empty")
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
        if value is not None and not value.strip():
            raise ValueError("password must not be empty")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("password must not be empty")
        return value


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
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)

    @field_validator("token")
    @classmethod
    def token_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("token must not be empty")
        return cleaned

    @field_validator("new_password")
    @classmethod
    def validate_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not value.strip():
            raise ValueError("new_password must not be empty")
        return value


def validate_skills(skills: list[str]) -> list[str]:
    """Ensure submitted skills are within the company's allowed list."""
    cleaned = [skill.strip().lower() for skill in skills]
    invalid = [skill for skill in cleaned if not skill or skill not in SKILLS]
    if invalid:
        raise ValueError(f"Unknown skills: {', '.join(invalid)}")
    return cleaned
