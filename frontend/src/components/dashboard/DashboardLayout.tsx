import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import Header from "@/components/dashboard/Header";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-terrava-bg">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
