import type { ReactNode } from "react";

interface PageHeroProps {
  badge?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  image?: string;
  imageAlt?: string;
}

export default function PageHero({ badge, title, description, children, image, imageAlt }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-terrava-light pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="container">
        <div className={`grid gap-12 ${image ? "lg:grid-cols-2 lg:items-center" : ""}`}>
          <div className={image ? "" : "mx-auto max-w-3xl text-center"}>
            {badge && (
              <span className="mb-5 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary shadow-sm">
                {badge}
              </span>
            )}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-terrava-text sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-5 text-base leading-relaxed text-terrava-muted sm:text-lg">
                {description}
              </p>
            )}
            {children}
          </div>
          {image && (
            <div className="overflow-hidden rounded-3xl shadow-soft">
              <img
                src={image}
                alt={imageAlt ?? title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
