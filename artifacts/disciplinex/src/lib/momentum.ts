import type { Task } from "./analytics";

const LS_KEY = "dx_momentum";
const dayStr = (d = new Date()) => d.toISOString().slice(0, 10);

// ─── Tier System ──────────────────────────────────────────────────────────────

export type DisciplineTier =
  | "Unstable"
  | "Building"
  | "Consistent"
  | "Elite"
  | "Legendary"
  | "Mythic";

export type TierConfig = {
  name: DisciplineTier;
  min: number;
  max: number;
  peerLabel: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  ringFrom: string;
  ringTo: string;
  glowHsl: string;      // e.g. "258 52% 65%" — no hsl() wrapper
  glowOpacity: number;  // 0–1
  pulseSeconds: number; // 0 = no pulse
};

export const TIERS: TierConfig[] = [
  {
    name: "Unstable", min: 0, max: 20,
    peerLabel: "Just starting",
    textClass: "text-zinc-400",
    bgClass: "bg-zinc-700/12",
    borderClass: "border-zinc-600/18",
    ringFrom: "hsl(240 5% 50%)", ringTo: "hsl(240 5% 36%)",
    glowHsl: "240 5% 42%", glowOpacity: 0, pulseSeconds: 0,
  },
  {
    name: "Building", min: 20, max: 40,
    peerLabel: "Habit forming",
    textClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/18",
    ringFrom: "hsl(258 42% 64%)", ringTo: "hsl(240 35% 54%)",
    glowHsl: "258 42% 58%", glowOpacity: 0.14, pulseSeconds: 0,
  },
  {
    name: "Consistent", min: 40, max: 60,
    peerLabel: "Top 30%",
    textClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/22",
    ringFrom: "hsl(258 52% 72%)", ringTo: "hsl(222 56% 68%)",
    glowHsl: "258 52% 65%", glowOpacity: 0.22, pulseSeconds: 4,
  },
  {
    name: "Elite", min: 60, max: 80,
    peerLabel: "Top 10%",
    textClass: "text-indigo-300",
    bgClass: "bg-indigo-500/10",
    borderClass: "border-indigo-400/22",
    ringFrom: "hsl(258 62% 76%)", ringTo: "hsl(215 68% 70%)",
    glowHsl: "230 65% 70%", glowOpacity: 0.35, pulseSeconds: 3,
  },
  {
    name: "Legendary", min: 80, max: 95,
    peerLabel: "Top 3%",
    textClass: "text-amber-300",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-400/22",
    ringFrom: "hsl(38 88% 66%)", ringTo: "hsl(258 60% 70%)",
    glowHsl: "38 82% 60%", glowOpacity: 0.5, pulseSeconds: 2.5,
  },
  {
    name: "Mythic", min: 95, max: 101,
    peerLabel: "Top 0.5%",
    textClass: "text-pink-300",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-400/22",
    ringFrom: "hsl(290 68% 74%)", ringTo: "hsl(215 78% 70%)",
    glowHsl: "290 65% 68%", glowOpacity: 0.7, pulseSeconds: 2,
  },
];

export function getTier(score: number): TierConfig {
  return TIERS.find((t) => score < t.max) ?? TIERS[TIERS.length - 1];
}

export function getMomentumMultiplier(momentum: number): number {
  return Math.round((1 + (momentum / 100) * 1.5) * 100) / 100;
}

export function getMomentumLabel(momentum: number): string {
  if (momentum >= 80) return "Surging";
  if (momentum >= 60) return "Strong";
  if (momentum >= 40) return "Growing";
  if (momentum >= 20) return "Warming up";
  return "Cold";
}

// ─── Stored State ─────────────────────────────────────────────────────────────

export type MomentumState = {
  score: number;
  momentum: number;
  lastDate: string;
  version: 1;
};

function defaultState(): MomentumState {
  return { score: 0, momentum: 0, lastDate: "", version: 1 };
}

function loadState(): MomentumState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as MomentumState;
    return p?.version === 1 ? p : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState(s: MomentumState) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

// ─── Core Algorithm ───────────────────────────────────────────────────────────

function getDaySummary(tasks: Task[], date: string) {
  const forDate = tasks.filter((t) => t.created_at === date || t.completed_at === date);
  const done = tasks.filter((t) => t.completed_at === date && t.done).length;
  return { done, total: forDate.length };
}

/**
 * Process one calendar day and return updated state.
 *
 * Design goals:
 * - Consistent performers: 40–80 range naturally
 * - Perfect streak 7d: ~50
 * - Perfect streak 14d: ~75
 * - Perfect streak 30d: ~92
 * - Single missed day costs momentum heavily, not just score
 * - Score is hard to build, easy to lose at high levels
 */
function applyDay(state: MomentumState, done: number, total: number): MomentumState {
  let { score, momentum } = state;
  const pct = total > 0 ? done / total : 0;

  // ── Momentum update ──────────────────────────────────────
  if (total === 0) {
    // Complete inactivity: heavy momentum loss
    momentum = Math.max(0, momentum * 0.5);
  } else if (pct >= 0.8) {
    momentum = Math.min(100, momentum + pct * 10);
  } else if (pct >= 0.5) {
    momentum = Math.min(100, momentum + (pct - 0.3) * 6);
  } else {
    // Weak day: momentum erodes
    momentum = Math.max(0, momentum - (0.5 - pct) * 12);
  }

  const mult = getMomentumMultiplier(momentum);
  // Diminishing returns at high score — Elite is hard to maintain
  const dim = 1 - score / 240;

  // ── Score update ─────────────────────────────────────────
  if (total === 0) {
    // No tasks: gradual decay scales with score
    score = Math.max(0, score - (score * 0.04 + 1.2));
  } else if (pct >= 1.0) {
    score = Math.min(100, score + 5 * mult * dim);
  } else if (pct >= 0.8) {
    score = Math.min(100, score + 3 * mult * dim);
  } else if (pct >= 0.5) {
    score = Math.min(100, score + 1.5 * mult * dim);
  } else {
    score = Math.max(0, score - 2);
  }

  return {
    ...state,
    score: Math.round(Math.max(0, Math.min(100, score)) * 10) / 10,
    momentum: Math.round(Math.max(0, Math.min(100, momentum)) * 10) / 10,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type ComputedDiscipline = {
  score: number;
  momentum: number;
  multiplier: number;
  tier: TierConfig;
  momentumLabel: string;
  tierProgress: number;
  ptsToNextTier: number;
  nextTierName: string;
  isDecaying: boolean;
};

export function syncMomentum(tasks: Task[]): ComputedDiscipline {
  const today = dayStr();
  let state = loadState();

  // Guard: clock went backwards
  if (state.lastDate > today) {
    state.lastDate = today;
    saveState(state);
  }

  // ── First launch: bootstrap from task history (up to 29 days) ──
  if (!state.lastDate) {
    let boot = defaultState();
    for (let i = 29; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayStr(d);
      const { done, total } = getDaySummary(tasks, k);
      if (total > 0 || boot.score > 0) {
        boot = applyDay(boot, done, total);
      }
    }
    boot.lastDate = today;
    saveState(boot);
    state = boot;
  }

  const prevScore = state.score;

  // ── Sync: close all unprocessed past days ──
  if (state.lastDate !== today) {
    const initialLastDate = state.lastDate;
    const last = new Date(initialLastDate);
    const daysDiff = Math.max(
      0,
      Math.floor((new Date(today).getTime() - last.getTime()) / 86_400_000)
    );
    for (let i = 1; i < daysDiff; i++) {
      const d = new Date(initialLastDate);
      d.setDate(d.getDate() + i);
      const k = dayStr(d);
      const { done, total } = getDaySummary(tasks, k);
      state = applyDay(state, done, total);
    }
    state.lastDate = today;
    saveState(state);
  }

  // ── Live today (not persisted) ──
  const { done: todayDone, total: todayTotal } = getDaySummary(tasks, today);
  const live = applyDay(state, todayDone, todayTotal);

  const score = live.score;
  const tier = getTier(score);
  const nextTier = TIERS.find((t) => t.min >= tier.max);
  const tierRange = tier.max - tier.min;
  const tierProgress = Math.min(
    100,
    Math.round(((score - tier.min) / tierRange) * 100)
  );

  return {
    score: Math.round(score),
    momentum: live.momentum,
    multiplier: getMomentumMultiplier(live.momentum),
    tier,
    momentumLabel: getMomentumLabel(live.momentum),
    tierProgress,
    ptsToNextTier: nextTier ? Math.max(0, Math.ceil(nextTier.min - score)) : 0,
    nextTierName: nextTier?.name ?? tier.name,
    isDecaying: score < prevScore - 0.5,
  };
}
