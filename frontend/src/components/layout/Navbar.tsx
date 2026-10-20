import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";
import { mainNavItems } from "@/data/navigation";
import Logo from "@/components/layout/Logo";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import UserAvatar from "@/components/dashboard/UserAvatar";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-terrava-border/70 bg-white/80 shadow-[0_8px_30px_-18px_rgb(var(--t-shadow)/0.25)] backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-white/60 backdrop-blur-sm"
      )}
    >
      <div className={cn("container flex items-center justify-between transition-all duration-300", scrolled ? "h-16" : "h-20")}>
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.main")}>
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                  active ? "text-terrava-primary" : "text-terrava-text hover:text-terrava-primary"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-terrava-light ring-1 ring-terrava-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{t(item.labelKey)}</span>
                {!active && (
                  <span
                    className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 rounded-full bg-terrava-primary/60 transition-transform duration-300 ease-out-expo group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          {isAuthenticated ? (
            <PrimaryButton href="/dashboard" showArrow={false} className="gap-2.5 py-2 pl-2 pr-4">
              <UserAvatar initials={user?.initials ?? "TV"} size="sm" online={false} className="[&>span]:ring-white/40" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-white/70">{t("nav.signedInAs")}</span>
                <span className="text-sm">{user?.name?.split(" ")[0] ?? t("nav.user")}</span>
              </span>
              <LayoutDashboard className="ml-1 h-4 w-4" aria-hidden="true" />
            </PrimaryButton>
          ) : (
            <>
              <SecondaryButton href="/register">{t("nav.register")}</SecondaryButton>
              <PrimaryButton href="/login" showArrow={false}>
                {t("nav.login")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </PrimaryButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
        <LanguageToggle compact />
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-terrava-text transition-colors hover:bg-terrava-light"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </button>
        </div>
      </div>

      <ScrollProgress className={cn("absolute inset-x-0 bottom-0 transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-terrava-border bg-white lg:hidden"
          >
            <nav className="container flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto py-4" aria-label={t("nav.mobile")}>
              {mainNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.25 }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive(item.href) ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-light/60"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 flex flex-col gap-3 px-4 pb-2">
                {isAuthenticated ? (
                  <PrimaryButton href="/dashboard" className="w-full justify-center">
                    {t("nav.openDashboard")}
                  </PrimaryButton>
                ) : (
                  <>
                    <SecondaryButton href="/register" className="w-full justify-center">
                      {t("nav.register")}
                    </SecondaryButton>
                    <PrimaryButton href="/login" className="w-full justify-center">
                      {t("nav.login")}
                    </PrimaryButton>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
