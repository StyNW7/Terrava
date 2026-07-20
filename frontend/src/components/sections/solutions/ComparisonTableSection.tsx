import { CheckCircle2, CircleAlert } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const rows = [
  {
    aspect: "Monitoring",
    traditional: "Manual, berkala",
    terrava: "Real-time, berkelanjutan",
  },
  {
    aspect: "Detection",
    traditional: "Bergantung pada observasi visual",
    terrava: "Dibantu deteksi anomali berbasis AI",
  },
  {
    aspect: "Data History",
    traditional: "Sering tidak konsisten",
    terrava: "Tersimpan otomatis dan terpusat",
  },
  {
    aspect: "Accessibility",
    traditional: "Terbatas di lokasi kandang",
    terrava: "Dapat diakses dari web dan mobile",
  },
  {
    aspect: "Alert",
    traditional: "Tidak ada notifikasi otomatis",
    terrava: "Notifikasi real-time dan terkategori",
  },
  {
    aspect: "Scalability",
    traditional: "Sulit untuk banyak ternak",
    terrava: "Mendukung multi-kandang dan multi-farm",
  },
  {
    aspect: "Decision Support",
    traditional: "Berdasarkan perkiraan",
    terrava: "Didukung insight dan rekomendasi data",
  },
];

export default function ComparisonTableSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="Comparison" title="Traditional Monitoring vs Terrava" />

        <div className="mt-14 overflow-x-auto rounded-2xl border border-terrava-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-terrava-bg">
                <th className="px-6 py-4 font-semibold text-terrava-text">Aspek</th>
                <th className="px-6 py-4 font-semibold text-terrava-muted">Traditional Monitoring</th>
                <th className="px-6 py-4 font-semibold text-terrava-primary">Terrava</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.aspect} className="border-t border-terrava-border">
                  <td className="px-6 py-4 font-medium text-terrava-text">{row.aspect}</td>
                  <td className="px-6 py-4 text-terrava-muted">
                    <span className="flex items-start gap-2">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-terrava-warning" aria-hidden="true" />
                      {row.traditional}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-terrava-text">
                    <span className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                      {row.terrava}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
