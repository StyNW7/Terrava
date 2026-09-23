import toast from "react-hot-toast";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";
import { useLanguage } from "@/hooks/useLanguage";

const sessions = [
  { id: "1", device: "Chrome - Windows", location: "Boyolali, Indonesia", activeNow: true },
  { id: "2", device: "Terrava Mobile App", location: "Boyolali, Indonesia", lastActive: "2 hours ago" },
];

const loginHistory = [
  { id: "1", device: "Chrome - Windows", dayKey: "time.today", time: "08.12" },
  { id: "2", device: "Terrava Mobile App", dayKey: "time.yesterday", time: "19.40" },
];

export default function SecurityTab({ onDirty }: { onDirty: () => void }) {
  const { t, tRel } = useLanguage();

  return (
    <div className="space-y-6">
      <SettingsSection title={t("settings.security.changePassword")} description={t("settings.security.changePasswordDescription")}>
        <SettingsField label={t("settings.security.currentPassword")}>
          <input type="password" onChange={onDirty} className={settingsInputClass} />
        </SettingsField>
        <SettingsField label={t("auth.field.newPassword")}>
          <input type="password" onChange={onDirty} className={settingsInputClass} />
        </SettingsField>
      </SettingsSection>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.twoFactor")}</h3>
        <SettingsToggleRow
          label={t("settings.security.enable2fa")}
          description={t("settings.security.enable2faDescription")}
          checked={false}
          onChange={onDirty as unknown as (v: boolean) => void}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.activeSessions")}</h3>
        <ul className="space-y-2.5">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between rounded-xl bg-terrava-bg px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-terrava-text">{session.device}</p>
                <p className="text-xs text-terrava-muted">
                  {session.location} &middot; {session.activeNow ? t("settings.security.activeNow") : tRel(session.lastActive ?? "")}
                </p>
              </div>
              <button onClick={() => toast.success(t("settings.security.sessionRevoked"))} className="text-xs font-semibold text-terrava-error">
                {t("settings.security.revoke")}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.security.loginHistory")}</h3>
        <ul className="space-y-2 text-sm text-terrava-text">
          {loginHistory.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{t("settings.security.loginFrom", { device: item.device })}</span>
              <span className="text-xs text-terrava-muted">
                {t(item.dayKey)}, {item.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
