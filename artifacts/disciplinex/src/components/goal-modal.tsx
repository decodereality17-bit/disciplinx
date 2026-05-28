import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAddGoal, useUpdateGoal } from "@/hooks/use-goals";
import type { Goal } from "@/lib/analytics";

type Props = {
  onClose: () => void;
  editing?: Goal | null;
};

export function GoalModal({ onClose, editing }: Props) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [target, setTarget] = useState(editing?.target ?? 10);
  const [deadline, setDeadline] = useState(editing?.deadline ?? "");
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();

  async function save() {
    if (!title.trim()) { toast.error("Please enter a goal title"); return; }
    if (target < 1 || target > 9999) { toast.error("Target must be 1–9999 tasks"); return; }

    if (editing) {
      await updateGoal.mutateAsync({
        id: editing.id,
        title: title.trim(),
        target,
        deadline: deadline || null,
      });
      toast.success("Goal updated");
    } else {
      await addGoal.mutateAsync({ title: title.trim(), target, deadline: deadline || undefined });
      toast.success("Goal set — commit to it every single day.");
    }
    onClose();
  }

  const isPending = addGoal.isPending || updateGoal.isPending;
  const minDate = new Date().toISOString().slice(0, 10);

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
              <p className="text-xs text-primary font-semibold uppercase tracking-widest">{editing ? "Edit Goal" : "New Goal"}</p>
              <h2 className="text-lg font-bold">{editing ? "Update goal" : "Set a goal"}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition p-1 rounded-xl hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Goal title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish calculus unit"
                autoFocus
                data-testid="input-goal-title"
                className="w-full rounded-2xl bg-input px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Target (tasks)</label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  data-testid="input-target"
                  className="w-full rounded-2xl bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Deadline (optional)</label>
                <input
                  type="date"
                  value={deadline}
                  min={minDate}
                  onChange={(e) => setDeadline(e.target.value)}
                  data-testid="input-deadline"
                  className="w-full rounded-2xl bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition [color-scheme:dark]"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-xl p-3">
              <span className="font-semibold text-foreground">Pro tip:</span> Link tasks to this goal from the Planner. Each completed linked task counts toward your target.
            </p>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={isPending}
              data-testid="button-save-goal"
              className="flex-1 rounded-2xl bg-gradient-primary py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              {isPending ? "Saving…" : (editing ? "Update" : <><Plus className="size-4" /> Add Goal</>)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
