import { useState } from "react";
import { Layout } from "@/components/layout";
import { GoalModal } from "@/components/goal-modal";
import { useGoals, useRemoveGoal } from "@/hooks/use-goals";
import { useTasks } from "@/hooks/use-tasks";
import { goalProgress, daysLeft } from "@/lib/analytics";
import type { Goal } from "@/lib/analytics";
import { Plus, Target, Pencil, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Goals() {
  const goals = useGoals();
  const tasks = useTasks();
  const removeGoal = useRemoveGoal();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  async function handleDelete(id: string) {
    await removeGoal.mutateAsync(id);
    toast.success("Goal removed");
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Goals</h1>
            <p className="text-sm text-muted-foreground">Define what matters. Measure progress.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            data-testid="button-add-goal"
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
          >
            <Plus className="size-4" /> New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Target className="size-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No goals yet</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Without goals, effort is scattered. Set one goal and let every task serve it.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
            >
              <Plus className="size-4" /> Set Your First Goal
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {goals.map((goal, i) => {
                const { done, pct } = goalProgress(goal, tasks);
                const dl = daysLeft(goal.deadline);
                const completed = pct >= 100;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-3xl border p-5 shadow-card group transition-all ${
                      completed
                        ? "bg-success/6 border-success/25"
                        : "bg-card border-card-border hover:border-border/80"
                    }`}
                    data-testid={`goal-card-${goal.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 size-9 rounded-xl grid place-items-center shrink-0 ${
                          completed ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                        }`}>
                          {completed ? <CheckCircle2 className="size-5" /> : <Target className="size-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {done} / {goal.target} tasks · {pct}% complete
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => setEditing(goal)}
                          data-testid={`edit-goal-${goal.id}`}
                          className="p-1.5 rounded-xl hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          data-testid={`delete-goal-${goal.id}`}
                          className="p-1.5 rounded-xl hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded-full ${completed ? "bg-success" : "bg-gradient-primary"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Near completion nudge */}
                      {pct >= 80 && !completed && (
                        <span className="text-xs text-primary font-semibold animate-pulse">
                          Almost there — {goal.target - done} task{goal.target - done === 1 ? "" : "s"} to go!
                        </span>
                      )}
                      {completed && (
                        <span className="text-xs text-success font-semibold">
                          Goal achieved!
                        </span>
                      )}
                      {dl !== null && !completed && (
                        <span className={`flex items-center gap-1 text-xs ${
                          dl <= 0 ? "text-destructive" : dl <= 3 ? "text-destructive" : dl <= 7 ? "text-warning" : "text-muted-foreground"
                        }`}>
                          {dl <= 3 ? <AlertCircle className="size-3" /> : <Clock className="size-3" />}
                          {dl <= 0 ? "Overdue" : `${dl} day${dl === 1 ? "" : "s"} left`}
                        </span>
                      )}
                      {dl === null && !goal.deadline && (
                        <span className="text-xs text-muted-foreground">No deadline</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: "Active", value: goals.filter((g) => goalProgress(g, tasks).pct < 100).length },
                { label: "Completed", value: goals.filter((g) => goalProgress(g, tasks).pct >= 100).length },
                { label: "Overdue", value: goals.filter((g) => { const dl = daysLeft(g.deadline); return dl !== null && dl < 0 && goalProgress(g, tasks).pct < 100; }).length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-card border border-card-border p-3 text-center">
                  <p className="text-xl font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(showAdd || editing) && (
        <GoalModal onClose={() => { setShowAdd(false); setEditing(null); }} editing={editing} />
      )}
    </Layout>
  );
}
