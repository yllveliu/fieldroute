from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.job_part import JobPart
    from app.models.service import Service
    from app.models.technician import Technician


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id"), nullable=True)
    technician_id: Mapped[int | None] = mapped_column(ForeignKey("technicians.id"), nullable=True)
    raw_description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new")
    eta_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    customer: Mapped["Customer"] = relationship("Customer", back_populates="jobs")
    service: Mapped["Service | None"] = relationship("Service", back_populates="jobs")
    technician: Mapped["Technician | None"] = relationship("Technician", back_populates="jobs")
    job_parts: Mapped[list["JobPart"]] = relationship("JobPart", back_populates="job")
