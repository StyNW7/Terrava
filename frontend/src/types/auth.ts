import type { LucideIcon } from "lucide-react";
import type { Localized } from "@/i18n/types";

export interface AuthBenefit {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface AuthTestimonialData {
  quote: Localized;
  name: string;
  role: Localized;
}

export interface AuthPanelCopy {
  heading: Localized;
  description: Localized;
  benefits: AuthBenefit[];
  testimonial?: AuthTestimonialData;
}

/** A `<select>`/radio choice whose label is translated at render time. */
export interface LocalizedOption {
  value: string;
  label: Localized;
}

export type AuthPanelVariant = "login" | "register" | "forgot" | "reset";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  farmName: string;
  initials: string;
}

export interface AuthSession {
  user: AuthUser;
  loggedInAt: string;
  rememberMe: boolean;
}
