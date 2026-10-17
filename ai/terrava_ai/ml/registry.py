"""Training, evaluation, persistence and loading of the Terrava models.

Artifacts (in `models/`):
  risk_model.joblib      HistGradientBoostingClassifier over window features -> condition probabilities
  anomaly_model.joblib   StandardScaler + IsolationForest trained on normal windows
  metadata.json          versions, feature list, evaluation metrics, training timestamp
"""

from __future__ import annotations

import json
import logging
import threading
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

import joblib
import numpy as np
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier, IsolationForest
from sklearn.inspection import permutation_importance
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from .features import FEATURES, to_matrix
from .physiology import CLASSES
from .synthetic import generate_dataset

log = logging.getLogger("terrava.models")

MODEL_VERSION = "1.0.0"


@dataclass
class LoadedModels:
    risk: HistGradientBoostingClassifier
    anomaly: object  # sklearn Pipeline(StandardScaler, IsolationForest)
    metadata: dict
    normal_mean: np.ndarray
    normal_std: np.ndarray


def train(models_dir: Path, n_samples: int = 14_000, seed: int = 42) -> dict:
    """Generate data, train both models, evaluate on a hold-out split and save everything."""
    started = time.perf_counter()
    rows, labels = generate_dataset(n_samples, seed=seed)
    X = to_matrix(rows)
    y = np.array(labels)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=seed, stratify=y)

    risk = HistGradientBoostingClassifier(
        max_iter=350,
        learning_rate=0.07,
        max_leaf_nodes=31,
        l2_regularization=0.2,
        early_stopping=True,
        validation_fraction=0.1,
        random_state=seed,
    )
    risk.fit(X_train, y_train)
    predicted = risk.predict(X_test)

    importance = permutation_importance(risk, X_test[:1500], y_test[:1500], n_repeats=4, random_state=seed, n_jobs=1)
    importances = sorted(
        ({"feature": f, "importance": round(float(v), 4)} for f, v in zip(FEATURES, importance.importances_mean)),
        key=lambda item: item["importance"],
        reverse=True,
    )

    normal = X_train[y_train == "normal"]
    anomaly = make_pipeline(StandardScaler(), IsolationForest(n_estimators=250, contamination=0.03, random_state=seed))
    anomaly.fit(normal)
    # How well "anything not normal" is separated by the unsupervised detector alone.
    flagged = anomaly.predict(X_test) == -1
    is_abnormal = y_test != "normal"
    anomaly_recall = float((flagged & is_abnormal).sum() / max(1, is_abnormal.sum()))
    anomaly_fpr = float((flagged & ~is_abnormal).sum() / max(1, (~is_abnormal).sum()))

    labels_order = list(risk.classes_)
    metadata = {
        "version": MODEL_VERSION,
        "trained_at": datetime.now(UTC).isoformat(),
        "training_seconds": round(time.perf_counter() - started, 1),
        "sklearn_version": sklearn.__version__,
        "samples": n_samples,
        "features": FEATURES,
        "classes": labels_order,
        "data": "synthetic (physiology-based generator, see ml/synthetic.py)",
        "risk_model": {
            "algorithm": "HistGradientBoostingClassifier",
            "accuracy": round(float(accuracy_score(y_test, predicted)), 4),
            "macro_f1": round(float(f1_score(y_test, predicted, average="macro")), 4),
            "per_class": {
                k: {m: round(float(v), 4) for m, v in values.items() if m in ("precision", "recall", "f1-score")}
                for k, values in classification_report(y_test, predicted, output_dict=True).items()
                if k in labels_order
            },
            "confusion_matrix": {"labels": labels_order, "matrix": confusion_matrix(y_test, predicted, labels=labels_order).tolist()},
            "feature_importance": importances,
        },
        "anomaly_model": {
            "algorithm": "IsolationForest (trained on normal windows)",
            "abnormal_recall": round(anomaly_recall, 4),
            "false_positive_rate": round(anomaly_fpr, 4),
        },
        "normal_profile": {"mean": normal.mean(axis=0).round(4).tolist(), "std": normal.std(axis=0).round(4).tolist()},
    }

    models_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(risk, models_dir / "risk_model.joblib")
    joblib.dump(anomaly, models_dir / "anomaly_model.joblib")
    (models_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    log.info(
        "Trained models in %.1fs: accuracy=%.3f macro_f1=%.3f",
        metadata["training_seconds"],
        metadata["risk_model"]["accuracy"],
        metadata["risk_model"]["macro_f1"],
    )
    return metadata


class ModelRegistry:
    """Lazily loads (and if needed trains) the models once per process."""

    def __init__(self, models_dir: Path, auto_train: bool = True, n_samples: int = 14_000, seed: int = 42):
        self.models_dir = models_dir
        self.auto_train = auto_train
        self.n_samples = n_samples
        self.seed = seed
        self._lock = threading.Lock()
        self._models: LoadedModels | None = None

    def _artifacts_exist(self) -> bool:
        return all((self.models_dir / name).exists() for name in ("risk_model.joblib", "anomaly_model.joblib", "metadata.json"))

    def get(self) -> LoadedModels:
        if self._models is not None:
            return self._models
        with self._lock:
            if self._models is None:
                if not self._artifacts_exist() or not self._compatible():
                    if not self.auto_train:
                        raise RuntimeError("Models are missing. Run `terrava-ai train` first.")
                    log.info("Training models (first start)...")
                    train(self.models_dir, self.n_samples, self.seed)
                self._models = self._load()
        return self._models

    def retrain(self, n_samples: int | None = None) -> dict:
        with self._lock:
            metadata = train(self.models_dir, n_samples or self.n_samples, self.seed)
            self._models = self._load()
            return metadata

    def _compatible(self) -> bool:
        try:
            metadata = json.loads((self.models_dir / "metadata.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return False
        return metadata.get("features") == FEATURES and metadata.get("classes") == sorted(CLASSES) and metadata.get("version") == MODEL_VERSION

    def _load(self) -> LoadedModels:
        metadata = json.loads((self.models_dir / "metadata.json").read_text(encoding="utf-8"))
        profile = metadata["normal_profile"]
        return LoadedModels(
            risk=joblib.load(self.models_dir / "risk_model.joblib"),
            anomaly=joblib.load(self.models_dir / "anomaly_model.joblib"),
            metadata=metadata,
            normal_mean=np.array(profile["mean"]),
            normal_std=np.maximum(np.array(profile["std"]), 1e-6),
        )
