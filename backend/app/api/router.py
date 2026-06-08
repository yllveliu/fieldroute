from fastapi import APIRouter

from .routes import ai
from .routes import debug
from .routes import health
from .routes import jobs
from .routes import parts
from .routes import dispatcher
from .routes import technicians
from .routes import assignment

api_router = APIRouter()

# Mount health check route at root; more routers (customers, etc.) can be added later
api_router.include_router(health.router)
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(dispatcher.router, prefix="/dispatcher", tags=["dispatcher"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
api_router.include_router(technicians.router, prefix="/technicians", tags=["technicians"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(assignment.router, prefix="/jobs", tags=["jobs"])
