import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Download, Maximize2, RefreshCw, Share, SquarePlus, WifiOff, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { images } from "@/data/images";
import { useLanguage } from "@/hooks/useLanguage";

const INSTALL_BANNER_DELAY_MS = 6000;
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const SWIPE_DISMISS_OFFSET = 70;
const SWIPE_DISMISS_VELOCITY = 500;

const sheetMotion = {
  initial: { y: 48, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 48, opacity: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
} as const;

const sheetClass =
  "pointer-events-auto relative max-h-[calc(100svh-1.5rem)] w-full max-w-[26rem] overflow-y-auto overscroll-contain rounded-3xl border border-terrava-border bg-terrava-surface/95 p-5 shadow-lift backdrop-blur-xl";

/**
 * Untransformed fixed anchor for the bottom sheets. Framer Motion writes its own
 * inline `transform` on the animated node, so the sheet must never be positioned
 * with translate utilities (that is what pushed it half off-screen on phones).
 */
function BottomDock({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6 sm:pb-6">
      {children}
    </div>
  );
}

function GrabHandle() {
  return <span className="mx-auto -mt-1 mb-4 block h-1 w-10 rounded-full bg-terrava-border sm:hidden" aria-hidden="true" />;
}

/**
 * Handles every PWA touchpoint in one place: service-worker updates,
 * the install sheet (with manual steps on iOS), and an offline indicator.
 */
export default function PWAPrompts() {
  const { t } = useLanguage();
  const online = useOnlineStatus();
  const { canInstall, showIOSHint, install, dismiss } = useInstallPrompt();
  const [showInstall, setShowInstall] = useState(false);
  const offerAvailable = canInstall || showIOSHint;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Keep checking for a new version while the app stays open.
      if (!registration) return;
      setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    toast.success(t("pwa.offlineReady"), { id: "pwa-offline-ready" });
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, t]);

  // Do not interrupt the first seconds of a visit with the install sheet.
  useEffect(() => {
    if (!offerAvailable) {
      setShowInstall(false);
      return;
    }
    const timer = setTimeout(() => setShowInstall(true), INSTALL_BANNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [offerAvailable]);

  const handleInstall = async () => {
    const outcome = await install();
    setShowInstall(false);
    if (outcome === "accepted") toast.success(t("pwa.installed"));
  };

  const handleDismiss = () => {
    dismiss();
    setShowInstall(false);
  };

  const installVisible = showInstall && !needRefresh;

  useEffect(() => {
    if (!installVisible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // handleDismiss only touches stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installVisible]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > SWIPE_DISMISS_OFFSET || info.velocity.y > SWIPE_DISMISS_VELOCITY) handleDismiss();
  };

  const benefits = [
    { icon: Zap, label: t("pwa.benefitFast") },
    { icon: WifiOff, label: t("pwa.benefitOffline") },
    { icon: Maximize2, label: t("pwa.benefitFullscreen") },
  ];

  return (
    <>
      {/* Offline indicator */}
      <AnimatePresence>
        {!online && (
          <motion.div
            key="offline"
            role="status"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-terrava-warning px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-center text-xs font-semibold text-white shadow-lift"
          >
            <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("pwa.offlineNotice")}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomDock>
        <AnimatePresence mode="wait">
          {/* New version available */}
          {needRefresh && (
            <motion.div key="update" role="alertdialog" aria-labelledby="pwa-update-title" {...sheetMotion} className={sheetClass}>
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terrava-light text-terrava-primary">
                  <RefreshCw className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p id="pwa-update-title" className="text-[15px] font-semibold leading-snug text-terrava-text">
                    {t("pwa.updateTitle")}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-terrava-muted">{t("pwa.updateDescription")}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNeedRefresh(false)}
                  className="h-11 rounded-xl border border-terrava-border text-sm font-semibold text-terrava-text transition-colors hover:bg-terrava-bg"
                >
                  {t("pwa.later")}
                </button>
                <button
                  type="button"
                  onClick={() => updateServiceWorker(true)}
                  className="btn-shine h-11 rounded-xl bg-terrava-primary text-sm font-semibold text-white shadow-glow transition-colors hover:bg-terrava-hover"
                >
                  {t("pwa.updateNow")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Install sheet */}
          {installVisible && (
            <motion.div
              key="install"
              role="dialog"
              aria-labelledby="pwa-install-title"
              aria-describedby="pwa-install-description"
              {...sheetMotion}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              className={sheetClass}
            >
              <GrabHandle />
              <button
                type="button"
                onClick={handleDismiss}
                aria-label={t("common.close")}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-terrava-bg text-terrava-muted transition-colors hover:bg-terrava-light hover:text-terrava-text"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-3.5 pr-10">
                <img
                  src={images.logoIcon}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl bg-terrava-light object-contain p-1.5 ring-1 ring-terrava-primary/10"
                />
                <div className="min-w-0">
                  <p id="pwa-install-title" className="text-[15px] font-semibold leading-snug text-terrava-text">
                    {t("pwa.installTitle")}
                  </p>
                  <p className="mt-0.5 text-xs text-terrava-muted">{t("pwa.installMeta")}</p>
                </div>
              </div>

              <p id="pwa-install-description" className="mt-3 text-sm leading-relaxed text-terrava-muted">
                {t("pwa.installDescription")}
              </p>

              {canInstall ? (
                <>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {benefits.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full bg-terrava-light px-2.5 py-1 text-[11px] font-semibold text-terrava-primary"
                      >
                        <Icon className="h-3 w-3" aria-hidden="true" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="h-11 rounded-xl border border-terrava-border text-sm font-semibold text-terrava-text transition-colors hover:bg-terrava-bg"
                    >
                      {t("pwa.maybeLater")}
                    </button>
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="btn-shine inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-terrava-primary px-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-terrava-hover"
                    >
                      <Download className="hidden h-4 w-4 shrink-0 min-[360px]:block" aria-hidden="true" />
                      {t("pwa.install")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ol className="mt-4 space-y-2">
                    {[
                      { label: t("pwa.iosStep1"), icon: Share },
                      { label: t("pwa.iosStep2"), icon: SquarePlus },
                    ].map(({ label, icon: Icon }, index) => (
                      <li key={label} className="flex items-center gap-3 rounded-xl bg-terrava-bg px-3 py-2.5 text-sm text-terrava-text">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terrava-primary text-[11px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">{label}</span>
                        <Icon className="h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="mt-4 h-11 w-full rounded-xl bg-terrava-primary text-sm font-semibold text-white shadow-glow transition-colors hover:bg-terrava-hover"
                  >
                    {t("pwa.gotIt")}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </BottomDock>
    </>
  );
}
