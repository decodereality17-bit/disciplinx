import { useState } from "react";
import { Layout } from "@/components/layout";
import { ScoreRing } from "@/components/score-ring";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/lib/auth";
import { useGoals } from "@/hooks/use-goals";
import { goalProgress } from "@/lib/analytics";
import {
  disciplineScore, streakDays, totalXP, todaysTasks,
  initials, firstName,
} from "@/lib/analytics";
import { toast } from "sonner";
import { Pencil, Check, X, LogOut, Trophy, Flame, Target, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  { id: "first_task", icon: "🎯", label: "First Task", desc: "Complete your first task", req: (tasks: ReturnType<typeof useTasks>) => tasks.some((t) => t.done) },
  { id: "streak_3", icon: "🔥", label: "On Fire", desc: "3-day streak", req: (_t: ReturnType<typeof useTasks>, streak: number) => streak >= 3 },
  { id: "streak_7", icon: "⚡", label: "Lightning", desc: "7-day streak", req: (_t: ReturnType<typeof useTasks>, streak: number) => streak >= 7 },
  { id: "xp_100", icon: "💎", label: "Centurion", desc: "Earn 100+ XP", req: (tasks: ReturnType<typeof useTasks>) => tasks.filter((t) => t.done).reduce((a, t) => a + t.duration * 4, 0) >= 100 },
  { id: "xp_500", icon: "🏆", label: "Champion", desc: "Earn 500+ XP", req: (tasks: ReturnType<typeof useTasks>) => tasks.filter((t) => t.done).reduce((a, t) => a + t.duration * 4, 0) >= 500 },
  { id: "tasks_10", icon: "📚", label: "Scholar", desc: "10 tasks done", req: (tasks: ReturnType<typeof useTasks>) => tasks.filter((t) => t.done).length >= 10 },
  { id: "tasks_50", icon: "🎓", label: "Graduate", desc: "50 tasks done", req: (tasks: ReturnType<typeof useTasks>) => tasks.filter((t) => t.done).length >= 50 },
  { id: "score_80", icon: "🌟", label: "Elite", desc: "Score 80+", req: (_t: ReturnType<typeof useTasks>, _s: number, score: number) => score >= 80 },
];

export default function Profile() {
  const tasks = useTasks();
  const goals = useGoals();
  const { profile, isLoading } = useProfile();
  const { signOut, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const score = disciplineScore(tasks);
  const streak = streakDays(tasks);
  const xp = totalXP(tasks);
  const todayDone = todaysTasks(tasks).filter((t) => t.done).length;
  const totalDone = tasks.filter((t) => t.done).length;
  const totalMins = tasks.filter((t) => t.done).reduce((a, t) => a + t.duration, 0);
  const completedGoals = goals.filter((g) => goalProgress(g, tasks).pct >= 100).length;
  const name = firstName(profile?.name);
  const ini = initials(profile?.name);

  function startEdit() {
    setNameInput(profile?.name ?? "");
    setEditing(true);
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) { toast.error("Name cannot be empty"); return; }
    await updateProfile.mutateAsync(trimmed);
    toast.success("Name updated");
    setEditing(false);
  }

  const statsGrid = [
    { icon: Zap, label: "Score", value: score, suffix: "", color: "text-primary" },
    { icon: Flame, label: "Streak", value: streak, suffix: "d", color: "text-orange-400" },
    { icon: Trophy, label: "Total XP", value: xp, suffix: "", color: "text-chart-4" },
    { icon: Target, label: "Goals Done", value: completedGoals, suffix: "", color: "text-success" },
    { icon: Clock, label: "Hours", value: Math.round(totalMins / 60), suffix: "h", color: "text-accent" },
    { icon: Trophy, label: "Tasks Done", value: totalDone, suffix: "", color: "text-chart-3" },
  ];

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.req(tasks, streak, score));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.req(tasks, streak, score));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="size-8 rounded-2xl bg-gradient-primary animate-pulse-glow" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Avatar + info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-hero border border-primary/20 p-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="size-20 rounded-3xl bg-gradient-primary grid place-items-center text-2xl font-bold text-white shadow-glow shrink-0">
              {ini}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                    data-testid="input-edit-name"
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false); }}
                    className="rounded-xl bg-input px-3 py-1.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition w-40"
                  />
                  <button onClick={saveName} data-testid="button-save-name" className="p-1.5 rounded-xl bg-success/20 text-success hover:bg-success/30 transition">
                    <Check className="size-4" />
                  </button>
                  <button onClick={() => setEditing(false)} className="p-1.5 rounded-xl hover:bg-muted transition text-muted-foreground">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <h2 className="text-xl font-bold">{profile?.name ?? "Disciplined User"}</h2>
                  <button onClick={startEdit} data-testid="button-edit-name" className="text-muted-foreground hover:text-foreground transition p-1 rounded-xl hover:bg-muted">
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile?.created_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <ScoreRing score={score} size={90} label="score" />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statsGrid.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-card border border-card-border p-4 shadow-card text-center"
            >
              <Icon className={`size-4 mx-auto mb-1.5 ${color}`} />
              <p className="text-xl font-bold tabular-nums">{value}{suffix}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-4">Achievements</h2>
          {unlockedAchievements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-success font-semibold uppercase tracking-wider mb-3">Unlocked ({unlockedAchievements.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {unlockedAchievements.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl bg-success/8 border border-success/20 p-3 text-center"
                    data-testid={`achievement-${a.id}`}
                  >
                    <div className="text-2xl mb-1">{a.icon}</div>
                    <p className="text-xs font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {lockedAchievements.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Locked ({lockedAchievements.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {lockedAchievements.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-muted/50 border border-border p-3 text-center opacity-50">
                    <div className="text-2xl mb-1 grayscale">{a.icon}</div>
                    <p className="text-xs font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {unlockedAchievements.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Complete tasks to unlock achievements!</p>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          data-testid="button-signout-profile"
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/8 py-3 text-sm font-medium text-destructive hover:bg-destructive/15 transition"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </Layout>
  );
}
