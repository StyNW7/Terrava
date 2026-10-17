"""Health assessment for one animal: condition probabilities, anomaly score,
explanations and a 0-100 health score compatible with the dashboard bands."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np

from .features import FEATURES, Baseline, to_matrix, window_features
from .physiology import CONDITIONS, NORMAL, SEVERITY_WEIGHT
from .registry import LoadedModels


@dataclass
class VitalsWindow:
    temperature: Sequence[float | None]
    heart_rate: Sequence[float | None]
    oxygen: Sequence[float | None]
    activity: Sequence[float | None]
    thi: Sequence[float | None] | float | None = None
    baseline: Baseline | None = None


def physiological_score(temperature: float, heart_rate: float, oxygen: float, activity_ratio: float) -> float:
    """Distance-from-normal score; the same idea as the backend's deterministic model."""

    def excess(value: float, low: float, high: float) -> float:
        return max(0.0, low - value, value - high)

    penalty = (
        excess(temperature, *NORMAL["temperature"]) * 28
        + excess(heart_rate, *NORMAL["heart_rate"]) * 0.9
        + excess(oxygen, *NORMAL["oxygen"]) * 4
        + max(0.0, 0.7 - activity_ratio) * 60
    )
    return float(np.clip(98 - penalty, 0, 100))


def band(score: float) -> str:
    if score >= 80:
        return "healthy"
    if score >= 58:
        return "attention"
    return "critical"


def _factor_message(name: str, value: float, baseline: Baseline) -> dict[str, str] | None:
    if name == "temp_delta" and abs(value) >= 0.4:
        sign = "+" if value > 0 else "-"
        return {"id": f"Suhu tubuh {sign}{abs(value):.1f}°C dari baseline ternak", "en": f"Body temperature {sign}{abs(value):.1f}°C from the animal's baseline"}
    if name == "temp_slope" and abs(value) >= 0.05:
        return {"id": f"Suhu berubah {value:+.2f}°C per jam", "en": f"Temperature changing {value:+.2f}°C per hour"}
    if name == "hr_delta" and abs(value) >= 10:
        return {"id": f"Detak jantung {value:+.0f} bpm dari baseline", "en": f"Heart rate {value:+.0f} bpm from baseline"}
    if name == "spo2_min" and value < 94:
        return {"id": f"Saturasi oksigen terendah {value:.0f}%", "en": f"Lowest oxygen saturation {value:.0f}%"}
    if name == "act_ratio" and (value < 0.75 or value > 1.5):
        pct = round(value * 100)
        return {"id": f"Aktivitas {pct}% dari baseline normalnya", "en": f"Activity at {pct}% of its normal baseline"}
    if name == "thi_mean" and value >= 72:
        return {"id": f"THI lingkungan rata-rata {value:.0f} (berisiko heat stress)", "en": f"Average environmental THI {value:.0f} (heat stress risk)"}
    return None


def assess(models: LoadedModels, window: VitalsWindow) -> dict:
    baseline = window.baseline or Baseline()
    features = window_features(window.temperature, window.heart_rate, window.oxygen, window.activity, window.thi, baseline)
    X = to_matrix([features])

    probabilities = models.risk.predict_proba(X)[0]
    ranked = sorted(((str(k), float(v)) for k, v in zip(models.risk.classes_, probabilities)), key=lambda item: item[1], reverse=True)
    conditions = [
        {"key": key, "name": {"id": CONDITIONS[key].name_id, "en": CONDITIONS[key].name_en}, "probability": round(float(p), 4)}
        for key, p in ranked
    ]
    primary_key, primary_p = ranked[0]
    p = dict(ranked)

    # Unsupervised second opinion: how unusual is this window versus healthy animals?
    decision = float(models.anomaly.decision_function(X)[0])
    anomaly_score = float(1 / (1 + np.exp(decision * 12)))  # ~0.5 at the boundary, ->1 when anomalous
    is_anomaly = bool(models.anomaly.predict(X)[0] == -1)

    # Health score: model view (1 - expected severity over the condition probabilities)
    # blended with how far the raw vitals are from the normal ranges.
    expected_severity = sum(float(prob) * SEVERITY_WEIGHT[key] for key, prob in p.items())
    model_score = 100 * (1 - expected_severity)
    phys = physiological_score(features["temp_max"], features["hr_mean"], features["spo2_min"], features["act_ratio"])
    score = round(0.6 * model_score + 0.4 * phys)

    z = (X[0] - models.normal_mean) / models.normal_std
    factors = []
    for index in np.argsort(-np.abs(z)):
        name = FEATURES[int(index)]
        message = _factor_message(name, features[name], baseline)
        if message:
            factors.append({"feature": name, "value": round(features[name], 3), "zScore": round(float(z[index]), 2), "message": message})
        if len(factors) == 4:
            break

    condition = CONDITIONS[primary_key]
    return {
        "healthScore": int(score),
        "status": band(score),
        "primaryCondition": {"key": primary_key, "name": {"id": condition.name_id, "en": condition.name_en}, "probability": round(float(primary_p), 4)},
        "conditions": conditions,
        "urgent": bool(condition.urgent and primary_p >= 0.5),
        "anomaly": {"score": round(anomaly_score, 4), "isAnomaly": is_anomaly},
        "factors": factors,
        "cause": {"id": condition.cause_id, "en": condition.cause_en},
        "recommendations": list(condition.actions),
        "features": {k: round(v, 3) for k, v in features.items()},
        "modelVersion": models.metadata["version"],
    }
