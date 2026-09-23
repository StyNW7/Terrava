import { useState } from "react";
import { Loader2, Send, CircleCheck, CircleAlert } from "lucide-react";
import type { ContactFormData, ContactFormErrors } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

const initialData: ContactFormData = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  role: "",
  inquiryType: "",
  farmLocation: "",
  livestockCount: "",
  message: "",
  preferredContact: "email",
  consent: false,
};

/** Canonical inquiry values; the visible label comes from `contactOption.*`. */
const inquiryTypes = [
  "Request Demo",
  "Pilot Project",
  "Partnership",
  "Research Collaboration",
  "Technical Inquiry",
  "General Inquiry",
];

const contactMethods = ["email", "phone", "whatsapp"];

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-terrava-text placeholder:text-terrava-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-terrava-primary/30";

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-terrava-error focus:border-terrava-error" : "border-terrava-border focus:border-terrava-primary"}`;
}

export default function ContactForm() {
  const { t, tt } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>(initialData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: ContactFormErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = t("contact.form.error.fullName");
    if (!formData.email.trim()) {
      nextErrors.email = t("contact.form.error.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = t("contact.form.error.emailInvalid");
    }
    if (!formData.phone.trim()) nextErrors.phone = t("contact.form.error.phone");
    if (!formData.inquiryType) nextErrors.inquiryType = t("contact.form.error.inquiryType");
    if (!formData.message.trim()) nextErrors.message = t("contact.form.error.message");
    if (!formData.consent) nextErrors.consent = t("contact.form.error.consent");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("success");
    setFormData(initialData);
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-10 text-center shadow-card">
        <CircleCheck className="mb-4 h-12 w-12 text-terrava-primary" aria-hidden="true" />
        <h3 className="mb-2 text-xl font-semibold text-terrava-text">{t("contact.form.successTitle")}</h3>
        <p className="max-w-sm text-sm text-terrava-muted">{t("contact.form.successDescription")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-terrava-primary"
        >
          {t("contact.form.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-terrava-border bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            className={fieldClass(!!errors.fullName)}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
              <CircleAlert className="h-3.5 w-3.5" /> {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.email")}
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={fieldClass(!!errors.email)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
              <CircleAlert className="h-3.5 w-3.5" /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={fieldClass(!!errors.phone)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
              <CircleAlert className="h-3.5 w-3.5" /> {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="organization" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.organization")}
          </label>
          <input
            id="organization"
            type="text"
            value={formData.organization}
            onChange={(event) => updateField("organization", event.target.value)}
            className={fieldClass(false)}
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.role")}
          </label>
          <input
            id="role"
            type="text"
            placeholder={t("contact.form.rolePlaceholder")}
            value={formData.role}
            onChange={(event) => updateField("role", event.target.value)}
            className={fieldClass(false)}
          />
        </div>

        <div>
          <label htmlFor="inquiryType" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.inquiryType")}
          </label>
          <select
            id="inquiryType"
            value={formData.inquiryType}
            onChange={(event) => updateField("inquiryType", event.target.value)}
            className={fieldClass(!!errors.inquiryType)}
            aria-invalid={!!errors.inquiryType}
          >
            <option value="">{t("contact.form.inquiryPlaceholder")}</option>
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {tt("contactOption", type)}
              </option>
            ))}
          </select>
          {errors.inquiryType && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
              <CircleAlert className="h-3.5 w-3.5" /> {errors.inquiryType}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="farmLocation" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.farmLocation")}
          </label>
          <input
            id="farmLocation"
            type="text"
            value={formData.farmLocation}
            onChange={(event) => updateField("farmLocation", event.target.value)}
            className={fieldClass(false)}
          />
        </div>

        <div>
          <label htmlFor="livestockCount" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("contact.form.livestockCount")}
          </label>
          <input
            id="livestockCount"
            type="number"
            min={0}
            value={formData.livestockCount}
            onChange={(event) => updateField("livestockCount", event.target.value)}
            className={fieldClass(false)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-terrava-text">
          {t("contact.form.message")}
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(event) => updateField("message", event.target.value)}
          className={fieldClass(!!errors.message)}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
            <CircleAlert className="h-3.5 w-3.5" /> {errors.message}
          </p>
        )}
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">
          {t("contact.form.preferredContact")}
        </span>
        <div className="flex flex-wrap gap-4">
          {contactMethods.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm text-terrava-text">
              <input
                type="radio"
                name="preferredContact"
                value={method}
                checked={formData.preferredContact === method}
                onChange={(event) => updateField("preferredContact", event.target.value)}
                className="h-4 w-4 accent-terrava-primary"
              />
              {t("contact.form.method." + method)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-sm text-terrava-text">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(event) => updateField("consent", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-terrava-primary"
            aria-invalid={!!errors.consent}
          />
          {t("contact.form.consent")}
        </label>
        {errors.consent && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-terrava-error">
            <CircleAlert className="h-3.5 w-3.5" /> {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terrava-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("contact.form.sending")}
          </>
        ) : (
          <>
            {t("contact.form.submit")}
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
