from fastapi import HTTPException, Security, status
from fastapi.security.api_key import APIKeyHeader

from app.core.config import settings

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(api_key: str = Security(API_KEY_HEADER)) -> str:
    """Verifică API key din header X-API-Key."""
    if not api_key or api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key invalid sau lipsă. Adaugă header X-API-Key.",
        )
    return api_key
