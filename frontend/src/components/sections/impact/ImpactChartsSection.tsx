import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import ResponseTimeChart from "@/components/charts/ResponseTimeChart";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import AlertCategoryBarChart from "@/components/charts/AlertCategoryBarChart";
import UptimeChart from "@/components/charts/UptimeChart";
import HealthStatusPieChart from "@/components/charts/HealthStatusPieChart";

export default function ImpactChartsSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Illustrative Projection"
          title="Gambaran dampak dalam skenario prototype"
          description="Visualisasi berikut merupakan proyeksi ilustratif berdasarkan skenario prototype dan belum merupakan hasil tervalidasi di lapangan."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Monitoring Response Time" description="Prototype scenario: manual vs assisted monitoring">
            <ResponseTimeChart />
          </ChartCard>
          <ChartCard title="Manual vs Assisted Monitoring" description="Target impact perbandingan efisiensi monitoring">
            <ComparisonBarChart />
          </ChartCard>
          <ChartCard title="Alert Category Distribution" description="Illustrative projection kategori alert ternak">
            <AlertCategoryBarChart />
          </ChartCard>
          <ChartCard title="Device Uptime" description="Target capability uptime perangkat mingguan">
            <UptimeChart />
          </ChartCard>
          <ChartCard title="Health Status Distribution" description="Prototype scenario distribusi status kesehatan ternak">
            <HealthStatusPieChart />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
