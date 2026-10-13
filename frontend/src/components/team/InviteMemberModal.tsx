import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import type { StaffRole } from "@/types/dashboard";
import { initialsAvatar } from "@/utils/avatar";
import { cn } from "@/lib/utils";

const roles: StaffRole[] = ["Owner", "Farm Manager", "Operational", "Staff", "Veterinarian", "Cooperative Admin", "Viewer"];
const permissionLevels = ["Full Access", "Edit Access", "View Only"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldClass =
  "w-full rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

export default function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { farms, staff, addStaff } = useDataStore();
  const { t, tt } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Operational");
  const [farmAccess, setFarmAccess] = useState(farms[0]?.id ?? "");
  const [permission, setPermission] = useState(permissionLevels[1]);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRole("Operational");
    setFarmAccess(farms[0]?.id ?? "");
    setPermission(permissionLevels[1]);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t("team.error.name");
    if (!EMAIL_PATTERN.test(email.trim())) next.email = t("validation.emailFormat");
    else if (staff.some((member) => member.email.toLowerCase() === email.trim().toLowerCase())) next.email = t("team.error.emailTaken");
    setErrors(next);
    if (Object.keys(next).length) return;

    addStaff({
      id: `STF-${Date.now().toString(36).toUpperCase()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: initialsAvatar(name.trim()),
      role,
      farmId: farmAccess,
      status: "invited",
      lastActive: "Never active",
      tasksAssigned: 0,
      alertsAssigned: 0,
      resolutionRate: 0,
    });
    toast.success(t("team.toast.invitationSent", { email: email.trim() }));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("team.inviteMember")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="invite-name" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("team.field.name")}
          </label>
          <input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus className={cn(fieldClass, errors.name && "border-terrava-error")} />
          {errors.name && <p className="mt-1 text-xs text-terrava-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("auth.field.email")}
          </label>
          <input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(fieldClass, errors.email && "border-terrava-error")} />
          {errors.email && <p className="mt-1 text-xs text-terrava-error">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="invite-role" className="mb-1.5 block text-sm font-medium text-terrava-text">
              {t("filter.role")}
            </label>
            <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={fieldClass}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {tt("role", r)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="invite-permission" className="mb-1.5 block text-sm font-medium text-terrava-text">
              {t("team.field.permissionLevel")}
            </label>
            <select id="invite-permission" value={permission} onChange={(e) => setPermission(e.target.value)} className={fieldClass}>
              {permissionLevels.map((p) => (
                <option key={p} value={p}>
                  {tt("permission", p)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="invite-farm" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("team.field.farmAccess")}
          </label>
          <select id="invite-farm" value={farmAccess} onChange={(e) => setFarmAccess(e.target.value)} className={fieldClass}>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
          {t("team.sendInvitation")}
        </button>
      </form>
    </Modal>
  );
}
