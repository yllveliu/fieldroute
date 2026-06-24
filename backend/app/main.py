from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION
from app.core.limiter import limiter

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(api_router)
