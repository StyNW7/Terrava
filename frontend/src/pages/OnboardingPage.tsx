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
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

const steps = [
  { id: 1, key: "farmProfile", icon: Building2 },
  { id: 2, key: "connectDevice", icon: Radio },
  { id: 3, key: "inviteTeam", icon: Users },
];

const pairingStageKeys = ["searching", "found", "syncing", "calibrating", "ready"];

function StepIndicator({ current }: { current: number }) {
  const { t } = useLanguage();

  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label={t("onboarding.progress")}>
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
                {t("onboarding.step." + step.key)}
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
  const { t } = useLanguage();
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

  const firstName = (user?.name ?? t("auth.defaultRole")).replace(/^(drh\.|dr\.|ir\.)\s*/i, "").split(" ")[0];
  const paired = pairStage >= pairingStageKeys.length - 1;

  const startPairing = () => {
    if (pairing || paired) return;
    setPairing(true);
    setPairStage(0);
    pairingStageKeys.forEach((_, index) => {
      setTimeout(() => {
        setPairStage(index);
        if (index === pairingStageKeys.length - 1) {
          setPairing(false);
          toast.success(t("onboarding.pairingSuccess"));
        }
      }, 650 * (index + 1));
    });
  };

  const addInvite = () => {
    const value = inviteInput.trim().toLowerCase();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error(t("validation.emailFormat"));
      return;
    }
    if (invites.includes(value)) {
      toast.error(t("onboarding.emailAlreadyAdded"));
      return;
    }
    setInvites((prev) => [...prev, value]);
    setInviteInput("");
  };

  const finish = async () => {
    setFinishing(true);
    if (farmName.trim()) updateUser({ farmName: farmName.trim() });
    await new Promise((resolve) => setTimeout(resolve, 900));
    toast.success(
      invites.length > 0 ? t("onboarding.invitesSent", { count: invites.length }) : t("onboarding.workspaceReady")
    );
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
          <div className="flex items-center gap-3">
            <LanguageToggle className="h-9" />
            <ThemeToggle className="h-9 w-9" />
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm font-medium text-terrava-muted transition-colors hover:text-terrava-primary"
            >
              {t("onboarding.skip")}
            </button>
          </div>
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
            {t("onboarding.stepOf", { current: step, total: steps.length })}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-terrava-text sm:text-4xl">
            {t("onboarding.title", { name: firstName })}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-terrava-muted sm:text-base">
            {t("onboarding.subtitle")}
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
                      <h2 className="text-lg font-semibold text-terrava-text">{t("onboarding.step.farmProfile")}</h2>
                      <p className="text-sm text-terrava-muted">{t("onboarding.farmProfileDescription")}</p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("onboarding.farmName")}</span>
                      <input
                        value={farmName}
                        onChange={(event) => setFarmName(event.target.value)}
                        placeholder={t("onboarding.farmNamePlaceholder")}
                        className="w-full rounded-xl border border-terrava-border bg-white px-4 py-3 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("category.location")}</span>
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
                      <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("onboarding.estimatedHerdSize")}</span>
                      <div className="relative">
                        <PawPrint className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terrava-muted" aria-hidden="true" />
                        <select
                          value={livestockCount}
                          onChange={(event) => setLivestockCount(event.target.value)}
                          className="w-full appearance-none rounded-xl border border-terrava-border bg-white py-3 pl-10 pr-4 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                        >
                          <option value="1-10">{t("onboarding.herd.range", { range: "1 - 10" })}</option>
                          <option value="11-50">{t("onboarding.herd.range", { range: "11 - 50" })}</option>
                          <option value="51-100">{t("onboarding.herd.range", { range: "51 - 100" })}</option>
                          <option value="101-500">{t("onboarding.herd.range", { range: "101 - 500" })}</option>
                          <option value="500+">{t("onboarding.herd.moreThan", { count: 500 })}</option>
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
                      <h2 className="text-lg font-semibold text-terrava-text">{t("onboarding.connectTitle")}</h2>
                      <p className="text-sm text-terrava-muted">{t("onboarding.connectDescription")}</p>
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
                        {paired
                          ? t("onboarding.tagConnected", { tag: "TAG-0001" })
                          : pairing
                          ? t("onboarding.connecting")
                          : t("onboarding.noDeviceYet")}
                      </p>
                      <p className="mt-1 text-center text-xs text-terrava-muted">
                        {paired ? t("onboarding.deviceMeta") : t("onboarding.pairingHint")}
                      </p>
                      <button
                        type="button"
                        onClick={startPairing}
                        disabled={pairing || paired}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-60"
                      >
                        {pairing && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {paired ? t("onboarding.stage.ready") : pairing ? t("onboarding.processing") : t("onboarding.startPairing")}
                      </button>
                    </div>

                    <ol className="space-y-2.5">
                      {pairingStageKeys.map((stage, index) => {
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
                            {t("onboarding.stage." + stage)}
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
                      <h2 className="text-lg font-semibold text-terrava-text">{t("onboarding.inviteTitle")}</h2>
                      <p className="text-sm text-terrava-muted">{t("onboarding.inviteDescription")}</p>
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
                      placeholder={t("onboarding.invitePlaceholder")}
                      className="flex-1 rounded-xl border border-terrava-border bg-white px-4 py-3 text-sm text-terrava-text transition-colors focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20"
                    />
                    <button
                      type="button"
                      onClick={addInvite}
                      className="rounded-xl border border-terrava-primary/30 bg-terrava-light px-5 py-3 text-sm font-semibold text-terrava-primary transition-colors hover:bg-terrava-soft"
                    >
                      {t("common.add")}
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
                              {t("common.delete")}
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <div className="mt-6 rounded-2xl border border-terrava-border bg-terrava-bg p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-terrava-muted">{t("onboarding.summary")}</p>
                    <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-terrava-muted">{t("onboarding.summary.farm")}</dt>
                        <dd className="font-semibold text-terrava-text">{farmName || t("onboarding.notFilled")}</dd>
                      </div>
                      <div>
                        <dt className="text-terrava-muted">{t("category.location")}</dt>
                        <dd className="font-semibold text-terrava-text">{location || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-terrava-muted">{t("category.device")}</dt>
                        <dd className="font-semibold text-terrava-text">
                          {paired ? t("onboarding.oneConnected") : t("onboarding.notConnected")}
                        </dd>
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
                {t("common.back")}
              </button>

              {step < steps.length ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-terrava-hover"
                >
                  {t("auth.continue")}
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
                  {t("onboarding.goToDashboard")}
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
