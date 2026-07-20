import { Activity, ShieldCheck, Radio } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import HealthScoreRadial from "@/components/charts/HealthScoreRadial";
import { images } from "@/data/images";

const trustPoints = [
  { icon: Activity, label: "Real-time monitoring" },
  { icon: ShieldCheck, label: "AI anomaly detection" },
  { icon: Radio, label: "Long-range connectivity" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-terrava-light pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="section-fade">
            <span className="mb-6 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary shadow-sm">
              AI-Powered Smart Livestock Ecosystem
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-terrava-text sm:text-5xl lg:text-[3.25rem]">
              Rawat Lebih Awal. Kelola Lebih Cerdas. Tumbuh Lebih Berkelanjutan.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-terrava-muted sm:text-lg">
              Terrava menghubungkan smart ear tag, IoT, cloud, dan artificial intelligence untuk membantu
              peternak memantau kesehatan ternak, mendeteksi risiko lebih awal, dan mengambil keputusan
              berbasis data.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <PrimaryButton href="/contact">Request a Demo</PrimaryButton>
              <SecondaryButton href="/how-it-works">Explore How It Works</SecondaryButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-2 text-sm font-medium text-terrava-text">
                  <point.icon className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
                  {point.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative section-fade">
            <div className="overflow-hidden rounded-3xl shadow-soft">
              <img
                src={images.heroFarm}
                alt="Peternakan modern dengan sapi yang dipantau menggunakan teknologi Terrava"
                loading="lazy"
                className="h-[320px] w-full object-cover sm:h-[420px]"
              />
            </div>

            <div className="absolute -left-4 top-6 w-44 rounded-2xl border border-terrava-border bg-white p-4 shadow-soft sm:-left-10 sm:top-10 sm:w-52">
              <p className="text-xs font-medium text-terrava-muted">Livestock Health Score</p>
              <HealthScoreRadial score={92} />
            </div>

            <div className="absolute -right-2 bottom-6 w-48 rounded-2xl border border-terrava-border bg-white p-4 shadow-soft sm:-right-8 sm:bottom-10 sm:w-56">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-terrava-muted">Temperature</p>
                <span className="rounded-full bg-terrava-light px-2 py-0.5 text-[10px] font-semibold text-terrava-primary">
                  Normal
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-terrava-text">38.4°C</p>
              <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-3 text-xs text-terrava-muted">
                <span>Device connected</span>
                <span className="h-2 w-2 rounded-full bg-terrava-primary" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs font-medium text-terrava-text">No critical alerts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
