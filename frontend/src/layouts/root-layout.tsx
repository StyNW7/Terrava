import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTopButton from "@/components/common/BackToTopButton";
import PageTransition from "@/components/motion/PageTransition";

function RootLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-svh flex-col bg-terrava-bg">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}

export default RootLayout;
