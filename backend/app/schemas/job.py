from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TechnicianSummary(BaseModel):
    id: int
    name: str
    status: str

    model_config = {"from_attributes": True}


class JobDetailResponse(BaseModel):
    id: int
    status: str
    service_name: Optional[str] = None
    problem_description: Optional[str] = None
    eta_message: Optional[str] = None
    technician: Optional[TechnicianSummary] = None
    ai_service_type: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class JobRequestCreate(BaseModel):
    """Incoming customer service request used to create a new job."""

    customer_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    raw_description: str = Field(..., min_length=1)

    @field_validator("customer_name", "phone", "address", "raw_description")
    @classmethod
    def text_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class JobRequestResponse(BaseModel):
    """Result returned after a customer job request is submitted."""

    job_id: int
    status: str
    message: str


class JobTechnicianStatus(BaseModel):
    """Minimal technician info exposed to customers tracking a job."""

    name: str
    status: str


class JobStatusResponse(BaseModel):
    """Current status of a job, used for polling-based customer tracking."""

    job_id: int
    status: str
    eta_message: str | None = None
    service: str | None = None
    technician: JobTechnicianStatus | None = None
