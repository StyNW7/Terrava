import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const scenario = [
  "Sapi mengalami peningkatan suhu dan penurunan aktivitas",
  "Sensor mengirimkan data ke cloud melalui gateway",
  "AI mendeteksi pola abnormal dibandingkan baseline",
  "Peternak menerima alert melalui dashboard dan notifikasi",
  "Terrava memberikan rekomendasi tindakan awal",
  "Peternak mencatat tindak lanjut yang dilakukan",
  "Data tersimpan sebagai riwayat kesehatan ternak",
];

export default function FarmerJourneySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Farmer Journey"
          title="Contoh skenario penggunaan sehari-hari"
          description="Ilustrasi bagaimana Terrava membantu peternak merespons perubahan kondisi ternak."
        />

        <div className="mx-auto mt-14 max-w-2xl">
          <ol className="space-y-4">
            {scenario.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl border border-terrava-border bg-white p-4 shadow-card">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terrava-light text-xs font-bold text-terrava-primary">
                  {index + 1}
                </span>
                <p className="text-sm text-terrava-text">{step}</p>
                <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
