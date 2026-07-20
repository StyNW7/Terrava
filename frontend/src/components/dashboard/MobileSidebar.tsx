import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, LogOut, Settings, UserRound } from "lucide-react";
import { dashboardNavGroups } from "@/data/dashboardNav";
import { images } from "@/data/images";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {

  const navigate = useNavigate()
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-terrava-dark/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-soft transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-terrava-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img src={images.logoIcon} alt="Terrava" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <p className="text-sm font-bold text-terrava-text">Terrava</p>
              <p className="text-xs text-terrava-muted">Farmer Dashboard</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup menu" className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {dashboardNavGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-terrava-muted/80">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href === "/dashboard"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                          isActive ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-terrava-border p-3">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
            <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
          </button>
          <NavLink to="/dashboard/settings" onClick={onClose} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
            <Settings className="h-4 w-4" aria-hidden="true" /> Settings
          </NavLink>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-error hover:bg-terrava-error/10" onClick={() => navigate("/")}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
