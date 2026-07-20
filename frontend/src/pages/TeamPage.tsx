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

const roleOptions = [
  { value: "Owner", label: "Owner" },
  { value: "Farm Manager", label: "Farm Manager" },
  { value: "Staff", label: "Staff" },
  { value: "Veterinarian", label: "Veterinarian" },
  { value: "Cooperative Admin", label: "Cooperative Admin" },
  { value: "Viewer", label: "Viewer" },
];

const statusTone: Record<string, string> = {
  active: "bg-terrava-primary/10 text-terrava-primary",
  invited: "bg-terrava-info/10 text-terrava-info",
  disabled: "bg-terrava-neutral/10 text-terrava-neutral",
};

export default function TeamPage() {
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

  return (
    <div>
      <PageHeader
        title="Team and Staff"
        subtitle="Kelola anggota tim, peran, dan akses peternakan."
        actions={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite Member
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard icon={Users} label="Total Members" value={staff.length} />
        <MetricCard icon={UserCheck} label="Active Today" value={activeToday} />
        <MetricCard icon={Building2} label="Farm Managers" value={farmManagers} />
        <MetricCard icon={Stethoscope} label="Veterinarians" value={veterinarians} />
        <MetricCard icon={MailPlus} label="Pending Invitations" value={pendingInvitations} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari anggota tim..." className="w-full sm:w-64" />
        <FilterSelect label="Role" value={role} onChange={setRole} options={roleOptions} />
        <FilterSelect label="Farm" value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-2xl border border-terrava-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-terrava-text">{member.name}</p>
                  <p className="text-xs text-terrava-muted">{member.role}</p>
                </div>
              </div>
              <RowActionsMenu
                actions={[
                  { label: "View profile", onClick: () => toast.success(`Membuka profil ${member.name}.`) },
                  { label: "Edit role", onClick: () => toast.success("Peran anggota berhasil diperbarui.") },
                  { label: "Assign farm", onClick: () => toast.success("Farm berhasil ditugaskan.") },
                  { label: "Disable access", onClick: () => toast.success("Akses anggota dinonaktifkan."), danger: true },
                  { label: "Remove member", onClick: () => toast.success("Anggota berhasil dihapus."), danger: true },
                ]}
              />
            </div>
            <p className="mt-3 truncate text-xs text-terrava-muted">{member.email}</p>
            <p className="text-xs text-terrava-muted">{getFarmById(member.farmId)?.name}</p>
            <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-2.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[member.status]}`}>{member.status}</span>
              <span className="text-xs text-terrava-muted">Active {member.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <ChartCard title="Staff Workload" description="Tugas dan alert yang ditugaskan per anggota tim">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffWorkload} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F5F8F6" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="tasks" name="Tasks" fill="#277A4D" radius={[8, 8, 0, 0]} isAnimationActive />
              <Bar dataKey="alerts" name="Alerts Assigned" fill="#A7CFB7" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">Permissions Matrix</h2>
      <PermissionsMatrix />

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
