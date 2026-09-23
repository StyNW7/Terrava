import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, ArrowRight, CircleCheck, BellRing, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface WelcomeBannerProps {
  healthyPercent: number;
  activeAlerts: number;
  devicesOnline: number;
  devicesTotal: number;
}

function greetingFor(hour: number) {
  if (hour < 11) return { key: "greeting.morning", icon: Sunrise };
  if (hour < 15) return { key: "greeting.afternoon", icon: Sun };
  if (hour < 19) return { key: "greeting.evening", icon: Sunset };
  return { key: "greeting.night", icon: Moon };
}

export default function WelcomeBanner({ healthyPercent, activeAlerts, devicesOnline, devicesTotal }: WelcomeBannerProps) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const GreetingIcon = greeting.icon;
  const firstName = (user?.name ?? t("auth.defaultRole")).replace(/^(drh\.|dr\.|ir\.)\s*/i, "").split(" ")[0];
  const dateLabel = now.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chips = [
    { icon: CircleCheck, label: t("overview.chip.healthy", { percent: healthyPercent }), tone: "text-terrava-success" },
    {
      icon: BellRing,
      label: t("overview.chip.activeAlerts", { count: activeAlerts }),
      tone: activeAlerts > 0 ? "text-terrava-warning" : "text-terrava-success",
    },
    {
      icon: Radio,
      label: t("overview.chip.devicesOnline", { online: devicesOnline, total: devicesTotal }),
      tone: "text-terrava-info",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-terrava-dark via-[#1B5F3A] to-terrava-primary p-6 text-white shadow-soft sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" aria-hidden="true" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="welcome-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#welcome-grid)" />
      </svg>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <GreetingIcon className="h-4 w-4" aria-hidden="true" />
            {dateLabel}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t(greeting.key, { name: firstName })}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            {activeAlerts > 0
              ? t("overview.summaryWithAlerts", {
                  count: activeAlerts,
                  farm: user?.farmName ?? t("overview.yourFarm"),
                })
              : t("overview.summaryNoAlerts", { farm: user?.farmName ?? t("overview.yourFarm") })}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur"
              >
                <chip.icon className={`h-3.5 w-3.5 ${chip.tone}`} aria-hidden="true" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/dashboard/alerts"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-terrava-primary transition-all hover:-translate-y-0.5 hover:bg-terrava-light"
          >
            {t("overview.reviewAlerts")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            to="/dashboard/monitoring"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            {t("overview.liveMonitoring")}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
