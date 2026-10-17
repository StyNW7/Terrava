import numpy as np

from terrava_ai.ml.features import FEATURES, Baseline, window_features
from terrava_ai.ml.inference import VitalsWindow, assess
from terrava_ai.ml.physiology import CLASSES
from terrava_ai.ml.synthetic import generate_dataset, simulate_window


def test_dataset_has_every_class_and_feature():
    rows, labels = generate_dataset(800, seed=3)
    assert set(labels) == set(CLASSES)
    assert all(set(row) == set(FEATURES) for row in rows)
    assert all(np.isfinite(list(row.values())).all() for row in rows)


def test_features_are_relative_to_the_animal_baseline():
    calm = window_features([38.6] * 24, [66] * 24, [97] * 24, [30] * 24, 68, Baseline(activity=30))
    lively = window_features([38.6] * 24, [66] * 24, [97] * 24, [30] * 24, 68, Baseline(activity=60))
    assert calm["act_ratio"] == 1.0
    assert lively["act_ratio"] == 0.5


def test_features_tolerate_missing_values():
    f = window_features([38.6, None, float("nan"), 39.0], [70, None], [], [50, 55], None)
    assert np.isfinite(list(f.values())).all()


def test_metadata_reports_reasonable_quality(models):
    risk = models.metadata["risk_model"]
    assert risk["accuracy"] > 0.8
    assert risk["macro_f1"] > 0.75
    assert len(risk["confusion_matrix"]["labels"]) == len(CLASSES)


def test_clear_cases_are_recognised(models):
    rng = np.random.default_rng(11)
    for label in ["normal", "fever", "heat_stress", "respiratory", "metabolic", "estrus"]:
        hits = 0
        for _ in range(10):
            w = simulate_window(rng, label, intensity=1.0, onset=6)
            r = assess(models, VitalsWindow(w.temperature, w.heart_rate, w.oxygen, w.activity, w.thi, w.baseline))
            hits += r["primaryCondition"]["key"] == label
        assert hits >= 8, f"{label}: {hits}/10"


def test_fever_window_is_critical_and_explained(models):
    window = VitalsWindow([38.6] * 12 + [39.5, 39.9, 40.3, 40.6] * 3, [68] * 12 + [92, 100, 108, 112] * 3, [96] * 24, [60] * 12 + [30] * 12, 70)
    r = assess(models, window)
    assert r["status"] == "critical"
    assert r["urgent"] is True
    assert r["primaryCondition"]["key"] == "fever"
    assert "Contact veterinarian" in r["recommendations"]
    assert any(f["feature"] == "temp_delta" for f in r["factors"])
    assert {"id", "en"} <= set(r["cause"])


def test_healthy_window_scores_high(models):
    rng = np.random.default_rng(5)
    w = simulate_window(rng, "normal")
    r = assess(models, VitalsWindow(w.temperature, w.heart_rate, w.oxygen, w.activity, w.thi, w.baseline))
    assert r["healthScore"] >= 70
    assert abs(sum(c["probability"] for c in r["conditions"]) - 1) < 1e-3
