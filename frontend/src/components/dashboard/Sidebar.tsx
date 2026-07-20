import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, ChevronUp, UserRound, Settings, LogOut } from "lucide-react";
import { dashboardNavGroups } from "@/data/dashboardNav";
import { images } from "@/data/images";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-terrava-border bg-white transition-all duration-300 lg:flex ${
        collapsed ? "w-20" : "w-[270px]"
      }`}
    >
      <div className={`flex items-center gap-2.5 border-b border-terrava-border px-4 py-5 ${collapsed ? "justify-center px-2" : ""}`}>
        <img src={images.logoIcon} alt="Terrava" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-terrava-text">Terrava</p>
            <p className="truncate text-xs text-terrava-muted">Farmer Dashboard</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {dashboardNavGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-terrava-muted/80">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href} className="group relative">
                  <NavLink
                    to={item.href}
                    end={item.href === "/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                        collapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-terrava-light text-terrava-primary"
                          : "text-terrava-text hover:bg-terrava-bg"
                      }`
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-terrava-dark px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-terrava-border p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className={`mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-terrava-muted transition-colors hover:bg-terrava-bg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className={`flex w-full items-center gap-2.5 rounded-xl border border-terrava-border px-2.5 py-2 text-left transition-colors hover:bg-terrava-bg ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terrava-light text-sm font-semibold text-terrava-primary">
              SW
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-terrava-text">Stanley Wijaya</p>
                <p className="truncate text-xs text-terrava-muted">Farm Owner</p>
              </span>
            )}
            {!collapsed && <ChevronUp className={`h-4 w-4 shrink-0 text-terrava-muted transition-transform ${profileOpen ? "" : "rotate-180"}`} aria-hidden="true" />}
          </button>

          {profileOpen && (
            <div className={`absolute bottom-full z-50 mb-2 w-52 rounded-xl border border-terrava-border bg-white p-1.5 shadow-soft ${collapsed ? "left-full ml-2" : "left-0"}`}>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
                <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
              </button>
              <NavLink to="/dashboard/settings" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
                <Settings className="h-4 w-4" aria-hidden="true" /> Settings
              </NavLink>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-error hover:bg-terrava-error/10">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
