import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { farms } from "@/data/mockFarms";

const roles = ["Owner", "Farm Manager", "Staff", "Veterinarian", "Cooperative Admin", "Viewer"];
const permissionLevels = ["Full Access", "Edit Access", "View Only"];

export default function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[2]);
  const [farmAccess, setFarmAccess] = useState(farms[0].id);
  const [permission, setPermission] = useState(permissionLevels[1]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success(`Undangan berhasil dikirim ke ${email || "anggota baru"}.`);
    setName("");
    setEmail("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-terrava-text">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-terrava-text">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-terrava-text">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none">
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-terrava-text">Farm Access</label>
          <select value={farmAccess} onChange={(e) => setFarmAccess(e.target.value)} className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none">
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-terrava-text">Permission Level</label>
          <select value={permission} onChange={(e) => setPermission(e.target.value)} className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none">
            {permissionLevels.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
          Send Invitation
        </button>
      </form>
    </Modal>
  );
}
