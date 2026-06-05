from fastapi import APIRouter

from .routes import health
from .routes import jobs
from .routes import parts

api_router = APIRouter()

# Mount health check route at root; more routers (customers, etc.) can be added later
api_router.include_router(health.router)
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
