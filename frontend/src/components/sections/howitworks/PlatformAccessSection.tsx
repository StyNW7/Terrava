import { Monitor, Smartphone, Tablet, BellRing } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";

const channels = [
  { icon: Monitor, label: "Desktop" },
  { icon: Tablet, label: "Tablet" },
  { icon: Smartphone, label: "Mobile" },
  { icon: BellRing, label: "Notification Channels" },
];

export default function PlatformAccessSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Platform Access"
          title="Dapat diakses di mana saja Anda bekerja"
          description="Dashboard Terrava dirancang responsif untuk digunakan pada berbagai perangkat."
        />

        <StaggerGrid className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {channels.map((channel) => (
            <div key={channel.label} className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card">
              <channel.icon className="mb-3 h-7 w-7 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{channel.label}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
