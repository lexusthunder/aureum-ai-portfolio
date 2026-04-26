from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.ml_model import get_model
from app.routers import health, leads


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: pre-inițializează modelul (nu lazy load la primul request)
    get_model()
    print(f"[startup] {settings.app_name} v{settings.app_version} pornit.")
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API de scoring lead-uri B2B folosind rețele neurale. "
            "Trimite features despre un lead și primești probabilitatea de conversie."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # restricționează în producție
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(leads.router, prefix="/api/v1")

    return app


app = create_app()
