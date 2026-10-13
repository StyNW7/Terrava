import toast from "react-hot-toast";
import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getInitials } from "@/data/demoAccounts";
import { resizeImageToDataUrl } from "@/utils/image";
import type { Language } from "@/i18n/types";

export default function ProfileTab({ draft, update }: SettingsTabProps) {
  const { user } = useAuth();
  const { lang, setLanguage, t, tt } = useLanguage();
  const photo = draft.profile.avatarUrl;
  const initials = getInitials(draft.account.name || user?.name || "TV") || "TV";

  const handleAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.profile.avatarTooLarge"));
      return;
    }
    try {
      update("profile", { avatarUrl: await resizeImageToDataUrl(file, 256) });
    } catch {
      toast.error(t("addLivestock.photoInvalid"));
    }
  };

  return (
    <SettingsSection title={t("settings.tab.profile")} description={t("settings.profile.description")}>
      <div className="flex items-center gap-4 sm:col-span-2">
        {photo ? (
          <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-terrava-light" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-terrava-light to-terrava-soft text-lg font-semibold text-terrava-primary">
            {initials}
          </span>
        )}
        <div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl border border-terrava-border px-4 py-2 text-sm font-medium text-terrava-text transition-colors hover:bg-terrava-bg">
              {t("settings.profile.changeAvatar")}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleAvatar} />
            </label>
            {photo && (
              <button type="button" onClick={() => update("profile", { avatarUrl: null })} className="rounded-xl px-3 py-2 text-sm font-medium text-terrava-error hover:bg-terrava-error/10">
                {t("addLivestock.removePhoto")}
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-terrava-muted">{t("settings.profile.avatarHint")}</p>
        </div>
      </div>
      <SettingsField label={t("team.field.name")}>
        <input value={draft.account.name} onChange={(event) => update("account", { name: event.target.value })} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("auth.field.email")}>
        <input type="email" value={draft.account.email} onChange={(event) => update("account", { email: event.target.value })} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("auth.field.phone")}>
        <input
          type="tel"
          value={draft.profile.phone}
          onChange={(event) => update("profile", { phone: event.target.value.replace(/[^\d+\s-]/g, "") })}
          className={settingsInputClass}
        />
      </SettingsField>
      <SettingsField label={t("filter.role")}>
        <input value={tt("role", user?.role ?? "Farm Owner")} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label={t("filter.farm")}>
        <input value={user?.farmName ?? ""} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label={t("settings.profile.language")}>
        {/* Language switches instantly, like the globe menu in the header. */}
        <select value={lang} onChange={(event) => setLanguage(event.target.value as Language)} className={settingsInputClass}>
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.profile.timezone")}>
        <select
          value={draft.profile.timezone}
          onChange={(event) => update("profile", { timezone: event.target.value as SettingsTabProps["draft"]["profile"]["timezone"] })}
          className={settingsInputClass}
        >
          <option value="wib">WIB (UTC+7)</option>
          <option value="wita">WITA (UTC+8)</option>
          <option value="wit">WIT (UTC+9)</option>
        </select>
      </SettingsField>
    </SettingsSection>
  );
}
