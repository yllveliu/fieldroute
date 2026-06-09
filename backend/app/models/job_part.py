from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.part import Part


class JobPart(Base):
    __tablename__ = "job_parts"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    part_id: Mapped[int] = mapped_column(ForeignKey("parts.id"), nullable=False)
    qty_needed: Mapped[int] = mapped_column(Integer, nullable=False)

    job: Mapped["Job"] = relationship("Job", back_populates="job_parts")
    part: Mapped["Part"] = relationship("Part", back_populates="job_parts")
