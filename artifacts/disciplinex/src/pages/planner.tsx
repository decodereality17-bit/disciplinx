import { useState } from "react";
import { Layout } from "@/components/layout";
import { AddTaskModal } from "@/components/add-task-modal";
import { Celebration } from "@/components/celebration";
import { useTasks, useToggleTask, useRemoveTask } from "@/hooks/use-tasks";
import { todaysTasks } from "@/lib/analytics";
import type { Task } from "@/lib/analytics";
import { Plus, CheckCircle2, Circle, Trash2, Pencil, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const TABS = [
  { label: "Today", key: "today" },
  { label: "All", key: "all" },
];

function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const m = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const k = t.created_at;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(t);
  });
  return new Map([...m.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

function formatDateLabel(s: string) {
  const d = new Date(s + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (s === today) return "Today";
  if (s === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function Planner() {
  const tasks = useTasks();
  const toggle = useToggleTask();
  const remove = useRemoveTask();
  const [tab, setTab] = useState<"today" | "all">("today");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [search, setSearch] = useState("");

  const todayList = todaysTasks(tasks);
  const allFiltered = search
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
    : tasks;
  const displayList = tab === "today" ? todayList : allFiltered;

  async function handleToggle(id: string, done: boolean) {
    await toggle.mutateAsync({ id, done });
    if (!done) setCelebrate(true);
  }

  async function handleDelete(id: string) {
    await remove.mutateAsync(id);
    toast.success("Task removed");
  }

  const grouped = groupByDate(displayList);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planner</h1>
            <p className="text-sm text-muted-foreground">Plan and conquer your day</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            data-testid="button-add-task"
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
          >
            <Plus className="size-4" /> Add Task
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-muted p-1 mb-4 w-fit">
          {TABS.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setTab(key as "today" | "all")}
              data-testid={`tab-${key}`}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                tab === key ? "bg-gradient-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {key === "today" && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${tab === "today" ? "bg-white/20" : "bg-muted-foreground/20"}`}>
                  {todayList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search (all tab) */}
        {tab === "all" && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            data-testid="input-search"
            className="w-full rounded-2xl bg-input px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition mb-4"
          />
        )}

        {/* Empty state */}
        {displayList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <CalendarDays className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-semibold mb-2">
              {tab === "today" ? "No tasks today yet" : search ? "No matching tasks" : "No tasks yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              {tab === "today"
                ? "Champions don't leave their day to chance. Plan it."
                : "Create tasks to track your progress."}
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm text-primary font-medium hover:bg-primary/20 transition"
            >
              <Plus className="size-4" /> Add Task
            </button>
          </motion.div>
        )}

        {/* Task groups */}
        <div className="space-y-6">
          {[...grouped.entries()].map(([date, group]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatDateLabel(date)}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {group.filter((t) => t.done).length}/{group.length} done
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {group.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center gap-3 rounded-2xl p-4 border transition-all group ${
                        task.done
                          ? "bg-success/5 border-success/20"
                          : "bg-card border-card-border hover:border-border/80 shadow-card"
                      }`}
                      data-testid={`task-row-${task.id}`}
                    >
                      <button
                        onClick={() => handleToggle(task.id, task.done)}
                        data-testid={`toggle-${task.id}`}
                        className={`shrink-0 hover:scale-110 transition ${task.done ? "text-success" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {task.done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.subject} · {task.duration} min</p>
                      </div>
                      {task.done && <span className="text-xs text-success font-semibold">+{task.duration * 4} XP</span>}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setEditing(task)}
                          data-testid={`edit-task-${task.id}`}
                          className="p-1.5 rounded-xl hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          data-testid={`delete-task-${task.id}`}
                          className="p-1.5 rounded-xl hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(showAdd || editing) && (
        <AddTaskModal
          onClose={() => { setShowAdd(false); setEditing(null); }}
          editing={editing}
        />
      )}
      <Celebration show={celebrate} onDone={() => setCelebrate(false)} />
    </Layout>
  );
}
