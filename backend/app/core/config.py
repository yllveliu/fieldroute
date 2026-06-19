import os

APP_NAME = "FieldRoute API"
APP_VERSION = "0.1.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# PostgreSQL connection string (SQLAlchemy-compatible URL)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://fieldroute:fieldroute@db:5432/fieldroute",
)

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "fieldroute-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Claude AI classification (KAN-67). Loaded from the environment only — never
# hardcode or log this value. Empty by default so the classify endpoint falls
# back to the KAN-31 keyword classifier when no key is configured.
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
