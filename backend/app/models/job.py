from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.job_event import JobEvent
    from app.models.job_part import JobPart
    from app.models.service import Service
    from app.models.technician import Technician


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id"), nullable=True)
    technician_id: Mapped[int | None] = mapped_column(ForeignKey("technicians.id"), nullable=True)
    # The technician who *requested* this job for themselves (if any). Used to
    # keep them out of the assignable-technician list for their own request.
    requested_by_technician_id: Mapped[int | None] = mapped_column(
        ForeignKey("technicians.id"), nullable=True
    )
    raw_description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new")
    eta_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    ai_service_type: Mapped[str | None] = mapped_column(String, nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="jobs")
    service: Mapped["Service | None"] = relationship("Service", back_populates="jobs")
    technician: Mapped["Technician | None"] = relationship(
        "Technician", foreign_keys=[technician_id], back_populates="jobs"
    )
    job_parts: Mapped[list["JobPart"]] = relationship("JobPart", back_populates="job")
    events: Mapped[list["JobEvent"]] = relationship("JobEvent", back_populates="job")
