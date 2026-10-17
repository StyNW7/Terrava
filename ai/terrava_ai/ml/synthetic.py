"""Physiologically grounded synthetic data for training before real herd data exists.

Each sample is a 24-hour window of hourly ear tag readings for one animal with
its own baseline, a diurnal activity rhythm, sensor noise and, for non-normal
classes, a condition that starts at a random hour with random intensity. The
generator also produces confounders (hot-but-healthy days, naturally calm
animals) so the models learn relative change rather than fixed cut-offs.

When real labelled data is available, replace `generate_dataset` with a loader
of the same shape; the training pipeline is unchanged.
"""

from dataclasses import dataclass

import numpy as np

from .features import Baseline, window_features
from .physiology import CLASSES

HOURS = 24

# Class priors: most windows are normal, as on a real farm.
PRIORS = {
    "normal": 0.46,
    "fever": 0.12,
    "heat_stress": 0.10,
    "respiratory": 0.07,
    "lameness": 0.09,
    "estrus": 0.10,
    "metabolic": 0.06,
}


@dataclass
class Window:
    temperature: np.ndarray
    heart_rate: np.ndarray
    oxygen: np.ndarray
    activity: np.ndarray
    thi: np.ndarray
    baseline: Baseline
    label: str


def _diurnal(hours: np.ndarray, start_hour: int) -> np.ndarray:
    """Cattle are most active in the morning and late afternoon, least at night."""
    local = (hours + start_hour) % 24
    return 0.6 * np.sin((local - 6) / 24 * 2 * np.pi) + 0.25 * np.sin((local - 15) / 12 * 2 * np.pi)


def simulate_window(rng: np.random.Generator, label: str, intensity: float | None = None, onset: int | None = None) -> Window:
    hours = np.arange(HOURS)
    start_hour = int(rng.integers(0, 24))
    rhythm = _diurnal(hours, start_hour)

    base = Baseline(
        temperature=float(rng.normal(38.6, 0.18)),
        heart_rate=float(rng.normal(66, 6)),
        # Mid-range baseline leaves headroom so activity surges (estrus) are not clipped at 100.
        activity=float(rng.uniform(35, 68)),
        oxygen=float(rng.uniform(95.5, 98.8)),
    )

    temperature = base.temperature + 0.15 * rhythm + rng.normal(0, 0.08, HOURS)
    heart_rate = base.heart_rate + 3 * rhythm + rng.normal(0, 2.5, HOURS)
    oxygen = base.oxygen + rng.normal(0, 0.6, HOURS)
    activity = base.activity * (1 + 0.35 * rhythm) + rng.normal(0, 4, HOURS)

    # Environment: mostly comfortable, sometimes hot even for healthy animals.
    thi_level = rng.uniform(64, 80) if label != "heat_stress" else rng.uniform(79, 93)
    thi = thi_level + 3 * np.sin((hours + start_hour - 9) / 24 * 2 * np.pi) + rng.normal(0, 0.8, HOURS)
    if label == "normal":
        if rng.random() < 0.25:
            # Healthy animal on a hot day: mild warming only.
            thi += rng.uniform(5, 12)
            temperature += rng.uniform(0.05, 0.3)
        if rng.random() < 0.2:
            # A calm day (rain, new feed, resting) without being sick.
            activity *= rng.uniform(0.7, 0.92)
        if rng.random() < 0.1:
            # A lively day (grazing, social activity) without estrus.
            activity *= rng.uniform(1.1, 1.35)

    # Conditions start anywhere in the window, including the last hours (early detection),
    # and range from subclinical to severe.
    onset = int(rng.integers(0, HOURS - 2)) if onset is None else onset
    ramp = np.clip((hours - onset) / rng.uniform(3, 8), 0, 1)
    k = rng.uniform(0.3, 1.0) if intensity is None else intensity

    if label == "fever":
        temperature += ramp * k * rng.uniform(1.2, 2.3)
        heart_rate += ramp * k * rng.uniform(18, 42)
        activity *= 1 - ramp * k * rng.uniform(0.25, 0.55)
        oxygen -= ramp * k * rng.uniform(0, 1.5)
    elif label == "heat_stress":
        heat = np.clip((thi - 72) / 18, 0, 1.3)
        temperature += heat * k * rng.uniform(0.6, 1.4)
        heart_rate += heat * k * rng.uniform(10, 26)
        activity *= 1 - heat * k * rng.uniform(0.15, 0.4)
    elif label == "respiratory":
        oxygen -= ramp * k * rng.uniform(4, 11)
        heart_rate += ramp * k * rng.uniform(14, 34)
        temperature += ramp * k * rng.uniform(0.3, 1.2)
        activity *= 1 - ramp * k * rng.uniform(0.15, 0.4)
    elif label == "lameness":
        activity *= 1 - ramp * k * rng.uniform(0.5, 0.8)
        heart_rate += ramp * k * rng.uniform(0, 8)
    elif label == "estrus":
        activity *= 1 + ramp * k * rng.uniform(0.6, 1.5)
        temperature += ramp * k * rng.uniform(0.15, 0.45)
        heart_rate += ramp * k * rng.uniform(4, 12)
    elif label == "metabolic":
        temperature -= ramp * k * rng.uniform(0.8, 1.8)
        activity *= 1 - ramp * k * rng.uniform(0.55, 0.85)
        heart_rate += ramp * k * rng.uniform(-6, 14)

    # Real sensors glitch: occasional spikes and dropped packets.
    for series, scale in ((temperature, 0.6), (heart_rate, 15.0), (activity, 20.0)):
        spikes = rng.random(HOURS) < 0.03
        series[spikes] += rng.normal(0, scale, spikes.sum())
    for series in (temperature, heart_rate, oxygen, activity):
        series[rng.random(HOURS) < 0.05] = np.nan

    return Window(
        temperature=np.round(temperature, 2),
        heart_rate=np.round(np.clip(heart_rate, 30, 200)),
        oxygen=np.round(np.clip(oxygen, 70, 100)),
        activity=np.round(np.clip(activity, 0, 100)),
        thi=np.round(thi, 1),
        baseline=base,
        label=label,
    )


def generate_dataset(n: int, seed: int = 42) -> tuple[list[dict[str, float]], list[str]]:
    rng = np.random.default_rng(seed)
    labels = rng.choice(CLASSES, size=n, p=[PRIORS[c] for c in CLASSES])
    rows: list[dict[str, float]] = []
    for label in labels:
        w = simulate_window(rng, str(label))
        rows.append(window_features(w.temperature, w.heart_rate, w.oxygen, w.activity, w.thi, w.baseline))
    return rows, [str(label) for label in labels]


def simulate_series(rng: np.random.Generator, label: str = "normal", hours: int = 72) -> dict[str, list[float]]:
    """A longer single-animal series (concatenated windows) for demos and tests."""
    parts = [simulate_window(rng, "normal") for _ in range(max(1, hours // HOURS) - 1)] + [simulate_window(rng, label)]

    def joined(name: str) -> list[float | None]:
        # Dropped packets become None (JSON null), as they would arrive from the API.
        values = np.concatenate([getattr(p, name) for p in parts])
        return [None if np.isnan(v) else float(v) for v in values]

    return {name: joined(name) for name in ("temperature", "heart_rate", "oxygen", "activity", "thi")}
