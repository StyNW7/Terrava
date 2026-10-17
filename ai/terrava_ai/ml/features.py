"""Feature engineering shared by training and inference.

A *window* is the recent history of one animal (hourly readings, typically the
last 24 h). A *baseline* summarises the animal's own normal over the previous
days, so features describe change relative to that individual, which is how
Terrava separates a naturally lively animal from a sick one.
"""

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np

FEATURES: list[str] = [
    "temp_mean",
    "temp_max",
    "temp_delta",
    "temp_slope",
    "hr_mean",
    "hr_max",
    "hr_delta",
    "spo2_mean",
    "spo2_min",
    "act_mean",
    "act_ratio",
    "act_std",
    "thi_mean",
]

POPULATION_BASELINE = {"temperature": 38.6, "heart_rate": 66.0, "activity": 65.0, "oxygen": 97.0}


@dataclass
class Baseline:
    temperature: float = POPULATION_BASELINE["temperature"]
    heart_rate: float = POPULATION_BASELINE["heart_rate"]
    activity: float = POPULATION_BASELINE["activity"]
    oxygen: float = POPULATION_BASELINE["oxygen"]


def _clean(values: Sequence[float | None], fallback: float) -> np.ndarray:
    arr = np.array([v for v in values if v is not None and np.isfinite(v)], dtype=float)
    return arr if arr.size else np.array([fallback], dtype=float)


def slope_per_hour(values: np.ndarray) -> float:
    """Least-squares slope, robust to a single sample."""
    if values.size < 2:
        return 0.0
    x = np.arange(values.size, dtype=float)
    x -= x.mean()
    denom = float((x**2).sum())
    return float((x * (values - values.mean())).sum() / denom) if denom else 0.0


def window_features(
    temperature: Sequence[float | None],
    heart_rate: Sequence[float | None],
    oxygen: Sequence[float | None],
    activity: Sequence[float | None],
    thi: Sequence[float | None] | float | None = None,
    baseline: Baseline | None = None,
) -> dict[str, float]:
    base = baseline or Baseline()
    t = _clean(temperature, base.temperature)
    h = _clean(heart_rate, base.heart_rate)
    o = _clean(oxygen, base.oxygen)
    a = _clean(activity, base.activity)
    if thi is None:
        thi_mean = 68.0
    elif isinstance(thi, (int, float)):
        thi_mean = float(thi)
    else:
        thi_mean = float(_clean(thi, 68.0).mean())

    # The most recent quarter of the window carries the freshest signal.
    recent = max(1, t.size // 4)
    return {
        "temp_mean": float(t.mean()),
        "temp_max": float(t.max()),
        "temp_delta": float(t[-recent:].mean() - base.temperature),
        "temp_slope": slope_per_hour(t),
        "hr_mean": float(h.mean()),
        "hr_max": float(h.max()),
        "hr_delta": float(h[-max(1, h.size // 4):].mean() - base.heart_rate),
        "spo2_mean": float(o.mean()),
        "spo2_min": float(o.min()),
        "act_mean": float(a.mean()),
        "act_ratio": float(a[-max(1, a.size // 4):].mean() / max(base.activity, 1.0)),
        "act_std": float(a.std()),
        "thi_mean": thi_mean,
    }


def to_matrix(rows: list[dict[str, float]]) -> np.ndarray:
    return np.array([[row[name] for name in FEATURES] for row in rows], dtype=float)
