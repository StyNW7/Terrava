import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Users, UserCheck, Building2, Stethoscope, MailPlus, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ChartCard from "@/components/charts/ChartCard";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import InviteMemberModal from "@/components/team/InviteMemberModal";
import PermissionsMatrix from "@/components/team/PermissionsMatrix";
import { staff } from "@/data/mockTeam";
import { farms, getFarmById } from "@/data/mockFarms";
import { staffWorkload } from "@/data/dashboardChartData";
import { useLanguage } from "@/hooks/useLanguage";

const roleValues = ["Owner", "Farm Manager", "Operational", "Staff", "Veterinarian", "Cooperative Admin", "Viewer"];

const statusTone: Record<string, string> = {
  active: "bg-terrava-primary/10 text-terrava-primary",
  invited: "bg-terrava-info/10 text-terrava-info",
  disabled: "bg-terrava-neutral/10 text-terrava-neutral",
};

export default function TeamPage() {
  const { t, tt, tRel } = useLanguage();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    document.title = "Team and Staff | Terrava";
  }, []);

  const filtered = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch = search.trim().length === 0 || member.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === "all" || member.role === role;
      const matchesFarm = farmFilter === "all" || member.farmId === farmFilter;
      return matchesSearch && matchesRole && matchesFarm;
    });
  }, [search, role, farmFilter]);

  const activeToday = staff.filter((member) => member.status === "active").length;
  const farmManagers = staff.filter((member) => member.role === "Farm Manager").length;
  const veterinarians = staff.filter((member) => member.role === "Veterinarian").length;
  const pendingInvitations = staff.filter((member) => member.status === "invited").length;
  const roleOptions = roleValues.map((value) => ({ value, label: tt("role", value) }));

  return (
    <div>
      <PageHeader
        title={t("nav.item.team")}
        subtitle={t("team.subtitle")}
        actions={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {t("team.inviteMember")}
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard icon={Users} label={t("team.metric.totalMembers")} value={staff.length} />
        <MetricCard icon={UserCheck} label={t("team.metric.activeToday")} value={activeToday} />
        <MetricCard icon={Building2} label={t("team.metric.farmManagers")} value={farmManagers} />
        <MetricCard icon={Stethoscope} label={t("team.metric.veterinarians")} value={veterinarians} />
        <MetricCard icon={MailPlus} label={t("team.metric.pendingInvitations")} value={pendingInvitations} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t("team.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect label={t("filter.role")} value={role} onChange={setRole} options={roleOptions} />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-2xl border border-terrava-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-terrava-text">{member.name}</p>
                  <p className="text-xs text-terrava-muted">{tt("role", member.role)}</p>
                </div>
              </div>
              <RowActionsMenu
                actions={[
                  { label: t("team.action.viewProfile"), onClick: () => toast.success(t("team.toast.viewProfile", { name: member.name })) },
                  { label: t("team.action.editRole"), onClick: () => toast.success(t("team.toast.roleUpdated")) },
                  { label: t("team.action.assignFarm"), onClick: () => toast.success(t("team.toast.farmAssigned")) },
                  { label: t("team.action.disableAccess"), onClick: () => toast.success(t("team.toast.accessDisabled")), danger: true },
                  { label: t("team.action.removeMember"), onClick: () => toast.success(t("team.toast.memberRemoved")), danger: true },
                ]}
              />
            </div>
            <p className="mt-3 truncate text-xs text-terrava-muted">{member.email}</p>
            <p className="text-xs text-terrava-muted">{getFarmById(member.farmId)?.name}</p>
            <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-2.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[member.status]}`}>{t("status." + member.status)}</span>
              <span className="text-xs text-terrava-muted">{t("team.lastActive", { time: tRel(member.lastActive) })}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <ChartCard title={t("chart.staffWorkload")} description={t("chart.staffWorkloadDesc")}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffWorkload} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="tasks" name={t("chart.tasks")} fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
              <Bar dataKey="alerts" name={t("chart.alertsAssigned")} fill="var(--chart-soft-2)" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">{t("team.permissionsMatrix")}</h2>
      <PermissionsMatrix />

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
