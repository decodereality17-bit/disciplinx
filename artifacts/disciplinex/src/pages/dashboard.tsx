import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { ScoreRing } from "@/components/score-ring";
import { InsightCard } from "@/components/insight-card";
import { Heatmap } from "@/components/heatmap";
import { WeeklyReport } from "@/components/weekly-report";
import { DailyCheckin } from "@/components/daily-checkin";
import { Celebration } from "@/components/celebration";
import { AddTaskModal } from "@/components/add-task-modal";
import { AnimatedNumber } from "@/components/animated-number";
import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import { useProfile } from "@/hooks/use-profile";
import { useDiscipline } from "@/hooks/use-momentum";
import { StreakMeter } from "@/components/streak-meter";
import {
  streakDays, totalXP, completionPct, todaysTasks,
  momentum7d, subjectMix, generateInsights, firstName,
  greetingPrefix, daysLeft, goalProgress,
} from "@/lib/analytics";
import type { ComputedDiscipline } from "@/lib/momentum";
import { useGoals } from "@/hooks/use-goals";
import { Link } from "wouter";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartTooltip, XAxis, YAxis,
} from "recharts";
import {
  Plus, Flame, Trophy, CheckCircle2, Circle,
  ChevronRight, Zap, TrendingUp, TrendingDown, ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { getTodayCheckin } from "@/components/daily-checkin";

function useTodayCheckin() {
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => { setDone(!!getTodayCheckin()); }, []);
  return done;
}

function getStatusMessage(
  disc: ComputedDiscipline,
  streak: number,
  hasCompletedToday: boolean
): { msg: string; urgent: boolean } {
  const { score, tier, momentum, isDecaying, multiplier, ptsToNextTier, nextTierName } = disc;

  if (streak > 2 && !hasCompletedToday) {
    return {
      msg: `Your ${streak}-day streak is at risk — complete one task to protect it`,
      urgent: true,
    };
  }
  if (isDecaying && score > 20) {
    return { msg: "Momentum slipping. One strong day can reverse this.", urgent: true };
  }
  if (tier.name === "Mythic") {
    return { msg: "MYTHIC tier — fewer than 0.5% of users reach this. Extraordinary.", urgent: false };
  }
  if (tier.name === "Legendary") {
    return { msg: "Legendary discipline. Protect what you've built — this is rare.", urgent: false };
  }
  if (tier.name === "Elite") {
    return { msg: "Elite tier. Top 10% consistency. Your future self is grateful.", urgent: false };
  }
  if (ptsToNextTier > 0 && ptsToNextTier <= 6) {
    return { msg: `Only ${ptsToNextTier} pts from ${nextTierName}. Push today.`, urgent: false };
  }
  if (momentum >= 70 && score > 25) {
    return { msg: `Momentum at ${multiplier}× — consistency is compounding. Keep the chain.`, urgent: false };
  }
  if (streak >= 7) {
    return { msg: `${streak}-day streak. Your discipline compounds in ways you can't see yet.`, urgent: false };
  }
  if (score < 15 && streak === 0) {
    return { msg: "Every discipline legend started at zero. Add one task to begin.", urgent: false };
  }
  return {
    msg: `${tier.peerLabel} consistency. ${momentum > 25 ? `Momentum multiplier: ${multiplier}×.` : "Build daily momentum to accelerate."}`,
    urgent: false,
  };
}

export default function Dashboard() {
  const tasks = useTasks();
  const goals = useGoals();
  const { profile } = useProfile();
  const toggle = useToggleTask();
  const disc = useDiscipline();

  const name = firstName(profile?.name);
  const streak = streakDays(tasks);
  const xp = totalXP(tasks);
  const pct = completionPct(tasks);
  const todayList = todaysTasks(tasks);
  const m7 = momentum7d(tasks);
  const mix = subjectMix(tasks);
  const insights = generateInsights(tasks, name);
  const checkinDone = useTodayCheckin();

  const hasCompletedToday = todayList.some((t) => t.done);
  const streakAtRisk = streak > 2 && !hasCompletedToday;
  const status = getStatusMessage(disc, streak, hasCompletedToday);

  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (checkinDone !== false) return;
    const t = setTimeout(() => setShowCheckin(true), 800);
    return () => clearTimeout(t);
  }, [checkinDone]);

  async function handleToggle(id: string, done: boolean) {
    await toggle.mutateAsync({ id, done });
    if (!done) setCelebrate(true);
  }

  const nextTierIndex = disc.tier.min < 95 ? disc.ptsToNextTier : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4 animate-fade-in">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="rounded-3xl bg-gradient-hero border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="shrink-0">
            <ScoreRing score={disc.score} tier={disc.tier} size={148} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
              {greetingPrefix()}
            </p>

            {/* Tier badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3 border ${disc.tier.bgClass} ${disc.tier.borderClass} ${disc.tier.textClass}`}>
              <span className="size-1.5 rounded-full bg-current" />
              {disc.tier.name}
              <span className="opacity-50">·</span>
              <span className="opacity-70">{disc.tier.peerLabel}</span>
            </div>

            <h1 className="text-2xl font-bold mb-1.5">
              {disc.score >= 80
                ? `You're elite, ${name}`
                : disc.score >= 50
                ? `Keep pushing, ${name}`
                : `Start strong, ${name}`}
            </h1>

            <p className={`text-sm mb-4 leading-relaxed ${status.urgent ? "text-warning font-medium" : "text-muted-foreground"}`}>
              {status.urgent && <span className="mr-1">⚠</span>}
              {status.msg}
            </p>

            {/* Momentum bar */}
            <div className="mb-4 max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">Momentum</span>
                <span className="text-xs font-semibold flex items-center gap-1">
                  <span className={disc.tier.textClass}>{disc.multiplier.toFixed(1)}×</span>
                  <span className="text-muted-foreground">· {disc.momentumLabel}</span>
                  {disc.isDecaying ? (
                    <TrendingDown className="size-3 text-destructive" />
                  ) : disc.momentum > 20 ? (
                    <TrendingUp className="size-3 text-success" />
                  ) : null}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${disc.tier.ringFrom}, ${disc.tier.ringTo})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${disc.momentum}%` }}
                  transition={{ duration: 1.3, ease: "easeOut" }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowAddTask(true)}
              data-testid="button-add-task-hero"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
            >
              <Plus className="size-4" /> Add Task
            </button>
          </div>
        </section>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.4 }}
            className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
          >
            <div className={`inline-flex size-8 rounded-xl items-center justify-center mb-2 ${streakAtRisk ? "text-warning bg-warning/10" : "text-orange-400 bg-orange-400/10"}`}>
              <Flame className="size-4" />
            </div>
            <p className="text-xl font-bold tabular-nums">
              <AnimatedNumber value={streak} />d
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
            {streakAtRisk && (
              <p className="text-[10px] text-warning mt-0.5 font-medium">At risk</p>
            )}
            {hasCompletedToday && streak > 0 && (
              <p className="text-[10px] text-success mt-0.5 font-medium flex items-center gap-1">
                <ShieldCheck className="size-2.5" /> Protected
              </p>
            )}
          </motion.div>

          {/* Momentum multiplier */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.4 }}
            className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
          >
            <div className={`inline-flex size-8 rounded-xl items-center justify-center mb-2 ${disc.tier.bgClass} ${disc.tier.textClass}`}>
              <Zap className="size-4" />
            </div>
            <p className={`text-xl font-bold tabular-nums ${disc.tier.textClass}`}>
              {disc.multiplier.toFixed(1)}×
            </p>
            <p className="text-xs text-muted-foreground">Multiplier</p>
            <p className={`text-[10px] mt-0.5 ${disc.tier.textClass} opacity-70`}>{disc.momentumLabel}</p>
          </motion.div>

          {/* Done today */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4 }}
            className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
          >
            <div className="inline-flex size-8 rounded-xl items-center justify-center mb-2 text-success bg-success/10">
              <CheckCircle2 className="size-4" />
            </div>
            <p className="text-xl font-bold tabular-nums">
              <AnimatedNumber value={todayList.filter((t) => t.done).length} />
              <span className="text-muted-foreground text-sm">/{todayList.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">Done Today</p>
            {pct === 100 && todayList.length > 0 && (
              <p className="text-[10px] text-success mt-0.5 font-medium">Perfect day!</p>
            )}
          </motion.div>

          {/* XP */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21, duration: 0.4 }}
            className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
          >
            <div className="inline-flex size-8 rounded-xl items-center justify-center mb-2 text-chart-4 bg-chart-4/10">
              <Trophy className="size-4" />
            </div>
            <p className="text-xl font-bold tabular-nums">
              <AnimatedNumber value={xp} />
            </p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </motion.div>
        </div>

        {/* ── Streak meter ─────────────────────────────────────────── */}
        <StreakMeter tasks={tasks} />

        {/* ── Tier progress bar ────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-card-border px-5 py-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${disc.tier.textClass}`}>{disc.tier.name}</span>
              <span className="text-xs text-muted-foreground">· score {disc.score}</span>
            </div>
            {nextTierIndex > 0 ? (
              <span className="text-xs text-muted-foreground">
                {disc.ptsToNextTier} pts to{" "}
                <span className="font-semibold text-foreground">{disc.nextTierName}</span>
              </span>
            ) : (
              <span className="text-xs text-success font-medium">Maximum tier</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${disc.tier.ringFrom}, ${disc.tier.ringTo})` }}
              initial={{ width: 0 }}
              animate={{ width: `${disc.tierProgress}%` }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
            />
          </div>
        </div>

        {/* ── Today's tasks + subject mix ──────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-card-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Today's Tasks</h2>
              <Link href="/planner" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="size-3" />
              </Link>
            </div>

            {todayList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">No tasks yet. Champions plan their day.</p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary font-medium hover:bg-primary/20 transition"
                >
                  <Plus className="size-3.5" /> Add first task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayList.slice(0, 5).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className={`flex items-center gap-3 rounded-2xl p-3 border transition-all ${
                      task.done
                        ? "bg-success/6 border-success/20 opacity-80"
                        : "bg-muted/40 border-border hover:border-border/80"
                    }`}
                    data-testid={`task-card-${task.id}`}
                  >
                    <button
                      onClick={() => handleToggle(task.id, task.done)}
                      data-testid={`toggle-task-${task.id}`}
                      className="shrink-0 text-success hover:scale-110 transition"
                    >
                      {task.done ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.done ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.subject} · {task.duration}m</p>
                    </div>
                    {task.done && (
                      <span className="text-xs text-success font-semibold shrink-0">+{task.duration * 4} XP</span>
                    )}
                  </motion.div>
                ))}
                {todayList.length > 5 && (
                  <Link href="/planner" className="block text-center text-xs text-muted-foreground hover:text-primary transition py-1">
                    +{todayList.length - 5} more
                  </Link>
                )}
              </div>
            )}

            {todayList.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Today's completion</span>
                  <span className="text-foreground font-semibold">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                {pct >= 80 && pct < 100 && (
                  <p className="text-xs text-primary mt-1.5 font-medium">So close — finish strong!</p>
                )}
                {pct === 100 && (
                  <p className="text-xs text-success mt-1.5 font-semibold">100% — momentum is compounding.</p>
                )}
              </div>
            )}
          </div>

          {/* Subject mix */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
            <h2 className="font-semibold mb-3">Subject Mix</h2>
            {mix.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={mix} cx="50%" cy="50%" innerRadius={30} outerRadius={54} paddingAngle={2} dataKey="value">
                      {mix.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <RechartTooltip
                      formatter={(v: number, n: string) => [`${v}%`, n]}
                      contentStyle={{ background: "hsl(240 10% 7%)", border: "1px solid hsl(240 8% 13%)", borderRadius: "12px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {mix.slice(0, 4).map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <div className="size-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-muted-foreground flex-1 truncate">{s.name}</span>
                      <span className="font-semibold tabular-nums">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── 7-day momentum chart ─────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-4">7-Day Momentum</h2>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={m7} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(258 52% 68%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(258 52% 68%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
              <RechartTooltip
                formatter={(v: number) => [`${v}%`, "Score"]}
                contentStyle={{ background: "hsl(240 10% 7%)", border: "1px solid hsl(240 8% 13%)", borderRadius: "12px", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(258 52% 68%)" strokeWidth={1.5} fill="url(#areaGrad)" dot={{ fill: "hsl(258 52% 68%)", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <WeeklyReport tasks={tasks} name={name} />

          {/* Goals preview */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Active Goals</h2>
              <Link href="/goals" className="text-xs text-primary hover:underline flex items-center gap-1">
                Manage <ChevronRight className="size-3" />
              </Link>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-3">No goals set. Define your purpose.</p>
                <Link href="/goals" className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary font-medium hover:bg-primary/20 transition">
                  <Plus className="size-3.5" /> Add goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const { pct: gpct } = goalProgress(g, tasks);
                  const dl = daysLeft(g.deadline);
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{g.title}</p>
                        {dl !== null && (
                          <span className={`text-[10px] font-semibold shrink-0 ${dl <= 3 ? "text-destructive" : dl <= 7 ? "text-warning" : "text-muted-foreground"}`}>
                            {dl}d left
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${gpct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{gpct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Insights ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">AI Insights</h2>
            <Link href="/insights" className="text-xs text-primary hover:underline flex items-center gap-1">
              Full report <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.slice(0, 2).map((ins, i) => (
              <InsightCard key={i} title={ins.title} body={ins.body} tone={ins.tone} index={i} />
            ))}
          </div>
        </div>

        {/* ── Activity Heatmap ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-4">Activity Heatmap</h2>
          <Heatmap tasks={tasks} />
        </div>
      </div>

      {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} />}
      {showCheckin && <DailyCheckin onClose={() => setShowCheckin(false)} />}
      <Celebration show={celebrate} onDone={() => setCelebrate(false)} />
    </Layout>
  );
}
