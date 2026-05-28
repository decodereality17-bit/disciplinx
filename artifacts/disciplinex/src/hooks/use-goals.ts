import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Goal } from "@/lib/analytics";

const today = () => new Date().toISOString().slice(0, 10);
const QKEY = (uid: string) => ["goals", uid];

export function useGoals() {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: QKEY(user?.id ?? ""),
    queryFn: async (): Promise<Goal[]> => {
      if (!user) return [];
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
      const { error } = await supabase
        .from("goals")
        .update(patch)
        .eq("id", id)
        .eq("user_id", user.id);
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
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}
