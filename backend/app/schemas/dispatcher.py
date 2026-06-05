from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DispatcherCustomer(BaseModel):
    name: str
    phone: str
    address: str

    class Config:
        orm_mode = True


class DispatcherTechnician(BaseModel):
    name: str
    status: str

    class Config:
        orm_mode = True


class DispatcherJobItem(BaseModel):
    id: int
    status: str
    raw_description: str
    eta_message: Optional[str]
    created_at: datetime
    customer: Optional[DispatcherCustomer]
    service_name: Optional[str]
    technician: Optional[DispatcherTechnician]

    class Config:
        orm_mode = True
