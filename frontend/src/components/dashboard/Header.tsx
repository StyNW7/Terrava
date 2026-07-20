import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  CircleHelp,
  CalendarDays,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import { useDashboardFilters } from "@/context/DashboardContext";
import { breadcrumbLabels } from "@/data/dashboardNav";
import { farms } from "@/data/mockFarms";
import { livestock } from "@/data/mockLivestock";
import { alerts } from "@/data/mockAlerts";
import { devices } from "@/data/mockDevices";
import { staff } from "@/data/mockTeam";

const dateRanges = ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

interface HeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

function useDerivedPageTitle(): string {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";
  if (breadcrumbLabels[last]) return breadcrumbLabels[last];
  const parent = segments[segments.length - 2];
  if (parent && breadcrumbLabels[parent]) return `${breadcrumbLabels[parent]} Detail`;
  return "Dashboard";
}

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
  const navigate = useNavigate();
  const derivedTitle = useDerivedPageTitle();
  const title = pageTitle ?? derivedTitle;
  const { selectedFarmId, setSelectedFarmId, dateRangeLabel, setDateRangeLabel } = useDashboardFilters();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [farmMenuOpen, setFarmMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results =
    searchTerm.trim().length > 0
      ? {
          livestock: livestock.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3),
          alerts: alerts.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3),
          devices: devices.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3),
          farms: farms.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3),
          staff: staff.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3),
        }
      : null;

  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;

  const selectedFarmName = selectedFarmId === "all" ? "All Farms" : farms.find((f) => f.id === selectedFarmId)?.name ?? "All Farms";

  return (
    <header className="sticky top-0 z-30 border-b border-terrava-border bg-white/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          className="rounded-lg p-1.5 text-terrava-text hover:bg-terrava-bg lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumb />
          <h1 className="truncate text-lg font-bold text-terrava-text sm:text-xl">{title}</h1>
        </div>

        <div ref={searchRef} className="relative hidden md:block">
          <div className="flex items-center gap-2 rounded-xl border border-terrava-border bg-terrava-bg px-3 py-2">
            <Search className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Cari livestock, alert, device..."
              className="w-56 bg-transparent text-sm text-terrava-text placeholder:text-terrava-muted focus:outline-none"
            />
          </div>

          {searchOpen && results && (
            <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-terrava-border bg-white p-2 shadow-soft">
              {Object.values(results).every((list) => list.length === 0) ? (
                <p className="px-3 py-4 text-center text-sm text-terrava-muted">Tidak ada hasil ditemukan.</p>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {results.livestock.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase text-terrava-muted">Livestock</p>
                      {results.livestock.map((item) => (
                        <button key={item.id} onClick={() => { navigate(`/dashboard/livestock/${item.id}`); setSearchOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
                          {item.name} <span className="text-xs text-terrava-muted">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.alerts.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase text-terrava-muted">Alerts</p>
                      {results.alerts.map((item) => (
                        <button key={item.id} onClick={() => { navigate(`/dashboard/alerts/${item.id}`); setSearchOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-terrava-text hover:bg-terrava-bg">
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {results.devices.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase text-terrava-muted">Devices</p>
                      {results.devices.map((item) => (
                        <button key={item.id} onClick={() => { navigate(`/dashboard/devices/${item.id}`); setSearchOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-terrava-text hover:bg-terrava-bg">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {results.farms.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase text-terrava-muted">Farms</p>
                      {results.farms.map((item) => (
                        <button key={item.id} onClick={() => { navigate(`/dashboard/farms/${item.id}`); setSearchOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-terrava-text hover:bg-terrava-bg">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {results.staff.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase text-terrava-muted">Staff</p>
                      {results.staff.map((item) => (
                        <button key={item.id} onClick={() => { navigate(`/dashboard/team`); setSearchOpen(false); }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-terrava-text hover:bg-terrava-bg">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-terrava-border px-3 py-2 text-xs font-medium text-terrava-text hover:bg-terrava-bg"
            >
              <CalendarDays className="h-4 w-4 text-terrava-muted" aria-hidden="true" />
              {dateRangeLabel}
              <ChevronDown className="h-3.5 w-3.5 text-terrava-muted" aria-hidden="true" />
            </button>
            {dateMenuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl border border-terrava-border bg-white p-1.5 shadow-soft">
                {dateRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => { setDateRangeLabel(range); setDateMenuOpen(false); }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-xs ${range === dateRangeLabel ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setFarmMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-terrava-border px-3 py-2 text-xs font-medium text-terrava-text hover:bg-terrava-bg"
            >
              <span className="max-w-[110px] truncate">{selectedFarmName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-terrava-muted" aria-hidden="true" />
            </button>
            {farmMenuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-terrava-border bg-white p-1.5 shadow-soft">
                <button
                  onClick={() => { setSelectedFarmId("all"); setFarmMenuOpen(false); }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${selectedFarmId === "all" ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"}`}
                >
                  All Farms
                </button>
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    onClick={() => { setSelectedFarmId(farm.id); setFarmMenuOpen(false); }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${selectedFarmId === farm.id ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"}`}
                  >
                    {farm.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button aria-label="Bantuan" className="hidden rounded-lg p-2 text-terrava-muted hover:bg-terrava-bg sm:block">
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="Notifikasi"
              className="relative rounded-lg p-2 text-terrava-muted hover:bg-terrava-bg"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {activeAlertsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terrava-error px-1 text-[10px] font-bold text-white">
                  {activeAlertsCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-terrava-border bg-white p-2 shadow-soft">
                <p className="px-3 py-1.5 text-xs font-semibold uppercase text-terrava-muted">Active Alerts</p>
                {alerts.filter((a) => a.status === "active").slice(0, 4).map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => { navigate(`/dashboard/alerts/${alert.id}`); setNotifOpen(false); }}
                    className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-terrava-bg"
                  >
                    <span className="text-sm font-medium text-terrava-text">{alert.title}</span>
                    <span className="text-xs text-terrava-muted">{alert.detectedAt}</span>
                  </button>
                ))}
                <button onClick={() => { navigate("/dashboard/alerts"); setNotifOpen(false); }} className="mt-1 block w-full rounded-lg px-3 py-2 text-center text-xs font-semibold text-terrava-primary hover:bg-terrava-bg">
                  Lihat semua alert
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-terrava-light text-sm font-semibold text-terrava-primary"
              aria-label="Menu pengguna"
            >
              SW
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-terrava-border bg-white p-1.5 shadow-soft">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
                  <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
                </button>
                <button onClick={() => { navigate("/dashboard/settings"); setUserMenuOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text hover:bg-terrava-bg">
                  <Settings className="h-4 w-4" aria-hidden="true" /> Settings
                </button>
                <button onClick={() => navigate("/login")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-error hover:bg-terrava-error/10">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
