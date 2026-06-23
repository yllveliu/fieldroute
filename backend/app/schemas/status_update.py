from pydantic import BaseModel, Field, field_validator


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., min_length=1)  # the target status to transition to

    @field_validator("status")
    @classmethod
    def status_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("status must not be empty")
        return cleaned
