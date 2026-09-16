import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, KeyRound, Mail, Zap, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { demoAccounts, primaryDemoAccount } from "@/data/demoAccounts";
import type { DemoAccount } from "@/data/demoAccounts";
import { cn } from "@/lib/utils";

interface DemoAccountCardProps {
  /** Fill the login form with the given credentials without submitting. */
  onFill: (account: DemoAccount) => void;
  /** Sign in immediately with the given account. */
  onQuickLogin: (account: DemoAccount) => void;
  disabled?: boolean;
}

function CopyValue({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Mail }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} disalin.`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Clipboard tidak tersedia di browser ini.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Salin ${label.toLowerCase()}`}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-terrava-border bg-white px-3 py-2 text-left transition-colors hover:border-terrava-primary/40 hover:bg-terrava-light/40"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-terrava-muted" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-terrava-muted">{label}</span>
        <span className="block truncate font-mono text-xs font-medium text-terrava-text">{value}</span>
      </span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-terrava-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-terrava-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      )}
    </button>
  );
}

export default function DemoAccountCard({ onFill, onQuickLogin, disabled }: DemoAccountCardProps) {
  const [selectedId, setSelectedId] = useState(primaryDemoAccount.id);
  const [personaOpen, setPersonaOpen] = useState(false);
  const account = demoAccounts.find((item) => item.id === selectedId) ?? primaryDemoAccount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-terrava-primary/25 bg-gradient-to-br from-terrava-light via-white to-terrava-light/60 p-4 shadow-card sm:p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-terrava-primary/10 blur-2xl" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-terrava-primary text-white shadow-glow">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-terrava-text">Akun Demo Tersedia</p>
            <p className="text-xs text-terrava-muted">Coba dashboard tanpa perlu mendaftar.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-terrava-primary shadow-sm">
          Prototype
        </span>
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setPersonaOpen((prev) => !prev)}
          aria-expanded={personaOpen}
          className="flex w-full items-center justify-between rounded-xl border border-terrava-border bg-white px-3 py-2 text-left transition-colors hover:border-terrava-primary/40"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terrava-primary/10 text-xs font-bold text-terrava-primary">
              {account.initials}
            </span>
            <span>
              <span className="block text-sm font-semibold text-terrava-text">{account.name}</span>
              <span className="block text-xs text-terrava-muted">
                {account.role} &middot; {account.tagline}
              </span>
            </span>
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-terrava-muted transition-transform", personaOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence>
          {personaOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-2 overflow-hidden rounded-xl border border-terrava-border bg-white p-1.5"
              role="listbox"
              aria-label="Pilih persona demo"
            >
              {demoAccounts.map((item) => {
                const active = item.id === account.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSelectedId(item.id);
                        setPersonaOpen(false);
                        onFill(item);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        active ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-bg"
                      )}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terrava-primary/10 text-[11px] font-bold text-terrava-primary">
                        {item.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.name}</span>
                        <span className="block truncate text-xs text-terrava-muted">{item.role}</span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <CopyValue label="Email" value={account.email} icon={Mail} />
        <CopyValue label="Password" value={account.password} icon={KeyRound} />
      </div>

      <div className="relative mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFill(account)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-terrava-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-terrava-primary transition-all hover:bg-terrava-light disabled:opacity-60"
        >
          Isi otomatis
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onQuickLogin(account)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-60"
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          Masuk langsung
        </button>
      </div>
    </motion.div>
  );
}
