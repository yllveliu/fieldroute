"""Alembic migration environment for FieldRoute."""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# DATABASE_URL is sourced from the environment via app.core.config, so we never
# hardcode credentials in alembic.ini.
from app.core.config import DATABASE_URL

# Importing app.db.base registers the declarative Base and all ORM models on
# Base.metadata, which is what Alembic autogenerate compares against.
from app.db.base import Base

# Alembic Config object, providing access to values in alembic.ini.
config = context.config

# Inject the database URL from the application config / environment.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Configure Python logging from the .ini file, if present.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' support.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emits SQL, no live DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to the database)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
