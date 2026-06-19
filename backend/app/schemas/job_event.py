from datetime import datetime

from pydantic import BaseModel


class JobEventResponse(BaseModel):
    id: int
    job_id: int
    from_status: str
    to_status: str
    changed_by: int | None
    changed_at: datetime

    model_config = {"from_attributes": True}
