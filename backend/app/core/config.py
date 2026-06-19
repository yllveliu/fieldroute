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

# Email / SMTP settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@fieldroute.com")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "")
