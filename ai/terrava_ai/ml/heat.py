"""Heat-stress assessment from barn or weather conditions."""

from __future__ import annotations

from .physiology import thi, thi_band

# Dairy cows lose roughly 0.2-0.4 kg of milk per day for every THI unit above ~69
# (Bouraoui et al. 2002; West 2003). We use a conservative midpoint as an estimate.
MILK_LOSS_KG_PER_THI_UNIT = 0.27
MILK_LOSS_THRESHOLD = 69

ACTIONS = {
    "normal": [
        {"id": "Kondisi nyaman. Pertahankan akses air minum dan ventilasi.", "en": "Comfortable conditions. Keep water and ventilation available."},
    ],
    "mild": [
        {"id": "Pastikan air minum bersih tersedia setiap saat (sapi perah butuh 80-120 L/hari).", "en": "Keep clean drinking water available at all times (dairy cows need 80-120 L/day)."},
        {"id": "Nyalakan kipas atau buka ventilasi kandang pada siang hari.", "en": "Run fans or open barn ventilation during the day."},
        {"id": "Geser jadwal pakan ke pagi dan sore yang lebih sejuk.", "en": "Move feeding to the cooler morning and evening."},
    ],
    "moderate": [
        {"id": "Semprot/sprinkler air dan kipas bersamaan untuk pendinginan evaporatif.", "en": "Combine sprinklers with fans for evaporative cooling."},
        {"id": "Kurangi kepadatan kandang dan sediakan peneduh di area terbuka.", "en": "Reduce stocking density and provide shade in open areas."},
        {"id": "Tunda pemindahan, vaksinasi, atau penanganan ternak ke jam sejuk.", "en": "Postpone moving, vaccinating or handling animals until cooler hours."},
        {"id": "Tambahkan elektrolit pada air minum.", "en": "Add electrolytes to the drinking water."},
    ],
    "severe": [
        {"id": "DARURAT: dinginkan ternak segera (air + kipas) dan pantau suhu tubuh tiap jam.", "en": "EMERGENCY: cool animals immediately (water + fans) and check body temperature hourly."},
        {"id": "Hubungi dokter hewan untuk ternak dengan suhu tubuh di atas 40,5°C atau napas terengah.", "en": "Call the veterinarian for animals above 40.5°C or panting with an open mouth."},
        {"id": "Hentikan semua aktivitas penanganan ternak.", "en": "Stop all animal handling."},
    ],
}


def assess_heat(temperature: float, humidity: float, forecast: list[dict] | None = None, herd_size: int = 0, dairy_share: float = 1.0) -> dict:
    current = thi(temperature, humidity)
    band = thi_band(current)
    hours = []
    for point in forecast or []:
        value = thi(float(point["temperature"]), float(point["humidity"]))
        hours.append({"time": point.get("time"), "thi": value, "band": thi_band(value)})
    stressed_hours = sum(1 for h in hours if h["band"] != "normal")
    peak = max([current] + [h["thi"] for h in hours])

    milk_loss_per_cow = max(0.0, peak - MILK_LOSS_THRESHOLD) * MILK_LOSS_KG_PER_THI_UNIT
    return {
        "thi": current,
        "band": band,
        "peakThi": peak,
        "peakBand": thi_band(peak),
        "stressedHours": stressed_hours,
        "forecast": hours,
        "estimatedMilkLossKgPerCowPerDay": round(milk_loss_per_cow, 2),
        "estimatedHerdMilkLossKgPerDay": round(milk_loss_per_cow * herd_size * dairy_share, 1),
        "actions": ACTIONS[thi_band(peak)],
    }
