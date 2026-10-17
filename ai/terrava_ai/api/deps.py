from functools import lru_cache

from fastapi import Header, HTTPException, status

from ..chat.assistant import TerraAssistant
from ..config import get_settings
from ..ml.registry import ModelRegistry


@lru_cache
def get_registry() -> ModelRegistry:
    s = get_settings()
    return ModelRegistry(s.models_dir, auto_train=s.auto_train, n_samples=s.training_samples, seed=s.random_seed)


@lru_cache
def get_assistant() -> TerraAssistant:
    return TerraAssistant(get_settings(), get_registry())


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """When TERRAVA_AI_API_KEY is set, callers must present it in `x-api-key`."""
    expected = get_settings().api_key
    if expected and x_api_key != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing x-api-key")
