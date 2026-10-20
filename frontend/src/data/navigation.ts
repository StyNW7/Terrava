import type { NavItem } from "@/types";

export const mainNavItems: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.solutions", href: "/solutions" },
  { labelKey: "nav.earTag", href: "/smart-ear-tag" },
  { labelKey: "nav.howItWorks", href: "/how-it-works" },
  { labelKey: "nav.impact", href: "/impact" },
  { labelKey: "nav.contact", href: "/contact" },
];

// Footer links only point at pages that exist in this prototype.
export const productLinks: NavItem[] = [
  { labelKey: "nav.solutions", href: "/solutions" },
  { labelKey: "nav.earTag", href: "/smart-ear-tag" },
  { labelKey: "nav.howItWorks", href: "/how-it-works" },
  { labelKey: "footer.link.demoDashboard", href: "/login" },
];

export const companyLinks: NavItem[] = [
  { labelKey: "footer.link.aboutTeam", href: "/about" },
  { labelKey: "footer.link.impactSdg", href: "/impact" },
  { labelKey: "footer.link.partnership", href: "/contact" },
  { labelKey: "nav.contact", href: "/contact" },
];

export const resourceLinks: NavItem[] = [
  { labelKey: "footer.link.createAccount", href: "/register" },
  { labelKey: "footer.link.signIn", href: "/login" },
  { labelKey: "footer.link.faq", href: "/contact" },
];
