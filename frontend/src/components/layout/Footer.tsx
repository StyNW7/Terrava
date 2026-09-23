import { useState } from "react";
import { Link } from "react-router-dom";
import { Linkedin, Instagram, Youtube, Mail, Send } from "lucide-react";
import { productLinks, companyLinks, resourceLinks } from "@/data/navigation";
import { images } from "@/data/images";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import { useLanguage } from "@/hooks/useLanguage";

const socialLinks = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@terrava.id" },
];

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
    <footer className="bg-terrava-dark text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5" aria-label={t("nav.backToHome")}>
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-200 hover:bg-terrava-primary"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">{t("footer.product")}</h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">{t("footer.company")}</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">{t("footer.resources")}</h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">{t("footer.newsletter")}</h3>
            {subscribed ? (
              <p className="text-sm text-white/80">{t("footer.subscribed")}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
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
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-terrava-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terrava-hover"
                >
                  {t("footer.subscribe")}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Terrava. {t("footer.rights")}</p>
          <div className="flex items-center gap-5">
            <InstallAppButton className="w-auto px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white" />
          </div>
          <p>{t("footer.madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
