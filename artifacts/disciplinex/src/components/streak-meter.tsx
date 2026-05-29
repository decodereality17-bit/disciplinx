import { motion } from "framer-motion";
import { Flame, Trophy, AlertTriangle, Target } from "lucide-react";
import { streakDays, longestStreak, type Task } from "@/lib/analytics";

const MILESTONES = [3, 7, 14, 21, 30, 50, 100, 365];

function nextMilestone(streak: number): { days: number; daysLeft: number } | null {
  const m = MILESTONES.find((n) => n > streak);
  return m ? { days: m, daysLeft: m - streak } : null;
}

function getLast14Days(tasks: Task[]) {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().slice(0, 10);
    const done = tasks.some((t) => t.completed_at === date && t.done);
    return { date, done, isToday: i === 13 };
  });
}

function getStreakDates(tasks: Task[], streak: number): Set<string> {
  const dates = new Set<string>();
  if (streak === 0) return dates;
  let found = 0;
  for (let offset = 0; found < streak && offset < 400; offset++) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const k = d.toISOString().slice(0, 10);
    if (tasks.some((t) => t.completed_at === k && t.done)) {
      dates.add(k);
      found++;
    } else if (found > 0) {
      break; // gap in streak
    }
    // if found === 0 and offset === 0, today has no completions — skip and check yesterday
  }
  return dates;
}

type Props = {
  tasks: Task[];
};

export function StreakMeter({ tasks }: Props) {
  const streak = streakDays(tasks);
  const record = longestStreak(tasks);
  const days = getLast14Days(tasks);
  const streakDates = getStreakDates(tasks, streak);
  const hasCompletedToday = days[13].done;
  const streakAtRisk = streak > 0 && !hasCompletedToday;
  const milestone = nextMilestone(streak);
  const isPersonalBest = streak > 0 && streak >= record;

  return (
    <div className="rounded-2xl bg-card border border-card-border p-5 shadow-card">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Streak count */}
        <div className="flex items-center gap-3">
          <motion.div
            className={`size-11 rounded-2xl flex items-center justify-center ${
              streak > 0 ? "bg-orange-400/15 text-orange-400" : "bg-muted text-muted-foreground"
            }`}
            animate={streakAtRisk ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <Flame className="size-5" />
          </motion.div>
          <div>
            <div className="flex items-baseline gap-1">
              <motion.span
                key={streak}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold leading-none"
              >
                {streak}
              </motion.span>
              <span className="text-sm text-muted-foreground font-medium leading-none">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Current streak</p>
          </div>
        </div>

        {/* Record */}
        {record > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-chart-4">
              <Trophy className="size-3.5 shrink-0" />
              <span className="text-xs font-semibold">{record}d best</span>
            </div>
            {isPersonalBest && (
              <p className="text-[10px] text-success font-medium mt-0.5">Personal best!</p>
            )}
          </div>
        )}
      </div>

      {/* 14-day dot chain */}
      <div className="flex items-center mb-4">
        {days.map((day, i) => {
          const inStreak = streakDates.has(day.date);
          const nextInStreak = i < 13 && streakDates.has(days[i + 1].date);

          return (
            <div key={day.date} className={`flex items-center ${i < 13 ? "flex-1" : ""}`}>
              {/* Dot */}
              {day.isToday && !day.done ? (
                <motion.div
                  className="size-3.5 rounded-full border-2 border-orange-400 shrink-0"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              ) : (
                <div
                  className={`shrink-0 rounded-full transition ${
                    inStreak
                      ? "size-3.5 bg-orange-400"
                      : day.done
                      ? "size-3 bg-muted-foreground/40"
                      : "size-2.5 bg-muted/50"
                  }`}
                  style={
                    inStreak
                      ? { boxShadow: "0 0 6px hsl(38 88% 60% / 0.55)" }
                      : undefined
                  }
                />
              )}

              {/* Connector */}
              {i < 13 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 rounded-full transition ${
                    inStreak && nextInStreak
                      ? "bg-orange-400/55"
                      : "bg-muted/25"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Day labels — show every 2nd label to avoid crowding */}
      <div className="flex mb-3">
        {days.map((day, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          const label = i === 13 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
          const show = i === 0 || i === 13 || i % 3 === 0;
          return (
            <div key={day.date} className={`${i < 13 ? "flex-1" : ""} text-[9px] text-muted-foreground/60 leading-none ${show ? "" : "invisible"} ${i === 13 ? "text-right" : "text-center"}`}>
              {label}
            </div>
          );
        })}
      </div>

      {/* Footer: at-risk warning OR milestone */}
      {streakAtRisk ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-warning/10 border border-warning/25 px-3 py-2.5 text-xs text-warning font-medium"
        >
          <AlertTriangle className="size-3.5 shrink-0" />
          {streak > 0
            ? `Your ${streak}-day streak is at risk — complete a task today to protect it`
            : "Complete a task today to start your streak"}
        </motion.div>
      ) : milestone ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Next milestone</span>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
            <Target className="size-3 text-primary" />
            <span className="font-bold text-primary">{milestone.days}d</span>
            <span className="text-muted-foreground">
              · {milestone.daysLeft} day{milestone.daysLeft !== 1 ? "s" : ""} to go
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-success font-medium text-center">
          🔥 All milestones achieved — you are legendary
        </p>
      )}
    </div>
  );
}
