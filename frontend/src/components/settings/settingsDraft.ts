import type { AppSettings } from "@/context/settings-context";

/** Everything the Settings page edits before "Save": app preferences plus the account name/email. */
export interface SettingsDraft extends AppSettings {
  account: { name: string; email: string };
}

export type UpdateDraft = <K extends keyof SettingsDraft>(section: K, patch: Partial<SettingsDraft[K]>) => void;

export interface SettingsTabProps {
  draft: SettingsDraft;
  update: UpdateDraft;
}
