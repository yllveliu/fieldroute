from fastapi import APIRouter

from .routes import health

api_router = APIRouter()

# Mount health check route at root; more routers (customers, jobs, etc.) can be added later
api_router.include_router(health.router)
