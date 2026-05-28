import { useState } from "react";
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
import {
  disciplineScore, streakDays, totalXP, completionPct,
  todaysTasks, momentum7d, subjectMix, generateInsights,
  firstName, greetingPrefix, daysLeft,
} from "@/lib/analytics";
import { useGoals } from "@/hooks/use-goals";
import { goalProgress } from "@/lib/analytics";
import { Link } from "wouter";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartTooltip, XAxis, YAxis,
} from "recharts";
import { Plus, Flame, Trophy, Clock, CheckCircle2, Circle, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { getTodayCheckin } from "@/components/daily-checkin";

function useTodayCheckin() {
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => {
    setDone(!!getTodayCheckin());
  }, []);
  return done;
}

export default function Dashboard() {
  const tasks = useTasks();
  const goals = useGoals();
  const { profile } = useProfile();
  const toggle = useToggleTask();
  const name = firstName(profile?.name);
  const score = disciplineScore(tasks);
  const streak = streakDays(tasks);
  const xp = totalXP(tasks);
  const pct = completionPct(tasks);
  const todayList = todaysTasks(tasks);
  const m7 = momentum7d(tasks);
  const mix = subjectMix(tasks);
  const insights = generateInsights(tasks, name);
  const checkinDone = useTodayCheckin();

  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (checkinDone === false) {
      const timer = setTimeout(() => setShowCheckin(true), 800);
      return () => clearTimeout(timer);
    }
  }, [checkinDone]);

  async function handleToggle(id: string, done: boolean) {
    await toggle.mutateAsync({ id, done });
    if (!done) setCelebrate(true);
  }

  const statCards = [
    { icon: Flame, label: "Streak", value: streak, suffix: "d", color: "text-orange-400 bg-orange-400/10" },
    { icon: Trophy, label: "Total XP", value: xp, suffix: "", color: "text-chart-4 bg-chart-4/10" },
    { icon: Clock, label: "Done Today", value: todayList.filter((t) => t.done).length, suffix: `/${todayList.length}`, color: "text-success bg-success/10" },
    { icon: Zap, label: "Momentum", value: pct, suffix: "%", color: "text-primary bg-primary/10" },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-hero border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <ScoreRing score={score} size={130} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">{greetingPrefix()}</p>
            <h1 className="text-2xl font-bold mb-1">
              {score >= 80
                ? `You're on fire, ${name}`
                : score >= 50
                ? `Keep pushing, ${name}`
                : `Start strong, ${name}`}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              {score >= 80
                ? "Top 5% discipline. Your future self is proud."
                : score >= 50
                ? "You're in motion. Every task compounds."
                : "One completed task changes your trajectory."}
            </p>
            <button
              onClick={() => setShowAddTask(true)}
              data-testid="button-add-task-hero"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
            >
              <Plus className="size-4" /> Add Task
            </button>
          </div>
        </section>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
            >
              <div className={`inline-flex size-8 rounded-xl items-center justify-center mb-2 ${color}`}>
                <Icon className="size-4" />
              </div>
              <p className="text-xl font-bold tabular-nums">
                <AnimatedNumber value={value} />{suffix}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Today's tasks */}
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

            {/* Completion bar */}
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
                  <p className="text-xs text-success mt-1.5 font-semibold">100% complete. Legendary.</p>
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
                      contentStyle={{ background: "hsl(262 16% 15%)", border: "1px solid hsl(262 18% 22%)", borderRadius: "12px", fontSize: "11px" }}
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

        {/* 7-day momentum */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-4">7-Day Momentum</h2>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={m7} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(290 65% 62%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(290 65% 62%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(262 8% 57%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(262 8% 57%)" }} axisLine={false} tickLine={false} />
              <RechartTooltip
                formatter={(v: number) => [`${v}%`, "Score"]}
                contentStyle={{ background: "hsl(262 16% 15%)", border: "1px solid hsl(262 18% 22%)", borderRadius: "12px", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(290 65% 62%)" strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: "hsl(290 65% 62%)", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Weekly report */}
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

        {/* Insights */}
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

        {/* Heatmap */}
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
