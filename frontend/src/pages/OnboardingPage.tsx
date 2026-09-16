import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Radio,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  Wifi,
  Sparkles,
  MapPin,
  PawPrint,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Profil Peternakan", icon: Building2 },
  { id: 2, label: "Hubungkan Perangkat", icon: Radio },
  { id: 3, label: "Undang Tim", icon: Users },
];

const pairingStages = ["Mencari gateway LoRa...", "Gateway ditemukan", "Menyinkronkan smart ear tag", "Kalibrasi sensor", "Perangkat siap"];

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Progres onboarding">
      {steps.map((step, index) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                  done && "border-terrava-light bg-terrava-light text-terrava-primary",
                  active && "border-terrava-primary bg-terrava-primary text-white shadow-glow",
                  !done && !active && "border-terrava-border bg-white text-terrava-muted"
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : step.id}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", active ? "text-terrava-text" : "text-terrava-muted")}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className={cn("h-px w-6 sm:w-10", done ? "bg-terrava-primary" : "bg-terrava-border")} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState(user?.farmName ?? "");
  const [location, setLocation] = useState("Boyolali, Jawa Tengah");
  const [livestockCount, setLivestockCount] = useState("11-50");
  const [pairing, setPairing] = useState(false);
  const [pairStage, setPairStage] = useState(-1);
  const [invites, setInvites] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    document.title = "Onboarding | Terrava";
  }, []);

  const firstName = (user?.name ?? "Peternak").replace(/^(drh\.|dr\.|ir\.)\s*/i, "").split(" ")[0];
  const paired = pairStage >= pairingStages.length - 1;

  const startPairing = () => {
    if (pairing || paired) return;
    setPairing(true);
    setPairStage(0);
    pairingStages.forEach((_, index) => {
      setTimeout(() => {
        setPairStage(index);
        if (index === pairingStages.length - 1) {
          setPairing(false);
          toast.success("Smart ear tag berhasil terhubung.");
        }
      }, 650 * (index + 1));
    });
  };

  const addInvite = () => {
    const value = inviteInput.trim().toLowerCase();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Gunakan format email yang valid.");
      return;
    }
    if (invites.includes(value)) {
      toast.error("Email tersebut sudah ditambahkan.");
      return;
    }
    setInvites((prev) => [...prev, value]);
    setInviteInput("");
  };

  const finish = async () => {
    setFinishing(true);
    if (farmName.trim()) updateUser({ farmName: farmName.trim() });
    await new Promise((resolve) => setTimeout(resolve, 900));
    toast.success(invites.length > 0 ? `Undangan terkirim ke ${invites.length} anggota tim.` : "Workspace Terrava Anda siap digunakan.");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-terrava-bg">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid-soft bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />

      <header className="relative">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-xl font-bold text-terrava-text">Terrava</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-terrava-muted transition-colors hover:text-terrava-primary"
          >
            Lewati untuk sekarang
          </button>
        </div>
      </header>

      <main className="container relative pb-20 pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-terrava-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Langkah {step} dari {steps.length}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-terrava-text sm:text-4xl">
            Selamat datang, {firstName}. Mari siapkan workspace Anda.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-terrava-muted sm:text-base">
            Tiga langkah singkat agar dashboard Terrava langsung relevan dengan kondisi peternakan Anda.
          </p>

          <div className="mt-8">
            <StepIndicator current={step} />
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-terrava-border bg-white shadow-card">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.section
                  key="step-1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-terrava-text">Profil peternakan</h2>
                      <p className="text-sm text-terrava-muted">Informasi dasar untuk menyesuaikan dashboard Anda.</p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">Nama peternakan</span>
                      <input
                        value={farmName}
                        onChange={(event) => setFarmName(event.target.value)}
                        placeholder="Contoh: Terrava Farm Boyolali"
                        className="w-full rounded-xl border border-terrava-border bg-white px-4 py-3 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">Lokasi</span>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terrava-muted" aria-hidden="true" />
                        <input
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                          className="w-full rounded-xl border border-terrava-border bg-white py-3 pl-10 pr-4 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">Perkiraan jumlah ternak</span>
                      <div className="relative">
                        <PawPrint className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terrava-muted" aria-hidden="true" />
                        <select
                          value={livestockCount}
                          onChange={(event) => setLivestockCount(event.target.value)}
                          className="w-full appearance-none rounded-xl border border-terrava-border bg-white py-3 pl-10 pr-4 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                        >
                          <option value="1-10">1 - 10 ekor</option>
                          <option value="11-50">11 - 50 ekor</option>
                          <option value="51-100">51 - 100 ekor</option>
                          <option value="101-500">101 - 500 ekor</option>
                          <option value="500+">Lebih dari 500 ekor</option>
                        </select>
                      </div>
                    </label>
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section
                  key="step-2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                      <Radio className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-terrava-text">Hubungkan smart ear tag</h2>
                      <p className="text-sm text-terrava-muted">Simulasi pairing perangkat pertama Anda ke gateway Terrava.</p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-terrava-border bg-terrava-bg p-8">
                      <div className="relative">
                        {(pairing || paired) && (
                          <>
                            <span className="absolute inset-0 -m-4 rounded-full bg-terrava-primary/15 animate-ping-slow" aria-hidden="true" />
                            <span className="absolute inset-0 -m-8 rounded-full bg-terrava-primary/10 animate-ping-slow [animation-delay:0.5s]" aria-hidden="true" />
                          </>
                        )}
                        <span
                          className={cn(
                            "relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white shadow-soft transition-colors duration-500",
                            paired ? "bg-terrava-primary text-white" : "bg-white text-terrava-primary"
                          )}
                        >
                          {paired ? <CheckCircle2 className="h-9 w-9" aria-hidden="true" /> : <Wifi className="h-9 w-9" aria-hidden="true" />}
                        </span>
                      </div>
                      <p className="mt-5 text-sm font-semibold text-terrava-text">
                        {paired ? "TAG-0001 terhubung" : pairing ? "Menghubungkan..." : "Belum ada perangkat"}
                      </p>
                      <p className="mt-1 text-center text-xs text-terrava-muted">
                        {paired ? "Sinyal kuat · Baterai 100%" : "Tekan tombol pairing pada gateway, lalu mulai."}
                      </p>
                      <button
                        type="button"
                        onClick={startPairing}
                        disabled={pairing || paired}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-60"
                      >
                        {pairing && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {paired ? "Perangkat siap" : pairing ? "Memproses" : "Mulai pairing"}
                      </button>
                    </div>

                    <ol className="space-y-2.5">
                      {pairingStages.map((stage, index) => {
                        const done = pairStage > index || paired;
                        const active = pairStage === index && !paired;
                        return (
                          <li
                            key={stage}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-300",
                              done && "border-terrava-primary/30 bg-terrava-light text-terrava-text",
                              active && "border-terrava-primary bg-white text-terrava-text shadow-card",
                              !done && !active && "border-terrava-border bg-white text-terrava-muted"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                done ? "bg-terrava-primary text-white" : active ? "bg-terrava-primary/10 text-terrava-primary" : "bg-terrava-bg text-terrava-muted"
                              )}
                            >
                              {done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : active ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : index + 1}
                            </span>
                            {stage}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section
                  key="step-3"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-terrava-text">Undang anggota tim</h2>
                      <p className="text-sm text-terrava-muted">Opsional. Anda bisa menambahkannya nanti dari menu Team and Staff.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      value={inviteInput}
                      onChange={(event) => setInviteInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addInvite();
                        }
                      }}
                      placeholder="nama@peternakan.id"
                      className="flex-1 rounded-xl border border-terrava-border bg-white px-4 py-3 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                    />
                    <button
                      type="button"
                      onClick={addInvite}
                      className="rounded-xl border border-terrava-primary/30 bg-terrava-light px-5 py-3 text-sm font-semibold text-terrava-primary transition-colors hover:bg-terrava-soft"
                    >
                      Tambah
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {invites.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2 overflow-hidden"
                      >
                        {invites.map((email) => (
                          <motion.li
                            key={email}
                            layout
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between rounded-xl bg-terrava-bg px-3.5 py-2.5 text-sm"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terrava-primary/10 text-[11px] font-bold text-terrava-primary">
                                {email[0].toUpperCase()}
                              </span>
                              <span className="text-terrava-text">{email}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setInvites((prev) => prev.filter((item) => item !== email))}
                              className="text-xs font-semibold text-terrava-muted hover:text-terrava-error"
                            >
                              Hapus
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <div className="mt-6 rounded-2xl border border-terrava-border bg-terrava-bg p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-terrava-muted">Ringkasan</p>
                    <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-terrava-muted">Peternakan</dt>
                        <dd className="font-semibold text-terrava-text">{farmName || "Belum diisi"}</dd>
                      </div>
                      <div>
                        <dt className="text-terrava-muted">Lokasi</dt>
                        <dd className="font-semibold text-terrava-text">{location || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-terrava-muted">Perangkat</dt>
                        <dd className="font-semibold text-terrava-text">{paired ? "1 terhubung" : "Belum terhubung"}</dd>
                      </div>
                    </dl>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between border-t border-terrava-border bg-terrava-bg/60 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1 || finishing}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terrava-muted transition-colors hover:text-terrava-primary disabled:invisible"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali
              </button>

              {step < steps.length ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-terrava-hover"
                >
                  Lanjutkan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  disabled={finishing}
                  className="group inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
                >
                  {finishing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Masuk ke Dashboard
                  {!finishing && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
