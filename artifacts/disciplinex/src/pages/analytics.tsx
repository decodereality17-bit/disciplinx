import { Layout } from "@/components/layout";
import { Heatmap } from "@/components/heatmap";
import { AnimatedNumber } from "@/components/animated-number";
import { useTasks } from "@/hooks/use-tasks";
import {
  momentum7d, consistency15d, subjectMix, disciplineScore,
  streakDays, totalXP, todaysTasks,
} from "@/lib/analytics";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Target, BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold">{payload[0].value}%</p>
    </div>
  );
};

export default function Analytics() {
  const tasks = useTasks();
  const m7 = momentum7d(tasks);
  const c15 = consistency15d(tasks);
  const mix = subjectMix(tasks);
  const score = disciplineScore(tasks);
  const streak = streakDays(tasks);
  const xp = totalXP(tasks);
  const todayDone = todaysTasks(tasks).filter((t) => t.done).length;
  const totalDone = tasks.filter((t) => t.done).length;
  const avgScore = m7.length ? Math.round(m7.reduce((a, b) => a + b.score, 0) / m7.length) : 0;
  const totalMins = tasks.filter((t) => t.done).reduce((a, t) => a + t.duration, 0);

  const stats = [
    { icon: Zap, label: "Discipline Score", value: score, suffix: "", color: "text-primary bg-primary/10" },
    { icon: Flame, label: "Current Streak", value: streak, suffix: "d", color: "text-orange-400 bg-orange-400/10" },
    { icon: Trophy, label: "Total XP", value: xp, suffix: "", color: "text-chart-4 bg-chart-4/10" },
    { icon: Target, label: "Tasks Complete", value: totalDone, suffix: "", color: "text-success bg-success/10" },
    { icon: BarChart3, label: "Avg This Week", value: avgScore, suffix: "%", color: "text-accent bg-accent/10" },
    { icon: Flame, label: "Today Done", value: todayDone, suffix: "", color: "text-chart-3 bg-chart-3/10" },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Your discipline, visualised</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-card border border-card-border p-4 shadow-card"
            >
              <div className={`inline-flex size-7 rounded-lg items-center justify-center mb-2 ${color}`}>
                <Icon className="size-3.5" />
              </div>
              <p className="text-lg font-bold tabular-nums leading-none mb-1">
                <AnimatedNumber value={value} suffix={suffix} />
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* 7-day momentum */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-1">7-Day Momentum</h2>
          <p className="text-xs text-muted-foreground mb-4">Daily discipline score over the past week</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={m7} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(258 52% 68%)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="hsl(258 52% 68%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 12%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
              <RechartTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="hsl(258 52% 68%)" strokeWidth={2} fill="url(#areaG)" dot={{ fill: "hsl(258 52% 68%)", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 15-day consistency */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
            <h2 className="font-semibold mb-1">15-Day Consistency</h2>
            <p className="text-xs text-muted-foreground mb-4">Daily completion rate</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={c15} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 12%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(240 6% 46%)" }} axisLine={false} tickLine={false} />
                <RechartTooltip content={<CustomTooltip />} />
                <Bar dataKey="consistency" fill="hsl(222 56% 66%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject distribution */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
            <h2 className="font-semibold mb-1">Subject Distribution</h2>
            <p className="text-xs text-muted-foreground mb-4">Focus time by subject</p>
            {mix.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={mix} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
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
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                  {mix.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs">
                      <div className="size-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-muted-foreground truncate">{s.name}</span>
                      <span className="font-semibold ml-auto tabular-nums">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Full heatmap */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
          <h2 className="font-semibold mb-1">Activity Heatmap</h2>
          <p className="text-xs text-muted-foreground mb-4">20-week history of completed tasks</p>
          <Heatmap tasks={tasks} />
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div
                key={v}
                className={`size-3 rounded-[2px] ${
                  ["bg-muted", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"][v]
                }`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>

        {/* Study hours total */}
        <div className="rounded-2xl border border-primary/20 bg-primary/6 p-5 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
            <Trophy className="size-7 text-white" />
          </div>
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-0.5">Total Focus Time</p>
            <p className="text-3xl font-bold tabular-nums">
              <AnimatedNumber value={Math.round(totalMins / 60)} suffix="h" />
            </p>
            <p className="text-sm text-muted-foreground">
              across {totalDone} completed task{totalDone === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
