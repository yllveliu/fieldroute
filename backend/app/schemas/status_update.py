from pydantic import BaseModel


class StatusUpdateRequest(BaseModel):
    status: str  # the target status to transition to
