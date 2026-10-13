import type { Farm } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function FarmTeamTab({ farm }: { farm: Farm }) {
  const { staff } = useDataStore();
  const { tt } = useLanguage();
  const farmStaff = staff.filter((member) => member.farmId === farm.id);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {farmStaff.map((member) => (
        <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-terrava-border bg-white p-4">
          <img src={member.avatar} alt={member.name} className="h-11 w-11 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-terrava-text">{member.name}</p>
            <p className="truncate text-xs text-terrava-muted">{tt("role", member.role)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
