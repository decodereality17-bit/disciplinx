

export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  duration: number;
  created_at: string;
  completed_at: string | null;
  done: boolean;
  goal_id: string | null;
  created_at_ts: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target: number;
  deadline: string | null;
  created_at: string;
  created_at_ts: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  mood: string | null;
  intent: number | null;
  created_at: string;
}

const KEYS = {
  profiles: 'dx_profiles',
  tasks:    'dx_tasks',
  goals:    'dx_goals',
  checkins: 'dx_checkins',
};

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[]; }
  catch { return []; }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function today(): string { return new Date().toISOString().split('T')[0]; }
function now(): string { return new Date().toISOString(); }

export const profileStorage = {
  get(userId: string): Profile | null {
    return load<Profile>(KEYS.profiles).find(p => p.id === userId) ?? null;
  },
  create(userId: string, name: string): Profile {
    const profile: Profile = { id: userId, name, created_at: now() };
    const all = load<Profile>(KEYS.profiles).filter(p => p.id !== userId);
    save(KEYS.profiles, [...all, profile]);
    return profile;
  },
  update(userId: string, name: string): Profile | null {
    const all = load<Profile>(KEYS.profiles);
    const idx = all.findIndex(p => p.id === userId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], name };
    save(KEYS.profiles, all);
    return all[idx];
  },
};

export const taskStorage = {
  getAll(userId: string): Task[] {
    return load<Task>(KEYS.tasks).filter(t => t.user_id === userId)
      .sort((a, b) => b.created_at_ts.localeCompare(a.created_at_ts));
  },
  getByDate(userId: string, date: string): Task[] {
    return load<Task>(KEYS.tasks).filter(t => t.user_id === userId && t.created_at === date);
  },
  getByGoal(userId: string, goalId: string): Task[] {
    return load<Task>(KEYS.tasks).filter(t => t.user_id === userId && t.goal_id === goalId);
  },
  create(userId: string, data: Pick<Task, 'title' | 'subject' | 'duration' | 'goal_id'>): Task {
    const task: Task = {
      id: crypto.randomUUID(), user_id: userId, title: data.title,
      subject: data.subject ?? 'General', duration: data.duration ?? 25,
      created_at: today(), completed_at: null, done: false,
      goal_id: data.goal_id ?? null, created_at_ts: now(),
    };
    save(KEYS.tasks, [...load<Task>(KEYS.tasks), task]);
    return task;
  },
  update(taskId: string, userId: string, changes: Partial<Task>): Task | null {
    const all = load<Task>(KEYS.tasks);
    const idx = all.findIndex(t => t.id === taskId && t.user_id === userId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...changes };
    save(KEYS.tasks, all);
    return all[idx];
  },
  complete(taskId: string, userId: string): Task | null {
    return taskStorage.update(taskId, userId, { done: true, completed_at: today() });
  },
  uncomplete(taskId: string, userId: string): Task | null {
    return taskStorage.update(taskId, userId, { done: false, completed_at: null });
  },
  delete(taskId: string, userId: string): boolean {
    const all = load<Task>(KEYS.tasks);
    const filtered = all.filter(t => !(t.id === taskId && t.user_id === userId));
    if (filtered.length === all.length) return false;
    save(KEYS.tasks, filtered);
    return true;
  },
};

export const goalStorage = {
  getAll(userId: string): Goal[] {
    return load<Goal>(KEYS.goals).filter(g => g.user_id === userId)
      .sort((a, b) => b.created_at_ts.localeCompare(a.created_at_ts));
  },
  create(userId: string, data: Pick<Goal, 'title' | 'target' | 'deadline'>): Goal {
    const goal: Goal = {
      id: crypto.randomUUID(), user_id: userId, title: data.title,
      target: data.target ?? 1, deadline: data.deadline ?? null,
      created_at: today(), created_at_ts: now(),
    };
    save(KEYS.goals, [...load<Goal>(KEYS.goals), goal]);
    return goal;
  },
  update(goalId: string, userId: string, changes: Partial<Goal>): Goal | null {
    const all = load<Goal>(KEYS.goals);
    const idx = all.findIndex(g => g.id === goalId && g.user_id === userId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...changes };
    save(KEYS.goals, all);
    return all[idx];
  },
  delete(goalId: string, userId: string): boolean {
    const all = load<Goal>(KEYS.goals);
    const filtered = all.filter(g => !(g.id === goalId && g.user_id === userId));
    if (filtered.length === all.length) return false;
    save(KEYS.goals, filtered);
    return true;
  },
  getProgress(userId: string, goalId: string): number {
    return load<Task>(KEYS.tasks).filter(
      t => t.user_id === userId && t.goal_id === goalId && t.done
    ).length;
  },
};

export const checkinStorage = {
  getAll(userId: string): CheckIn[] {
    return load<CheckIn>(KEYS.checkins).filter(c => c.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  getByDate(userId: string, date: string): CheckIn | null {
    return load<CheckIn>(KEYS.checkins).find(
      c => c.user_id === userId && c.date === date
    ) ?? null;
  },
  upsert(userId: string, data: Pick<CheckIn, 'date' | 'mood' | 'intent'>): CheckIn {
    const all = load<CheckIn>(KEYS.checkins);
    const idx = all.findIndex(c => c.user_id === userId && c.date === data.date);
    if (idx !== -1) {
      all[idx] = { ...all[idx], mood: data.mood ?? null, intent: data.intent ?? null };
      save(KEYS.checkins, all);
      return all[idx];
    }
    const checkin: CheckIn = {
      id: crypto.randomUUID(), user_id: userId, date: data.date,
      mood: data.mood ?? null, intent: data.intent ?? null, created_at: now(),
    };
    save(KEYS.checkins, [...all, checkin]);
    return checkin;
  },
  delete(checkinId: string, userId: string): boolean {
    const all = load<CheckIn>(KEYS.checkins);
    const filtered = all.filter(c => !(c.id === checkinId && c.user_id === userId));
    if (filtered.length === all.length) return false;
    save(KEYS.checkins, filtered);
    return true;
  },
};

export const analyticsStorage = {
  getTotalXP(userId: string): number {
    return load<Task>(KEYS.tasks).filter(t => t.user_id === userId && t.done)
      .reduce((sum, t) => sum + t.duration * 4, 0);
  },
  getStreak(userId: string): number {
    const days = [...new Set(
      load<Task>(KEYS.tasks)
        .filter(t => t.user_id === userId && t.done && t.completed_at)
        .map(t => t.completed_at!)
    )].sort((a, b) => b.localeCompare(a));
    if (!days.length) return 0;
    let streak = 0;
    let cursor = new Date(); cursor.setHours(0,0,0,0);
    for (const day of days) {
      const d = new Date(day + 'T00:00:00');
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
      if (diff === 0 || diff === 1) { streak++; cursor = d; } else break;
    }
    return streak;
  },
  getDisciplineScore(userId: string): number {
    const allTasks = load<Task>(KEYS.tasks).filter(t => t.user_id === userId);
    const todayStr = today();
    const todayTasks = allTasks.filter(t => t.created_at === todayStr);
    const todayScore = todayTasks.length > 0
      ? (todayTasks.filter(t => t.done).length / todayTasks.length) * 100 : 0;
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = allTasks.filter(t => t.created_at === dateStr);
      return dayTasks.length > 0
        ? (dayTasks.filter(t => t.done).length / dayTasks.length) * 100 : 0;
    });
    const avgScore = last7.reduce((a, b) => a + b, 0) / 7;
    const streakBonus = Math.min(analyticsStorage.getStreak(userId) * 2, 20);
    return Math.round(todayScore * 0.5 + avgScore * 0.3 + streakBonus);
  },
  getSubjectDistribution(userId: string): Record<string, number> {
    return load<Task>(KEYS.tasks).filter(t => t.user_id === userId && t.done)
      .reduce((acc, t) => { acc[t.subject] = (acc[t.subject] ?? 0) + t.duration; return acc; }, {} as Record<string, number>);
  },
  getLast7Days(userId: string): { date: string; completed: number; total: number }[] {
    const allTasks = load<Task>(KEYS.tasks).filter(t => t.user_id === userId);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = allTasks.filter(t => t.created_at === dateStr);
      return { date: dateStr, completed: dayTasks.filter(t => t.done).length, total: dayTasks.length };
    });
  },
};
