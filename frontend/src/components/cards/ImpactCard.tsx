import type { ImpactPillar } from "@/types";

export default function ImpactCard({ pillar }: { pillar: ImpactPillar }) {
  const Icon = pillar.icon;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-primary text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-terrava-text">{pillar.title}</h3>
      <p className="text-sm leading-relaxed text-terrava-muted">{pillar.description}</p>
    </div>
  );
}
