from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check")
def health_check():
    return {"status": "ok", "version": settings.app_version}


@router.get("/", summary="Root")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }
