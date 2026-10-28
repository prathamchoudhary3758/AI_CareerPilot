from fastapi import APIRouter
from datetime import datetime
from backend.core.config import get_settings
from backend.models.schemas import HealthCheckResponse

router = APIRouter()
settings = get_settings()

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    return HealthCheckResponse(
        status="healthy",
        app_name=settings.app_name,
        version=settings.app_version,
        timestamp=datetime.utcnow().isoformat()
    )
