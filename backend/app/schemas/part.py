from typing import Optional

from pydantic import BaseModel, Field, field_validator


class PartResponse(BaseModel):
    id: int
    name: str
    sku: str
    stock_quantity: int
    reserved_qty: int

    class Config:
        orm_mode = True


class PartUpdateRequest(BaseModel):
    stock_quantity: int | None = None
    reserved_qty: int | None = None
    low_stock_threshold: int | None = None

    @field_validator("stock_quantity", "reserved_qty", "low_stock_threshold")
    @classmethod
    def must_be_non_negative(cls, value: int | None) -> int | None:
        if value is not None and value < 0:
            raise ValueError("must be >= 0")
        return value


class PartCreateRequest(BaseModel):
    name: str
    sku: str
    stock_quantity: int = Field(..., ge=0)
    low_stock_threshold: int = Field(5, ge=0)


class PartAdminResponse(BaseModel):
    id: int
    name: str
    sku: str
    stock_quantity: int
    reserved_qty: int
    low_stock_threshold: int

    class Config:
        from_attributes = True
