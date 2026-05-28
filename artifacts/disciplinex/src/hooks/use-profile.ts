import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type Profile = { id: string; name: string | null; created_at: string };
const QKEY = (uid: string) => ["profile", uid];

export function useProfile() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: QKEY(user?.id ?? ""),
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as Profile) ?? null;
    },
    enabled: !!user,
  });
  return { profile: data ?? null, isLoading };
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, name: name.trim() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY(user?.id ?? "") }),
  });
}
