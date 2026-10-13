import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, LoaderCircle, LogOut, Monitor, Smartphone, Tablet } from "lucide-react";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useLogout } from "@/hooks/useLogout";
import { setPasswordOverride, verifyCredentials } from "@/data/demoAccounts";
import { isoToRelative } from "@/utils/time";

const deviceIcon = (device: string) => (/mobile|app/i.test(device) ? Smartphone : /ipad|tablet/i.test(device) ? Tablet : Monitor);

export default function SecurityTab({ draft, update }: SettingsTabProps) {
  const { t, tRel, lang } = useLanguage();
  const { user } = useAuth();
  const { settings, saveSettings } = useSettings();
  const logout = useLogout();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = [next.length >= 8, /[A-Z]/.test(next), /[a-z]/.test(next), /\d/.test(next)].filter(Boolean).length;

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!current) nextErrors.current = t("settings.security.error.current");
    if (strength < 4) nextErrors.next = t("settings.security.error.weak");
    else if (next === current) nextErrors.next = t("settings.security.error.same");
    if (confirm !== next) nextErrors.confirm = t("settings.security.error.mismatch");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !user) return;

    setBusy(true);
    const valid = await verifyCredentials(user.email, current);
    if (!valid) {
      setErrors({ current: t("settings.security.error.wrongCurrent") });
      setBusy(false);
      return;
    }
    await setPasswordOverride(user.email, next);
    setBusy(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success(t("settings.security.passwordChanged"));
  };

  const revoke = (id: string) => {
    saveSettings({ ...settings, security: { ...settings.security, sessions: settings.security.sessions.filter((session) => session.id !== id) } });
    toast.success(t("settings.security.sessionRevoked"));
  };

  const loggedInAt = (() => {
    try {
      const raw = localStorage.getItem("terrava-auth-session") ?? sessionStorage.getItem("terrava-auth-session");
      return raw ? (JSON.parse(raw) as { loggedInAt?: string }).loggedInAt : undefined;
    } catch {
      return undefined;
    }
  })();
  const formatTime = (iso: string) => new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  const passwordInput = (value: string, set: (v: string) => void, key: string, label: string, autoComplete: string) => (
    <SettingsField label={label}>
      <input
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => {
          set(event.target.value);
          setErrors((prev) => ({ ...prev, [key]: "" }));
        }}
        aria-invalid={Boolean(errors[key])}
        className={`${settingsInputClass} ${errors[key] ? "border-terrava-error" : ""}`}
      />
      {errors[key] && <p className="mt-1 text-xs text-terrava-error">{errors[key]}</p>}
    </SettingsField>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={changePassword} noValidate>
        <SettingsSection title={t("settings.security.changePassword")} description={t("settings.security.changePasswordDescription")}>
          {passwordInput(current, setCurrent, "current", t("settings.security.currentPassword"), "current-password")}
          <div className="hidden sm:block" />
          {passwordInput(next, setNext, "next", t("auth.field.newPassword"), "new-password")}
          {passwordInput(confirm, setConfirm, "confirm", t("settings.security.confirmPassword"), "new-password")}
          <div className="sm:col-span-2">
            <div className="mb-1 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${index < strength ? (strength >= 4 ? "bg-terrava-success" : strength >= 2 ? "bg-terrava-warning" : "bg-terrava-error") : "bg-terrava-border"}`}
                />
              ))}
            </div>
            <p className="text-xs text-terrava-muted">{t("settings.security.passwordRules")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-60"
            >
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {t("settings.security.updatePassword")}
            </button>
            <button type="button" onClick={() => setShow((value) => !value)} className="inline-flex items-center gap-1.5 text-sm font-medium text-terrava-muted hover:text-terrava-text">
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              {show ? t("settings.security.hidePasswords") : t("settings.security.showPasswords")}
            </button>
          </div>
        </SettingsSection>
      </form>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.twoFactor")}</h3>
        <SettingsToggleRow
          label={t("settings.security.enable2fa")}
          description={t("settings.security.enable2faDescription")}
          checked={draft.security.twoFactor}
          onChange={(value) => update("security", { twoFactor: value })}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.activeSessions")}</h3>
        <ul className="space-y-2.5">
          {settings.security.sessions.map((session) => {
            const Icon = deviceIcon(session.device);
            return (
              <li key={session.id} className="flex items-center gap-3 rounded-xl bg-terrava-bg px-3.5 py-2.5">
                <Icon className="h-5 w-5 shrink-0 text-terrava-muted" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-terrava-text">
                    {session.device} {session.current && <span className="ml-1 rounded-full bg-terrava-success/10 px-2 py-0.5 text-[11px] font-semibold text-terrava-success">{t("settings.security.thisDevice")}</span>}
                  </p>
                  <p className="text-xs text-terrava-muted">
                    {session.location} &middot; {session.current ? t("settings.security.activeNow") : tRel(isoToRelative(session.lastActive))}
                  </p>
                </div>
                {session.current ? (
                  <button type="button" onClick={logout} className="inline-flex items-center gap-1 text-xs font-semibold text-terrava-error hover:underline">
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> {t("dashboard.logout")}
                  </button>
                ) : (
                  <button type="button" onClick={() => revoke(session.id)} className="text-xs font-semibold text-terrava-error hover:underline">
                    {t("settings.security.revoke")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.loginHistory")}</h3>
        <ul className="space-y-2 text-sm text-terrava-text">
          {loggedInAt && (
            <li className="flex justify-between gap-3">
              <span>{t("settings.security.loginFrom", { device: "Chrome - Windows" })}</span>
              <span className="text-xs text-terrava-muted">{formatTime(loggedInAt)}</span>
            </li>
          )}
          {settings.security.sessions
            .filter((session) => !session.current)
            .map((session) => (
              <li key={session.id} className="flex justify-between gap-3">
                <span>{t("settings.security.loginFrom", { device: session.device })}</span>
                <span className="text-xs text-terrava-muted">{formatTime(session.lastActive)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
