import { useQuery } from "@tanstack/react-query";
import { syncMomentum, getTier, getMomentumLabel, type ComputedDiscipline } from "@/lib/momentum";
import { useTasks } from "./use-tasks";

const FALLBACK: ComputedDiscipline = {
  score: 0,
  momentum: 0,
  multiplier: 1,
  tier: getTier(0),
  momentumLabel: getMomentumLabel(0),
  tierProgress: 0,
  ptsToNextTier: 20,
  nextTierName: "Building",
  isDecaying: false,
};

export function useDiscipline(): ComputedDiscipline {
  const tasks = useTasks();
  const completedCount = tasks.filter((t) => t.done).length;

  const { data = FALLBACK } = useQuery({
    queryKey: ["discipline", tasks.length, completedCount],
    queryFn: () => syncMomentum(tasks),
    staleTime: 0,
  });

  return data;
}
