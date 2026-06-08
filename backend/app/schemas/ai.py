from pydantic import BaseModel, Field, field_validator


class ClassificationRequest(BaseModel):
    """Incoming free-text service description to classify."""

    description: str = Field(..., min_length=1)

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("description must not be empty")
        return cleaned


class ClassificationResponse(BaseModel):
    """Structured, AI-like classification result for a service request."""

    service_type: str
    confidence: float
    explanation: str
    eta_message: str
