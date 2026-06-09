from typing import List, Optional

from pydantic import BaseModel


class TechnicianResponse(BaseModel):
    id: int
    name: str
    skills: Optional[List[str]] = None
    status: str

    class Config:
        orm_mode = True
