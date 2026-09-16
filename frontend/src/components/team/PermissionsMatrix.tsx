import { Check, X } from "lucide-react";

const permissions = [
  "View livestock",
  "Edit livestock",
  "Manage alerts",
  "Manage devices",
  "Manage team",
  "Export reports",
  "Edit settings",
];

const roles = ["Owner", "Farm Manager", "Operational", "Staff", "Veterinarian", "Cooperative Admin", "Viewer"];

const matrix: Record<string, boolean[]> = {
  "View livestock": [true, true, true, true, true, true, true],
  "Edit livestock": [true, true, true, true, true, false, false],
  "Manage alerts": [true, true, true, true, true, false, false],
  "Manage devices": [true, true, true, false, false, false, false],
  "Manage team": [true, true, true, false, false, true, false],
  "Export reports": [true, true, true, false, true, true, false],
  "Edit settings": [true, false, false, false, false, false, false],
};

export default function PermissionsMatrix() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-terrava-border bg-white">
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead className="bg-terrava-bg text-xs uppercase text-terrava-muted">
          <tr>
            <th className="px-4 py-3">Permission</th>
            {roles.map((role) => (
              <th key={role} className="px-4 py-3 text-center">{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission} className="border-t border-terrava-border">
              <td className="px-4 py-3 font-medium text-terrava-text">{permission}</td>
              {matrix[permission].map((allowed, index) => (
                <td key={index} className="px-4 py-3 text-center">
                  {allowed ? (
                    <Check className="mx-auto h-4 w-4 text-terrava-primary" aria-hidden="true" />
                  ) : (
                    <X className="mx-auto h-4 w-4 text-terrava-border" aria-hidden="true" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
