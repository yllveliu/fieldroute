from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    LargeBinary,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.roles import ApplicationStatus
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.user import User


class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Links a technician record to its login account. Nullable so existing/
    # admin-created technicians without a login still work.
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, unique=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="available")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    # --- Technician application (self-service apply → admin review) ---
    # pending while awaiting review, approved once accepted, rejected on decline
    # (a rejected application's account is deleted, so rejected rows are rare).
    application_status: Mapped[str] = mapped_column(
        String, nullable=False, default=ApplicationStatus.APPROVED.value,
        server_default=ApplicationStatus.APPROVED.value,
    )
    # AI review of the uploaded CV against the company's required skills:
    # a 0-100 suitability percentage plus a short human-readable summary.
    ai_match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_match_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # CV stored in-DB (PDF only). Never select cv_data in list queries — it is
    # fetched solely by the authenticated admin download endpoint.
    cv_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    cv_filename: Mapped[str | None] = mapped_column(String, nullable=True)
    cv_content_type: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User | None"] = relationship("User", back_populates="technician")
    jobs: Mapped[list["Job"]] = relationship(
        "Job", foreign_keys="Job.technician_id", back_populates="technician"
    )
