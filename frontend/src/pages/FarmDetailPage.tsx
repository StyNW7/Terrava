import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PawPrint, Warehouse, HeartPulse, TriangleAlert, Radio, Users, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Tabs from "@/components/dashboard/Tabs";
import ErrorState from "@/components/dashboard/ErrorState";
import FarmOverviewTab from "@/components/farms/FarmOverviewTab";
import FarmBarnsTab from "@/components/farms/FarmBarnsTab";
import FarmLivestockTab from "@/components/farms/FarmLivestockTab";
import FarmEnvironmentTab from "@/components/farms/FarmEnvironmentTab";
import FarmDevicesTab from "@/components/farms/FarmDevicesTab";
import FarmTeamTab from "@/components/farms/FarmTeamTab";
import FarmActivityTab from "@/components/farms/FarmActivityTab";
import { getFarmById } from "@/data/mockFarms";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "barns", label: "Barns" },
  { value: "livestock", label: "Livestock" },
  { value: "environment", label: "Environment" },
  { value: "devices", label: "Devices" },
  { value: "team", label: "Team" },
  { value: "activity", label: "Activity" },
];

export default function FarmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const farm = id ? getFarmById(id) : undefined;

  useEffect(() => {
    document.title = farm ? `${farm.name} | Terrava` : "Farm Detail | Terrava";
  }, [farm]);

  if (!farm) {
    return <ErrorState title="Farm tidak ditemukan" onRetry={() => navigate("/dashboard/farms")} />;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Farms and Barns", href: "/dashboard/farms" }, { label: farm.name }]} />

      <div className="mt-3 mb-6 overflow-hidden rounded-2xl border border-terrava-border bg-white">
        <img src={farm.image} alt={farm.name} className="h-40 w-full object-cover sm:h-56" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-terrava-text">{farm.name}</h1>
            <p className="text-sm text-terrava-muted">{farm.location} &middot; Manager: {farm.manager}</p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => toast.success("Form edit farm dibuka.")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
              Edit
            </button>
            <button onClick={() => toast.success("Barn baru berhasil ditambahkan.")} className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Barn
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={PawPrint} label="Total Livestock" value={farm.livestockCount} />
        <SummaryCard icon={Warehouse} label="Barns" value={farm.barnCount} />
        <SummaryCard icon={HeartPulse} label="Avg Health Score" value={farm.healthScore} />
        <SummaryCard icon={TriangleAlert} label="Active Alerts" value={farm.activeAlerts} />
        <SummaryCard icon={Radio} label="Device Coverage" value={`${farm.deviceCoverage}%`} />
        <SummaryCard icon={Users} label="Staff" value={farm.staffCount} />
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <FarmOverviewTab farm={farm} />}
      {activeTab === "barns" && <FarmBarnsTab farm={farm} />}
      {activeTab === "livestock" && <FarmLivestockTab farm={farm} />}
      {activeTab === "environment" && <FarmEnvironmentTab />}
      {activeTab === "devices" && <FarmDevicesTab farm={farm} />}
      {activeTab === "team" && <FarmTeamTab farm={farm} />}
      {activeTab === "activity" && <FarmActivityTab />}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof PawPrint; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-4">
      <Icon className="mb-2 h-4 w-4 text-terrava-primary" aria-hidden="true" />
      <p className="text-xs text-terrava-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-terrava-text">{value}</p>
    </div>
  );
}
