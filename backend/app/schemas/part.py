from typing import Optional

from pydantic import BaseModel


class PartResponse(BaseModel):
    id: int
    name: str
    sku: str
    stock_quantity: int
    reserved_qty: int

    class Config:
        orm_mode = True
