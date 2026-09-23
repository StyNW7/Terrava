import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import ResponseTimeChart from "@/components/charts/ResponseTimeChart";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import AlertCategoryBarChart from "@/components/charts/AlertCategoryBarChart";
import UptimeChart from "@/components/charts/UptimeChart";
import HealthStatusPieChart from "@/components/charts/HealthStatusPieChart";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function ImpactChartsSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("impact.charts.badge")}
          title={t("impact.charts.title")}
          description={t("impact.charts.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title={t("impact.charts.responseTime")} description={t("impact.charts.responseTimeDesc")}>
            <ResponseTimeChart />
          </ChartCard>
          <ChartCard title={t("impact.charts.comparison")} description={t("impact.charts.comparisonDesc")}>
            <ComparisonBarChart />
          </ChartCard>
          <ChartCard title={t("impact.charts.alertCategory")} description={t("impact.charts.alertCategoryDesc")}>
            <AlertCategoryBarChart />
          </ChartCard>
          <ChartCard title={t("impact.charts.uptime")} description={t("impact.charts.uptimeDesc")}>
            <UptimeChart />
          </ChartCard>
          <ChartCard title={t("impact.charts.healthStatus")} description={t("impact.charts.healthStatusDesc")}>
            <HealthStatusPieChart />
          </ChartCard>
        </StaggerGrid>
      </div>
    </section>
  );
}
