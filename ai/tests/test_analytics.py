import math

import numpy as np

from terrava_ai.chat.retriever import get_knowledge_base
from terrava_ai.ml.heat import assess_heat
from terrava_ai.ml.physiology import thi, thi_band
from terrava_ai.ml.timeseries import detect_estrus, forecast, hours_until, robust_anomalies


def test_thi_matches_reference_formula():
    assert thi(30, 70) == 81.3
    assert [thi_band(v) for v in (70, 75, 85, 95)] == ["normal", "mild", "moderate", "severe"]


def test_heat_assessment_estimates_milk_loss_and_actions():
    r = assess_heat(33, 75, forecast=[{"temperature": 35, "humidity": 70}], herd_size=10)
    assert r["band"] in ("moderate", "severe")
    assert r["peakThi"] >= r["thi"]
    assert r["estimatedHerdMilkLossKgPerDay"] > 0
    assert all({"id", "en"} <= set(a) for a in r["actions"])


def test_forecast_follows_a_daily_cycle():
    hours = np.arange(96)
    series = 38.6 + 0.3 * np.sin(hours / 24 * 2 * math.pi)
    r = forecast(series.tolist(), horizon=12, season=24)
    expected = 38.6 + 0.3 * np.sin(np.arange(96, 108) / 24 * 2 * math.pi)
    assert r["method"] == "holt-winters"
    assert np.abs(np.array(r["forecast"]) - expected).max() < 0.1
    assert all(lo <= f <= hi for lo, f, hi in zip(r["lower"], r["forecast"], r["upper"]))


def test_time_to_threshold():
    assert hours_until([38.9, 39.2, 39.6, 40.0], 39.5) == 3
    assert hours_until([38.9, 39.0], 39.5) is None
    assert hours_until([30, 20, 10], 15, above=False) == 3


def test_short_series_falls_back_to_naive():
    assert forecast([38.5, 38.6], horizon=3)["method"] == "naive"


def test_robust_anomalies_flag_a_spike():
    temps = [38.6 + 0.05 * ((i % 5) - 2) for i in range(60)]
    temps[50] = 40.8
    points = robust_anomalies({"temperature": temps})
    flagged = [p["index"] for p in points if p["isAnomaly"]]
    assert flagged == [50]


def test_estrus_detection_and_insemination_window():
    rng = np.random.default_rng(0)
    activity = list(50 + rng.normal(0, 4, 72))
    activity += list(105 + rng.normal(0, 4, 8))  # surge in the last 8 hours
    r = detect_estrus([min(100, a) for a in activity])
    assert r["detected"] is True
    assert r["durationHours"] >= 3
    assert r["inseminationWindow"]["startsInHours"] >= 0


def test_no_estrus_on_flat_activity():
    assert detect_estrus([55.0] * 60)["detected"] is False


def test_knowledge_base_finds_relevant_sections():
    kb = get_knowledge_base()
    assert "heat" in kb.search("THI heat stress kipas")[0]["title"].lower()
    assert "birahi" in kb.search("kapan waktu inseminasi buatan setelah birahi")[0]["title"].lower()
    assert kb.search("baterai ear tag habis")[0]["source"] == "06-ear-tag-devices.md"
