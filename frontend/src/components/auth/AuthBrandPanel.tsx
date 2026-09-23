import { HeartPulse, Thermometer, Radio, BellRing } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { AuthBenefit, AuthTestimonialData } from "@/types/auth";
import type { Localized } from "@/i18n/types";
import AuthBenefitItem from "@/components/auth/AuthBenefitItem";
import AuthTestimonial from "@/components/auth/AuthTestimonial";
import RotatingMessage from "@/components/auth/RotatingMessage";
import { trustRowItems } from "@/data/auth";
import { images } from "@/data/images";
import { useLanguage } from "@/hooks/useLanguage";

interface AuthBrandPanelProps {
  heading: Localized;
  description: Localized;
  benefits: AuthBenefit[];
  testimonial?: AuthTestimonialData;
}

const floatingCards = [
  { icon: HeartPulse, key: "healthScore", value: "92 / 100", tone: "text-terrava-success" },
  { icon: Thermometer, key: "temperature", value: "38.4°C", tone: "text-terrava-primary" },
  { icon: Radio, key: "deviceStatus", valueKey: "connected", tone: "text-terrava-info" },
  { icon: BellRing, key: "activeAlerts", valueKey: "needAttention", tone: "text-terrava-warning" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function AuthBrandPanel({ heading, description, benefits, testimonial }: AuthBrandPanelProps) {
  const { t, tr } = useLanguage();

  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-terrava-dark to-terrava-primary lg:flex lg:flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${images.cattleHerd})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102B1D] via-terrava-dark/80 to-terrava-primary/70" aria-hidden="true" />

      {/* Ambient light blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-terrava-primary/30 blur-3xl animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl animate-float-slow [animation-delay:2s]" aria-hidden="true" />

      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
        <defs>
          <pattern id="auth-node-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-node-grid)" />
      </svg>

      <motion.div
        className="relative flex h-full flex-col justify-between px-12 py-12 xl:px-16"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item}>
          <Link to="/" className="flex items-center gap-2.5">
            <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-xl font-bold text-white">Terrava</span>
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
            AI-Powered Smart Livestock Ecosystem
          </p>
        </motion.div>

        <div className="max-w-md">
          <motion.h1 variants={item} className="text-3xl font-bold leading-tight text-white xl:text-[2.15rem]">
            {tr(heading)}
          </motion.h1>
          <motion.p variants={item} className="mt-4 text-sm leading-relaxed text-white/80">
            {tr(description)}
          </motion.p>

          <motion.div variants={item} className="mt-5">
            <RotatingMessage />
          </motion.div>

          <div className="mt-8 space-y-5">
            {benefits.map((benefit) => (
              <motion.div key={benefit.id} variants={item}>
                <AuthBenefitItem benefit={benefit} />
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="relative mt-10 hidden xl:block">
            <div className="grid grid-cols-2 gap-3">
              {floatingCards.map((card, index) => (
                <motion.div
                  key={card.key}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + index * 0.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                  className="rounded-2xl border border-white/15 bg-white/95 p-4 shadow-soft backdrop-blur"
                >
                  <card.icon className={`mb-2 h-4 w-4 ${card.tone}`} aria-hidden="true" />
                  <p className="text-[11px] font-medium text-terrava-muted">{t("auth.card." + card.key)}</p>
                  <p className="text-sm font-bold text-terrava-text">
                    {card.value ?? t("auth.cardValue." + card.valueKey)}
                  </p>
                  <p className="text-[10px] text-terrava-muted">{t("auth.cardMeta." + card.key)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {testimonial && (
            <motion.div variants={item} className="mt-8">
              <AuthTestimonial testimonial={testimonial} />
            </motion.div>
          )}
        </div>

        <motion.div variants={item}>
          <p className="text-xs text-white/70">{t("auth.panelFooter")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {trustRowItems.map((trust) => (
              <div key={trust.label.en} className="flex items-center gap-1.5 text-xs text-white/60">
                <trust.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tr(trust.label)}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
