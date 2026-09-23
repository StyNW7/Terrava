import type { LucideIcon } from "lucide-react";
import type { Localized, LocalizedList } from "@/i18n/types";

/**
 * Content types for the public site.
 *
 * Prose fields are typed as `Localized` and resolved at render time with the
 * `tr()` helper from `useLanguage()`. Fields that read identically in both
 * locales (brand names, product terms, place names, spec values) stay plain
 * strings.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
  href?: string;
}

export interface SolutionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  problem: Localized;
  solution: Localized;
  capabilities: LocalizedList;
  benefit: Localized;
  image: string;
}

export interface StatisticItem {
  id: string;
  icon: LucideIcon;
  value: string;
  suffix?: Localized;
  label: Localized;
  qualifier?: Localized;
}

export interface TestimonialItem {
  id: string;
  quote: Localized;
  name: string;
  role: Localized;
  location: string;
  image: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
}

export interface TimelineEntry {
  id: string;
  year: Localized;
  title: string;
  description: Localized;
}

export interface SdgItem {
  id: string;
  number: number;
  title: string;
  description: Localized;
  color: string;
}

export interface FaqItem {
  id: string;
  question: Localized;
  answer: Localized;
}

export interface ContactOption {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface ValueItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface RecognitionItem {
  id: string;
  year: string;
  title: Localized;
  description: Localized;
}

export interface ProcessStep {
  id: string;
  number: number;
  icon: LucideIcon;
  title: string;
  description: Localized;
  image: string;
}

export interface UserRole {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface PersonaItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
  image: string;
}

export interface SensorItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface AnatomyCallout {
  id: string;
  label: string;
  description: Localized;
  top: string;
  left: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface ImpactPillar {
  id: string;
  icon: LucideIcon;
  title: string;
  description: Localized;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  inquiryType: string;
  farmLocation: string;
  livestockCount: string;
  message: string;
  preferredContact: string;
  consent: boolean;
}

export interface ContactFormErrors {
  [key: string]: string | undefined;
}
