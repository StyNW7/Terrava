"""Herd-level insight generation.

Takes a snapshot of the herd (recent readings per animal, barn climate, devices)
and returns insights in exactly the shape the backend's `POST /insights` and the
dashboard's AIInsight type expect: priority, category, bilingual title / summary
/ recommendation, confidence and affected livestock ids.
"""

from __future__ import annotations

from collections import defaultdict

import numpy as np

from .features import Baseline
from .heat import assess_heat
from .inference import VitalsWindow, assess
from .registry import LoadedModels
from .timeseries import detect_estrus


def _insight(priority, category, title, summary, recommendation, confidence, affected, key):
    return {
        "key": key,
        "priority": priority,
        "category": category,
        "title": title,
        "summary": summary,
        "recommendation": recommendation,
        "confidence": round(confidence),
        "affectedLivestock": affected,
        "source": "ai/herd-insights-v1",
    }


def generate_insights(models: LoadedModels, herd: dict) -> dict:
    animals = herd.get("animals", [])
    results = []
    assessments = {}

    for animal in animals:
        r = animal.get("readings", {})
        baseline = Baseline(**animal["baseline"]) if animal.get("baseline") else None
        assessments[animal["id"]] = assess(
            models,
            VitalsWindow(r.get("temperature", []), r.get("heartRate", []), r.get("oxygen", []), r.get("activity", []), r.get("thi"), baseline),
        )

    # 1. Disease clusters by most likely condition.
    by_condition: dict[str, list[tuple[str, float]]] = defaultdict(list)
    for animal_id, a in assessments.items():
        key, p = a["primaryCondition"]["key"], a["primaryCondition"]["probability"]
        if key not in ("normal", "estrus") and p >= 0.55:
            by_condition[key].append((animal_id, p))

    copy = {
        "fever": ("health", "high", ("Indikasi infeksi pada {n} ternak", "Signs of infection in {n} animals"),
                  ("Model mendeteksi pola demam (suhu, detak jantung, aktivitas) dengan keyakinan rata-rata {c}%.", "The model detects a fever pattern (temperature, heart rate, activity) with {c}% average confidence."),
                  ("Periksa ternak terkait, cek hidrasi, dan konsultasikan dengan dokter hewan hari ini.", "Inspect the animals, check hydration and consult the veterinarian today.")),
        "respiratory": ("health", "high", ("Risiko gangguan pernapasan pada {n} ternak", "Respiratory disease risk in {n} animals"),
                        ("Saturasi oksigen rendah dan detak jantung tinggi terdeteksi (keyakinan {c}%).", "Low oxygen saturation with a raised heart rate detected ({c}% confidence)."),
                        ("Pisahkan ternak ke kandang observasi dan minta pemeriksaan dokter hewan.", "Move the animals to an observation pen and request a veterinary exam.")),
        "heat_stress": ("environment", "high", ("{n} ternak menunjukkan heat stress", "{n} animals show heat stress"),
                        ("Kenaikan suhu tubuh mengikuti THI lingkungan yang tinggi (keyakinan {c}%).", "Body temperature is rising with the high environmental THI ({c}% confidence)."),
                        ("Tingkatkan ventilasi, sediakan air dingin, dan kurangi penanganan di siang hari.", "Increase ventilation, provide cool water and reduce handling during the day.")),
        "lameness": ("behavior", "medium", ("Kemungkinan pincang pada {n} ternak", "Possible lameness in {n} animals"),
                     ("Aktivitas turun tajam tanpa demam, pola khas masalah kaki (keyakinan {c}%).", "Activity dropped sharply without fever, a typical hoof problem pattern ({c}% confidence)."),
                     ("Periksa kuku dan kaki, serta kondisi lantai kandang.", "Check hooves and legs, and the barn floor condition.")),
        "metabolic": ("health", "high", ("Risiko gangguan metabolik pada {n} ternak", "Metabolic disorder risk in {n} animals"),
                      ("Suhu di bawah normal dengan aktivitas sangat rendah (keyakinan {c}%).", "Below-normal temperature with very low activity ({c}% confidence)."),
                      ("Segera periksa ternak, terutama sapi yang baru melahirkan.", "Examine the animals promptly, especially recently calved cows.")),
    }
    for key, members in by_condition.items():
        category, priority, title, summary, rec = copy[key]
        n = len(members)
        c = round(100 * float(np.mean([p for _, p in members])))
        results.append(
            _insight(
                priority,
                category,
                {"id": title[0].format(n=n), "en": title[1].format(n=n)},
                {"id": summary[0].format(c=c), "en": summary[1].format(c=c)},
                {"id": rec[0], "en": rec[1]},
                c,
                [animal_id for animal_id, _ in members],
                f"condition:{key}",
            )
        )

    # 2. Breeding opportunities (estrus).
    in_heat = []
    for animal in animals:
        activity = animal.get("readings", {}).get("activity", [])
        if len(activity) >= 30:
            estrus = detect_estrus(activity)
            if estrus.get("detected"):
                in_heat.append((animal["id"], estrus["confidence"]))
        elif assessments[animal["id"]]["primaryCondition"]["key"] == "estrus" and assessments[animal["id"]]["primaryCondition"]["probability"] >= 0.6:
            in_heat.append((animal["id"], assessments[animal["id"]]["primaryCondition"]["probability"]))
    if in_heat:
        n = len(in_heat)
        results.append(
            _insight(
                "medium",
                "productivity",
                {"id": f"{n} ternak sedang birahi", "en": f"{n} animals are in heat"},
                {"id": "Lonjakan aktivitas khas birahi terdeteksi. Ini peluang inseminasi buatan yang tepat waktu.", "en": "Activity surges typical of estrus detected. This is a timely insemination opportunity."},
                {"id": "Jadwalkan inseminasi buatan 12-18 jam setelah awal birahi.", "en": "Schedule artificial insemination 12-18 hours after estrus onset."},
                100 * float(np.mean([c for _, c in in_heat])),
                [animal_id for animal_id, _ in in_heat],
                "estrus",
            )
        )

    # 3. Activity decline per barn (relative to each animal's own baseline).
    barns: dict[str, list[tuple[str, float]]] = defaultdict(list)
    names: dict[str, str] = {}
    for animal in animals:
        if animal.get("barnId"):
            barns[animal["barnId"]].append((animal["id"], assessments[animal["id"]]["features"]["act_ratio"]))
            names[animal["barnId"]] = animal.get("barnName", animal["barnId"])
    for barn_id, members in barns.items():
        ratios = [r for _, r in members]
        if len(members) >= 3 and np.mean(ratios) < 0.85:
            drop = round((1 - float(np.mean(ratios))) * 100)
            results.append(
                _insight(
                    "high" if drop >= 20 else "medium",
                    "behavior",
                    {"id": f"Penurunan aktivitas di {names[barn_id]}", "en": f"Activity decline in {names[barn_id]}"},
                    {"id": f"{len(members)} ternak di {names[barn_id]} rata-rata {drop}% kurang aktif dari baseline masing-masing.", "en": f"{len(members)} animals in {names[barn_id]} are on average {drop}% less active than their own baselines."},
                    {"id": "Jadwalkan inspeksi lapangan dan cek pakan, air, serta kondisi kandang.", "en": "Schedule a field inspection and check feed, water and barn conditions."},
                    min(95, 65 + drop),
                    [animal_id for animal_id, r in members if r < 0.9],
                    f"activity:{barn_id}",
                )
            )

    # 4. Heat stress outlook from barn climate / weather forecast.
    for env in herd.get("environment", []):
        heat = assess_heat(env["temperature"], env["humidity"], env.get("forecast"), herd_size=env.get("animals", 0))
        if heat["peakBand"] in ("moderate", "severe") or (heat["peakBand"] == "mild" and heat["stressedHours"] >= 6):
            label = env.get("name", env.get("barnId", "farm"))
            results.append(
                _insight(
                    "high" if heat["peakBand"] != "mild" else "medium",
                    "environment",
                    {"id": f"Risiko heat stress di {label}", "en": f"Heat stress risk at {label}"},
                    {
                        "id": f"THI puncak {heat['peakThi']} ({heat['stressedHours']} jam berisiko). Estimasi kehilangan susu {heat['estimatedMilkLossKgPerCowPerDay']} kg/ekor/hari.",
                        "en": f"Peak THI {heat['peakThi']} ({heat['stressedHours']} risky hours). Estimated milk loss {heat['estimatedMilkLossKgPerCowPerDay']} kg/cow/day.",
                    },
                    heat["actions"][0],
                    85,
                    [],
                    f"heat:{label}",
                )
            )

    # 5. Devices that will run flat within a week.
    soon_flat = []
    for device in herd.get("devices", []):
        drain = device.get("batteryDrainPerDay")
        if drain and drain > 0 and device.get("battery", 100) / drain < 7:
            soon_flat.append(device)
    if soon_flat:
        results.append(
            _insight(
                "medium",
                "devices",
                {"id": f"{len(soon_flat)} perangkat akan habis baterai dalam 7 hari", "en": f"{len(soon_flat)} devices will run flat within 7 days"},
                {"id": "Prediksi berdasarkan laju pengurasan baterai harian.", "en": "Forecast from the daily battery drain rate."},
                {"id": "Jadwalkan pengisian daya atau penggantian baterai secara proaktif.", "en": "Proactively schedule recharging or battery replacement."},
                90,
                [d["livestockId"] for d in soon_flat if d.get("livestockId")],
                "battery-forecast",
            )
        )

    priority_rank = {"high": 0, "medium": 1, "low": 2}
    results.sort(key=lambda item: (priority_rank[item["priority"]], -item["confidence"]))
    anomalous = sum(1 for a in assessments.values() if a["anomaly"]["isAnomaly"])
    return {
        "insights": results,
        "herd": {
            "animals": len(assessments),
            "anomalous": anomalous,
            "averageHealthScore": round(float(np.mean([a["healthScore"] for a in assessments.values()])), 1) if assessments else None,
            "statusCounts": {s: sum(1 for a in assessments.values() if a["status"] == s) for s in ("healthy", "attention", "critical")},
        },
    }
