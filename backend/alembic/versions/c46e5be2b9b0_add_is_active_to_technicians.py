"""add_is_active_to_technicians

Revision ID: c46e5be2b9b0
Revises: 6a7ce0154c78
Create Date: 2026-06-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c46e5be2b9b0'
down_revision: Union[str, None] = '6a7ce0154c78'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'technicians',
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column('technicians', 'is_active')
