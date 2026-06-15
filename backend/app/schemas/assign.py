from typing import List

from pydantic import BaseModel


class AssignRequest(BaseModel):
    technician_id: int
    part_ids: List[int] = []


class AssignResponse(BaseModel):
    job_id: int
    technician_id: int
    new_job_status: str
    new_technician_status: str
    reserved_part_ids: List[int]

    model_config = {"from_attributes": True}
