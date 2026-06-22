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

# Public base URL of the frontend, used to build links in emails
# (e.g. the password-reset link). No trailing slash.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Email / SMTP settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@fieldroute.com")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "")
# Claude AI classification (KAN-67). Loaded from the environment only — never
# hardcode or log this value. Empty by default so the classify endpoint falls
# back to the KAN-31 keyword classifier when no key is configured.
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
