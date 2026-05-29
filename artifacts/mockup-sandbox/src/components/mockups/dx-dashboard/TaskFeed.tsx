import React, { useState } from 'react';
import { Check, Flame, Trophy, Clock, Zap, Target, BookOpen, Quote } from 'lucide-react';

// Hardcoded data
const USER = { name: "Alex Chen", score: 73, tier: "Locked In", streak: 7 };

const INITIAL_TASKS = [
  { id: 1, title: "Read Chapter 12", subject: "Biology", duration: 25, xp: 100, completed: true, color: "bg-emerald-500", borderColor: "border-emerald-500/50" },
  { id: 2, title: "Practice Problems Set 3", subject: "Math", duration: 40, xp: 160, completed: true, color: "bg-blue-500", borderColor: "border-blue-500/50" },
  { id: 3, title: "Essay Outline", subject: "English", duration: 30, xp: 120, completed: false, isNext: true, color: "bg-orange-500", borderColor: "border-orange-500/80" },
  { id: 4, title: "Vocab Review", subject: "Spanish", duration: 20, xp: 80, completed: false, color: "bg-purple-500", borderColor: "border-purple-500/50" },
  { id: 5, title: "Physics Lab Notes", subject: "Physics", duration: 35, xp: 140, completed: false, color: "bg-indigo-500", borderColor: "border-indigo-500/50" },
];

const GOALS = [
  { id: 1, title: "Ace Biology Midterm", progress: 8, total: 15 },
  { id: 2, title: "Math Streak 30d", progress: 7, total: 30 },
];

export function TaskFeed() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const remainingCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-['Space_Grotesk',sans-serif] selection:bg-orange-500/30 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-[#0f1117] font-bold text-lg">
            {USER.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-semibold text-white leading-tight">{USER.name}</h1>
            <p className="text-xs text-slate-400 font-medium">Ready to work?</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
            <Flame size={14} className="text-orange-500" />
            <span className="text-sm font-bold">{USER.streak}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
            <Trophy size={14} className="text-indigo-400" />
            <span className="text-sm font-bold">{USER.score}</span>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-md mx-auto w-full pb-24">
        {/* Momentum Strip */}
        <div className="mb-8 bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-50" />
          <div className="relative z-10 flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> 
              Tier: <strong className="text-amber-400">{USER.tier}</strong>
            </span>
            <span className="text-sm font-bold text-white">{USER.score}/100</span>
          </div>
          <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: \`\${USER.score}%\` }} />
          </div>
        </div>

        {/* HERO: Today's Tasks */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Today's Focus</h2>
            <span className="text-sm text-slate-400 font-medium bg-white/5 px-2 py-1 rounded-md border border-white/10">
              {completedCount}/{tasks.length} done
            </span>
          </div>
          
          {remainingCount === 1 && (
            <div className="mb-4 text-sm text-orange-400 font-medium animate-pulse flex items-center gap-2">
              <Flame size={14} /> 1 task left — finish strong!
            </div>
          )}

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={\`relative group cursor-pointer transition-all duration-300 overflow-hidden rounded-xl border p-4 flex items-center gap-4
                  \${task.completed ? 'bg-white/[0.02] border-white/5 opacity-60 grayscale-[0.5]' : 
                    task.isNext ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] scale-[1.02]' : 
                    'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                \`}
              >
                <div className={\`absolute left-0 top-0 bottom-0 w-1 \${task.color}\`} />
                
                {/* Checkbox */}
                <div className={\`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  \${task.completed ? 'bg-emerald-500 border-emerald-500 text-[#0f1117]' : 
                    task.isNext ? 'border-orange-500 text-transparent group-hover:bg-orange-500/20' : 
                    'border-slate-500 text-transparent group-hover:bg-slate-500/20'}
                \`}>
                  <Check size={14} className={task.completed ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={\`w-2 h-2 rounded-full \${task.color}\`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{task.subject}</span>
                    {task.isNext && !task.completed && (
                      <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded uppercase tracking-wide">Next Up</span>
                    )}
                  </div>
                  <h3 className={\`font-semibold text-base truncate transition-colors
                    \${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}
                  \`}>
                    {task.title}
                  </h3>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                    <Clock size={12} /> {task.duration}m
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                    <Zap size={12} /> {task.xp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subjects Breakdown */}
        <section className="mb-10">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Today's Mix</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(tasks.map(t => t.subject))).map(subject => {
              const subjectTasks = tasks.filter(t => t.subject === subject);
              const color = subjectTasks[0].color;
              return (
                <div key={subject} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-full text-xs font-medium">
                  <span className={\`w-2 h-2 rounded-full \${color}\`} />
                  {subject}
                </div>
              )
            })}
          </div>
        </section>

        {/* Goals Progress */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pl-1">
            <Target size={16} className="text-blue-400" />
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Goals</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map(goal => {
              const percentage = (goal.progress / goal.total) * 100;
              return (
                <div key={goal.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden hover:bg-white/[0.07] transition-colors cursor-pointer">
                  <div className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight relative z-10">{goal.title}</div>
                  <div className="flex items-center justify-between mt-auto relative z-10">
                    <span className="text-xs font-medium text-slate-400">{goal.progress}/{goal.total}</span>
                    <div className="text-xs font-bold text-blue-400">{Math.round(percentage)}%</div>
                  </div>
                  {/* Background progress bar */}
                  <div className="absolute bottom-0 left-0 h-[3px] bg-blue-500/20 w-full" />
                  <div className="absolute bottom-0 left-0 h-[3px] bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: \`\${percentage}%\` }} />
                </div>
              )
            })}
          </div>
        </section>

        {/* Quote */}
        <section>
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <Quote className="absolute -top-3 -left-3 text-indigo-500/10 w-24 h-24 rotate-180 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-slate-300 font-medium italic relative z-10 text-center leading-relaxed text-sm">
              "Discipline is choosing between what you want now, and what you want most."
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default TaskFeed;
