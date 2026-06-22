"""add requested_by_technician_id to jobs

Records which technician requested a job for themselves so they can be excluded
from the assignable-technician list for that job.

Revision ID: f2b3c4d5e6f7
Revises: e1a2b3c4d5e6
Create Date: 2026-06-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2b3c4d5e6f7'
down_revision: Union[str, None] = 'e1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'jobs',
        sa.Column('requested_by_technician_id', sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        'fk_jobs_requested_by_technician_id_technicians',
        'jobs', 'technicians',
        ['requested_by_technician_id'], ['id'],
    )


def downgrade() -> None:
    op.drop_constraint(
        'fk_jobs_requested_by_technician_id_technicians', 'jobs', type_='foreignkey'
    )
    op.drop_column('jobs', 'requested_by_technician_id')
