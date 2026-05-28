import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Profile = { id: string; name: string | null; created_at: string };
const LS_KEY = "dx_profile";
const QKEY = ["profile"];

function getLocalProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
    return p ?? { id: "local-user", name: null, created_at: new Date().toISOString() };
  } catch {
    return { id: "local-user", name: null, created_at: new Date().toISOString() };
  }
}
function setLocalProfile(p: Profile) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: QKEY,
    queryFn: (): Profile => getLocalProfile(),
    staleTime: 0,
  });
  return { profile: data ?? null, isLoading };
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const existing = getLocalProfile();
      setLocalProfile({ ...existing, name: name.trim() });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}
