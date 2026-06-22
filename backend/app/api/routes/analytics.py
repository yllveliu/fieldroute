from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import get_analytics

router = APIRouter()


@router.get("", response_model=AnalyticsResponse)
def dispatcher_analytics(db: Session = Depends(get_db)) -> AnalyticsResponse:
    return get_analytics(db)
