import { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, ChevronUp } from "lucide-react";
import { dashboardNavGroups } from "@/data/dashboardNav";
import { images } from "@/data/images";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { alerts } from "@/data/mockAlerts";
import UserMenuItems from "@/components/dashboard/UserMenuItems";
import UserAvatar from "@/components/dashboard/UserAvatar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export default function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const { user } = useAuth();
  const { t, tt } = useLanguage();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);

  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  // The active item is the nav entry whose path is the longest prefix of the
  // current URL, so "/dashboard/livestock/add" highlights Add Livestock only.
  const allHrefs = dashboardNavGroups.flatMap((group) => group.items.map((item) => item.href));
  const activeHref = allHrefs
    .filter((href) => location.pathname === href || location.pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const isItemActive = (href: string) => href === activeHref;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-terrava-border bg-white transition-[width] duration-300 ease-out-expo lg:flex",
        collapsed ? "w-20" : "w-[270px]"
      )}
    >
      <div className={cn("flex items-center gap-2.5 border-b border-terrava-border px-4 py-5", collapsed && "justify-center px-2")}>
        <img src={images.logoIcon} alt="Terrava" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-terrava-text">Terrava</p>
            <p className="truncate text-xs text-terrava-muted">{t("dashboard.farmerDashboard")}</p>
          </div>
        )}
      </div>

      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {dashboardNavGroups.map((group) => (
          <div key={group.labelKey}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-terrava-muted/80">{t(group.labelKey)}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const badge = item.href === "/dashboard/alerts" ? activeAlerts : undefined;
                return (
                  <li key={item.href} className="group relative">
                    <NavLink
                      to={item.href}
                      end={item.href === "/dashboard"}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        collapsed && "justify-center",
                        active ? "text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-terrava-light"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative flex items-center gap-3">
                        <span className="relative">
                          <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                          {collapsed && badge ? (
                            <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-terrava-error" aria-hidden="true" />
                          ) : null}
                        </span>
                        {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                      </span>
                      {!collapsed && badge ? (
                        <span className="relative ml-auto rounded-full bg-terrava-error/10 px-2 py-0.5 text-[11px] font-semibold text-terrava-error">
                          {badge}
                        </span>
                      ) : null}
                    </NavLink>
                    {collapsed && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-terrava-dark px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-soft transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                      >
                        {t(item.labelKey)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-terrava-border p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("dashboard.expandSidebar") : t("dashboard.collapseSidebar")}
          className={cn(
            "mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
          {!collapsed && <span>{t("dashboard.collapse")}</span>}
        </button>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl border border-terrava-border px-2.5 py-2 text-left transition-colors hover:bg-terrava-bg",
              collapsed && "justify-center border-transparent px-0"
            )}
          >
            <UserAvatar initials={user?.initials ?? "TV"} />
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-terrava-text">{user?.name ?? t("nav.user")}</span>
                <span className="block truncate text-xs text-terrava-muted">{tt("role", user?.role ?? "Farm Owner")}</span>
              </span>
            )}
            {!collapsed && (
              <ChevronUp
                className={cn("h-4 w-4 shrink-0 text-terrava-muted transition-transform", !profileOpen && "rotate-180")}
                aria-hidden="true"
              />
            )}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "absolute bottom-full z-50 mb-2 w-56 rounded-xl border border-terrava-border bg-white p-1.5 shadow-lift",
                  collapsed ? "left-full ml-2" : "left-0"
                )}
              >
                <UserMenuItems onNavigate={() => setProfileOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
