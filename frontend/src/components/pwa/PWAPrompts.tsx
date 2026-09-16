import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Download, RefreshCw, WifiOff, X, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { images } from "@/data/images";

const INSTALL_BANNER_DELAY_MS = 6000;
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Handles every PWA touchpoint in one place: service-worker updates,
 * the install banner, and an offline indicator.
 */
export default function PWAPrompts() {
  const online = useOnlineStatus();
  const { canInstall, install, dismiss } = useInstallPrompt();
  const [showInstall, setShowInstall] = useState(false);

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
    toast.success("Terrava siap digunakan secara offline.", { id: "pwa-offline-ready" });
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady]);

  // Do not interrupt the first seconds of a visit with the install banner.
  useEffect(() => {
    if (!canInstall) {
      setShowInstall(false);
      return;
    }
    const timer = setTimeout(() => setShowInstall(true), INSTALL_BANNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canInstall]);

  const handleInstall = async () => {
    const outcome = await install();
    setShowInstall(false);
    if (outcome === "accepted") toast.success("Terrava berhasil dipasang di perangkat Anda.");
  };

  const handleDismiss = () => {
    dismiss();
    setShowInstall(false);
  };

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
            className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-terrava-warning px-4 py-2 text-center text-xs font-semibold text-white shadow-lift"
          >
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            Anda sedang offline. Data yang ditampilkan berasal dari cache terakhir.
          </motion.div>
        )}
      </AnimatePresence>

      {/* New version available */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            key="update"
            role="alertdialog"
            aria-label="Versi baru tersedia"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-4 left-1/2 z-[85] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl p-4 shadow-lift"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-terrava-text">Versi baru Terrava tersedia</p>
                <p className="mt-0.5 text-xs text-terrava-muted">Muat ulang untuk mendapatkan pembaruan terbaru.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateServiceWorker(true)}
                    className="rounded-lg bg-terrava-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-terrava-hover"
                  >
                    Perbarui sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeedRefresh(false)}
                    className="rounded-lg px-3.5 py-2 text-xs font-semibold text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text"
                  >
                    Nanti
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install banner */}
      <AnimatePresence>
        {showInstall && !needRefresh && (
          <motion.div
            key="install"
            role="dialog"
            aria-label="Pasang aplikasi Terrava"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-4 left-1/2 z-[85] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl p-4 shadow-lift sm:left-auto sm:right-6 sm:translate-x-0"
          >
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup"
              className="absolute right-2.5 top-2.5 rounded-lg p-1 text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <img src={images.logoIcon} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-terrava-light object-contain p-1" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-terrava-text">Pasang Terrava di perangkat Anda</p>
                <p className="mt-0.5 text-xs leading-relaxed text-terrava-muted">
                  Akses dashboard lebih cepat dari layar utama, tampil layar penuh tanpa browser, dan tetap bisa dibuka saat offline.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-terrava-primary px-3.5 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-terrava-hover"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Pasang aplikasi
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-text"
                  >
                    <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                    Lain kali
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
