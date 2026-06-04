from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import APP_NAME, APP_VERSION

app = FastAPI(
    title=APP_NAME,
    description="Backend API for the FieldRoute field-service dispatch platform.",
    version=APP_VERSION,
)

# Include central API router (mounts health and future routes)
app.include_router(api_router)
