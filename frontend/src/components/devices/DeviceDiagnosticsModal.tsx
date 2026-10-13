import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, XCircle } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import { useLanguage } from "@/hooks/useLanguage";
import type { Device } from "@/types/dashboard";

/** Latest released firmware per device family. */
const LATEST_FIRMWARE: Record<Device["type"], string> = { "ear-tag": "v2.4.1", gateway: "v1.8.2", "environmental-sensor": "v1.2.0" };

type Result = "pass" | "warn" | "fail";

/** Runs a short, animated health check whose outcome is derived from the device's real readings. */
export default function DeviceDiagnosticsModal({ device, onClose, onFinished }: { device: Device | null; onClose: () => void; onFinished: (device: Device, passed: boolean) => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const checks = useMemo(() => {
    if (!device) return [];
    const battery: Result = device.battery >= 40 ? "pass" : device.battery >= 15 ? "warn" : "fail";
    const signal: Result = device.signal >= 60 ? "pass" : device.signal >= 35 ? "warn" : "fail";
    const connection: Result = device.status === "offline" ? "fail" : "pass";
    const latest = LATEST_FIRMWARE[device.type];
    const firmware: Result = device.firmware.localeCompare(latest, undefined, { numeric: true }) >= 0 ? "pass" : "warn";
    const uptime: Result = device.uptime >= 95 ? "pass" : device.uptime >= 85 ? "warn" : "fail";
    return [
      { key: "connection", result: connection, detail: t("status." + device.status) },
      { key: "battery", result: battery, detail: `${device.battery}%` },
      { key: "signal", result: signal, detail: `${device.signal}%` },
      { key: "firmware", result: firmware, detail: firmware === "pass" ? device.firmware : `${device.firmware} → ${latest}` },
      { key: "uptime", result: uptime, detail: `${device.uptime}%` },
    ];
  }, [device, t]);

  useEffect(() => {
    if (!device) return;
    setStep(0);
    const timers = checks.map((_, index) => setTimeout(() => setStep(index + 1), 450 * (index + 1)));
    const done = setTimeout(() => onFinished(device, checks.every((check) => check.result === "pass")), 450 * (checks.length + 1));
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.id]);

  if (!device) return null;
  const finished = step >= checks.length;
  const failures = checks.filter((check) => check.result !== "pass");

  return (
    <Modal
      open
      onClose={onClose}
      title={t("devices.diagnostics.title", { name: device.name })}
      footer={
        <button type="button" onClick={onClose} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
          {t("common.close")}
        </button>
      }
    >
      <ul className="space-y-2">
        {checks.map((check, index) => {
          const state = index < step ? check.result : index === step ? "running" : "pending";
          return (
            <li key={check.key} className="flex items-center gap-3 rounded-xl bg-terrava-bg px-3.5 py-2.5">
              {state === "running" && <Loader2 className="h-4 w-4 animate-spin text-terrava-primary" aria-hidden="true" />}
              {state === "pending" && <span className="h-4 w-4 rounded-full border-2 border-terrava-border" aria-hidden="true" />}
              {state === "pass" && <CheckCircle2 className="h-4 w-4 text-terrava-success" aria-hidden="true" />}
              {state === "warn" && <CircleAlert className="h-4 w-4 text-terrava-warning" aria-hidden="true" />}
              {state === "fail" && <XCircle className="h-4 w-4 text-terrava-error" aria-hidden="true" />}
              <span className="flex-1 text-sm text-terrava-text">{t("devices.diagnostics." + check.key)}</span>
              {index < step && <span className="text-xs font-semibold text-terrava-muted">{check.detail}</span>}
            </li>
          );
        })}
      </ul>
      {finished && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${failures.length ? "bg-terrava-warning/10 text-terrava-text" : "bg-terrava-success/10 text-terrava-text"}`} role="status">
          <p className="font-semibold">{failures.length ? t("devices.diagnostics.issues", { count: failures.length }) : t("devices.diagnostics.allPassed")}</p>
          {failures.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-terrava-muted">
              {failures.map((check) => (
                <li key={check.key}>{t("devices.diagnostics.fix." + check.key)}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
