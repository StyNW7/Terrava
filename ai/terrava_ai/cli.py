"""Command line: `python -m terrava_ai <command>` or `terrava-ai <command>`.

  serve      run the API (uvicorn)
  train      train / retrain the models and print the evaluation
  evaluate   print the metrics of the current models
  chat       talk to Terra in the terminal
  demo       score a few simulated animals end to end
"""

from __future__ import annotations

import argparse
import asyncio

import numpy as np

from .config import get_settings


def _serve(args):
    import uvicorn

    settings = get_settings()
    uvicorn.run("terrava_ai.main:app", host=args.host or settings.host, port=args.port or settings.port, reload=args.reload)


def _train(args):
    from .ml.registry import train

    settings = get_settings()
    metadata = train(settings.models_dir, args.samples or settings.training_samples, settings.random_seed)
    _print_metrics(metadata)


def _evaluate(_args):
    from .api.deps import get_registry

    _print_metrics(get_registry().get().metadata)


def _print_metrics(metadata: dict):
    risk = metadata["risk_model"]
    print(f"\nTerrava models v{metadata['version']}  (trained {metadata['trained_at']}, {metadata['samples']} samples, {metadata['training_seconds']}s)")
    print(f"  Condition classifier : accuracy {risk['accuracy']:.3f}   macro F1 {risk['macro_f1']:.3f}")
    for name, scores in risk["per_class"].items():
        print(f"     {name:<12} precision {scores['precision']:.2f}  recall {scores['recall']:.2f}  f1 {scores['f1-score']:.2f}")
    print("  Top features         : " + ", ".join(f"{f['feature']} ({f['importance']:.3f})" for f in risk["feature_importance"][:5]))
    anomaly = metadata["anomaly_model"]
    print(f"  Anomaly detector     : abnormal recall {anomaly['abnormal_recall']:.2f}, false-positive rate {anomaly['false_positive_rate']:.2f}\n")


def _demo(_args):
    from collections import Counter

    from .api.deps import get_registry
    from .ml.inference import VitalsWindow, assess
    from .ml.synthetic import simulate_window

    models = get_registry().get()
    rng = np.random.default_rng(7)
    print("\n20 simulated, fully developed cases per condition")
    print(f"{'condition':<13} {'correct':>8} {'avg score':>10}  most common prediction")
    for label in ["normal", "fever", "heat_stress", "respiratory", "lameness", "estrus", "metabolic"]:
        predictions, scores = [], []
        for _ in range(20):
            # See `evaluate` for hold-out metrics that include subclinical and early cases.
            w = simulate_window(rng, label, intensity=1.0, onset=6)
            r = assess(models, VitalsWindow(w.temperature, w.heart_rate, w.oxygen, w.activity, w.thi, w.baseline))
            predictions.append(r["primaryCondition"]["key"])
            scores.append(r["healthScore"])
        correct = sum(p == label for p in predictions)
        common = Counter(predictions).most_common(1)[0][0]
        print(f"{label:<13} {correct:>5}/20 {np.mean(scores):>10.0f}  {common}")
    print()


def _chat(args):
    from .api.deps import get_assistant

    assistant = get_assistant()
    print(f"Terra ({assistant.mode} mode). Type 'exit' to quit.\n")
    history: list[dict] = []

    async def ask(question: str):
        history.append({"role": "user", "content": question})
        reply = []
        async for event in assistant.stream(history, args.lang):
            if event["type"] == "text":
                print(event["delta"], end="", flush=True)
                reply.append(event["delta"])
            elif event["type"] == "tool":
                print(f"\n  [{event['name']}]", flush=True)
            elif event["type"] == "error":
                print(f"\n  ! {event['message']}")
        print("\n")
        history.append({"role": "assistant", "content": "".join(reply) or "-"})

    while True:
        try:
            question = input("you > ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if question.lower() in {"exit", "quit", "keluar"}:
            break
        if question:
            asyncio.run(ask(question))


def main(argv: list[str] | None = None):
    parser = argparse.ArgumentParser(prog="terrava-ai", description="Terrava AI service")
    sub = parser.add_subparsers(dest="command", required=True)
    serve = sub.add_parser("serve", help="run the API")
    serve.add_argument("--host")
    serve.add_argument("--port", type=int)
    serve.add_argument("--reload", action="store_true")
    serve.set_defaults(func=_serve)
    train = sub.add_parser("train", help="train the models")
    train.add_argument("--samples", type=int)
    train.set_defaults(func=_train)
    sub.add_parser("evaluate", help="show model metrics").set_defaults(func=_evaluate)
    sub.add_parser("demo", help="score simulated animals").set_defaults(func=_demo)
    chat = sub.add_parser("chat", help="chat with Terra in the terminal")
    chat.add_argument("--lang", choices=["id", "en"])
    chat.set_defaults(func=_chat)
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
