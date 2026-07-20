import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { images } from "@/data/images";

const contactDetails = [
  { icon: Mail, label: "Email", value: "hello@terrava.id" },
  { icon: Phone, label: "Phone", value: "+62 21 5000 1234" },
  { icon: MapPin, label: "Office Location", value: "Jakarta, Indonesia" },
  { icon: Clock, label: "Business Hours", value: "Senin - Jumat, 09.00 - 17.00 WIB" },
];

export default function ContactInfoSection() {
  return (
    <section className="bg-white pb-20 sm:pb-28">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <div className="lg:col-span-2">
          <div className="mb-6 overflow-hidden rounded-2xl">
            <img
              src={images.contactLocation}
              alt="Lokasi kantor dan kawasan peternakan mitra Terrava"
              loading="lazy"
              className="h-48 w-full object-cover"
            />
          </div>

          <div className="rounded-2xl border border-terrava-border bg-terrava-bg p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-terrava-muted">
              Contact Information
            </h3>
            <ul className="space-y-4">
              {contactDetails.map((detail) => (
                <li key={detail.label} className="flex items-start gap-3">
                  <detail.icon className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-terrava-muted">{detail.label}</p>
                    <p className="text-sm font-medium text-terrava-text">{detail.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
