from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DispatcherCustomer(BaseModel):
    name: str
    phone: str
    address: str

    model_config = {"from_attributes": True}


class DispatcherTechnician(BaseModel):
    name: str
    status: str

    model_config = {"from_attributes": True}


class DispatcherJobItem(BaseModel):
    id: int
    status: str
    raw_description: str
    eta_message: Optional[str] = None
    created_at: datetime
    customer: Optional[DispatcherCustomer] = None
    service_name: Optional[str] = None
    technician: Optional[DispatcherTechnician] = None

    model_config = {"from_attributes": True}
