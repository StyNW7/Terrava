import { Link } from "react-router-dom";
import { BookOpen, Keyboard, LifeBuoy, MessageCircle, PawPrint, BellRing, Cpu, BrainCircuit, ArrowRight } from "lucide-react";
import Drawer from "@/components/dashboard/Drawer";

const quickLinks = [
  { icon: PawPrint, label: "Tambah ternak baru", description: "Daftarkan ternak dan pasangkan ear tag.", href: "/dashboard/livestock/add" },
  { icon: BellRing, label: "Tinjau alert aktif", description: "Lihat peringatan yang perlu ditindaklanjuti.", href: "/dashboard/alerts" },
  { icon: Cpu, label: "Kelola perangkat", description: "Status baterai, sinyal, dan firmware.", href: "/dashboard/devices" },
  { icon: BrainCircuit, label: "AI Insights", description: "Rekomendasi berbasis data sensor.", href: "/dashboard/ai-insights" },
];

const shortcuts = [
  { keys: ["Ctrl", "K"], label: "Fokus ke pencarian global" },
  { keys: ["Esc"], label: "Tutup menu, dialog, atau panel" },
  { keys: ["?"], label: "Buka panel bantuan ini" },
];

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpDrawer({ open, onClose }: HelpDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Pusat Bantuan">
      <div className="space-y-7">
        <section>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
            Mulai cepat
          </p>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-xl border border-terrava-border px-3.5 py-3 transition-all hover:border-terrava-primary/40 hover:bg-terrava-light/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary">
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-terrava-text">{link.label}</span>
                    <span className="block text-xs text-terrava-muted">{link.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-terrava-muted transition-transform group-hover:translate-x-1 group-hover:text-terrava-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">
            <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
            Pintasan keyboard
          </p>
          <ul className="divide-y divide-terrava-border rounded-xl border border-terrava-border">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.label} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="text-terrava-text">{shortcut.label}</span>
                <span className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="rounded-md border border-terrava-border bg-terrava-bg px-1.5 py-0.5 font-mono text-[11px] font-semibold text-terrava-muted"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-terrava-dark to-terrava-primary p-5 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Butuh bantuan lebih lanjut?
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/80">
            Tim Terrava siap membantu dari Senin sampai Sabtu, 08.00 - 18.00 WIB.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/contact"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-terrava-primary transition-colors hover:bg-terrava-light"
            >
              Hubungi tim
            </Link>
            <Link
              to="/how-it-works"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Dokumentasi
            </Link>
          </div>
        </section>
      </div>
    </Drawer>
  );
}
