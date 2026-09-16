import { Clock, HandMetal, ClipboardX, TrendingDown } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

const problems = [
  {
    icon: Clock,
    title: "Gejala penyakit sering terlambat terdeteksi",
    description: "Perubahan kondisi ternak baru diketahui setelah gejala terlihat jelas secara fisik.",
  },
  {
    icon: HandMetal,
    title: "Monitoring manual memakan waktu dan tenaga",
    description: "Pemeriksaan satu per satu ternak membutuhkan waktu yang panjang dan tenaga besar.",
  },
  {
    icon: ClipboardX,
    title: "Data kesehatan ternak tidak tercatat konsisten",
    description: "Catatan kesehatan sering tersebar dan tidak terdokumentasi secara rapi.",
  },
  {
    icon: TrendingDown,
    title: "Risiko kerugian meningkat karena respons yang lambat",
    description: "Keterlambatan penanganan berdampak pada produktivitas dan kerugian ekonomi peternak.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading title="Peternakan tidak seharusnya bergantung pada keterlambatan dan perkiraan." />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {problems.map((problem) => (
              <StaggerItem
                key={problem.title}
                className="card-hover rounded-2xl border border-terrava-border bg-white p-6 shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                  <problem.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-terrava-text">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-terrava-muted">{problem.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal direction="left" className="order-first lg:order-last">
            <ImageWithOverlay
              src="/Images/meriksa-sapi.jpg"
              alt="Peternak memeriksa kondisi sapi secara manual"
              className="aspect-[4/3]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
