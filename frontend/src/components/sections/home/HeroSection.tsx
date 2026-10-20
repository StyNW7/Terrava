import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import type { Variants } from "framer-motion";
import { Activity, ShieldCheck, Radio, Play, HeartPulse, Wifi } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import HealthScoreRadial from "@/components/charts/HealthScoreRadial";
import { images } from "@/data/images";
import { useLanguage } from "@/hooks/useLanguage";

const trustPoints = [
  { icon: Activity, key: "home.hero.trust.monitoring" },
  { icon: ShieldCheck, key: "home.hero.trust.anomaly" },
  { icon: Radio, key: "home.hero.trust.connectivity" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Position (x/y) is left to the pointer parallax, so the entrance only fades and scales.
const floatCard = (delay: number) => ({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function HeroSection() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  // Pointer position across the section, -0.5..0.5, smoothed by a spring.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 90, damping: 18 });
  const tiltX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const driftX = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const driftY = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const counterX = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const counterY = useTransform(springY, [-0.5, 0.5], [8, -8]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative overflow-hidden bg-terrava-light pb-20 pt-16 sm:pb-28 sm:pt-24"
    >
      {/* Ambient decoration: grid, drifting aurora glows, and a soft floor fade. */}
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-terrava-primary/15 blur-3xl animate-aurora" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-aurora [animation-delay:-7s] dark:bg-emerald-400/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-white/70 blur-3xl animate-aurora [animation-delay:-12s] dark:bg-terrava-primary/15" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-terrava-bg/60" aria-hidden="true" />

      <div className="container relative">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div variants={container} initial="hidden" animate="visible">
            <motion.span
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terrava-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terrava-primary" />
              </span>
              {t("home.hero.badge")}
            </motion.span>
            <motion.h1
              variants={item}
              className="text-4xl font-bold leading-[1.1] tracking-tight text-terrava-text sm:text-5xl lg:text-[3.35rem]"
            >
              {t("home.hero.titleLead")} <span className="text-gradient">{t("home.hero.titleAccent")}</span>{" "}
              {t("home.hero.titleTail")}
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-terrava-muted sm:text-lg">
              {t("home.hero.description")}
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton href="/login" className="shadow-glow">
                {t("home.hero.primaryCta")}
              </PrimaryButton>
              <SecondaryButton href="/how-it-works">
                <Play className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
                {t("home.hero.secondaryCta")}
              </SecondaryButton>
            </motion.div>
            <motion.div variants={item} className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustPoints.map((point) => (
                <div key={point.key} className="flex items-center gap-2 text-sm font-medium text-terrava-text">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-terrava-primary shadow-sm">
                    <point.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {t(point.key)}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="relative [perspective:1200px]">
            {/* Slowly turning conic glow behind the photo. */}
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-50 blur-2xl dark:opacity-40" aria-hidden="true">
              <div className="h-full w-full animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,rgb(var(--t-primary)/0.55),rgb(110_231_183/0.4),rgb(var(--t-light)/0.1),rgb(var(--t-primary)/0.55))]" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
              className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5 dark:ring-white/10"
            >
              <img
                src={images.heroFarm}
                alt={t("home.hero.imageAlt")}
                className="h-[320px] w-full object-cover sm:h-[440px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-terrava-dark/50 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Wifi className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{t("home.hero.tagsConnected", { count: 128 })}</p>
                    <p className="text-[10px] text-white/70">{t("home.hero.gatewayStatus")}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-terrava-success/90 px-2.5 py-1 text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
                  LIVE
                </span>
              </div>
            </motion.div>

            <motion.div
              {...floatCard(0.55)}
              style={{ x: driftX, y: driftY }}
              className="absolute -left-4 top-6 w-44 rounded-2xl border border-terrava-border bg-white/95 p-4 shadow-lift backdrop-blur sm:-left-10 sm:top-10 sm:w-52"
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <p className="flex items-center gap-1.5 text-xs font-medium text-terrava-muted">
                  <HeartPulse className="h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
                  {t("home.hero.healthScore")}
                </p>
                <HealthScoreRadial score={92} />
              </motion.div>
            </motion.div>

            <motion.div
              {...floatCard(0.75)}
              style={{ x: counterX, y: counterY }}
              className="absolute -right-2 bottom-20 w-48 rounded-2xl border border-terrava-border bg-white/95 p-4 shadow-lift backdrop-blur sm:-right-8 sm:bottom-24 sm:w-56"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-terrava-muted">{t("home.hero.temperature")}</p>
                  <span className="rounded-full bg-terrava-light px-2 py-0.5 text-[10px] font-semibold text-terrava-primary">{t("home.hero.normal")}</span>
                </div>
                <p className="mt-2 text-lg font-bold text-terrava-text">38.4°C</p>
                <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-3 text-xs text-terrava-muted">
                  <span>{t("home.hero.deviceConnected")}</span>
                  <span className="h-2 w-2 rounded-full bg-terrava-success animate-pulse-dot" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs font-medium text-terrava-text">{t("home.hero.noCriticalAlerts")}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
