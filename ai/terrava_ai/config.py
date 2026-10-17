from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PACKAGE_DIR.parent


class Settings(BaseSettings):
    """Runtime configuration, read from environment variables or `ai/.env`."""

    model_config = SettingsConfigDict(env_file=PROJECT_DIR / ".env", env_prefix="TERRAVA_AI_", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:4173,http://localhost:4000"
    # When set, every /v1 request must send it in the `x-api-key` header.
    api_key: str | None = None

    models_dir: Path = PROJECT_DIR / "models"
    # Train missing models on startup so the service works out of the box.
    auto_train: bool = True
    training_samples: int = Field(default=14_000, ge=1_000)
    random_seed: int = 42

    # Claude powers the Terra assistant. Without a key the assistant answers from
    # the local knowledge base and the models (offline mode).
    anthropic_api_key: str | None = Field(default=None, validation_alias="ANTHROPIC_API_KEY")
    llm_model: str = "claude-opus-5-5"
    llm_effort: str = "low"
    llm_max_tokens: int = 16_000
    llm_max_tool_rounds: int = 6

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
