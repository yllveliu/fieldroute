import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION, ENVIRONMENT, FRONTEND_URL
from app.core.limiter import limiter

logger = logging.getLogger(__name__)

ENV = os.getenv("ENV", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = ["*"] if ENV != "production" else [FRONTEND_URL]

app = FastAPI(
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def force_dev_wildcard_preflight(request: Request, call_next):
    response = await call_next(request)
    if (
        ENV != "production"
        and request.method == "OPTIONS"
        and request.headers.get("access-control-request-method")
    ):
        response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# Include central API router (mounts health and future routes)
app.include_router(api_router)
