import json

import numpy as np

from terrava_ai.ml.synthetic import simulate_series


def test_health_endpoint(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["assistantMode"] == "offline"


def test_models_info(client):
    body = client.get("/v1/models").json()
    assert body["risk_model"]["accuracy"] > 0.8
    assert "normal_profile" not in body


def test_health_score(client):
    r = client.post("/v1/health/score", json={"livestockId": "LVS-001", "temperature": [38.7, 39.6, 40.4, 40.8], "heartRate": [72, 90, 104, 112], "oxygen": [96, 95, 95, 94], "activity": [60, 40, 28, 20]})
    assert r.status_code == 200
    body = r.json()
    assert body["livestockId"] == "LVS-001"
    assert body["status"] in ("attention", "critical")
    assert body["primaryCondition"]["key"] != "normal"


def test_health_score_validation(client):
    assert client.post("/v1/health/score", json={"temperature": [], "heartRate": [70]}).status_code == 422


def test_batch_scoring(client):
    animals = [{"livestockId": f"A{i}", "temperature": [38.6], "heartRate": [66]} for i in range(5)]
    assert len(client.post("/v1/health/batch", json={"animals": animals}).json()["results"]) == 5


def test_anomaly_detection(client):
    temps = [38.6] * 60
    temps[55] = 41.0
    body = client.post("/v1/anomaly/detect", json={"temperature": temps, "heartRate": [66] * 60}).json()
    assert [a["index"] for a in body["anomalies"]] == [55]
    assert "temperature" in body["anomalies"][0]["vitals"]


def test_forecast(client):
    values = list(38.6 + 0.3 * np.sin(np.arange(72) / 24 * 2 * np.pi))
    body = client.post("/v1/forecast/vitals", json={"values": values, "horizon": 6, "threshold": 39.5}).json()
    assert len(body["forecast"]) == 6
    assert body["hoursUntilThreshold"] is None


def test_estrus(client):
    activity = [50.0] * 60 + [100.0] * 6
    assert client.post("/v1/estrus/detect", json={"activity": activity}).json()["detected"] is True


def test_heat_stress(client):
    body = client.post("/v1/heat-stress", json={"temperature": 34, "humidity": 80, "herdSize": 20}).json()
    assert body["band"] in ("moderate", "severe")


def test_herd_insights(client):
    rng = np.random.default_rng(2)
    animals = []
    for i, label in enumerate(["fever", "fever", "normal", "normal", "respiratory"]):
        s = simulate_series(rng, label, hours=24)
        animals.append({"id": f"LVS-{i}", "barnId": "barn-1", "barnName": "Barn A", "readings": {"temperature": s["temperature"], "heartRate": s["heart_rate"], "oxygen": s["oxygen"], "activity": s["activity"], "thi": s["thi"]}})
    body = client.post(
        "/v1/insights/herd",
        json={"animals": animals, "environment": [{"name": "Barn A", "temperature": 34, "humidity": 78}], "devices": [{"id": "DEV-1", "battery": 12, "batteryDrainPerDay": 3, "livestockId": "LVS-0"}]},
    ).json()
    assert body["herd"]["animals"] == 5
    categories = {i["category"] for i in body["insights"]}
    assert "environment" in categories and "devices" in categories
    for insight in body["insights"]:
        assert insight["priority"] in ("low", "medium", "high")
        assert {"id", "en"} <= set(insight["title"])


def test_alert_explain(client):
    body = client.post("/v1/alerts/explain", json={"temperature": 36.4, "heartRate": 60, "activity": 8, "baselineActivity": 60}).json()
    assert 0 <= body["aiConfidence"] <= 100
    assert body["recommendations"]


def test_knowledge_search(client):
    body = client.get("/v1/knowledge/search", params={"q": "vaksin PMK"}).json()
    assert body["results"]


def test_chat_offline_assesses_vitals(client):
    body = client.post("/v1/chat", json={"messages": [{"role": "user", "content": "Sapi saya suhu 40.7 C, detak jantung 115 bpm. Apa yang harus dilakukan?"}]}).json()
    assert body["mode"] == "offline"
    assert "assess_vitals" in body["toolsUsed"]
    assert "dokter hewan" in body["reply"].lower()


def test_chat_offline_heat_question_in_english(client):
    body = client.post("/v1/chat", json={"messages": [{"role": "user", "content": "Barn temperature 33 C and humidity 80%. Is that heat stress?"}], "language": "en"}).json()
    assert "heat_stress" in body["toolsUsed"]
    assert "THI" in body["reply"]


def test_chat_uses_farm_context(client):
    context = {"animals": [{"id": "LVS-001", "code": "TRV-001", "name": "Bella", "healthStatus": "critical", "healthScore": 48, "temperature": 40.8, "heartRate": 112, "activityLevel": 20}], "alerts": []}
    body = client.post("/v1/chat", json={"messages": [{"role": "user", "content": "Bagaimana kondisi TRV-001?"}], "context": context}).json()
    assert "Bella" in body["reply"]


def test_chat_stream_emits_sse(client):
    with client.stream("POST", "/v1/chat/stream", json={"messages": [{"role": "user", "content": "Apa itu THI?"}]}) as response:
        assert response.headers["content-type"].startswith("text/event-stream")
        events = [json.loads(line[6:]) for line in response.iter_lines() if line.startswith("data: ")]
    assert events[-1]["type"] == "done"
    assert any(e["type"] == "text" for e in events)


def test_chat_requires_user_turn_last(client):
    r = client.post("/v1/chat", json={"messages": [{"role": "assistant", "content": "hi"}]})
    assert r.status_code == 422
