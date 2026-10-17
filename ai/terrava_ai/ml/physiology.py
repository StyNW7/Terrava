"""Reference physiology for adult cattle and the health conditions the models recognise.

Ranges follow common veterinary references for Bos taurus / Bos indicus cattle
in tropical climates (rectal-equivalent temperature, resting heart rate).
"""

from dataclasses import dataclass

NORMAL = {
    "temperature": (38.0, 39.3),  # °C
    "heart_rate": (48, 84),  # bpm
    "oxygen": (95, 100),  # SpO2 %
    "activity": (40, 100),  # activity index
}


@dataclass(frozen=True)
class Condition:
    key: str
    name_id: str
    name_en: str
    category: str  # maps to the dashboard alert / insight category
    severity: str
    urgent: bool
    cause_id: str
    cause_en: str
    actions: tuple[str, ...]


# Canonical action labels are the same strings the dashboard localises.
CONDITIONS: dict[str, Condition] = {
    c.key: c
    for c in [
        Condition("normal", "Normal", "Normal", "health", "info", False,
                  "Tanda vital dalam rentang normal.", "Vital signs are within the normal range.",
                  ()),
        Condition("fever", "Demam / infeksi", "Fever / infection", "health", "high", True,
                  "Kenaikan suhu tubuh disertai detak jantung tinggi dan aktivitas menurun menunjukkan kemungkinan infeksi.",
                  "Raised body temperature with a high heart rate and reduced activity suggests a likely infection.",
                  ("Inspect livestock", "Check hydration", "Contact veterinarian")),
        Condition("heat_stress", "Heat stress", "Heat stress", "environmental", "high", True,
                  "Suhu tubuh naik bersamaan dengan THI lingkungan yang tinggi; ternak kesulitan membuang panas.",
                  "Body temperature is rising together with a high environmental THI; the animal is struggling to shed heat.",
                  ("Check hydration", "Move to observation barn", "Monitor for next 6 hours")),
        Condition("respiratory", "Gangguan pernapasan", "Respiratory disease", "health", "critical", True,
                  "Saturasi oksigen rendah dengan detak jantung tinggi mengarah pada gangguan pernapasan (mis. BRD/pneumonia).",
                  "Low oxygen saturation with a high heart rate points to respiratory disease (e.g. BRD / pneumonia).",
                  ("Inspect livestock", "Contact veterinarian", "Move to observation barn")),
        Condition("lameness", "Pincang / cedera", "Lameness / injury", "behavior", "warning", False,
                  "Aktivitas dan langkah turun tajam sementara suhu tetap normal, pola khas pincang atau cedera kaki.",
                  "Activity and steps have dropped sharply while temperature stays normal, a typical lameness or hoof injury pattern.",
                  ("Inspect livestock", "Move to observation barn", "Create task")),
        Condition("estrus", "Birahi (estrus)", "Estrus (heat)", "behavior", "info", False,
                  "Lonjakan aktivitas jauh di atas baseline dengan kenaikan suhu ringan menandakan birahi.",
                  "An activity spike well above baseline with a slight temperature rise indicates estrus.",
                  ("Create task", "Monitor for next 6 hours")),
        Condition("metabolic", "Gangguan metabolik", "Metabolic disorder", "health", "critical", True,
                  "Suhu di bawah normal dengan aktivitas sangat rendah dapat menandakan gangguan metabolik (mis. milk fever).",
                  "Below-normal temperature with very low activity can indicate a metabolic disorder (e.g. milk fever).",
                  ("Inspect livestock", "Contact veterinarian")),
    ]
}

CLASSES: list[str] = list(CONDITIONS)

# How much each condition lowers the health score (0 = no health concern).
SEVERITY_WEIGHT = {
    "normal": 0.0,
    "estrus": 0.0,
    "lameness": 0.55,
    "heat_stress": 0.7,
    "fever": 0.85,
    "metabolic": 0.95,
    "respiratory": 0.95,
}


def thi(temperature: float, humidity: float) -> float:
    """Temperature-Humidity Index (NRC 1971), the cattle heat-stress standard."""
    return round(0.8 * temperature + (humidity / 100) * (temperature - 14.4) + 46.4, 1)


def thi_band(value: float) -> str:
    if value < 72:
        return "normal"
    if value < 80:
        return "mild"
    if value < 90:
        return "moderate"
    return "severe"
