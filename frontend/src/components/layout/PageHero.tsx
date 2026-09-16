import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

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
    <section className="relative overflow-hidden bg-terrava-light pb-16 pt-16 sm:pb-20 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-terrava-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/70 blur-3xl" aria-hidden="true" />
      <div className="container relative">
        <div className={`grid gap-12 ${image ? "lg:grid-cols-2 lg:items-center" : ""}`}>
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className={image ? "" : "mx-auto max-w-3xl text-center"}
          >
            {badge && (
              <motion.span
                variants={item}
                className="mb-5 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary shadow-sm"
              >
                {badge}
              </motion.span>
            )}
            <motion.h1
              variants={item}
              className="text-3xl font-bold leading-tight tracking-tight text-terrava-text sm:text-4xl lg:text-5xl"
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p variants={item} className="mt-5 text-base leading-relaxed text-terrava-muted sm:text-lg">
                {description}
              </motion.p>
            )}
            {children && <motion.div variants={item}>{children}</motion.div>}
          </motion.div>
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5"
            >
              <img
                src={image}
                alt={imageAlt ?? title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
