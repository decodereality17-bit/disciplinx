import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal } from "@/lib/analytics";

const today = () => new Date().toISOString().slice(0, 10);
const LS_KEY = "dx_goals";
const QKEY = ["goals"];

function getLocalGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function setLocalGoals(goals: Goal[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(goals));
}
function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useGoals() {
  const { data = [] } = useQuery({
    queryKey: QKEY,
    queryFn: (): Goal[] => getLocalGoals(),
    staleTime: 0,
  });
  return data;
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; target: number; deadline?: string }) => {
      const goals = getLocalGoals();
      goals.unshift({
        id: newId(),
        title: input.title,
        target: Math.max(1, Math.floor(input.target)),
        deadline: input.deadline ?? null,
        created_at: today(),
      });
      setLocalGoals(goals);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; target?: number; deadline?: string | null }) => {
      const { id, ...patch } = input;
      if (patch.target !== undefined) patch.target = Math.max(1, Math.floor(patch.target));
      const goals = getLocalGoals().map((g) => (g.id === id ? { ...g, ...patch } : g));
      setLocalGoals(goals);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}

export function useRemoveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      setLocalGoals(getLocalGoals().filter((g) => g.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}
