from pydantic import BaseModel, Field


class JobRequestCreate(BaseModel):
    """Incoming customer service request used to create a new job."""

    customer_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    raw_description: str = Field(..., min_length=1)


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
