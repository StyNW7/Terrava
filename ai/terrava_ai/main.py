"""FastAPI application factory for the Terrava AI service."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .api.deps import get_assistant, get_registry
from .api.routes import router
from .chat.retriever import get_knowledge_base
from .config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Load (or train on first start) the models and index the knowledge base up front.
    await run_in_threadpool(get_registry().get)
    await run_in_threadpool(get_knowledge_base)
    logging.getLogger("terrava").info("Terra assistant mode: %s", get_assistant().mode)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Terrava AI",
        version=__version__,
        description=(
            "Machine learning and assistant service for Terrava: livestock health scoring, condition "
            "classification, anomaly detection, vital-sign forecasting, estrus detection, heat-stress "
            "analytics, herd insights and the Terra chatbot."
        ),
        lifespan=lifespan,
    )
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_methods=["*"], allow_headers=["*"])
    app.include_router(router)

    @app.get("/health", tags=["Service"])
    def health():
        registry = get_registry()
        metadata = registry.get().metadata
        return {
            "status": "ok",
            "service": "terrava-ai",
            "version": __version__,
            "modelVersion": metadata["version"],
            "modelTrainedAt": metadata["trained_at"],
            "assistantMode": get_assistant().mode,
        }

    return app


app = create_app()
