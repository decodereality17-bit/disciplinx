import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/lib/analytics";

const today = () => new Date().toISOString().slice(0, 10);
const LS_KEY = "dx_tasks";
const QKEY = ["tasks"];

function getLocalTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function setLocalTasks(tasks: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}
function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useTasks() {
  const { data = [] } = useQuery({
    queryKey: QKEY,
    queryFn: (): Task[] => getLocalTasks(),
    staleTime: 0,
  });
  return data;
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; subject: string; duration: number; goal_id?: string }) => {
      const tasks = getLocalTasks();
      tasks.unshift({
        id: newId(),
        title: input.title,
        subject: input.subject,
        duration: input.duration,
        created_at: today(),
        completed_at: null,
        done: false,
        goal_id: input.goal_id ?? null,
      });
      setLocalTasks(tasks);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const tasks = getLocalTasks().map((t) =>
        t.id === id ? { ...t, done: !done, completed_at: !done ? today() : null } : t,
      );
      setLocalTasks(tasks);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; subject?: string; duration?: number; goal_id?: string | null }) => {
      const { id, ...patch } = input;
      const tasks = getLocalTasks().map((t) => (t.id === id ? { ...t, ...patch } : t));
      setLocalTasks(tasks);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}

export function useRemoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      setLocalTasks(getLocalTasks().filter((t) => t.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QKEY }),
  });
}
