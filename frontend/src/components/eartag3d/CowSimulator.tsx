import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  BatteryMedium,
  Brain,
  Crosshair,
  Droplets,
  Eye,
  Footprints,
  Gauge,
  HeartPulse,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Smile,
  Stethoscope,
  Sun,
  Thermometer,
  Timer,
  Video,
  Zap,
} from "lucide-react";
import { earTagVariants, type EarTagVariantId } from "@/data/earTagVariants";
import VariantSwitch from "@/components/eartag3d/VariantSwitch";
import { PastureScene, type BehaviourKind, type CameraMode } from "@/components/eartag3d/simulation/pastureScene";
import type { CoatId } from "@/components/eartag3d/simulation/cow";
import {
  ACTIVITY_BASELINE,
  THRESHOLDS,
  TagSimulation,
  type AlertKind,
  type LogEntry,
  type Scenario,
  type SimAlert,
  type SimSnapshot,
} from "@/components/eartag3d/simulation/telemetry";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface CowSimulatorProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

const SCENARIOS: Array<{ id: Scenario; icon: typeof Smile }> = [
  { id: "normal", icon: Smile },
  { id: "fever", icon: Thermometer },
  { id: "heatStress", icon: Sun },
  { id: "lameness", icon: Footprints },
  { id: "geofence", icon: MapPin },
];

const COATS: CoatId[] = ["bali", "brahman", "holstein"];
const SPEEDS = [1, 60, 600] as const;
const CAMERAS: Array<{ id: CameraMode; icon: typeof Eye }> = [
  { id: "follow", icon: Video },
  { id: "ear", icon: Crosshair },
  { id: "overview", icon: Eye },
];

/** Byte groups of the 22-byte vitals payload, for colouring the hex dump. */
const VITALS_FIELDS: Array<[string, number]> = [
  ["header", 1],
  ["temperature", 2],
  ["heartRate", 1],
  ["oxygen", 1],
  ["activity", 1],
  ["steps", 2],
  ["latitude", 4],
  ["longitude", 4],
  ["battery", 1],
  ["flags", 1],
  ["timestamp", 4],
];
const FIELD_COLORS = [
  "text-slate-400",
  "text-rose-300",
  "text-pink-300",
  "text-sky-300",
  "text-amber-300",
  "text-orange-300",
  "text-emerald-300",
  "text-teal-300",
  "text-lime-300",
  "text-violet-300",
  "text-slate-300",
];

const SEVERITY_STYLE: Record<SimAlert["severity"], string> = {
  critical: "border-terrava-error/30 bg-terrava-error/10 text-terrava-error",
  warning: "border-terrava-warning/30 bg-terrava-warning/10 text-terrava-warning",
  info: "border-terrava-info/30 bg-terrava-info/10 text-terrava-info",
};

function clock(ms: number) {
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function CowSimulator({ variantId, onVariantChange }: CowSimulatorProps) {
  const { t } = useLanguage();
  const variant = earTagVariants[variantId];

  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PastureScene | null>(null);
  const simRef = useRef<TagSimulation | null>(null);
  const labelRefs = useRef<Record<"tag" | "gateway" | "cow", HTMLDivElement | null>>({ tag: null, gateway: null, cow: null });
  const control = useRef({ speed: 60 as number, paused: false });

  const [status, setStatus] = useState<"loading" | "ready" | "webgl">("loading");
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [coat, setCoat] = useState<CoatId>("bali");
  const [camera, setCamera] = useState<CameraMode>("follow");
  const [speed, setSpeed] = useState<number>(60);
  const [paused, setPaused] = useState(false);
  const [interval, setIntervalMinutes] = useState<5 | 15>(15);
  const [solarEdition, setSolarEdition] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [behaviour, setBehaviour] = useState<BehaviourKind>("graze");
  const [snap, setSnap] = useState<SimSnapshot | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<SimAlert[]>([]);
  const [activeKinds, setActiveKinds] = useState<AlertKind[]>([]);
  const [history, setHistory] = useState<TagSimulation["history"]>([]);

  // --- Mount scene + simulation ----------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let scene: PastureScene;
    try {
      scene = new PastureScene(host);
    } catch {
      setStatus("webgl");
      return;
    }
    const sim = new TagSimulation(earTagVariants[variantId]);
    sceneRef.current = scene;
    simRef.current = sim;

    scene.setCameraMode("follow", true);
    scene.onBehaviour = (kind) => setBehaviour(kind);
    sim.onTransmit = (entry) => {
      if (entry.kind === "downlink") scene.transmit("down", "command");
      else scene.transmit("up", entry.kind);
      if (entry.kind === "downlink" && entry.command === "locate") scene.flashLed("locate");
    };
    scene.onTick = (dt, input) => {
      const { speed: rate, paused: hold } = control.current;
      if (!hold) sim.advance(dt * rate * 1000, input);
      scene.setDaylight(sim.hour);
      scene.setFenceAlarm(!input.insideFence);
    };
    scene.onOverlay = (positions) => {
      for (const key of ["tag", "gateway", "cow"] as const) {
        const element = labelRefs.current[key];
        const point = positions[key];
        if (!element) continue;
        element.style.opacity = point.visible ? "1" : "0";
        element.style.transform = `translate(-50%, -100%) translate(${point.x}px, ${point.y}px)`;
      }
    };

    const publish = () => {
      setSnap(sim.snapshot());
      setLog(sim.log);
      setAlerts(sim.alerts);
      setActiveKinds(sim.activeAlertKinds);
      setHistory(sim.history);
    };
    publish();
    const timer = window.setInterval(publish, 250);

    return () => {
      window.clearInterval(timer);
      scene.dispose();
      sceneRef.current = null;
      simRef.current = null;
    };
    // The scene is created once; variant changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const sim = simRef.current;
    if (!scene || !sim) return;
    let cancelled = false;
    setStatus((current) => (current === "webgl" ? current : "loading"));
    sim.setVariant(earTagVariants[variantId]);
    scene
      .setTag(earTagVariants[variantId])
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [variantId]);

  useEffect(() => {
    sceneRef.current?.setCoat(coat);
  }, [coat]);

  useEffect(() => {
    sceneRef.current?.setScenario(scenario);
    simRef.current?.setScenario(scenario);
    if (scenario === "geofence") sceneRef.current?.clearTrail();
  }, [scenario]);

  useEffect(() => {
    control.current = { speed, paused };
    if (simRef.current) simRef.current.timeScale = speed;
  }, [speed, paused]);

  useEffect(() => {
    simRef.current?.setInterval(interval);
  }, [interval]);

  useEffect(() => {
    if (simRef.current) simRef.current.solarEdition = solarEdition;
  }, [solarEdition]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.requestFullscreen?.();
  };

  // --- Derived view state ----------------------------------------------------------------
  const lastVitals = useMemo(() => log.find((entry) => entry.kind === "vitals"), [log]);
  const vitals = lastVitals?.kind === "vitals" ? lastVitals.vitals : null;
  const activityRolling = history.length ? history.slice(-4).reduce((sum, item) => sum + item.activity, 0) / Math.min(4, history.length) : null;
  const hasSolar = variant.solar === "standard" || solarEdition;
  const isDay = snap ? snap.environment.sunlight > 0.05 : true;

  const score = useMemo(() => {
    let value = 100;
    for (const kind of activeKinds) {
      const alert = alerts.find((item) => item.kind === kind && item.resolvedAt === null);
      value -= alert?.severity === "critical" ? 28 : alert?.severity === "warning" ? 14 : 5;
    }
    return Math.max(15, value);
  }, [activeKinds, alerts]);

  const insight = useMemo(() => {
    if (snap?.offline) return t("eartag.sim.insight.offline");
    const has = (kind: AlertKind) => activeKinds.includes(kind);
    if (has("fever") && has("activity")) return t("eartag.sim.insight.feverActivity");
    if (has("fever")) return t("eartag.sim.insight.fever");
    if (has("heat")) return t("eartag.sim.insight.heat");
    if (has("geofence")) return t("eartag.sim.insight.geofence");
    if (has("activity")) return t("eartag.sim.insight.activity");
    if (has("tachycardia")) return t("eartag.sim.insight.heartRate");
    if (has("battery")) return t("eartag.sim.insight.battery");
    if (scenario !== "normal") return t("eartag.sim.insight.watching");
    return t("eartag.sim.insight.normal");
  }, [activeKinds, scenario, snap?.offline, t]);

  const tempValue = vitals?.temperature ?? snap?.temperature ?? 0;
  const metricTone = (danger: boolean, warn = false) => (danger ? "danger" : warn ? "warn" : "ok");

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-terrava-border bg-white p-3 shadow-card sm:p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <VariantSwitch value={variantId} onChange={onVariantChange} />
          <div className="flex items-center gap-1 rounded-full border border-terrava-border p-1" role="radiogroup" aria-label={t("eartag.sim.breed")}>
            {COATS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={coat === id}
                onClick={() => setCoat(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  coat === id ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted hover:text-terrava-primary"
                )}
              >
                {t(`eartag.sim.coat.${id}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("eartag.sim.scenario")}>
          {SCENARIOS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={scenario === id}
              onClick={() => setScenario(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                scenario === id
                  ? "border-terrava-primary bg-terrava-primary text-white"
                  : "border-terrava-border bg-white text-terrava-muted hover:border-terrava-primary/40 hover:text-terrava-primary"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {t(`eartag.sim.scenario.${id}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 3D pasture */}
        <div
          ref={frameRef}
          className={cn(
            "relative isolate overflow-hidden rounded-3xl border border-terrava-border bg-[#cfe9f3] shadow-card dark:bg-[#132233]",
            fullscreen ? "h-screen rounded-none" : "h-[480px] sm:h-[600px]"
          )}
        >
          <div ref={hostRef} className="absolute inset-0" />

          {/* World-anchored labels */}
          <div
            ref={(element) => {
              labelRefs.current.tag = element;
            }}
            className="pointer-events-none absolute left-0 top-0 z-10 -mt-3 opacity-0"
          >
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-terrava-forest/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {variant.code} · {tempValue.toFixed(1)} °C
            </div>
            <div className="mx-auto h-3 w-px bg-terrava-forest/70" />
          </div>
          <div
            ref={(element) => {
              labelRefs.current.gateway = element;
            }}
            className="pointer-events-none absolute left-0 top-0 z-10 opacity-0"
          >
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-terrava-text shadow-md dark:bg-terrava-forest/90">
              <Radio className="h-3 w-3 text-terrava-primary" aria-hidden="true" />
              {t("eartag.sim.gateway")}
              {snap && snap.fcnt > 0 && <span className="font-mono text-terrava-muted">{snap.link.rssi} dBm</span>}
            </div>
          </div>
          <div
            ref={(element) => {
              labelRefs.current.cow = element;
            }}
            className="pointer-events-none absolute left-0 top-0 z-10 opacity-0"
          >
            <div
              className={cn(
                "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md",
                activeKinds.some((kind) => kind !== "signal") ? "bg-terrava-error text-white" : "bg-white/90 text-terrava-text dark:bg-terrava-forest/90"
              )}
            >
              {t(`eartag.sim.behaviour.${behaviour}`)}
            </div>
          </div>

          {/* Clock + speed, camera: one wrapping bar so they never overlap on phones */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-md backdrop-blur dark:border-white/10 dark:bg-terrava-forest/80">
                {isDay ? <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" /> : <Moon className="h-4 w-4 text-sky-300" aria-hidden="true" />}
                <span className="font-mono text-sm font-bold text-terrava-text">{snap ? clock(snap.simTime) : "--:--"}</span>
                <span className="text-[11px] text-terrava-muted">WIB</span>
                {snap && (
                  <span className="hidden text-[11px] text-terrava-muted sm:inline">
                    · {snap.environment.airTemp.toFixed(0)} °C · THI {snap.environment.thi.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/85 p-1 shadow-md backdrop-blur dark:border-white/10 dark:bg-terrava-forest/80">
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? t("eartag.sim.resume") : t("eartag.sim.pause")}
                  title={paused ? t("eartag.sim.resume") : t("eartag.sim.pause")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-terrava-text hover:text-terrava-primary"
                >
                  {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
                {SPEEDS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSpeed(value);
                      setPaused(false);
                    }}
                    aria-pressed={speed === value && !paused}
                    className={cn(
                      "rounded-full px-2 py-1 font-mono text-[11px] font-semibold transition-colors",
                      speed === value && !paused ? "bg-terrava-primary text-white" : "text-terrava-muted hover:text-terrava-primary"
                    )}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/85 p-1 shadow-md backdrop-blur dark:border-white/10 dark:bg-terrava-forest/80">
                {CAMERAS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCamera(id);
                      sceneRef.current?.setCameraMode(id);
                    }}
                    aria-pressed={camera === id}
                    title={t(`eartag.sim.camera.${id}`)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      camera === id ? "bg-terrava-primary text-white" : "text-terrava-muted hover:text-terrava-primary"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{t(`eartag.sim.camera.${id}`)}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={t("eartag.studio.fullscreen")}
                title={t("eartag.studio.fullscreen")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-terrava-text shadow-md backdrop-blur hover:text-terrava-primary dark:border-white/10 dark:bg-terrava-forest/80"
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Legend + geofence */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-md backdrop-blur",
                snap && !snap.insideFence
                  ? "border-terrava-error/40 bg-terrava-error/90 text-white"
                  : "border-white/60 bg-white/85 text-terrava-text dark:border-white/10 dark:bg-terrava-forest/80"
              )}
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {snap && !snap.insideFence
                ? t("eartag.sim.outsideFence", { minutes: Math.round(snap.outsideMinutes) })
                : t("eartag.sim.insideFence")}
            </div>
            <div className="hidden items-center gap-3 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-terrava-muted shadow-md backdrop-blur dark:border-white/10 dark:bg-terrava-forest/80 sm:flex">
              <LegendDot color="bg-emerald-400" label={t("eartag.sim.legend.uplink")} />
              <LegendDot color="bg-sky-400" label={t("eartag.sim.legend.downlink")} />
              <LegendDot color="bg-amber-400" label={t("eartag.sim.legend.status")} />
            </div>
          </div>

          {status !== "ready" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-terrava-bg/70 px-6 text-center backdrop-blur-sm">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin text-terrava-primary" aria-hidden="true" />
                  <p className="text-sm font-medium text-terrava-text">{t("eartag.sim.loading")}</p>
                </>
              ) : (
                <p className="max-w-sm text-sm text-terrava-muted">{t("eartag.studio.noWebgl")}</p>
              )}
            </div>
          )}
        </div>

        {/* Live telemetry */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-terrava-border bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("eartag.sim.liveTelemetry")}</p>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-terrava-muted">
                <Timer className="h-3 w-3" aria-hidden="true" />
                {snap ? t("eartag.sim.nextUplink", { seconds: Math.ceil(snap.nextUplinkIn / 1000 / Math.max(1, paused ? 1 : speed)) }) : "–"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric
                icon={<Thermometer className="h-4 w-4" />}
                label={t("eartag.sim.metric.temperature")}
                value={vitals ? vitals.temperature.toFixed(2) : "–"}
                unit="°C"
                tone={vitals ? metricTone(vitals.temperature >= THRESHOLDS.tempHigh || vitals.temperature <= THRESHOLDS.tempLow, vitals.temperature >= 39.3) : "ok"}
              />
              <Metric
                icon={<HeartPulse className="h-4 w-4" />}
                label={t("eartag.sim.metric.heartRate")}
                value={vitals ? String(vitals.heartRate) : "–"}
                unit="bpm"
                tone={vitals ? metricTone(vitals.heartRate >= THRESHOLDS.heartRate, vitals.heartRate > 84) : "ok"}
              />
              <Metric
                icon={<Droplets className="h-4 w-4" />}
                label="SpO₂"
                value={vitals ? String(vitals.oxygen) : "–"}
                unit="%"
                tone={vitals ? metricTone(vitals.oxygen < 92, vitals.oxygen < 95) : "ok"}
              />
              <Metric
                icon={<Activity className="h-4 w-4" />}
                label={t("eartag.sim.metric.activity")}
                value={vitals ? String(vitals.activity) : "–"}
                unit={vitals ? `· ${vitals.steps} ${t("eartag.sim.steps")}` : ""}
                tone={activityRolling !== null ? metricTone(activityRolling <= ACTIVITY_BASELINE * 0.7, activityRolling < ACTIVITY_BASELINE * 0.8) : "ok"}
              />
              <Metric
                icon={hasSolar && isDay ? <BatteryCharging className="h-4 w-4" /> : <BatteryMedium className="h-4 w-4" />}
                label={t("eartag.sim.metric.battery")}
                value={snap ? snap.batteryPct.toFixed(1) : "–"}
                unit="%"
                tone={snap ? metricTone(snap.batteryPct <= THRESHOLDS.batteryLow, snap.batteryPct < 35) : "ok"}
                hint={snap && hasSolar ? `☀ ${snap.harvestMw.toFixed(1)} mW` : undefined}
              />
              <Metric
                icon={<Radio className="h-4 w-4" />}
                label={t("eartag.sim.metric.signal")}
                value={snap && snap.fcnt > 0 ? String(snap.link.rssi) : "–"}
                unit="dBm"
                tone={snap && snap.fcnt > 0 ? metricTone(snap.link.quality <= THRESHOLDS.signalWeak, snap.link.quality < 40) : "ok"}
                hint={snap && snap.fcnt > 0 ? `SNR ${snap.link.snr} · SF${snap.link.sf}` : undefined}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Sparkline label={t("eartag.sim.metric.temperature")} values={history.map((item) => item.temperature)} threshold={THRESHOLDS.tempHigh} min={37.8} max={41} color="#e0645a" />
              <Sparkline label={t("eartag.sim.metric.heartRate")} values={history.map((item) => item.heartRate)} threshold={THRESHOLDS.heartRate} min={50} max={130} color="#d9468f" />
            </div>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">
                <Brain className="h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
                {t("eartag.sim.aiInsight")}
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[11px] font-bold",
                  score >= 85 ? "bg-terrava-success/15 text-terrava-success" : score >= 60 ? "bg-terrava-warning/15 text-terrava-warning" : "bg-terrava-error/15 text-terrava-error"
                )}
              >
                {t("eartag.sim.healthScore")} {score}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-terrava-text">{insight}</p>
            <div className="mt-3 space-y-1.5">
              {alerts.length === 0 && <p className="text-xs text-terrava-muted">{t("eartag.sim.noAlerts")}</p>}
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                    alert.resolvedAt === null ? SEVERITY_STYLE[alert.severity] : "border-terrava-border bg-terrava-bg text-terrava-muted"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(`eartag.sim.alert.${alert.kind}`)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px]">
                    {alert.resolvedAt === null ? alert.value : t("eartag.sim.resolved")} · {clock(alert.simTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Device console + payload log */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-terrava-border bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("eartag.sim.console")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ConsoleButton icon={<Crosshair className="h-4 w-4" />} label={t("eartag.sim.cmd.locate")} onClick={() => simRef.current?.locate()} />
            <ConsoleButton icon={<Stethoscope className="h-4 w-4" />} label={t("eartag.sim.cmd.diagnostics")} onClick={() => simRef.current?.diagnostics()} />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("eartag.sim.interval")}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([15, 5] as const).map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setIntervalMinutes(minutes)}
                aria-pressed={interval === minutes}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition-colors",
                  interval === minutes ? "border-terrava-primary bg-terrava-light" : "border-terrava-border hover:border-terrava-primary/40"
                )}
              >
                <span className="block text-sm font-bold text-terrava-text">{minutes} min</span>
                <span className="block text-[11px] text-terrava-muted">{t(minutes === 15 ? "eartag.sim.profile.field" : "eartag.sim.profile.default")}</span>
              </button>
            ))}
          </div>
          {variant.solar === "optional" && (
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-terrava-border px-3 py-2">
              <span className="text-xs font-medium text-terrava-text">{t("eartag.sim.solarEdition")}</span>
              <input type="checkbox" checked={solarEdition} onChange={(event) => setSolarEdition(event.target.checked)} className="h-4 w-4 accent-terrava-primary" />
            </label>
          )}
          {snap && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-terrava-border pt-3 text-xs">
              <dt className="text-terrava-muted">{t("eartag.sim.energy.battery")}</dt>
              <dd className="text-right font-semibold text-terrava-text">
                {snap.batteryMah.toFixed(0)} / {variant.batteryMah} mAh
              </dd>
              <dt className="text-terrava-muted">{t("eartag.sim.energy.consumption")}</dt>
              <dd className="text-right font-semibold text-terrava-text">≈ {snap.consumptionMahDay} mAh/{t("eartag.sim.day")}</dd>
              <dt className="text-terrava-muted">{t("eartag.sim.energy.harvest")}</dt>
              <dd className="text-right font-semibold text-terrava-text">
                {hasSolar ? `+${snap.harvestMahDay.toFixed(1)} mAh/${t("eartag.sim.day")}` : t("eartag.sim.energy.noSolar")}
              </dd>
              <dt className="text-terrava-muted">{t("eartag.sim.energy.runtime")}</dt>
              <dd className="text-right font-semibold text-terrava-primary">
                {snap.runtimeDays === null ? t("eartag.sim.energy.neutral") : `≈ ${snap.runtimeDays.toFixed(snap.runtimeDays < 10 ? 1 : 0)} ${t("eartag.sim.days")}`}
              </dd>
            </dl>
          )}
          <button
            type="button"
            onClick={() => simRef.current?.recharge()}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-terrava-border px-3 py-2 text-xs font-semibold text-terrava-muted transition-colors hover:border-terrava-primary/40 hover:text-terrava-primary"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            {t("eartag.sim.recharge")}
          </button>
        </div>

        <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-terrava-forest/30 bg-[#0d1813] shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-300/90">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              {t("eartag.sim.payloadLog")}
            </p>
            <span className="font-mono text-[11px] text-white/40">LoRaWAN AS923-2 · FPort 1/2/10 · fcnt {snap?.fcnt ?? 0}</span>
          </div>
          <div className="max-h-[360px] flex-1 space-y-2 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed" aria-live="polite">
            {log.length === 0 && (
              <p className="flex items-center gap-2 text-white/50">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {t("eartag.sim.waiting")}
              </p>
            )}
            {log.slice(0, 14).map((entry) => (
              <LogLine key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
  unit,
  tone,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  tone: "ok" | "warn" | "danger";
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 transition-colors",
        tone === "danger" ? "border-terrava-error/35 bg-terrava-error/10" : tone === "warn" ? "border-terrava-warning/35 bg-terrava-warning/10" : "border-terrava-border bg-terrava-bg"
      )}
    >
      <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", tone === "danger" ? "text-terrava-error" : tone === "warn" ? "text-terrava-warning" : "text-terrava-muted")}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-lg font-bold leading-none text-terrava-text">
        {value}
        <span className="ml-1 text-[11px] font-medium text-terrava-muted">{unit}</span>
      </p>
      {hint && <p className="mt-1 truncate font-mono text-[10px] text-terrava-muted">{hint}</p>}
    </div>
  );
}

function Sparkline({ label, values, threshold, min, max, color }: { label: string; values: number[]; threshold: number; min: number; max: number; color: string }) {
  const width = 150;
  const height = 44;
  const lo = Math.min(min, ...values);
  const hi = Math.max(max, ...values);
  const y = (value: number) => height - ((value - lo) / (hi - lo || 1)) * height;
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * width},${y(value).toFixed(1)}`).join(" ");
  return (
    <div className="rounded-xl border border-terrava-border bg-terrava-bg p-2">
      <p className="mb-1 text-[10px] font-medium text-terrava-muted">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-full" preserveAspectRatio="none" role="img" aria-label={label}>
        <line x1={0} x2={width} y1={y(threshold)} y2={y(threshold)} stroke="currentColor" className="text-terrava-error/50" strokeDasharray="3 3" strokeWidth={1} />
        {values.length > 1 && <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}

function ConsoleButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-terrava-primary px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terrava-hover"
    >
      {icon}
      {label}
    </button>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const { t } = useLanguage();
  const time = clock(entry.simTime);
  if (entry.kind === "downlink") {
    return (
      <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 px-2.5 py-1.5">
        <span className="text-white/40">{time}</span> <span className="font-semibold text-sky-300">▼ DOWN FPort 10</span>{" "}
        <span className="text-white/70">{entry.command}</span>
        <div className="break-all text-sky-200/90">{entry.hex.match(/../g)?.join(" ")}</div>
      </div>
    );
  }
  if (entry.kind === "status") {
    return (
      <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-2.5 py-1.5">
        <span className="text-white/40">{time}</span> <span className="font-semibold text-amber-300">▲ UP FPort 2 · status</span>{" "}
        <span className="text-white/40">fcnt {entry.fcnt}</span>
        <div className="break-all text-amber-200/90">{entry.hex.match(/../g)?.join(" ")}</div>
        <div className="text-white/55">
          fw v1.4.0 · interval {entry.intervalSeconds}s · battery {entry.battery}% · {t("eartag.sim.selfTestOk")}
        </div>
      </div>
    );
  }
  const bytes = entry.hex.match(/../g) ?? [];
  let cursor = 0;
  const v = entry.vitals;
  return (
    <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1.5">
      <span className="text-white/40">{time}</span> <span className="font-semibold text-emerald-300">▲ UP FPort 1 · vitals</span>{" "}
      <span className="text-white/40">
        fcnt {entry.fcnt} · {entry.link.rssi} dBm · SNR {entry.link.snr} · SF{entry.link.sf} · {entry.link.airtimeMs} ms
      </span>
      <div className="break-all">
        {VITALS_FIELDS.map(([field, size], index) => {
          const group = bytes.slice(cursor, cursor + size).join(" ");
          cursor += size;
          return (
            <span key={field} title={field} className={cn(FIELD_COLORS[index], "mr-1.5")}>
              {group}
            </span>
          );
        })}
      </div>
      <div className="text-white/55">
        {`{ temp: ${v.temperature.toFixed(2)}, hr: ${v.heartRate}, spo2: ${v.oxygen}, act: ${v.activity}, steps: ${v.steps}, lat: ${v.latitude.toFixed(6)}, lng: ${v.longitude.toFixed(6)}, batt: ${v.battery}${v.flags.charging ? ", ☀ charging" : ""}${v.flags.lowPower ? ", low-power" : ""} }`}
      </div>
    </div>
  );
}
