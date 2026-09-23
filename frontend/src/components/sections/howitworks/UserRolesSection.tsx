import SectionHeading from "@/components/common/SectionHeading";
import { userRoles } from "@/data/roles";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function UserRolesSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("howitworks.roles.badge")} title={t("howitworks.roles.title")} />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {userRoles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-terrava-border bg-terrava-bg p-6 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-primary text-white">
                <role.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-terrava-text">{role.title}</h3>
              <p className="text-xs leading-relaxed text-terrava-muted">{tr(role.description)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
