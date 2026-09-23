import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { dashboardNavGroups } from "@/data/dashboardNav";
import { images } from "@/data/images";
import { useAuth } from "@/hooks/useAuth";
import UserMenuItems from "@/components/dashboard/UserMenuItems";
import UserAvatar from "@/components/dashboard/UserAvatar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { user } = useAuth();
  const { t, tt } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("dashboard.navigationMenu")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-terrava-dark/50 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 left-0 flex w-[290px] max-w-[85vw] flex-col bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-terrava-border px-4 py-4">
              <div className="flex items-center gap-2.5">
                <img src={images.logoIcon} alt="Terrava" className="h-8 w-8 rounded-lg object-contain" />
                <div>
                  <p className="text-sm font-bold text-terrava-text">Terrava</p>
                  <p className="text-xs text-terrava-muted">{t("dashboard.farmerDashboard")}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")} className="rounded-lg p-1.5 text-terrava-muted transition-colors hover:bg-terrava-bg">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-terrava-border bg-terrava-bg/60 px-4 py-3">
              <UserAvatar initials={user?.initials ?? "TV"} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-terrava-text">{user?.name ?? t("nav.user")}</p>
                <p className="truncate text-xs text-terrava-muted">{tt("role", user?.role ?? "Farm Owner")}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
              {dashboardNavGroups.map((group) => (
                <div key={group.labelKey}>
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-terrava-muted/80">{t(group.labelKey)}</p>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          to={item.href}
                          end={item.href === "/dashboard" || item.href === "/dashboard/livestock"}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                              isActive ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                            )
                          }
                        >
                          <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                          {t(item.labelKey)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-terrava-border p-3">
              <UserMenuItems onNavigate={onClose} showHeader={false} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
