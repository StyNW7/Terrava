import type { Farm } from "@/types/dashboard";
import LivestockGridCard from "@/components/livestock/LivestockGridCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function FarmLivestockTab({ farm }: { farm: Farm }) {
  const { getLivestockByFarm } = useDataStore();
  const { t } = useLanguage();
  const animals = getLivestockByFarm(farm.id);

  if (animals.length === 0) {
    return <EmptyState title={t("farms.noLivestockTitle")} description={t("farms.noLivestockDescription")} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animals.map((animal) => (
        <LivestockGridCard key={animal.id} animal={animal} />
      ))}
    </div>
  );
}
