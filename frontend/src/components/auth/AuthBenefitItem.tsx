import type { AuthBenefit } from "@/types/auth";
import { useLanguage } from "@/hooks/useLanguage";

export default function AuthBenefitItem({ benefit }: { benefit: AuthBenefit }) {
  const { tr } = useLanguage();
  const Icon = benefit.icon;

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{benefit.title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-white/75">{tr(benefit.description)}</p>
      </div>
    </div>
  );
}
