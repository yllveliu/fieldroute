from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

import app.db.base  # noqa: F401 — registers all ORM models so SQLAlchemy mappers configure at startup
from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
)


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,  # noqa: ARG001 - required by FastAPI handler signature
    exc: Exception,  # noqa: ARG001 - do not expose exception details to clients
):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error."},
    )


# Include central API router (mounts health and future routes)
app.include_router(api_router)
