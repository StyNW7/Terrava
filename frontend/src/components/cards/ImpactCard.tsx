import type { ImpactPillar } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function ImpactCard({ pillar }: { pillar: ImpactPillar }) {
  const { tr } = useLanguage();
  const Icon = pillar.icon;

  return (
    <div className="card-hover group flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-primary text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-terrava-text">{pillar.title}</h3>
      <p className="text-sm leading-relaxed text-terrava-muted">{tr(pillar.description)}</p>
    </div>
  );
}
