import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

export interface SolutionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
  capabilities: string[];
  benefit: string;
  image: string;
}

export interface StatisticItem {
  id: string;
  icon: LucideIcon;
  value: string;
  suffix?: string;
  label: string;
  qualifier?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
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
  year: string;
  title: string;
  description: string;
}

export interface SdgItem {
  id: string;
  number: number;
  title: string;
  description: string;
  color: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactOption {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ValueItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface RecognitionItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  id: string;
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

export interface UserRole {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PersonaItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

export interface SensorItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface AnatomyCallout {
  id: string;
  label: string;
  description: string;
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
  description: string;
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
