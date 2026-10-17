"""Time-series analytics: per-reading anomaly detection, vital forecasting and estrus detection."""

from __future__ import annotations

import math
from collections.abc import Sequence

import numpy as np

VITALS = ("temperature", "heart_rate", "oxygen", "activity")


# ---------------------------------------------------------------------------
# Per-reading anomalies (robust z-score against the animal's own recent past)
# ---------------------------------------------------------------------------

def robust_anomalies(series: dict[str, Sequence[float | None]], window: int = 48, threshold: float = 3.5) -> list[dict]:
    """Flag readings that deviate from the trailing median by more than `threshold`
    robust standard deviations (MAD * 1.4826). Works from the very first day:
    with little history, population-level spreads are used instead of MAD."""
    floor = {"temperature": 0.15, "heart_rate": 4.0, "oxygen": 1.0, "activity": 8.0}
    length = max((len(v) for v in series.values()), default=0)
    results = []
    for i in range(length):
        flags = {}
        for vital in VITALS:
            values = series.get(vital) or []
            if i >= len(values) or values[i] is None:
                continue
            history = np.array([v for v in values[max(0, i - window):i] if v is not None], dtype=float)
            if history.size < 6:
                continue
            median = float(np.median(history))
            scale = max(1.4826 * float(np.median(np.abs(history - median))), floor[vital])
            z = (float(values[i]) - median) / scale
            if abs(z) >= threshold:
                flags[vital] = {"value": values[i], "expected": round(median, 2), "zScore": round(z, 2)}
        results.append({"index": i, "isAnomaly": bool(flags), "vitals": flags})
    return results


# ---------------------------------------------------------------------------
# Forecasting: additive Holt-Winters with daily seasonality (or damped Holt)
# ---------------------------------------------------------------------------

def _holt_winters(y: np.ndarray, alpha: float, beta: float, gamma: float, season: int, phi: float):
    level = y[:season].mean() if season else y[0]
    trend = (y[season:2 * season].mean() - y[:season].mean()) / season if season and y.size >= 2 * season else 0.0
    seasonal = list(y[:season] - level) if season else []
    fitted = np.empty_like(y)
    for t in range(y.size):
        s = seasonal[t % season] if season else 0.0
        fitted[t] = level + phi * trend + s
        prev_level = level
        level = alpha * (y[t] - s) + (1 - alpha) * (prev_level + phi * trend)
        trend = beta * (level - prev_level) + (1 - beta) * phi * trend
        if season:
            seasonal[t % season] = gamma * (y[t] - level) + (1 - gamma) * s
    return level, trend, seasonal, fitted


def forecast(values: Sequence[float | None], horizon: int = 12, season: int = 24) -> dict:
    y = np.array([v for v in values if v is not None], dtype=float)
    if y.size < 4:
        last = float(y[-1]) if y.size else math.nan
        return {"method": "naive", "forecast": [last] * horizon, "lower": [last] * horizon, "upper": [last] * horizon}

    use_season = season if y.size >= 2 * season else 0
    phi = 0.95
    best = None
    grid = [0.1, 0.3, 0.5, 0.8]
    for alpha in grid:
        for beta in (0.02, 0.1, 0.3):
            for gamma in (0.05, 0.2, 0.4) if use_season else (0.0,):
                level, trend, seasonal, fitted = _holt_winters(y, alpha, beta, gamma, use_season, phi)
                start = use_season or 1
                sse = float(((y[start:] - fitted[start:]) ** 2).sum())
                if best is None or sse < best[0]:
                    best = (sse, level, trend, seasonal, fitted, alpha, beta, gamma)
    sse, level, trend, seasonal, fitted, alpha, beta, gamma = best
    start = use_season or 1
    sigma = float(np.std(y[start:] - fitted[start:])) or 1e-6

    points, lower, upper = [], [], []
    damp = 0.0
    for h in range(1, horizon + 1):
        damp += phi**h
        s = seasonal[(y.size + h - 1) % use_season] if use_season else 0.0
        value = level + damp * trend + s
        spread = 1.2816 * sigma * math.sqrt(h)  # 80% interval
        points.append(round(value, 3))
        lower.append(round(value - spread, 3))
        upper.append(round(value + spread, 3))
    return {
        "method": "holt-winters" if use_season else "damped-holt",
        "params": {"alpha": alpha, "beta": beta, "gamma": gamma, "phi": phi, "season": use_season},
        "forecast": points,
        "lower": lower,
        "upper": upper,
        "residualStd": round(sigma, 4),
    }


def hours_until(forecast_values: list[float], threshold: float, above: bool = True) -> int | None:
    """First forecast step (in hours) that crosses the threshold."""
    for step, value in enumerate(forecast_values, start=1):
        if (above and value >= threshold) or (not above and value <= threshold):
            return step
    return None


# ---------------------------------------------------------------------------
# Estrus (heat) detection from activity
# ---------------------------------------------------------------------------

def detect_estrus(activity: Sequence[float | None], hours_per_sample: float = 1.0) -> dict:
    """Detect an activity surge typical of estrus: the 4-hour rolling mean rises
    above 1.6x the animal's preceding baseline for at least 3 hours.

    Returns onset, the recommended insemination window (12-18 h after onset,
    the classic AM-PM rule) and a confidence derived from the surge strength.
    """
    a = np.array([v if v is not None else np.nan for v in activity], dtype=float)
    if np.count_nonzero(~np.isnan(a)) < 30:
        return {"detected": False, "reason": "Need at least 30 hourly activity readings"}

    roll = np.array([np.nanmean(a[max(0, i - 3):i + 1]) for i in range(a.size)])
    baseline_end = max(24, a.size - 24)
    baseline = float(np.nanmedian(a[:baseline_end]))
    if baseline <= 1:
        return {"detected": False, "reason": "Activity baseline too low"}
    ratio = roll / baseline

    above = ratio >= 1.6
    best_start, best_len, start = None, 0, None
    for i, flag in enumerate(above):
        if flag and start is None:
            start = i
        if (not flag or i == above.size - 1) and start is not None:
            end = i if not flag else i + 1
            if end - start > best_len:
                best_start, best_len = start, end - start
            start = None
    duration_h = best_len * hours_per_sample
    if best_start is None or duration_h < 3:
        return {"detected": False, "peakRatio": round(float(np.nanmax(ratio)), 2), "baseline": round(baseline, 1)}

    peak = float(np.nanmax(ratio[best_start:best_start + best_len]))
    confidence = round(min(0.98, 0.5 + (peak - 1.6) * 0.35 + min(duration_h, 12) * 0.02), 2)
    hours_since_onset = (a.size - best_start) * hours_per_sample
    return {
        "detected": True,
        "onsetIndex": int(best_start),
        "hoursSinceOnset": round(hours_since_onset, 1),
        "durationHours": round(duration_h, 1),
        "peakRatio": round(peak, 2),
        "baseline": round(baseline, 1),
        "confidence": confidence,
        "inseminationWindow": {
            "startsInHours": round(max(0.0, 12 - hours_since_onset), 1),
            "endsInHours": round(max(0.0, 18 - hours_since_onset), 1),
            "advice": {
                "id": "Inseminasi buatan ideal 12-18 jam setelah awal birahi (aturan pagi-sore).",
                "en": "Artificial insemination is ideal 12-18 hours after estrus onset (AM-PM rule).",
            },
        },
    }
