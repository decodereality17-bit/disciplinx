export type Task = {
  id: string;
  title: string;
  subject: string;
  duration: number;
  created_at: string;
  completed_at?: string | null;
  done: boolean;
  goal_id?: string | null;
};

export type Goal = {
  id: string;
  title: string;
  target: number;
  deadline?: string | null;
  created_at: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function todaysTasks(tasks: Task[]) {
  const t = todayStr();
  return tasks.filter((x) => x.created_at === t || x.completed_at === t);
}

export function completionPct(tasks: Task[]) {
  const t = todaysTasks(tasks);
  if (!t.length) return 0;
  return Math.round((t.filter((x) => x.done).length / t.length) * 100);
}

export function momentum7d(tasks: Task[]) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = dayKey(d);
    const relevant = tasks.filter((t) => t.created_at === k || t.completed_at === k);
    const done = tasks.filter((t) => t.completed_at === k).length;
    const total = relevant.length;
    return { day: labels[d.getDay()], date: k, score: total ? Math.round((done / total) * 100) : 0, tasks: done };
  });
}

export function consistency15d(tasks: Task[]) {
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    const k = dayKey(d);
    const done = tasks.filter((t) => t.completed_at === k).length;
    const total = tasks.filter((t) => t.created_at === k || t.completed_at === k).length;
    return { day: `D${i + 1}`, consistency: total ? Math.round((done / total) * 100) : 0 };
  });
}

export function streakDays(tasks: Task[]) {
  let n = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const has = tasks.some((t) => t.completed_at === k);
    if (has) n++;
    else if (i > 0) break;
  }
  return n;
}

export function longestStreak(tasks: Task[]): number {
  const dates = Array.from(
    new Set(
      tasks
        .filter((t) => t.done && t.completed_at)
        .map((t) => t.completed_at as string)
    )
  ).sort();
  if (!dates.length) return 0;
  let max = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86_400_000
    );
    if (diff === 1) { current++; if (current > max) max = current; }
    else { current = 1; }
  }
  return max;
}

export function totalXP(tasks: Task[]) {
  return tasks.filter((t) => t.done).reduce((a, t) => a + t.duration * 4, 0);
}

export function disciplineScore(_tasks: Task[]): number {
  try {
    const raw = localStorage.getItem("dx_momentum");
    if (raw) {
      const s = JSON.parse(raw) as { score?: number; version?: number };
      if (s?.version === 1 && typeof s.score === "number") {
        return Math.round(s.score);
      }
    }
  } catch {}
  return 0;
}

export function subjectMix(tasks: Task[]) {
  const colorVars = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const map = new Map<string, number>();
  tasks.forEach((t) => map.set(t.subject, (map.get(t.subject) || 0) + t.duration));
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()].map(([name, v], i) => ({
    name,
    value: Math.round((v / total) * 100),
    color: colorVars[i % colorVars.length],
  }));
}

export function heatmapGrid(tasks: Task[]) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(20).fill(0));
  const totalDays = 140;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - i));
    const k = dayKey(d);
    const count = tasks.filter((t) => t.completed_at === k).length;
    const col = Math.floor(i / 7);
    const row = i % 7;
    grid[row][col] = Math.min(4, count);
  }
  return grid;
}

export function goalProgress(goal: Goal, tasks: Task[]) {
  const done = tasks.filter(
    (t) => t.goal_id === goal.id && t.done && t.completed_at && t.completed_at >= goal.created_at,
  ).length;
  const pct = Math.min(100, Math.round((done / goal.target) * 100));
  return { done, pct };
}

export function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const d = new Date(deadline + "T23:59:59");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

type Insight = { title: string; body: string; tone: "primary" | "success" | "warning" | "accent" };

export function generateInsights(tasks: Task[], name: string): Insight[] {
  const out: Insight[] = [];
  const m = momentum7d(tasks);
  const streak = streakDays(tasks);
  const pct = completionPct(tasks);
  const today = todaysTasks(tasks);
  const subjects = subjectMix(tasks);
  const completedAll = tasks.filter((t) => t.done);

  if (tasks.length === 0) {
    return [
      {
        title: `Welcome, ${name}`,
        body: "Add your first task to unlock personalized analytics, AI insights, and streak tracking.",
        tone: "primary",
      },
      {
        title: "Identity beats motivation",
        body: "Don't say 'I need to study.' Say 'I am someone who studies.' Identity-based habits stick.",
        tone: "accent",
      },
    ];
  }

  const peak = m.reduce((a, b) => (b.score > a.score ? b : a), m[0]);
  if (peak && peak.score > 0) {
    out.push({
      title: `${name}, you peak on ${peak.day}s`,
      body: `Your discipline score hits ${peak.score}% on ${peak.day}s. Schedule your hardest work in that window — you're wired for it.`,
      tone: "primary",
    });
  }

  if (streak >= 3) {
    out.push({
      title: `${streak}-day streak — don't break the chain`,
      body: `You've built real momentum. One missed day costs ${streak} days of compounding effort. Complete just one task today.`,
      tone: "success",
    });
  } else if (streak === 0 && completedAll.length > 0) {
    out.push({
      title: "Restart the chain today",
      body: `Yesterday slipped, ${name}. But identity isn't destroyed by one miss — it's rebuilt by the next action. Go.`,
      tone: "warning",
    });
  }

  if (today.length > 0 && pct < 50) {
    const remaining = today.filter((t) => !t.done).length;
    out.push({
      title: "The hardest step is always starting",
      body: `${remaining} task${remaining === 1 ? "" : "s"} left. Pick the smallest one. Set a 2-minute timer. Begin. The rest follows.`,
      tone: "warning",
    });
  } else if (today.length > 0 && pct === 100) {
    out.push({
      title: "Perfect day — locked in the record",
      body: `100% today, ${name}. This is exactly what separates the top 5% from everyone else. Let it compound.`,
      tone: "success",
    });
  }

  if (subjects.length >= 3) {
    const least = subjects.reduce((a, b) => (b.value < a.value ? b : a));
    if (least.value < 12) {
      out.push({
        title: `${least.name} is your weak link`,
        body: `Only ${least.value}% of your time — neglected subjects compound into exam-day regret. A 25-min sprint right now rebalances the scale.`,
        tone: "accent",
      });
    }
  }

  if (completedAll.length >= 10 && out.length < 4) {
    out.push({
      title: "You're building the person you want to be",
      body: `${completedAll.length} tasks completed, ${name}. Discipline isn't an event — it's the identity you prove to yourself every single day.`,
      tone: "accent",
    });
  }

  return out.slice(0, 4);
}

export function firstName(name?: string | null) {
  return (name || "").trim().split(/\s+/)[0] || "friend";
}

export function initials(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "·";
}

export function greetingPrefix() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Burning the midnight oil";
}
