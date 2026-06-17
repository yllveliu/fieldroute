from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "dispatcher" | "technician" | "admin"


class RegisterResponse(BaseModel):
    user_id: int
    email: str
    role: str
    message: str
