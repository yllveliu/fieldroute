from typing import List, Optional

from pydantic import BaseModel


class TechnicianResponse(BaseModel):
    id: int
    name: str
    skills: List[str]
    status: str
    current_job: Optional[int] = None  # active job id if assigned, else null

    model_config = {"from_attributes": True}
