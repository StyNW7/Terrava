import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, Instagram, Youtube, Mail, Send, CheckCircle2 } from "lucide-react";
import { productLinks, companyLinks, resourceLinks } from "@/data/navigation";
import { images } from "@/data/images";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import { useLanguage } from "@/hooks/useLanguage";
import type { NavItem } from "@/types";

const socialLinks = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@terrava.id" },
];

function FooterColumn({ title, links }: { title: string; links: NavItem[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/70">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.labelKey}>
            <Link to={link.href} className="link-underline pb-0.5 text-sm text-white/75 hover:text-white">
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-terrava-dark text-white">
      {/* Decoration: a lit top edge, two soft glows, and a faint wordmark. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-terrava-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
      <p
        className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] select-none text-center text-[clamp(5rem,19vw,17rem)] font-extrabold leading-none tracking-tighter text-white/[0.035]"
        aria-hidden="true"
      >
        Terrava
      </p>

      <div className="container relative py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label={t("nav.backToHome")}>
              <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg object-contain" />
              <span className="text-xl font-bold text-white">Terrava</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{t("footer.tagline")}</p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-terrava-primary hover:text-white"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              {t("footer.status")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:col-span-2 sm:grid-cols-3 lg:col-span-5">
            <FooterColumn title={t("footer.product")} links={productLinks} />
            <FooterColumn title={t("footer.company")} links={companyLinks} />
            <FooterColumn title={t("footer.resources")} links={resourceLinks} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/70">{t("footer.newsletter")}</h3>
            <p className="mb-4 text-sm leading-relaxed text-white/65">{t("footer.newsletterDescription")}</p>
            <AnimatePresence mode="wait" initial={false}>
              {subscribed ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-white/90"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  {t("footer.subscribed")}
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -8 }}
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-2"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    {t("footer.emailLabel")}
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("footer.emailPlaceholder")}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 transition-colors focus:border-emerald-300/60 focus:bg-white/10 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terrava-hover"
                  >
                    {t("footer.subscribe")}
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Terrava. {t("footer.rights")}</p>
          <InstallAppButton className="w-auto px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white" />
          <p>{t("footer.madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
