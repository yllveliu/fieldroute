from fastapi import APIRouter, Depends

from app.core.dependencies import require_approved_technician, require_role
from .routes import admin
from .routes import ai
from .routes import debug
from .routes import health
from .routes import jobs
from .routes import parts
from .routes import dispatcher
from .routes import technicians
from .routes import technician_jobs
from .routes import assignment
from .routes import job_events
from .routes import auth

api_router = APIRouter()

# Mount health check route at root; more routers (customers, etc.) can be added later
api_router.include_router(health.router)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(
    parts.router, prefix="/parts", tags=["parts"],
    dependencies=[Depends(require_role("dispatcher", "technician", "admin"))],
)
api_router.include_router(
    dispatcher.router, prefix="/dispatcher", tags=["dispatcher"],
    dependencies=[Depends(require_role("dispatcher"))],
)
api_router.include_router(
    debug.router, prefix="/debug", tags=["debug"],
    dependencies=[Depends(require_role("dispatcher"))],
)
api_router.include_router(
    technicians.router, prefix="/technicians", tags=["technicians"],
    dependencies=[Depends(require_role("dispatcher", "technician", "admin"))],
)
api_router.include_router(
    ai.router, prefix="/ai", tags=["ai"],
    dependencies=[Depends(require_role("dispatcher"))],
)
api_router.include_router(
    assignment.router, prefix="/jobs", tags=["jobs"],
    dependencies=[Depends(require_role("dispatcher"))],
)
api_router.include_router(
    technician_jobs.router,
    prefix="/technician/jobs",
    tags=["technician"],
    dependencies=[Depends(require_approved_technician)],
)
api_router.include_router(job_events.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
