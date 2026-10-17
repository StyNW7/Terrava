import os

import pytest

# Small, fast models in a temporary directory; the assistant runs offline in tests.
os.environ.pop("ANTHROPIC_API_KEY", None)
os.environ["TERRAVA_AI_TRAINING_SAMPLES"] = "4000"
os.environ.pop("TERRAVA_AI_API_KEY", None)


@pytest.fixture(scope="session")
def models_dir(tmp_path_factory):
    path = tmp_path_factory.mktemp("models")
    os.environ["TERRAVA_AI_MODELS_DIR"] = str(path)
    return path


@pytest.fixture(scope="session")
def models(models_dir):
    from terrava_ai.ml.registry import ModelRegistry

    return ModelRegistry(models_dir, auto_train=True, n_samples=4000, seed=1).get()


@pytest.fixture(scope="session")
def client(models_dir):
    from fastapi.testclient import TestClient

    from terrava_ai.api import deps
    from terrava_ai.config import get_settings

    get_settings.cache_clear()
    deps.get_registry.cache_clear()
    deps.get_assistant.cache_clear()
    from terrava_ai.main import create_app

    with TestClient(create_app()) as test_client:
        yield test_client
