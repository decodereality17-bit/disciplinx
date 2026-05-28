import { motion } from "framer-motion";
import { Trophy, Flame, Clock, Target } from "lucide-react";
import { momentum7d, totalXP, streakDays } from "@/lib/analytics";
import type { Task } from "@/lib/analytics";
import { AnimatedNumber } from "./animated-number";

type Props = { tasks: Task[]; name: string };

export function WeeklyReport({ tasks, name }: Props) {
  const m = momentum7d(tasks);
  const xp = totalXP(tasks);
  const streak = streakDays(tasks);
  const weekTasks = m.reduce((a, b) => a + b.tasks, 0);
  const avgScore = m.length
    ? Math.round(m.reduce((a, b) => a + b.score, 0) / m.length)
    : 0;
  const totalMins = tasks.filter((t) => t.done).reduce((a, t) => a + t.duration, 0);

  const stats = [
    { icon: Target, label: "Tasks Done", value: weekTasks, suffix: "" },
    { icon: Trophy, label: "Total XP", value: xp, suffix: " XP" },
    { icon: Flame, label: "Streak", value: streak, suffix: "d" },
    { icon: Clock, label: "Hours Focused", value: Math.round(totalMins / 60), suffix: "h" },
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/6 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest">Weekly Report</p>
          <p className="text-sm font-semibold mt-0.5">
            {avgScore >= 80
              ? `Exceptional week, ${name}`
              : avgScore >= 50
              ? `Solid progress, ${name}`
              : `Keep building, ${name}`}
          </p>
        </div>
        <span className="text-2xl font-bold text-gradient-primary tabular-nums">{avgScore}%</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, label, value, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-card/50 p-2.5 text-center"
          >
            <Icon className="size-3.5 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold tabular-nums">
              <AnimatedNumber value={value} suffix={suffix} />
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* 7-day bar mini */}
      <div className="mt-4 flex gap-1 items-end h-10">
        {m.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <motion.div
              className="w-full rounded-t bg-gradient-primary opacity-80"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, d.score)}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              style={{ minHeight: d.score > 0 ? "4px" : "2px", maxHeight: "32px", height: `${d.score * 0.32}px` }}
            />
            <span className="text-[9px] text-muted-foreground">{d.day[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
