from fastapi import APIRouter

from .routes import health
from .routes import parts

api_router = APIRouter()

# Mount health check route at root; more routers (customers, jobs, etc.) can be added later
api_router.include_router(health.router)
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
