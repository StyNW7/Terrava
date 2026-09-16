import SectionHeading from "@/components/common/SectionHeading";
import TestimonialCard from "@/components/cards/TestimonialCard";
import { testimonials } from "@/data/testimonials";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Pilot Stories"
          title="Cerita dari mitra peternak"
          description="Testimoni contoh dari program pilot dan diskusi awal bersama komunitas peternak."
        />

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.12}>
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id} className="h-full">
              <TestimonialCard testimonial={testimonial} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
