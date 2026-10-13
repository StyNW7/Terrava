import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Users, UserCheck, Building2, Stethoscope, MailPlus, UserPlus, Mail } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ChartCard from "@/components/charts/ChartCard";
import RowActionsMenu, { type RowAction } from "@/components/dashboard/RowActionsMenu";
import Modal from "@/components/dashboard/Modal";
import Drawer from "@/components/dashboard/Drawer";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import InviteMemberModal from "@/components/team/InviteMemberModal";
import PermissionsMatrix from "@/components/team/PermissionsMatrix";
import type { StaffMember, StaffRole } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useAuth } from "@/hooks/useAuth";

const roleValues: StaffRole[] = ["Owner", "Farm Manager", "Operational", "Staff", "Veterinarian", "Cooperative Admin", "Viewer"];

const statusTone: Record<string, string> = {
  active: "bg-terrava-primary/10 text-terrava-primary",
  invited: "bg-terrava-info/10 text-terrava-info",
  disabled: "bg-terrava-neutral/10 text-terrava-neutral",
};

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

type EditMode = { member: StaffMember; field: "role" | "farm" } | null;
type ConfirmMode = { member: StaffMember; action: "disable" | "remove" } | null;

export default function TeamPage() {
  const { staff, farms, alerts, tasks, getFarmById, updateStaff, removeStaff } = useDataStore();
  const { user } = useAuth();
  const { t, tt, tRel } = useLanguage();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profile, setProfile] = useState<StaffMember | null>(null);
  const [editing, setEditing] = useState<EditMode>(null);
  const [editValue, setEditValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmMode>(null);

  useEffect(() => {
    document.title = "Team and Staff | Terrava";
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesSearch = query.length === 0 || member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query);
      const matchesRole = role === "all" || member.role === role;
      const matchesFarm = farmFilter === "all" || member.farmId === farmFilter;
      return matchesSearch && matchesRole && matchesFarm;
    });
  }, [staff, search, role, farmFilter]);

  // Workload is computed from what is actually assigned right now.
  const workload = (member: StaffMember) => ({
    openAlerts: alerts.filter((alert) => alert.assignedTo === member.name && alert.status !== "resolved").length,
    openTasks: tasks.filter((task) => task.assignee === member.name && !task.done).length,
  });
  const workloadChart = staff
    .filter((member) => member.status === "active")
    .map((member) => ({ name: member.name.split(" ")[0], ...workload(member) }))
    .filter((row) => row.openAlerts + row.openTasks > 0);

  const activeToday = staff.filter((member) => member.status === "active").length;
  const farmManagers = staff.filter((member) => member.role === "Farm Manager").length;
  const veterinarians = staff.filter((member) => member.role === "Veterinarian").length;
  const pendingInvitations = staff.filter((member) => member.status === "invited").length;
  const roleLabel = (member: StaffMember) => (member.title ? `${member.title} · ${tt("role", member.role)}` : tt("role", member.role));
  const roleOptions = roleValues.map((value) => ({ value, label: tt("role", value) }));

  const isSelf = (member: StaffMember) => member.email.toLowerCase() === user?.email.toLowerCase() || member.name === user?.name;
  const owners = staff.filter((member) => member.role === "Owner" && member.status === "active");
  const isLastOwner = (member: StaffMember) => member.role === "Owner" && owners.length <= 1;

  const openEdit = (member: StaffMember, field: "role" | "farm") => {
    setEditValue(field === "role" ? member.role : member.farmId);
    setEditing({ member, field });
  };

  const saveEdit = () => {
    if (!editing) return;
    if (editing.field === "role") {
      if (isLastOwner(editing.member) && editValue !== "Owner") {
        toast.error(t("team.error.lastOwner"));
        return;
      }
      updateStaff(editing.member.id, { role: editValue as StaffRole });
      toast.success(t("team.toast.roleChanged", { name: editing.member.name, role: tt("role", editValue) }));
    } else {
      updateStaff(editing.member.id, { farmId: editValue });
      toast.success(t("team.toast.farmChanged", { name: editing.member.name, farm: getFarmById(editValue)?.name ?? "" }));
    }
    setEditing(null);
  };

  const memberActions = (member: StaffMember): RowAction[] => {
    const actions: RowAction[] = [
      { label: t("team.action.viewProfile"), onClick: () => setProfile(member) },
      { label: t("team.action.editRole"), onClick: () => openEdit(member, "role") },
      { label: t("team.action.assignFarm"), onClick: () => openEdit(member, "farm") },
    ];
    if (member.status === "invited") {
      actions.push({ label: t("team.action.resendInvite"), onClick: () => toast.success(t("team.toast.invitationSent", { email: member.email })) });
    }
    if (!isSelf(member) && !isLastOwner(member)) {
      if (member.status === "disabled") {
        actions.push({
          label: t("team.action.enableAccess"),
          onClick: () => {
            updateStaff(member.id, { status: "active" });
            toast.success(t("team.toast.accessEnabled", { name: member.name }));
          },
        });
      } else {
        actions.push({ label: t("team.action.disableAccess"), onClick: () => setConfirm({ member, action: "disable" }), danger: true });
      }
      actions.push({ label: t("team.action.removeMember"), onClick: () => setConfirm({ member, action: "remove" }), danger: true });
    }
    return actions;
  };

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

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard icon={Users} label={t("team.metric.totalMembers")} value={staff.length} />
        <MetricCard icon={UserCheck} label={t("team.metric.activeToday")} value={activeToday} />
        <MetricCard icon={Building2} label={t("team.metric.farmManagers")} value={farmManagers} />
        <MetricCard icon={Stethoscope} label={t("team.metric.veterinarians")} value={veterinarians} />
        <MetricCard icon={MailPlus} label={t("team.metric.pendingInvitations")} value={pendingInvitations} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3 shadow-card">
        <SearchInput value={search} onChange={setSearch} placeholder={t("team.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect label={t("filter.role")} value={role} onChange={setRole} options={roleOptions} />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id} className={`rounded-2xl border border-terrava-border bg-white p-5 shadow-card ${member.status === "disabled" ? "opacity-70" : ""}`}>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setProfile(member)} className="flex min-w-0 items-center gap-3 text-left">
                <img src={member.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-terrava-text hover:text-terrava-primary">
                    {member.name} {isSelf(member) && <span className="text-xs font-normal text-terrava-muted">({t("team.you")})</span>}
                  </span>
                  <span className="block truncate text-xs text-terrava-muted">{roleLabel(member)}</span>
                </span>
              </button>
              <RowActionsMenu actions={memberActions(member)} />
            </div>
            <p className="mt-3 truncate text-xs text-terrava-muted">{member.email}</p>
            <p className="text-xs text-terrava-muted">{getFarmById(member.farmId)?.name}</p>
            <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-2.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[member.status]}`}>{t("status." + member.status)}</span>
              <span className="text-xs text-terrava-muted">{t("team.lastActive", { time: tRel(member.lastActive) })}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-terrava-border bg-white p-8 text-center text-sm text-terrava-muted">{t("team.empty")}</p>
        )}
      </div>

      <div className="mb-8">
        <ChartCard title={t("chart.staffWorkload")} description={t("team.workloadLive")} isEmpty={workloadChart.length === 0}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workloadChart} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="openTasks" name={t("chart.tasks")} fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
              <Bar dataKey="openAlerts" name={t("chart.alertsAssigned")} fill="var(--chart-soft-2)" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">{t("team.permissionsMatrix")}</h2>
      <PermissionsMatrix />

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <Drawer open={!!profile} onClose={() => setProfile(null)} title={profile?.name ?? ""}>
        {profile && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={profile.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="text-base font-bold text-terrava-text">{profile.name}</p>
                <p className="text-sm text-terrava-muted">{roleLabel(profile)}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[profile.status]}`}>{t("status." + profile.status)}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-terrava-border p-4">
              <DetailInfoRow label={t("auth.field.email")} value={profile.email} />
              <DetailInfoRow label={t("filter.farm")} value={getFarmById(profile.farmId)?.name} />
              <DetailInfoRow label={t("team.openTasks")} value={workload(profile).openTasks} />
              <DetailInfoRow label={t("team.openAlerts")} value={workload(profile).openAlerts} />
              <DetailInfoRow label={t("rpt.staff.avgResolution")} value={profile.status === "active" ? `${profile.resolutionRate}%` : "–"} />
              <DetailInfoRow label={t("team.lastActiveLabel")} value={tRel(profile.lastActive)} />
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> {t("team.sendEmail")}
            </a>
          </div>
        )}
      </Drawer>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? (editing.field === "role" ? t("team.editRoleTitle", { name: editing.member.name }) : t("team.assignFarmTitle", { name: editing.member.name })) : ""}
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
              {t("common.cancel")}
            </button>
            <button type="button" onClick={saveEdit} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
              {t("common.save")}
            </button>
          </>
        }
      >
        {editing?.field === "role" ? (
          <select value={editValue} onChange={(event) => setEditValue(event.target.value)} className={fieldClass} aria-label={t("filter.role")}>
            {roleValues.map((value) => (
              <option key={value} value={value}>
                {tt("role", value)}
              </option>
            ))}
          </select>
        ) : (
          <select value={editValue} onChange={(event) => setEditValue(event.target.value)} className={fieldClass} aria-label={t("filter.farm")}>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.action === "disable") {
            updateStaff(confirm.member.id, { status: "disabled" });
            toast.success(t("team.toast.accessDisabled"));
          } else {
            removeStaff(confirm.member.id);
            toast.success(t("team.toast.memberRemoved"));
          }
        }}
        title={confirm ? t(confirm.action === "disable" ? "team.confirm.disableTitle" : "team.confirm.removeTitle", { name: confirm.member.name }) : ""}
        description={confirm ? t(confirm.action === "disable" ? "team.confirm.disableDescription" : "team.confirm.removeDescription") : ""}
        confirmLabel={confirm?.action === "disable" ? t("team.action.disableAccess") : t("team.action.removeMember")}
        tone="danger"
      />
    </div>
  );
}
