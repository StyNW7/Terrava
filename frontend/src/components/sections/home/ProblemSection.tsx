import { Clock, HandMetal, ClipboardX, TrendingDown } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const problems = [
  { icon: Clock, key: "lateDetection" },
  { icon: HandMetal, key: "manualMonitoring" },
  { icon: ClipboardX, key: "inconsistentRecords" },
  { icon: TrendingDown, key: "slowResponse" },
];

export default function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading title={t("home.problem.title")} />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {problems.map((problem) => (
              <StaggerItem
                key={problem.key}
                className="card-hover rounded-2xl border border-terrava-border bg-white p-6 shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                  <problem.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-terrava-text">{t("home.problem." + problem.key + ".title")}</h3>
                <p className="text-sm leading-relaxed text-terrava-muted">{t("home.problem." + problem.key + ".description")}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal direction="left" className="order-first lg:order-last">
            <ImageWithOverlay
              src="/Images/meriksa-sapi.jpg"
              alt={t("home.problem.imageAlt")}
              className="aspect-[4/3]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
