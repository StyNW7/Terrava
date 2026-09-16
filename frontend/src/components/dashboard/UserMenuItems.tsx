import { Link } from "react-router-dom";
import { UserRound, Settings, LogOut, HelpCircle } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useAuth } from "@/hooks/useAuth";
import InstallAppButton from "@/components/pwa/InstallAppButton";

interface UserMenuItemsProps {
  onNavigate?: () => void;
  onHelp?: () => void;
  showHeader?: boolean;
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text transition-colors hover:bg-terrava-bg";

/** Shared profile / settings / logout actions used by every user menu in the dashboard. */
export default function UserMenuItems({ onNavigate, onHelp, showHeader = true }: UserMenuItemsProps) {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div>
      {showHeader && user && (
        <div className="mb-1.5 border-b border-terrava-border px-3 pb-2.5 pt-1.5">
          <p className="truncate text-sm font-semibold text-terrava-text">{user.name}</p>
          <p className="truncate text-xs text-terrava-muted">{user.email}</p>
        </div>
      )}
      <Link to="/dashboard/settings?tab=profile" onClick={onNavigate} className={itemClass}>
        <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
      </Link>
      <Link to="/dashboard/settings" onClick={onNavigate} className={itemClass}>
        <Settings className="h-4 w-4" aria-hidden="true" /> Settings
      </Link>
      <InstallAppButton />
      {onHelp && (
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onHelp();
          }}
          className={itemClass}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" /> Bantuan
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          logout();
        }}
        className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-error transition-colors hover:bg-terrava-error/10"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
      </button>
    </div>
  );
}
