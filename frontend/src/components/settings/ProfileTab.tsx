import toast from "react-hot-toast";
import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import UserAvatar from "@/components/dashboard/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/i18n/types";

export default function ProfileTab({ onDirty }: { onDirty: () => void }) {
  const { user, updateUser } = useAuth();
  const { lang, setLanguage, t, tt } = useLanguage();

  return (
    <SettingsSection title={t("settings.tab.profile")} description={t("settings.profile.description")}>
      <div className="sm:col-span-2 flex items-center gap-4">
        <UserAvatar initials={user?.initials ?? "TV"} size="lg" online={false} />
        <div>
          <button
            type="button"
            onClick={() => toast.success(t("settings.profile.avatarToast"))}
            className="rounded-xl border border-terrava-border px-4 py-2 text-sm font-medium text-terrava-text transition-colors hover:bg-terrava-bg"
          >
            {t("settings.profile.changeAvatar")}
          </button>
          <p className="mt-1.5 text-xs text-terrava-muted">{t("settings.profile.avatarHint")}</p>
        </div>
      </div>
      <SettingsField label={t("team.field.name")}>
        <input
          key={user?.id}
          defaultValue={user?.name ?? ""}
          onChange={(event) => {
            onDirty();
            const name = event.target.value.trim();
            if (name) updateUser({ name });
          }}
          className={settingsInputClass}
        />
      </SettingsField>
      <SettingsField label={t("auth.field.email")}>
        <input type="email" key={user?.email} defaultValue={user?.email ?? ""} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("auth.field.phone")}>
        <input defaultValue="+62 812 3456 7890" onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("filter.role")}>
        <input value={tt("role", user?.role ?? "Farm Owner")} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label={t("filter.farm")}>
        <input value={user?.farmName ?? ""} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label={t("settings.profile.language")}>
        <select
          value={lang}
          onChange={(event) => {
            setLanguage(event.target.value as Language);
            onDirty();
          }}
          className={settingsInputClass}
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.profile.timezone")}>
        <select defaultValue="wib" onChange={onDirty} className={settingsInputClass}>
          <option value="wib">WIB (UTC+7)</option>
          <option value="wita">WITA (UTC+8)</option>
          <option value="wit">WIT (UTC+9)</option>
        </select>
      </SettingsField>
    </SettingsSection>
  );
}
