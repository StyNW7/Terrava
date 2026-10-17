"""HTTP endpoints of the AI service (all under /v1)."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from ..chat.retriever import get_knowledge_base
from ..ml.features import Baseline
from ..ml.heat import assess_heat
from ..ml.inference import VitalsWindow, assess
from ..ml.insights import generate_insights
from ..ml.physiology import CONDITIONS, NORMAL
from ..ml.timeseries import detect_estrus, forecast, hours_until, robust_anomalies
from ..schemas import (
    AlertExplainRequest,
    AnomalyRequest,
    BatchHealthRequest,
    ChatRequest,
    EstrusRequest,
    ForecastRequest,
    HealthScoreRequest,
    HeatStressRequest,
    HerdInsightsRequest,
)
from .deps import get_assistant, get_registry, require_api_key

router = APIRouter(prefix="/v1", dependencies=[Depends(require_api_key)])


def _baseline(b) -> Baseline | None:
    return Baseline(temperature=b.temperature, heart_rate=b.heartRate, activity=b.activity, oxygen=b.oxygen) if b else None


def _window(body) -> VitalsWindow:
    return VitalsWindow(body.temperature, body.heartRate, body.oxygen, body.activity, body.thi, _baseline(body.baseline))


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

@router.get("/models", tags=["Models"], summary="Model versions, features and evaluation metrics")
def models_info():
    metadata = get_registry().get().metadata
    return {k: v for k, v in metadata.items() if k != "normal_profile"}


@router.post("/models/train", tags=["Models"], summary="Retrain the models (synthetic data until real labels are available)")
async def retrain(samples: int = Query(14_000, ge=2_000, le=200_000)):
    metadata = await run_in_threadpool(get_registry().retrain, samples)
    return {"ok": True, "accuracy": metadata["risk_model"]["accuracy"], "macroF1": metadata["risk_model"]["macro_f1"], "trainedAt": metadata["trained_at"]}


@router.get("/conditions", tags=["Models"], summary="Conditions the health model recognises and the normal vital ranges")
def conditions():
    return {
        "normalRanges": NORMAL,
        "conditions": [
            {"key": c.key, "name": {"id": c.name_id, "en": c.name_en}, "category": c.category, "urgent": c.urgent, "recommendations": list(c.actions)}
            for c in CONDITIONS.values()
        ],
    }


# ---------------------------------------------------------------------------
# Health, anomalies, forecasting
# ---------------------------------------------------------------------------

@router.post("/health/score", tags=["Health"], summary="Health score, likely conditions, anomaly score and explanation for one animal")
def health_score(body: HealthScoreRequest):
    result = assess(get_registry().get(), _window(body))
    return {"livestockId": body.livestockId, **result}


@router.post("/health/batch", tags=["Health"], summary="Score many animals in one call (e.g. a whole farm)")
def health_batch(body: BatchHealthRequest):
    models = get_registry().get()
    results = []
    for animal in body.animals:
        r = assess(models, _window(animal))
        results.append({"livestockId": animal.livestockId, "healthScore": r["healthScore"], "status": r["status"], "primaryCondition": r["primaryCondition"], "urgent": r["urgent"], "anomaly": r["anomaly"]})
    return {"results": results}


@router.post("/anomaly/detect", tags=["Health"], summary="Per-reading anomalies against the animal's own recent history + window anomaly score")
def anomaly(body: AnomalyRequest):
    series = {"temperature": body.temperature, "heart_rate": body.heartRate, "oxygen": body.oxygen, "activity": body.activity}
    points = robust_anomalies(series, window=body.window, threshold=body.threshold)
    if body.timestamps:
        for point in points:
            if point["index"] < len(body.timestamps):
                point["timestamp"] = body.timestamps[point["index"]]
    window_score = None
    if body.temperature and body.heartRate:
        recent = slice(-24, None)
        r = assess(get_registry().get(), VitalsWindow(body.temperature[recent], body.heartRate[recent], body.oxygen[recent], body.activity[recent]))
        window_score = r["anomaly"]
    rename = {"heart_rate": "heartRate"}
    flagged = [{**p, "vitals": {rename.get(k, k): v for k, v in p["vitals"].items()}} for p in points if p["isAnomaly"]]
    return {"livestockId": body.livestockId, "readings": len(points), "anomalies": flagged, "anomalyRate": round(len(flagged) / max(1, len(points)), 4), "window": window_score}


@router.post("/forecast/vitals", tags=["Forecast"], summary="Forecast a vital sign (Holt-Winters with daily seasonality) and time-to-threshold")
def forecast_vitals(body: ForecastRequest):
    result = forecast(body.values, horizon=body.horizon, season=body.season)
    crossing = hours_until(result["forecast"], body.threshold, above=body.thresholdDirection == "above") if body.threshold is not None else None
    return {"metric": body.metric, "horizonHours": body.horizon, **result, "hoursUntilThreshold": crossing}


@router.post("/estrus/detect", tags=["Reproduction"], summary="Detect estrus (heat) from activity and suggest the insemination window")
def estrus(body: EstrusRequest):
    return {"livestockId": body.livestockId, **detect_estrus(body.activity)}


@router.post("/heat-stress", tags=["Environment"], summary="THI, heat-stress band, exposure hours, milk-loss estimate and actions")
def heat_stress(body: HeatStressRequest):
    return assess_heat(body.temperature, body.humidity, [p.model_dump() for p in body.forecast], body.herdSize, body.dairyShare)


# ---------------------------------------------------------------------------
# Insights and alert explanations
# ---------------------------------------------------------------------------

@router.post("/insights/herd", tags=["Insights"], summary="Herd-level AI insights in the dashboard's AIInsight shape")
def herd_insights(body: HerdInsightsRequest):
    return generate_insights(get_registry().get(), body.model_dump())


@router.post("/alerts/explain", tags=["Insights"], summary="Likely cause, condition probabilities and recommended actions for an alert")
def explain_alert(body: AlertExplainRequest):
    models = get_registry().get()
    window = VitalsWindow(
        [body.temperature] if body.temperature is not None else [],
        [body.heartRate] if body.heartRate is not None else [],
        [body.oxygen] if body.oxygen is not None else [],
        [body.activity] if body.activity is not None else [],
        body.thi,
        Baseline(activity=body.baselineActivity) if body.baselineActivity else None,
    )
    r = assess(models, window)
    return {
        "aiConfidence": round(r["primaryCondition"]["probability"] * 100),
        "aiCause": r["cause"],
        "likelyConditions": r["conditions"][:3],
        "recommendations": r["recommendations"],
        "factors": r["factors"],
        "urgent": r["urgent"],
    }


# ---------------------------------------------------------------------------
# Terra assistant
# ---------------------------------------------------------------------------

@router.get("/knowledge/search", tags=["Assistant"], summary="Search the assistant's knowledge base")
def knowledge_search(q: str = Query(..., min_length=2), k: int = Query(4, ge=1, le=10)):
    return {"query": q, "results": get_knowledge_base().search(q, k=k)}


@router.post("/chat", tags=["Assistant"], summary="Ask Terra (complete answer as JSON)")
async def chat(body: ChatRequest):
    assistant = get_assistant()
    text, tools, done, error = [], [], {}, None
    async for event in assistant.stream([m.model_dump() for m in body.messages], body.language, body.context):
        if event["type"] == "text":
            text.append(event["delta"])
        elif event["type"] == "tool":
            tools.append(event["name"])
        elif event["type"] == "done":
            done = event
        elif event["type"] == "error":
            error = event["message"]
    return {"reply": "".join(text).strip(), "toolsUsed": tools, "mode": done.get("mode", assistant.mode), "usage": done.get("usage"), "error": error}


@router.post("/chat/stream", tags=["Assistant"], summary="Ask Terra with a streamed answer (Server-Sent Events)")
async def chat_stream(body: ChatRequest):
    assistant = get_assistant()

    async def events() -> AsyncIterator[str]:
        async for event in assistant.stream([m.model_dump() for m in body.messages], body.language, body.context):
            yield f"event: {event['type']}\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
