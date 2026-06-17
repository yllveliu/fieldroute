"""merge_kan26_kan27_heads

Revision ID: 6a7ce0154c78
Revises: 0131a359526c, b53862372731
Create Date: 2026-06-11 12:04:55.161197

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a7ce0154c78'
down_revision: Union[str, None] = ('0131a359526c', 'b53862372731')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
