from typing import Annotated, List

from pydantic import BaseModel, Field

PositiveId = Annotated[int, Field(ge=1)]


class AssignRequest(BaseModel):
    technician_id: PositiveId
    part_ids: List[PositiveId] = Field(default_factory=list)


class AssignResponse(BaseModel):
    job_id: int
    technician_id: int
    new_job_status: str
    new_technician_status: str
    reserved_part_ids: List[int]

    model_config = {"from_attributes": True}
