# Terrava AI

The intelligence layer of Terrava: a **Python / FastAPI** service with machine-learning models for livestock health and the **Terra** assistant chatbot.

| Capability | How it works |
| --- | --- |
| **Health score & condition classifier** | Gradient-boosted trees (`HistGradientBoostingClassifier`) over 13 window features (temperature, heart rate, SpO₂, activity relative to the animal's own baseline, environmental THI). Recognises **normal, fever/infection, heat stress, respiratory disease, lameness, estrus and metabolic disorders**, with probabilities, a 0–100 health score and plain-language explanations of the readings that drove the result |
| **Anomaly detection** | Window-level `IsolationForest` trained on healthy animals, plus per-reading robust z-scores (median / MAD) against each animal's recent history |
| **Forecasting** | Additive Holt-Winters with daily seasonality (damped Holt for short series), 80 % prediction intervals and "hours until threshold" (e.g. when will this fever cross 40 °C?) |
| **Estrus detection** | Activity surge ≥ 1.6× baseline for ≥ 3 h, with the recommended insemination window (12–18 h after onset) |
| **Heat stress** | Temperature-Humidity Index, risk band, exposure hours from a forecast, estimated milk loss and bilingual actions |
| **Herd insights** | Disease clusters, breeding opportunities, barn activity decline, heat-stress outlook and battery forecasts, returned in the dashboard's `AIInsight` shape |
| **Alert explanations** | Likely cause, top conditions and recommended first actions for any alert |
| **Terra assistant** | Claude (`claude-opus-5-5`) with tools — knowledge-base search, the health model, the heat calculator and the caller's farm data — streamed over Server-Sent Events. Prompt caching on the system prompt, server-side refusal fallback, input validation for every tool call. **Offline mode** answers from the same tools and knowledge base when no API key is set |

> Runs on its own; nothing here calls the backend or the IoT layer yet. Input and output shapes match the backend and dashboard so integration is a drop-in step.

---

## Quick start

Requirements: **Python 3.11+**.

```bash
cd ai
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
pip install -e . --no-deps

python -m terrava_ai train      # ~30 s; also happens automatically on first start
python -m terrava_ai serve      # http://localhost:8000  (docs at /docs)
```

Other commands:

```bash
python -m terrava_ai evaluate   # metrics of the current models
python -m terrava_ai demo       # 20 simulated cases per condition, end to end
python -m terrava_ai chat       # talk to Terra in the terminal
pytest                          # 35 tests (models, time series, API, assistant loop)
```

To enable the full assistant, copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`.

---

## Model quality

Trained on 14,000 physiologically grounded synthetic 24-hour windows (see `terrava_ai/ml/synthetic.py`): each animal has its own baseline and daily rhythm; conditions start at random hours, range from subclinical to severe, and the data includes sensor spikes, dropped packets, hot-but-healthy days and calm or lively days that are not illness. Hold-out results (20 % split):

| Metric | Value |
| --- | --- |
| Accuracy | ≈ 0.90 |
| Macro F1 | ≈ 0.89 |
| Strongest classes | heat stress, fever, metabolic (F1 > 0.9) |
| Hardest class | lameness (subtle early activity drops) |
| Anomaly detector false-positive rate | ≈ 2 % |

`GET /v1/models` returns the full report (per-class precision/recall, confusion matrix, permutation feature importance). These numbers describe the synthetic benchmark; **retrain on labelled herd data** (same feature pipeline, `ml/registry.py → train`) once pilot farms produce it.

---

## API

All `/v1` routes accept JSON and, when `TERRAVA_AI_API_KEY` is set, require the `x-api-key` header.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service, model version, assistant mode |
| GET | `/v1/models` | Model metadata and evaluation |
| POST | `/v1/models/train?samples=` | Retrain |
| GET | `/v1/conditions` | Conditions and normal vital ranges |
| POST | `/v1/health/score` | Score one animal from a window of readings |
| POST | `/v1/health/batch` | Score up to 500 animals |
| POST | `/v1/anomaly/detect` | Per-reading anomalies + window anomaly score |
| POST | `/v1/forecast/vitals` | Forecast a vital and time-to-threshold |
| POST | `/v1/estrus/detect` | Estrus detection + insemination window |
| POST | `/v1/heat-stress` | THI, band, milk-loss estimate, actions |
| POST | `/v1/insights/herd` | Herd insights in the dashboard's shape |
| POST | `/v1/alerts/explain` | Cause and recommendations for an alert |
| GET | `/v1/knowledge/search?q=` | Search the assistant's knowledge base |
| POST | `/v1/chat` | Ask Terra (JSON answer) |
| POST | `/v1/chat/stream` | Ask Terra (Server-Sent Events) |

Example:

```bash
curl -X POST localhost:8000/v1/health/score -H "Content-Type: application/json" -d '{
  "livestockId": "LVS-001",
  "temperature": [38.7, 39.4, 40.1, 40.8],
  "heartRate":   [72, 88, 101, 112],
  "oxygen":      [96, 96, 95, 94],
  "activity":    [62, 45, 30, 20],
  "baseline":    {"activity": 62}
}'
# -> healthScore 17, status "critical", primaryCondition "fever" (p≈0.99),
#    factors: "Heart rate +46 bpm from baseline", "Activity at 32% of its normal baseline", ...
```

Chat with farm context (what the dashboard would send):

```json
{
  "messages": [{ "role": "user", "content": "Bagaimana kondisi TRV-001 hari ini?" }],
  "language": "id",
  "context": {
    "farmName": "Terrava Farm Boyolali",
    "animals": [{ "id": "LVS-001", "code": "TRV-001", "name": "Bella", "healthStatus": "critical", "temperature": 40.8, "heartRate": 112 }],
    "alerts":  [{ "id": "ALT-003", "livestockId": "LVS-001", "severity": "critical", "status": "active" }]
  }
}
```

Stream events: `tool` (a tool is running), `text` (answer delta), `done` (mode, model, token usage), `error`.

---

## Project structure

```text
ai/
├── terrava_ai/
│   ├── main.py              # FastAPI app (lifespan loads/trains models, indexes knowledge)
│   ├── cli.py               # serve / train / evaluate / demo / chat
│   ├── config.py            # pydantic-settings (TERRAVA_AI_* and ANTHROPIC_API_KEY)
│   ├── schemas.py           # request models (camelCase like the backend)
│   ├── api/                 # routes and dependencies
│   ├── ml/
│   │   ├── physiology.py    # normal ranges, conditions, THI
│   │   ├── synthetic.py     # training data generator
│   │   ├── features.py      # window features relative to the animal's baseline
│   │   ├── registry.py      # train / evaluate / persist / load
│   │   ├── inference.py     # health assessment and explanations
│   │   ├── timeseries.py    # anomalies, Holt-Winters forecast, estrus
│   │   ├── heat.py          # heat-stress analytics
│   │   └── insights.py      # herd insights
│   └── chat/
│       ├── assistant.py     # Terra: Claude tool loop + offline mode
│       ├── tools.py         # tool schemas and validated execution
│       ├── retriever.py     # TF-IDF retrieval
│       └── knowledge/       # bilingual knowledge base (Markdown)
├── tests/
├── models/                  # trained artifacts (git-ignored)
└── Dockerfile
```

## Integration notes (for later)

- **Backend → AI**: the telemetry pipeline can call `/v1/health/batch` (or `/v1/health/score`) instead of the deterministic score, `/v1/alerts/explain` to enrich alerts, and post `/v1/insights/herd` results to the backend's `POST /insights`.
- **Dashboard → AI**: the chat widget streams from `/v1/chat/stream`, passing the farm snapshot it already holds as `context`.
- Keep `TERRAVA_AI_API_KEY` set and call the service from the backend, not the browser, in production.
