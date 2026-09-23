import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  CircleHelp,
  CalendarDays,
  ChevronDown,
  Building2,
  X,
} from "lucide-react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import HelpDrawer from "@/components/dashboard/HelpDrawer";
import UserMenuItems from "@/components/dashboard/UserMenuItems";
import UserAvatar from "@/components/dashboard/UserAvatar";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useDashboardFilters } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { breadcrumbLabelKeys } from "@/data/dashboardNav";
import { farms } from "@/data/mockFarms";
import { livestock } from "@/data/mockLivestock";
import { alerts } from "@/data/mockAlerts";
import { devices } from "@/data/mockDevices";
import { staff } from "@/data/mockTeam";
import { cn } from "@/lib/utils";

const dateRanges = ["today", "last-7-days", "last-30-days", "last-90-days"];

interface HeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

function useDerivedPageTitle(t: (key: string, vars?: Record<string, string | number>) => string): string {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return t("nav.item.dashboard");
  if (breadcrumbLabelKeys[last]) return t(breadcrumbLabelKeys[last]);
  const parent = segments[segments.length - 2];
  if (parent && breadcrumbLabelKeys[parent]) {
    return t("dashboard.detailOf", { name: t(breadcrumbLabelKeys[parent]) });
  }
  return t("nav.item.dashboard");
}

const dropdownMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
};

type OpenMenu = "search" | "farm" | "date" | "notif" | "user" | null;

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
  const navigate = useNavigate();
  const { t, tr, tRel } = useLanguage();
  const derivedTitle = useDerivedPageTitle(t);
  const title = pageTitle ?? derivedTitle;
  const { user } = useAuth();
  const { selectedFarmId, setSelectedFarmId, dateRangeLabel, setDateRangeLabel } = useDashboardFilters();

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeMenus = useCallback(() => setOpenMenu(null), []);
  useClickOutside(headerRef, closeMenus, openMenu !== null);

  const toggle = (menu: Exclude<OpenMenu, null>) => setOpenMenu((current) => (current === menu ? null : menu));

  // Global shortcuts: Ctrl/Cmd+K focuses search, "?" opens help.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileSearch(true);
        searchInputRef.current?.focus();
        setOpenMenu("search");
      } else if (event.key === "?" && !typing) {
        event.preventDefault();
        setHelpOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const term = searchTerm.trim().toLowerCase();
  const results =
    term.length > 0
      ? {
          livestock: livestock.filter((a) => a.name.toLowerCase().includes(term) || a.code.toLowerCase().includes(term)).slice(0, 3),
          alerts: alerts.filter((a) => tr(a.title).toLowerCase().includes(term)).slice(0, 3),
          devices: devices.filter((d) => d.name.toLowerCase().includes(term)).slice(0, 3),
          farms: farms.filter((f) => f.name.toLowerCase().includes(term)).slice(0, 3),
          staff: staff.filter((s) => s.name.toLowerCase().includes(term)).slice(0, 3),
        }
      : null;
  const hasResults = results ? Object.values(results).some((list) => list.length > 0) : false;

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const activeAlertsCount = activeAlerts.length;
  const allFarmsLabel = t("dashboard.allFarms");
  const selectedFarmName =
    selectedFarmId === "all" ? allFarmsLabel : farms.find((f) => f.id === selectedFarmId)?.name ?? allFarmsLabel;

  const goTo = (path: string) => {
    navigate(path);
    setOpenMenu(null);
    setSearchTerm("");
    setMobileSearch(false);
  };

  const renderResultGroup = (label: string, items: { key: string; title: string; meta?: string; path: string }[]) =>
    items.length > 0 && (
      <div>
        <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{label}</p>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-terrava-text transition-colors hover:bg-terrava-bg"
          >
            <span className="truncate">{item.title}</span>
            {item.meta && <span className="shrink-0 text-xs text-terrava-muted">{item.meta}</span>}
          </button>
        ))}
      </div>
    );

  const searchPanel = results && (
    <motion.div
      {...dropdownMotion}
      className="absolute left-0 right-0 z-40 mt-2 rounded-xl border border-terrava-border bg-white p-2 shadow-lift md:left-auto md:w-80"
    >
      {!hasResults ? (
        <p className="px-3 py-4 text-center text-sm text-terrava-muted">{t("dashboard.noResults", { term: searchTerm })}</p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {renderResultGroup(
            t("nav.item.livestock"),
            results.livestock.map((item) => ({ key: item.id, title: item.name, meta: item.code, path: `/dashboard/livestock/${item.id}` }))
          )}
          {renderResultGroup(
            t("nav.item.alerts"),
            results.alerts.map((item) => ({ key: item.id, title: tr(item.title), path: `/dashboard/alerts/${item.id}` }))
          )}
          {renderResultGroup(
            t("nav.item.devices"),
            results.devices.map((item) => ({ key: item.id, title: item.name, path: `/dashboard/devices/${item.id}` }))
          )}
          {renderResultGroup(
            t("dashboard.farms"),
            results.farms.map((item) => ({ key: item.id, title: item.name, path: `/dashboard/farms/${item.id}` }))
          )}
          {renderResultGroup(
            t("dashboard.staff"),
            results.staff.map((item) => ({ key: item.id, title: item.name, path: "/dashboard/team" }))
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-30 border-b border-terrava-border bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("dashboard.openNavigationMenu")}
            className="rounded-lg p-1.5 text-terrava-text transition-colors hover:bg-terrava-bg lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="hidden sm:block">
              <Breadcrumb />
            </div>
            <p className="truncate text-base font-semibold text-terrava-text sm:text-sm sm:font-medium sm:text-terrava-muted">{title}</p>
          </div>

          {/* Desktop search */}
          <div className="relative hidden md:block">
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-terrava-bg px-3 py-2 transition-all duration-200",
                openMenu === "search" ? "border-terrava-primary/50 bg-white shadow-card" : "border-terrava-border"
              )}
            >
              <Search className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setOpenMenu("search");
                }}
                onFocus={() => setOpenMenu("search")}
                placeholder={t("dashboard.searchPlaceholder")}
                aria-label={t("dashboard.globalSearch")}
                className="w-52 bg-transparent text-sm text-terrava-text placeholder:text-terrava-muted focus:outline-none lg:w-60"
              />
              <kbd className="hidden rounded-md border border-terrava-border bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-terrava-muted lg:block">
                Ctrl K
              </kbd>
            </div>
            <AnimatePresence>{openMenu === "search" && searchPanel}</AnimatePresence>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileSearch((prev) => !prev);
                setOpenMenu("search");
              }}
              aria-label={t("common.search")}
              className="rounded-lg p-2 text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => toggle("date")}
                aria-expanded={openMenu === "date"}
                className="flex items-center gap-1.5 rounded-xl border border-terrava-border px-3 py-2 text-xs font-medium text-terrava-text transition-colors hover:bg-terrava-bg"
              >
                <CalendarDays className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
                {t("dateRange." + dateRangeLabel)}
                <ChevronDown className={cn("h-3.5 w-3.5 text-terrava-muted transition-transform", openMenu === "date" && "rotate-180")} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {openMenu === "date" && (
                  <motion.div {...dropdownMotion} className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-terrava-border bg-white p-1.5 shadow-lift">
                    {dateRanges.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          setDateRangeLabel(range);
                          setOpenMenu(null);
                        }}
                        className={cn(
                          "block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors",
                          range === dateRangeLabel ? "bg-terrava-light font-semibold text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                        )}
                      >
                        {t("dateRange." + range)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => toggle("farm")}
                aria-expanded={openMenu === "farm"}
                className="flex items-center gap-1.5 rounded-xl border border-terrava-border px-3 py-2 text-xs font-medium text-terrava-text transition-colors hover:bg-terrava-bg"
              >
                <Building2 className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
                <span className="max-w-[110px] truncate">{selectedFarmName}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-terrava-muted transition-transform", openMenu === "farm" && "rotate-180")} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {openMenu === "farm" && (
                  <motion.div {...dropdownMotion} className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-terrava-border bg-white p-1.5 shadow-lift">
                    {[{ id: "all", name: allFarmsLabel }, ...farms.map((farm) => ({ id: farm.id, name: farm.name }))].map((farm) => (
                      <button
                        key={farm.id}
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setOpenMenu(null);
                        }}
                        className={cn(
                          "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          selectedFarmId === farm.id ? "bg-terrava-light font-semibold text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                        )}
                      >
                        {farm.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LanguageToggle className="h-9 rounded-lg border-transparent bg-transparent text-terrava-muted hover:bg-terrava-bg hover:text-terrava-text" />

            <ThemeToggle className="h-9 w-9 rounded-lg border-transparent bg-transparent text-terrava-muted hover:bg-terrava-bg hover:text-terrava-text" />

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label={t("dashboard.help")}
              className="hidden rounded-lg p-2 text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text sm:block"
            >
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggle("notif")}
                aria-label={t("dashboard.notificationsAria", { count: activeAlertsCount })}
                aria-expanded={openMenu === "notif"}
                className="relative rounded-lg p-2 text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terrava-error px-1 text-[10px] font-bold text-white animate-pulse-dot">
                    {activeAlertsCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {openMenu === "notif" && (
                  <motion.div {...dropdownMotion} className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-terrava-border bg-white p-2 shadow-lift">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-terrava-muted">{t("dashboard.activeAlerts")}</p>
                      <span className="rounded-full bg-terrava-error/10 px-2 py-0.5 text-[11px] font-semibold text-terrava-error">{activeAlertsCount}</span>
                    </div>
                    {activeAlerts.slice(0, 4).map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => goTo(`/dashboard/alerts/${alert.id}`)}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-terrava-bg"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-terrava-text">{tr(alert.title)}</span>
                          <span className="block text-xs text-terrava-muted">{tRel(alert.detectedAt)}</span>
                        </span>
                        <SeverityBadge severity={alert.severity} />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => goTo("/dashboard/alerts")}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold text-terrava-primary transition-colors hover:bg-terrava-bg"
                    >
                      {t("dashboard.viewAllAlerts")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggle("user")}
                aria-label={t("dashboard.userMenu")}
                aria-expanded={openMenu === "user"}
                className="rounded-full transition-transform hover:scale-105"
              >
                <UserAvatar initials={user?.initials ?? "TV"} />
              </button>
              <AnimatePresence>
                {openMenu === "user" && (
                  <motion.div {...dropdownMotion} className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-terrava-border bg-white p-1.5 shadow-lift">
                    <UserMenuItems onNavigate={() => setOpenMenu(null)} onHelp={() => setHelpOpen(true)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search row */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-visible border-t border-terrava-border px-4 py-2.5 md:hidden"
            >
              <div className="flex items-center gap-2 rounded-xl border border-terrava-border bg-terrava-bg px-3 py-2">
                <Search className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setOpenMenu("search");
                  }}
                  placeholder={t("dashboard.searchPlaceholder")}
                  aria-label={t("dashboard.globalSearch")}
                  className="flex-1 bg-transparent text-sm text-terrava-text placeholder:text-terrava-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearch(false);
                    setSearchTerm("");
                    setOpenMenu(null);
                  }}
                  aria-label={t("dashboard.closeSearch")}
                  className="rounded-md p-1 text-terrava-muted hover:text-terrava-text"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="relative px-0">
                <AnimatePresence>{openMenu === "search" && searchPanel}</AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
