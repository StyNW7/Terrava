const partners = [
  "Microsoft Azure",
  "BINUS University",
  "Livestock Cooperatives",
  "Government Partners",
  "Livestock Communities",
];

export default function TrustedBySection() {
  return (
    <section className="border-y border-terrava-border bg-white py-10">
      <div className="container">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wide text-terrava-muted">
          Trusted and supported by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 grayscale">
          {partners.map((partner) => (
            <span key={partner} className="text-sm font-semibold text-terrava-muted/70">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
