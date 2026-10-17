"""Tools the Terra assistant can call. Each tool validates its own input because
streamed (eager) tool inputs are not validated server-side."""

from __future__ import annotations

import json
from typing import Any

from ..ml.features import Baseline
from ..ml.heat import assess_heat
from ..ml.inference import VitalsWindow, assess
from ..ml.registry import ModelRegistry
from .retriever import get_knowledge_base

TOOLS: list[dict[str, Any]] = [
    {
        "name": "search_knowledge",
        "description": "Search Terrava's veterinary and product knowledge base (cattle vital signs, diseases, heat stress, vaccination, estrus, ear tag troubleshooting, how to use the dashboard). Use it before giving health or product advice.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "What to look up, in Indonesian or English"}},
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "name": "assess_vitals",
        "description": "Run Terrava's health model on vital signs. Returns a 0-100 health score, status, the most likely conditions with probabilities, anomaly score and the readings that drove the result. Pass single values or recent hourly series.",
        "input_schema": {
            "type": "object",
            "properties": {
                "temperature": {"type": "array", "items": {"type": "number"}, "description": "Body temperature °C, oldest first"},
                "heartRate": {"type": "array", "items": {"type": "number"}, "description": "Heart rate bpm"},
                "oxygen": {"type": "array", "items": {"type": "number"}, "description": "SpO2 %"},
                "activity": {"type": "array", "items": {"type": "number"}, "description": "Activity index 0-100"},
                "baselineActivity": {"type": "number", "description": "The animal's normal activity, if known"},
                "thi": {"type": "number", "description": "Environmental Temperature-Humidity Index, if known"},
            },
            "required": ["temperature", "heartRate"],
            "additionalProperties": False,
        },
    },
    {
        "name": "heat_stress",
        "description": "Compute the Temperature-Humidity Index and heat-stress risk, estimated milk loss and recommended actions from air temperature and humidity.",
        "input_schema": {
            "type": "object",
            "properties": {
                "temperature": {"type": "number", "description": "Air temperature °C"},
                "humidity": {"type": "number", "description": "Relative humidity %"},
                "herdSize": {"type": "integer", "description": "Number of dairy cows, for the herd milk-loss estimate"},
            },
            "required": ["temperature", "humidity"],
            "additionalProperties": False,
        },
    },
    {
        "name": "get_animal",
        "description": "Look up an animal from the user's farm data by code (e.g. TRV-001), ear tag, id or name. Returns its latest vitals, status, barn and recent alerts.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "name": "list_alerts",
        "description": "List alerts from the user's farm data, optionally filtered by status (active, acknowledged, resolved) or severity (info, warning, high, critical).",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["active", "acknowledged", "resolved"]},
                "severity": {"type": "string", "enum": ["info", "warning", "high", "critical"]},
                "limit": {"type": "integer"},
            },
            "additionalProperties": False,
        },
    },
]

for tool in TOOLS:
    # Stream tool inputs as they are generated (we validate them ourselves below).
    tool["eager_input_streaming"] = True


class ToolError(ValueError):
    pass


def _numbers(value: Any, field: str, required: bool = False) -> list[float]:
    if value is None:
        if required:
            raise ToolError(f"'{field}' is required")
        return []
    if isinstance(value, (int, float)):
        return [float(value)]
    if not isinstance(value, list) or not all(isinstance(v, (int, float)) for v in value):
        raise ToolError(f"'{field}' must be a number or a list of numbers")
    return [float(v) for v in value][-200:]


def run_tool(name: str, args: Any, registry: ModelRegistry, context: dict | None) -> str:
    """Execute a tool and return a JSON string for the tool_result block."""
    if not isinstance(args, dict):
        raise ToolError("Tool input must be a JSON object")
    context = context or {}

    if name == "search_knowledge":
        query = args.get("query")
        if not isinstance(query, str) or not query.strip():
            raise ToolError("'query' must be a non-empty string")
        hits = get_knowledge_base().search(query, k=4)
        return json.dumps([{"title": h["title"], "text": h["text"][:1800]} for h in hits], ensure_ascii=False)

    if name == "assess_vitals":
        temperature = _numbers(args.get("temperature"), "temperature", required=True)
        heart_rate = _numbers(args.get("heartRate"), "heartRate", required=True)
        oxygen = _numbers(args.get("oxygen"), "oxygen")
        activity = _numbers(args.get("activity"), "activity")
        baseline_activity = args.get("baselineActivity")
        baseline = Baseline(activity=float(baseline_activity)) if isinstance(baseline_activity, (int, float)) and baseline_activity > 0 else None
        thi = args.get("thi") if isinstance(args.get("thi"), (int, float)) else None
        result = assess(registry.get(), VitalsWindow(temperature, heart_rate, oxygen, activity, thi, baseline))
        result.pop("features", None)
        result["conditions"] = result["conditions"][:4]
        return json.dumps(result, ensure_ascii=False)

    if name == "heat_stress":
        t, h = args.get("temperature"), args.get("humidity")
        if not isinstance(t, (int, float)) or not isinstance(h, (int, float)) or not 0 <= h <= 100:
            raise ToolError("temperature (°C) and humidity (0-100 %) are required numbers")
        herd = args.get("herdSize") if isinstance(args.get("herdSize"), int) else 0
        return json.dumps(assess_heat(float(t), float(h), herd_size=herd), ensure_ascii=False)

    if name == "get_animal":
        query = str(args.get("query", "")).strip().lower()
        if not query:
            raise ToolError("'query' is required")
        animals = context.get("animals", [])
        match = next(
            (a for a in animals if query in {str(a.get(k, "")).lower() for k in ("id", "code", "earTagId", "name")}),
            None,
        ) or next((a for a in animals if query in str(a.get("name", "")).lower()), None)
        if not match:
            return json.dumps({"found": False, "message": "No animal matches that query in the farm data provided."})
        related = [al for al in context.get("alerts", []) if al.get("livestockId") == match.get("id")][:5]
        return json.dumps({"found": True, "animal": match, "recentAlerts": related}, ensure_ascii=False)

    if name == "list_alerts":
        alerts = context.get("alerts", [])
        if args.get("status"):
            alerts = [a for a in alerts if a.get("status") == args["status"]]
        if args.get("severity"):
            alerts = [a for a in alerts if a.get("severity") == args["severity"]]
        limit = args.get("limit") if isinstance(args.get("limit"), int) else 10
        return json.dumps({"total": len(alerts), "alerts": alerts[: max(1, min(limit, 30))]}, ensure_ascii=False)

    raise ToolError(f"Unknown tool '{name}'")
