import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Activity, ShieldCheck, Radio, Play, HeartPulse, Wifi } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import HealthScoreRadial from "@/components/charts/HealthScoreRadial";
import { images } from "@/data/images";

const trustPoints = [
  { icon: Activity, label: "Real-time monitoring" },
  { icon: ShieldCheck, label: "AI anomaly detection" },
  { icon: Radio, label: "Long-range connectivity" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const floatCard = (delay: number) => ({
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-terrava-light pb-20 pt-16 sm:pb-28 sm:pt-24">
      {/* Ambient decoration */}
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-terrava-primary/10 blur-3xl animate-float-slow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-white/70 blur-3xl animate-float-slow [animation-delay:3s]" aria-hidden="true" />

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
              AI-Powered Smart Livestock Ecosystem
            </motion.span>
            <motion.h1
              variants={item}
              className="text-4xl font-bold leading-[1.1] tracking-tight text-terrava-text sm:text-5xl lg:text-[3.35rem]"
            >
              Rawat Lebih Awal. <span className="text-gradient">Kelola Lebih Cerdas.</span> Tumbuh Lebih Berkelanjutan.
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-terrava-muted sm:text-lg">
              Terrava menghubungkan smart ear tag, IoT, cloud, dan artificial intelligence untuk membantu peternak
              memantau kesehatan ternak, mendeteksi risiko lebih awal, dan mengambil keputusan berbasis data.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton href="/login" className="shadow-glow">
                Coba Dashboard Demo
              </PrimaryButton>
              <SecondaryButton href="/how-it-works">
                <Play className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
                Lihat Cara Kerja
              </SecondaryButton>
            </motion.div>
            <motion.div variants={item} className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-2 text-sm font-medium text-terrava-text">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-terrava-primary shadow-sm">
                    <point.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {point.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5"
            >
              <img
                src={images.heroFarm}
                alt="Peternakan modern dengan sapi yang dipantau menggunakan teknologi Terrava"
                className="h-[320px] w-full object-cover sm:h-[440px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-terrava-dark/50 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Wifi className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">128 ear tag terhubung</p>
                    <p className="text-[10px] text-white/70">Gateway LoRa · sinyal kuat</p>
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
              className="absolute -left-4 top-6 w-44 rounded-2xl border border-terrava-border bg-white/95 p-4 shadow-lift backdrop-blur sm:-left-10 sm:top-10 sm:w-52"
            >
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <p className="flex items-center gap-1.5 text-xs font-medium text-terrava-muted">
                  <HeartPulse className="h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
                  Livestock Health Score
                </p>
                <HealthScoreRadial score={92} />
              </motion.div>
            </motion.div>

            <motion.div
              {...floatCard(0.75)}
              className="absolute -right-2 bottom-20 w-48 rounded-2xl border border-terrava-border bg-white/95 p-4 shadow-lift backdrop-blur sm:-right-8 sm:bottom-24 sm:w-56"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-terrava-muted">Temperature</p>
                  <span className="rounded-full bg-terrava-light px-2 py-0.5 text-[10px] font-semibold text-terrava-primary">Normal</span>
                </div>
                <p className="mt-2 text-lg font-bold text-terrava-text">38.4°C</p>
                <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-3 text-xs text-terrava-muted">
                  <span>Device connected</span>
                  <span className="h-2 w-2 rounded-full bg-terrava-success animate-pulse-dot" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs font-medium text-terrava-text">No critical alerts</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
