import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAddTask, useUpdateTask } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import type { Task } from "@/lib/analytics";

const SUBJECTS = ["Math", "Science", "English", "History", "CS", "Physics", "Chemistry", "Biology", "Economics", "General"];

type Props = {
  onClose: () => void;
  editing?: Task | null;
};

export function AddTaskModal({ onClose, editing }: Props) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [subject, setSubject] = useState(editing?.subject ?? "General");
  const [duration, setDuration] = useState(editing?.duration ?? 25);
  const [goalId, setGoalId] = useState(editing?.goal_id ?? "");
  const goals = useGoals();
  const addTask = useAddTask();
  const updateTask = useUpdateTask();

  async function save() {
    if (!title.trim()) { toast.error("Please enter a task title"); return; }
    if (duration < 1 || duration > 480) { toast.error("Duration must be 1–480 minutes"); return; }

    if (editing) {
      await updateTask.mutateAsync({
        id: editing.id,
        title: title.trim(),
        subject,
        duration,
        goal_id: goalId || null,
      });
      toast.success("Task updated");
    } else {
      await addTask.mutateAsync({
        title: title.trim(),
        subject,
        duration,
        goal_id: goalId || undefined,
      });
      toast.success("Task added — let's get it done!");
    }
    onClose();
  }

  const isPending = addTask.isPending || updateTask.isPending;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          className="glass rounded-3xl p-6 w-full max-w-sm shadow-elevated"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest">{editing ? "Edit Task" : "New Task"}</p>
              <h2 className="text-lg font-bold">{editing ? "Update task" : "Add a task"}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition p-1 rounded-xl hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Task title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 problems"
                autoFocus
                data-testid="input-task-title"
                className="w-full rounded-2xl bg-input px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="select-subject"
                  className="w-full rounded-2xl bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Duration (min)</label>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  data-testid="input-duration"
                  className="w-full rounded-2xl bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                />
              </div>
            </div>

            {goals.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Link to goal (optional)</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  data-testid="select-goal"
                  className="w-full rounded-2xl bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                >
                  <option value="">No goal</option>
                  {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={isPending}
              data-testid="button-save-task"
              className="flex-1 rounded-2xl bg-gradient-primary py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              {isPending ? "Saving…" : (editing ? "Update" : <><Plus className="size-4" /> Add</>)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
