import type { LucideIcon } from "lucide-react";

export interface AuthBenefit {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface AuthTestimonialData {
  quote: string;
  name: string;
  role: string;
}

export interface AuthPanelCopy {
  heading: string;
  description: string;
  benefits: AuthBenefit[];
  testimonial?: AuthTestimonialData;
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
