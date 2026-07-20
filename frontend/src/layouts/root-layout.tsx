import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTopButton from "@/components/common/BackToTopButton";

function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-terrava-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}

export default RootLayout;
