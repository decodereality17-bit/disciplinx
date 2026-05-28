import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Task } from "@/lib/analytics";

const today = () => new Date().toISOString().slice(0, 10);
const QKEY = (uid: string) => ["tasks", uid];

export function useTasks() {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: QKEY(user?.id ?? ""),
    queryFn: async (): Promise<Task[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at_ts", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
  return data;
}

export function useAddTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; subject: string; duration: number; goal_id?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: input.title,
        subject: input.subject,
        duration: input.duration,
        goal_id: input.goal_id ?? null,
        created_at: today(),
        done: false,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}

export function useToggleTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("tasks")
        .update({ done: !done, completed_at: !done ? today() : null })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}

export function useUpdateTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; subject?: string; duration?: number; goal_id?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const { id, ...patch } = input;
      const { error } = await supabase
        .from("tasks")
        .update(patch)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}

export function useRemoveTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}
