from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION, ENVIRONMENT, FRONTEND_URL
from app.core.limiter import limiter

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# In development allow the Vite dev server; in production restrict to the
# configured FRONTEND_URL so the wildcard never reaches production.
if ENVIRONMENT == "production":
    cors_origins = [FRONTEND_URL]
else:
    cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
