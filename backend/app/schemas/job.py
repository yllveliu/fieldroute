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
