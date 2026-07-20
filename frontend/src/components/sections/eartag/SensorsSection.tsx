import SectionHeading from "@/components/common/SectionHeading";
import { sensorItems } from "@/data/earTag";

export default function SensorsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Key Sensors"
          title="Komponen sensor di dalam smart ear tag"
          description="Setiap sensor bekerja bersama untuk memberikan gambaran menyeluruh terhadap kondisi ternak."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sensorItems.map((sensor) => (
            <div key={sensor.id} className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                <sensor.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{sensor.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{sensor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
