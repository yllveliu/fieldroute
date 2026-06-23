from fastapi import FastAPI
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION
from app.core.rate_limit import limiter, rate_limit_exceeded_handler

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Include central API router (mounts health and future routes)
app.include_router(api_router)
