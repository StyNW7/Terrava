import { Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface InstallAppButtonProps {
  className?: string;
}

/**
 * Explicit "Install app" action for menus. Renders nothing when the browser
 * has not offered installation (unsupported browser, or already installed
 * elsewhere), and shows an installed state when running as the PWA.
 */
export default function InstallAppButton({ className }: InstallAppButtonProps) {
  const { installAvailable, installed, install } = useInstallPrompt();
  const { t } = useLanguage();

  if (installed) {
    return (
      <span className={cn("flex items-center gap-2.5 px-3 py-2 text-sm text-terrava-muted", className)}>
        <CheckCircle2 className="h-4 w-4 text-terrava-success" aria-hidden="true" />
        {t("pwa.appInstalled")}
      </span>
    );
  }

  if (!installAvailable) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const outcome = await install();
        if (outcome === "accepted") toast.success(t("pwa.installed"));
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-terrava-text transition-colors hover:bg-terrava-bg",
        className
      )}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {t("pwa.install")}
    </button>
  );
}
