import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { mainNavItems } from "@/data/navigation";
import Logo from "@/components/layout/Logo";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-terrava-border bg-white/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="container flex h-20 items-center justify-between py-3">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? "bg-terrava-light text-terrava-primary"
                  : "text-terrava-text hover:bg-terrava-light/60 hover:text-terrava-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SecondaryButton href="/how-it-works">View Platform</SecondaryButton>
          <PrimaryButton href="/contact">Request Demo</PrimaryButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-terrava-text lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-terrava-border bg-white transition-all duration-300 lg:hidden ${
          isOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container flex flex-col gap-1 py-4" aria-label="Navigasi mobile">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                isActive(item.href)
                  ? "bg-terrava-light text-terrava-primary"
                  : "text-terrava-text hover:bg-terrava-light/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3 px-4">
            <SecondaryButton href="/how-it-works" className="w-full justify-center">
              View Platform
            </SecondaryButton>
            <PrimaryButton href="/contact" className="w-full justify-center">
              Request Demo
            </PrimaryButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
