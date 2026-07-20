import { Stethoscope, Syringe, Pill, Scale, FileText } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";

export default function LivestockHealthRecordsTab({ animal }: { animal: Livestock }) {
  const examinations = [
    { id: "exam-1", label: "Pemeriksaan rutin oleh drh. Andi Wirawan", timestamp: "12 hari lalu", icon: Stethoscope },
    { id: "exam-2", label: "Pemeriksaan kondisi tubuh", timestamp: "40 hari lalu", icon: Stethoscope },
  ];

  const vaccinations = [
    { id: "vac-1", label: `Vaksinasi ${animal.vaccinationStatus === "overdue" ? "tertunda" : "rutin"}`, timestamp: "3 bulan lalu", icon: Syringe },
  ];

  const treatments = [
    { id: "treat-1", label: "Pemberian suplemen vitamin", timestamp: "2 bulan lalu", icon: Pill },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Stethoscope className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Examination History
        </h3>
        <Timeline items={examinations} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Syringe className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Vaccination History
        </h3>
        <Timeline items={vaccinations} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Pill className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Treatment History
        </h3>
        <Timeline items={treatments} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <Scale className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Weight History
        </h3>
        <ul className="space-y-2 text-sm text-terrava-text">
          <li className="flex justify-between"><span>Hari ini</span><span className="font-medium">{animal.weightKg} kg</span></li>
          <li className="flex justify-between"><span>30 hari lalu</span><span className="font-medium">{Math.max(120, animal.weightKg - 12)} kg</span></li>
          <li className="flex justify-between"><span>60 hari lalu</span><span className="font-medium">{Math.max(110, animal.weightKg - 24)} kg</span></li>
        </ul>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5 lg:col-span-2">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
          <FileText className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Notes
        </h3>
        <p className="text-sm text-terrava-muted">{animal.notes}</p>
      </div>
    </div>
  );
}
