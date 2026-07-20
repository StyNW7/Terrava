import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="bg-terrava-primary py-16 sm:py-20">
      <div className="container max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton
            href={primaryHref}
            className="bg-white text-terrava-primary hover:bg-terrava-light hover:text-terrava-hover"
          >
            {primaryLabel}
          </PrimaryButton>
          {secondaryLabel && secondaryHref && (
            <SecondaryButton
              href={secondaryHref}
              className="border-white/40 bg-transparent text-white hover:border-white hover:text-white"
            >
              {secondaryLabel}
            </SecondaryButton>
          )}
        </div>
      </div>
    </section>
  );
}
