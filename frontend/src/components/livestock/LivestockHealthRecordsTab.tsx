import { Stethoscope, Syringe, Pill, Scale, FileText } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";
import { useLanguage } from "@/hooks/useLanguage";

export default function LivestockHealthRecordsTab({ animal }: { animal: Livestock }) {
  const { t, tr, tRel } = useLanguage();

  const examinations = [
    { id: "exam-1", label: t("records.exam.routine"), timestamp: tRel("12 days ago"), icon: Stethoscope },
    { id: "exam-2", label: t("records.exam.bodyCondition"), timestamp: tRel("40 days ago"), icon: Stethoscope },
  ];

  const vaccinations = [
    {
      id: "vac-1",
      label: animal.vaccinationStatus === "overdue" ? t("records.vaccination.overdue") : t("records.vaccination.routine"),
      timestamp: tRel("3 months ago"),
      icon: Syringe,
    },
  ];

  const treatments = [{ id: "treat-1", label: t("records.treatment.vitamin"), timestamp: tRel("2 months ago"), icon: Pill }];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Stethoscope className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("records.examinationHistory")}
        </h3>
        <Timeline items={examinations} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Syringe className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("records.vaccinationHistory")}
        </h3>
        <Timeline items={vaccinations} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Pill className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("records.treatmentHistory")}
        </h3>
        <Timeline items={treatments} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Scale className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("records.weightHistory")}
        </h3>
        <ul className="space-y-2 text-sm text-terrava-text">
          <li className="flex justify-between">
            <span>{t("time.today")}</span>
            <span className="font-medium">{animal.weightKg} kg</span>
          </li>
          <li className="flex justify-between">
            <span>{tRel("30 days ago")}</span>
            <span className="font-medium">{Math.max(120, animal.weightKg - 12)} kg</span>
          </li>
          <li className="flex justify-between">
            <span>{tRel("60 days ago")}</span>
            <span className="font-medium">{Math.max(110, animal.weightKg - 24)} kg</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5 lg:col-span-2">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <FileText className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("alerts.notes")}
        </h3>
        <p className="text-sm text-terrava-muted">{tr(animal.notes)}</p>
      </div>
    </div>
  );
}
