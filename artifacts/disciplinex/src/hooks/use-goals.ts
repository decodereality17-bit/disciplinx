import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Goal } from "@/lib/analytics";

const today = () => new Date().toISOString().slice(0, 10);
const LS_KEY = "dx_goals";
const QKEY = (uid: string) => ["goals", uid];

function getLocalGoals(): Goal[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function setLocalGoals(goals: Goal[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(goals));
}
function newId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function useGoals() {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: QKEY(user?.id ?? ""),
    queryFn: async (): Promise<Goal[]> => {
      if (!user) return [];
      if (!supabaseConfigured || user.id === "local-user") return getLocalGoals();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at_ts", { ascending: false });
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
  return data;
}

export function useAddGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; target: number; deadline?: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (!supabaseConfigured || user.id === "local-user") {
        const goals = getLocalGoals();
        goals.unshift({
          id: newId(),
          title: input.title,
          target: Math.max(1, Math.floor(input.target)),
          deadline: input.deadline ?? null,
          created_at: today(),
        });
        setLocalGoals(goals);
        return;
      }
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: input.title,
        target: Math.max(1, Math.floor(input.target)),
        deadline: input.deadline ?? null,
        created_at: today(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}

export function useUpdateGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; target?: number; deadline?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const { id, ...patch } = input;
      if (patch.target !== undefined) patch.target = Math.max(1, Math.floor(patch.target));
      if (!supabaseConfigured || user.id === "local-user") {
        const goals = getLocalGoals().map((g) => (g.id === id ? { ...g, ...patch } : g));
        setLocalGoals(goals);
        return;
      }
      const { error } = await supabase.from("goals").update(patch).eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}

export function useRemoveGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      if (!supabaseConfigured || user.id === "local-user") {
        setLocalGoals(getLocalGoals().filter((g) => g.id !== id));
        return;
      }
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}
