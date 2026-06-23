import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION

ENV = os.getenv("ENV", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = ["*"] if ENV != "production" else [FRONTEND_URL]

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
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
