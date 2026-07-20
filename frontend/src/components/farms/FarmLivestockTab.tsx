import type { Farm } from "@/types/dashboard";
import LivestockGridCard from "@/components/livestock/LivestockGridCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { getLivestockByFarm } from "@/data/mockLivestock";

export default function FarmLivestockTab({ farm }: { farm: Farm }) {
  const animals = getLivestockByFarm(farm.id);

  if (animals.length === 0) {
    return <EmptyState title="Belum ada ternak" description="Farm ini belum memiliki data ternak." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animals.map((animal) => (
        <LivestockGridCard key={animal.id} animal={animal} />
      ))}
    </div>
  );
}
