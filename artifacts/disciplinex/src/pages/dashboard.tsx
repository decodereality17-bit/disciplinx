import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { AddTaskModal } from "@/components/add-task-modal";
import { DailyCheckin } from "@/components/daily-checkin";
import { Celebration } from "@/components/celebration";
import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import { useProfile } from "@/hooks/use-profile";
import { useDiscipline } from "@/hooks/use-momentum";
import { useGoals } from "@/hooks/use-goals";
import {
  streakDays, totalXP, completionPct, todaysTasks,
  momentum7d, subjectMix, generateInsights, firstName,
  goalProgress, daysLeft,
} from "@/lib/analytics";
import { getTodayCheckin } from "@/components/daily-checkin";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, ChevronRight, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

function useClock() {
  const fmt = () => new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" });
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 5000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useTodayCheckin() {
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => { setDone(!!getTodayCheckin()); }, []);
  return done;
}

const SUBJECT_COLORS = [
  "#10b981", "#f59e0b", "#8b5cf6", "#3b82f6", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16",
];

export default function Dashboard() {
  const tasks = useTasks();
  const goals = useGoals();
  const { profile } = useProfile();
  const toggle = useToggleTask();
  const disc = useDiscipline();
  const clock = useClock();
  const checkinDone = useTodayCheckin();

  const name = firstName(profile?.name);
  const streak = streakDays(tasks);
  const xp = totalXP(tasks);
  const pct = completionPct(tasks);
  const todayList = todaysTasks(tasks);
  const m7 = momentum7d(tasks);
  const mix = subjectMix(tasks);
  const insights = generateInsights(tasks, name);

  const doneToday = todayList.filter((t) => t.done).length;
  const hasCompletedToday = doneToday > 0;
  const streakAtRisk = streak > 2 && !hasCompletedToday;

  const [showAddTask, setShowAddTask] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
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

  const circumference = 2 * Math.PI * 45;
  const ringOffset = circumference * (1 - Math.max(0, Math.min(100, disc.score)) / 100);

  const streak14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return tasks.some((t) => t.completed_at === k);
  });

  const subjectsWithColor = mix.map((s, i) => ({ ...s, hex: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }));

  const tierColor = disc.tier.name === "Mythic" || disc.tier.name === "Legendary" ? "#f59e0b"
    : disc.tier.name === "Elite" ? "#8b5cf6"
    : "#10b981";

  return (
    <Layout>
      {/* Terminal background overlay */}
      <div className="absolute inset-0 bg-[#080b10] -z-10" />

      <div
        className="flex flex-col h-full min-h-screen text-gray-300"
        style={{ fontFamily: "'Space Grotesk', monospace" }}
      >
        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <header className="cc-panel flex items-center justify-between px-4 py-2.5 mx-3 mt-3 rounded-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wider cc-text-glow" style={{ color: tierColor }}>
              DISCIPLINEX
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded border uppercase"
              style={{ color: tierColor, borderColor: `${tierColor}40`, background: `${tierColor}10` }}
            >
              SYS.ONLINE
            </span>
          </div>

          <div className="hidden sm:block text-center">
            <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
              {disc.tier.name.toUpperCase()} — DAY {streak} — SESSION ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="text-right hidden md:block">
              <div className="text-gray-500 text-[9px] uppercase">XP Total</div>
              <div className="cc-text-glow" style={{ color: tierColor }}>{xp.toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-[9px] uppercase">SYS TIME</div>
              <div className="text-gray-300">{clock}</div>
            </div>
          </div>
        </header>

        {/* ── 4-COLUMN GRID ───────────────────────────────────────── */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 px-3 pt-3 min-h-0 overflow-y-auto xl:overflow-hidden">

          {/* ── COL 1: Score + Tier ─────────────────────────────── */}
          <section className="cc-panel rounded-md p-4 flex flex-col items-center justify-center relative">
            <div className="absolute top-2 left-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              SYS.STATUS
            </div>

            {/* Score Ring */}
            <div className="relative w-40 h-40 mt-4 mb-4 cc-ring-glow">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="5" />
                <motion.circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke={tierColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono font-bold text-white cc-text-glow">{disc.score}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Score</span>
              </div>
            </div>

            {/* Tier badge */}
            <div
              className="px-3 py-1 rounded text-xs uppercase tracking-wider font-bold mb-4 border"
              style={{ color: tierColor, borderColor: `${tierColor}40`, background: `${tierColor}10` }}
            >
              Rank: {disc.tier.name}
            </div>

            {/* Momentum multiplier */}
            <div className="w-full">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono">Momentum</span>
                <span className="font-mono text-amber-400 text-sm font-bold">{disc.multiplier.toFixed(1)}×</span>
              </div>

              {/* Tier progress */}
              <div className="mt-3">
                <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1 uppercase">
                  <span>Next {disc.nextTierName}</span>
                  <span>{disc.tierProgress}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: tierColor, boxShadow: `0 0 6px ${tierColor}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${disc.tierProgress}%` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Peer label */}
              <p className="text-[9px] text-gray-500 font-mono uppercase text-center mt-3 tracking-widest">
                {disc.tier.peerLabel}
              </p>
            </div>
          </section>

          {/* ── COL 2: Daily Tasks ──────────────────────────────── */}
          <section className="cc-panel rounded-md p-4 flex flex-col relative">
            <div
              className="absolute top-0 right-0 text-[9px] font-mono px-2 py-0.5 border-l border-b rounded-bl"
              style={{ color: tierColor, borderColor: `${tierColor}30`, background: `${tierColor}10` }}
            >
              {doneToday}/{todayList.length} COMPLETE
            </div>

            <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">
              Daily Operations
            </h2>

            {/* Completion bar */}
            {todayList.length > 0 && (
              <div className="mb-3">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: tierColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                {pct >= 80 && pct < 100 && (
                  <p className="text-[9px] mt-1 font-mono" style={{ color: tierColor }}>
                    {100 - pct}% remaining — finish strong
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {todayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <p className="text-gray-500 text-xs font-mono mb-3">NO TASKS QUEUED</p>
                  <p className="text-gray-600 text-[10px] font-mono">Champions plan their day.</p>
                </div>
              ) : (
                todayList.slice(0, 7).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="flex items-center gap-2.5 p-2 border rounded cursor-pointer group"
                    style={{
                      background: task.done ? `${tierColor}08` : "rgba(31,41,55,0.3)",
                      borderColor: task.done ? `${tierColor}30` : "rgba(75,85,99,0.4)",
                    }}
                    onClick={() => handleToggle(task.id, task.done)}
                  >
                    <div
                      className="shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center"
                      style={{
                        background: task.done ? tierColor : "transparent",
                        borderColor: task.done ? tierColor : "#4b5563",
                      }}
                    >
                      {task.done && (
                        <svg className="w-3 h-3 text-[#080b10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs truncate ${task.done ? "line-through text-gray-500" : "text-gray-300"}`}>
                        {task.title}
                      </div>
                      <div className="text-[9px] text-gray-600 uppercase font-mono">
                        {task.subject} · {task.duration}m
                      </div>
                    </div>
                    <div
                      className="font-mono text-[9px] shrink-0"
                      style={{ color: task.done ? tierColor : "#4b5563" }}
                    >
                      +{task.duration * 4}xp
                    </div>
                  </motion.div>
                ))
              )}
              {todayList.length > 7 && (
                <Link href="/planner" className="block text-center text-[9px] text-gray-500 font-mono hover:text-gray-400 py-1 uppercase tracking-widest">
                  +{todayList.length - 7} more ops
                </Link>
              )}
            </div>

            <button
              onClick={() => setShowAddTask(true)}
              className="mt-3 w-full py-2 border rounded text-[10px] uppercase tracking-widest font-mono transition-colors flex items-center justify-center gap-1.5 hover:bg-gray-800/50"
              style={{ borderColor: "#374151", color: "#6b7280" }}
            >
              <Plus className="size-3" /> Add Task
            </button>
          </section>

          {/* ── COL 3: Momentum + Subjects ──────────────────────── */}
          <section className="flex flex-col gap-3">
            {/* 7D Momentum sparkline */}
            <div className="cc-panel rounded-md p-4 flex-1 flex flex-col">
              <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">
                7D Momentum
              </h2>

              <div className="flex-1 min-h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m7} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <defs>
                      <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tierColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={tierColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#4b5563", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                    <RechartTooltip
                      formatter={(v: number) => [`${v}%`, "Score"]}
                      contentStyle={{ background: "#0a0e14", border: `1px solid ${tierColor}30`, borderRadius: "4px", fontSize: "10px", fontFamily: "monospace" }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Area
                      type="monotone" dataKey="score"
                      stroke={tierColor} strokeWidth={1.5}
                      fill="url(#ccGrad)"
                      dot={{ fill: tierColor, r: 2, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 14-day streak dots */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800">
                <span className="text-[9px] text-gray-500 font-mono uppercase">14D Chain</span>
                <div className="flex gap-1">
                  {streak14.map((active, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-3 rounded-sm"
                      style={{
                        background: active ? tierColor : "#1f2937",
                        boxShadow: active ? `0 0 4px ${tierColor}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Subject distribution */}
            <div className="cc-panel rounded-md p-4 flex-1">
              <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">
                Subject Load
              </h2>
              {subjectsWithColor.length === 0 ? (
                <p className="text-[10px] text-gray-600 font-mono uppercase">No data yet</p>
              ) : (
                <div className="space-y-2.5">
                  {subjectsWithColor.slice(0, 5).map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-[9px] mb-1 font-mono">
                        <span className="text-gray-400 uppercase">{s.name}</span>
                        <span className="text-gray-500">{s.value}%</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.value}%`, background: s.hex }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── COL 4: Goals + Insights ─────────────────────────── */}
          <section className="flex flex-col gap-3">
            {/* Active goals */}
            <div className="cc-panel rounded-md p-4 flex-[2] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  Active Goals
                </h2>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: tierColor }}>{goals.length}</span>
                  <Link href="/goals" className="text-[9px] text-gray-500 hover:text-gray-400 font-mono uppercase">
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {goals.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[10px] text-gray-600 font-mono uppercase mb-2">No objectives set</p>
                    <Link href="/goals" className="text-[9px] font-mono uppercase tracking-widest" style={{ color: tierColor }}>
                      + Define mission
                    </Link>
                  </div>
                ) : (
                  goals.slice(0, 4).map((g) => {
                    const { pct: gpct } = goalProgress(g, tasks);
                    const dl = daysLeft(g.deadline);
                    return (
                      <div
                        key={g.id}
                        className="border rounded p-2.5"
                        style={{ borderColor: "#374151", background: "rgba(31,41,55,0.2)" }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-xs text-gray-300 truncate pr-2">{g.title}</p>
                          <span
                            className="font-mono text-[9px] shrink-0"
                            style={{ color: tierColor }}
                          >
                            {gpct}%
                          </span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: tierColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${gpct}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        {dl !== null && (
                          <p
                            className="text-[9px] font-mono mt-1 uppercase"
                            style={{ color: dl <= 3 ? "#ef4444" : dl <= 7 ? "#f59e0b" : "#4b5563" }}
                          >
                            {dl > 0 ? `${dl}d remaining` : "deadline passed"}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* System insights */}
            <div
              className="cc-panel rounded-md p-4 flex-1"
              style={{ borderColor: "#f59e0b30" }}
            >
              <h2 className="text-[10px] font-mono uppercase tracking-widest mb-3 text-amber-400">
                System Insights
              </h2>
              <div className="space-y-2">
                {insights.length === 0 ? (
                  <p className="text-[10px] text-gray-600 font-mono uppercase">Add tasks to unlock</p>
                ) : (
                  insights.slice(0, 3).map((ins, i) => (
                    <div
                      key={i}
                      className="border rounded p-2 text-[10px] font-sans leading-relaxed"
                      style={{
                        background: ins.tone === "warning" ? "rgba(245,158,11,0.08)" : `${tierColor}08`,
                        borderColor: ins.tone === "warning" ? "rgba(245,158,11,0.2)" : `${tierColor}20`,
                        color: ins.tone === "warning" ? "#f59e0b" : "#a7f3d0",
                      }}
                    >
                      {ins.tone === "warning" ? (
                        <AlertTriangle className="size-2.5 inline mr-1 mb-0.5" />
                      ) : (
                        <TrendingUp className="size-2.5 inline mr-1 mb-0.5" />
                      )}
                      {ins.title}
                    </div>
                  ))
                )}
                {streakAtRisk && (
                  <div
                    className="border rounded p-2 text-[10px]"
                    style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}
                  >
                    ⚠ {streak}-day streak at risk — complete a task now
                  </div>
                )}
                <Link
                  href="/insights"
                  className="block text-center text-[9px] font-mono uppercase tracking-widest text-gray-600 hover:text-gray-400 mt-2"
                >
                  Full Report →
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER STATUS BAR ───────────────────────────────────── */}
        <footer className="shrink-0 mx-3 mb-3 mt-3 border-t border-gray-800 pt-2 flex flex-wrap justify-between gap-2 text-[9px] font-mono text-gray-600 uppercase px-1">
          <div className="flex gap-4">
            <span>USER: {profile?.name ?? "—"}</span>
            <span style={{ color: tierColor }}>SCORE: {disc.score}</span>
            <span className="text-amber-600">STREAK: {streak}D</span>
          </div>
          <div className="flex gap-4">
            <span>XP: {xp.toLocaleString()}</span>
            <span>{disc.tier.peerLabel.toUpperCase()}</span>
            <span style={{ color: tierColor }}>MOMENTUM: {disc.multiplier.toFixed(1)}×</span>
          </div>
        </footer>
      </div>

      {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} />}
      {showCheckin && <DailyCheckin onClose={() => setShowCheckin(false)} />}
      <Celebration show={celebrate} onDone={() => setCelebrate(false)} />
    </Layout>
  );
}
