from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    jobs_today: int
    jobs_by_status: dict[str, int]
    available_technicians: int
    avg_resolution_hours: float | None
    technician_utilization_pct: float | None
