"""Request / response models. Field names use camelCase to match the Terrava
backend and dashboard JSON."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class BaselineIn(ApiModel):
    temperature: float = Field(38.6, ge=35, le=41)
    heartRate: float = Field(66, ge=30, le=140)
    activity: float = Field(65, ge=1, le=100)
    oxygen: float = Field(97, ge=80, le=100)


class VitalsIn(ApiModel):
    """A recent window of hourly readings (oldest first) or single values."""

    temperature: list[float | None] = Field(..., min_length=1, max_length=2000, examples=[[38.7, 39.1, 39.8, 40.3]])
    heartRate: list[float | None] = Field(..., min_length=1, max_length=2000, examples=[[70, 78, 92, 104]])
    oxygen: list[float | None] = Field(default_factory=list, max_length=2000)
    activity: list[float | None] = Field(default_factory=list, max_length=2000)
    thi: list[float | None] | float | None = Field(None, description="Environmental THI series or single value")
    baseline: BaselineIn | None = None


class HealthScoreRequest(VitalsIn):
    livestockId: str | None = None


class BatchHealthRequest(ApiModel):
    animals: list[HealthScoreRequest] = Field(..., min_length=1, max_length=500)


class AnomalyRequest(ApiModel):
    livestockId: str | None = None
    temperature: list[float | None] = Field(default_factory=list, max_length=5000)
    heartRate: list[float | None] = Field(default_factory=list, max_length=5000)
    oxygen: list[float | None] = Field(default_factory=list, max_length=5000)
    activity: list[float | None] = Field(default_factory=list, max_length=5000)
    timestamps: list[str] | None = None
    window: int = Field(48, ge=12, le=500)
    threshold: float = Field(3.5, ge=2, le=8)


class ForecastRequest(ApiModel):
    metric: Literal["temperature", "heartRate", "activity", "oxygen", "battery", "thi"] = "temperature"
    values: list[float | None] = Field(..., min_length=4, max_length=5000, description="Hourly values, oldest first")
    horizon: int = Field(12, ge=1, le=168)
    season: int = Field(24, ge=0, le=168)
    threshold: float | None = Field(None, description="Report when the forecast first crosses this value")
    thresholdDirection: Literal["above", "below"] = "above"


class EstrusRequest(ApiModel):
    livestockId: str | None = None
    activity: list[float | None] = Field(..., min_length=30, max_length=5000, description="Hourly activity, oldest first (≥ 30 h)")


class WeatherPoint(ApiModel):
    time: str | None = None
    temperature: float
    humidity: float = Field(..., ge=0, le=100)


class HeatStressRequest(ApiModel):
    temperature: float = Field(..., ge=-10, le=60)
    humidity: float = Field(..., ge=0, le=100)
    forecast: list[WeatherPoint] = Field(default_factory=list, max_length=240)
    herdSize: int = Field(0, ge=0)
    dairyShare: float = Field(1.0, ge=0, le=1)


class HerdAnimal(ApiModel):
    id: str
    code: str | None = None
    name: str | None = None
    barnId: str | None = None
    barnName: str | None = None
    readings: dict[str, list[float | None] | float | None] = Field(default_factory=dict, description="temperature, heartRate, oxygen, activity, thi")
    baseline: BaselineIn | None = None

    @model_validator(mode="after")
    def _has_readings(self):
        if not self.readings.get("temperature"):
            raise ValueError("each animal needs readings.temperature")
        return self


class HerdEnvironment(ApiModel):
    barnId: str | None = None
    name: str | None = None
    temperature: float
    humidity: float = Field(..., ge=0, le=100)
    animals: int = 0
    forecast: list[WeatherPoint] = Field(default_factory=list)


class HerdDevice(ApiModel):
    id: str
    battery: float = Field(100, ge=0, le=100)
    batteryDrainPerDay: float | None = None
    livestockId: str | None = None


class HerdInsightsRequest(ApiModel):
    animals: list[HerdAnimal] = Field(default_factory=list, max_length=2000)
    environment: list[HerdEnvironment] = Field(default_factory=list)
    devices: list[HerdDevice] = Field(default_factory=list)


class AlertExplainRequest(ApiModel):
    category: str | None = None
    severity: str | None = None
    temperature: float | None = None
    heartRate: float | None = None
    oxygen: float | None = None
    activity: float | None = None
    baselineActivity: float | None = None
    thi: float | None = None


class ChatMessage(ApiModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(ApiModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=50)
    language: Literal["id", "en"] | None = None
    context: dict | None = Field(None, description="Farm snapshot from the dashboard: farmName, animals[], alerts[]")

    @model_validator(mode="after")
    def _ends_with_user(self):
        if self.messages[-1].role != "user":
            raise ValueError("the last message must come from the user")
        return self
