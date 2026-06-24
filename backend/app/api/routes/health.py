from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.api_route(
    "/health",
    methods=["GET", "HEAD"],
    summary="API liveness check",
    description="Returns `ok` immediately. Use this to verify the service is reachable.",
    responses={200: {"content": {"application/json": {"example": {"status": "ok", "service": "fieldroute-api"}}}}},
)
async def health():
    return {"status": "ok", "service": "fieldroute-api"}


@router.get(
    "/health/db",
    summary="Database connectivity check",
    description="Executes a trivial `SELECT 1` against the database. Returns `ok` when the connection pool is healthy.",
    responses={
        200: {"content": {"application/json": {"example": {"status": "ok", "database": "connected"}}}},
        500: {"description": "Database unreachable"},
    },
)
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
