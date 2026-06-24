import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION, ENVIRONMENT, FRONTEND_URL
from app.core.limiter import limiter

logger = logging.getLogger(__name__)

app = FastAPI(
    redirect_slashes=False,
    title=APP_NAME,
    description=(
        "**FieldRoute** is a field-service dispatch platform.\n\n"
        "## Authentication\n"
        "Most endpoints require a JWT bearer token. Obtain one via `POST /auth/login`.\n\n"
        "## Roles\n"
        "| Role | Access |\n"
        "|------|--------|\n"
        "| `customer` | Submit jobs, track own job status |\n"
        "| `technician` | View and update assigned jobs, inventory |\n"
        "| `dispatcher` | Full board, classify, assign, manage technicians |\n"
        "| `admin` | Manage staff accounts, review technician applications |\n"
    ),
    version=APP_VERSION,
    contact={"name": "FieldRoute Team"},
    openapi_tags=[
        {"name": "health", "description": "Liveness and readiness probes."},
        {"name": "auth", "description": "Registration, login, password reset."},
        {"name": "jobs", "description": "Job lifecycle — submit, classify, track."},
        {"name": "dispatcher", "description": "Dispatcher board and status transitions."},
        {"name": "technician", "description": "Technician job view and status updates."},
        {"name": "technicians", "description": "Technician roster management."},
        {"name": "parts", "description": "Inventory / parts management."},
        {"name": "ai", "description": "AI-powered job classification."},
        {"name": "admin", "description": "Admin-only: staff accounts and applications."},
        {"name": "debug", "description": "Development-only diagnostic endpoints."},
    ],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


app.include_router(api_router)
