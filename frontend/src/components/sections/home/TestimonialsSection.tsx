import SectionHeading from "@/components/common/SectionHeading";
import TestimonialCard from "@/components/cards/TestimonialCard";
import { testimonials } from "@/data/testimonials";

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Pilot Stories"
          title="Cerita dari mitra peternak"
          description="Testimoni contoh dari program pilot dan diskusi awal bersama komunitas peternak."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
