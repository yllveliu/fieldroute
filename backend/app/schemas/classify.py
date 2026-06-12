from pydantic import BaseModel


class ClassifyResponse(BaseModel):
    job_id: int
    previous_status: str
    new_status: str
    ai_service_type: str
    ai_confidence: float
    ai_explanation: str

    model_config = {"from_attributes": True}
