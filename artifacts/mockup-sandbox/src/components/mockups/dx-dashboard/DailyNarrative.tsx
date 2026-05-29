import React from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import "./_group.css";

export function DailyNarrative() {
  const tasks = [
    { id: 1, title: "Read Ch12 Biology", done: true },
    { id: 2, title: "Math Problems", done: true },
    { id: 3, title: "Essay Outline (English)", done: false },
    { id: 4, title: "Vocab Review (Spanish)", done: false },
    { id: 5, title: "Physics Lab Notes", done: false },
  ];

  const goals = [
    { id: 1, title: "Ace Biology Midterm", current: 8, total: 15 },
    { id: 2, title: "Math Streak 30d", current: 7, total: 30 },
    { id: 3, title: "Finish English Essay", current: 4, total: 5 },
  ];

  return (
    <div className="dx-narrative-theme p-4 md:p-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-12 pb-12">
        
        {/* Header */}
        <header className="space-y-2">
          <h1 className="dx-playfair text-4xl md:text-5xl font-bold tracking-tight text-[#f0ebe1]">
            Thursday, May 29
          </h1>
          <p className="text-[#d4af37] font-medium tracking-wide uppercase text-sm">
            You are <span className="font-bold">Locked In</span>.
          </p>
        </header>

        {/* AI NARRATIVE CARD */}
        <section className="bg-[#1a1a19] border border-[#2d2b27] rounded-xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
          <div className="space-y-6">
            <h2 className="dx-playfair text-2xl text-[#f0ebe1] italic">
              "You've completed 2 of 5 tasks today, and your momentum is building. 7 consecutive days of showing up — that's not luck, that's identity. Three tasks remain. Finish what you started."
            </h2>
            <div className="flex items-center gap-3 text-[#a39c8e]">
              <div className="h-[1px] w-8 bg-[#a39c8e]/50"></div>
              <span className="text-sm tracking-wider uppercase">Your Discipline Coach</span>
            </div>
          </div>
        </section>

        {/* SCORE in context */}
        <section className="space-y-3">
          <div className="flex justify-between items-end text-sm">
            <span className="text-[#f0ebe1] font-medium">Discipline Score: 73/100</span>
            <span className="text-[#a39c8e]">Building momentum toward Elite tier</span>
          </div>
          <div className="h-2 w-full bg-[#2d2b27] rounded-full overflow-hidden">
            <div className="h-full bg-[#d4af37] rounded-full" style={{ width: '73%' }}></div>
          </div>
        </section>

        {/* STREAK STORY */}
        <section className="bg-[#1a1a19] border border-[#2d2b27] rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-[#f0ebe1] font-semibold">Day 7 of your journey.</h3>
            <p className="text-[#a39c8e] text-sm">14 days to your next milestone. Don't break the chain.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 14 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < 7 ? 'bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-[#2d2b27]'}`}
              />
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* TODAY'S TASKS */}
          <section className="space-y-6">
            <h3 className="dx-playfair text-2xl text-[#f0ebe1] border-b border-[#2d2b27] pb-3">
              Your Mission Today
            </h3>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 group cursor-pointer">
                  <div className="mt-1">
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#a39c8e] group-hover:text-[#d4af37] transition-colors" />
                    )}
                  </div>
                  <span className={`text-[15px] ${task.done ? 'text-[#a39c8e] line-through decoration-[#a39c8e]/50' : 'text-[#f0ebe1]'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* GOALS as chapters */}
          <section className="space-y-6">
            <h3 className="dx-playfair text-2xl text-[#f0ebe1] border-b border-[#2d2b27] pb-3">
              Current Chapters
            </h3>
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="bg-[#1a1a19] border border-[#2d2b27] rounded-lg p-4 space-y-3">
                  <h4 className="text-[#f0ebe1] font-medium text-[15px]">{goal.title}</h4>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-[#2d2b27] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#d4af37] rounded-full" 
                        style={{ width: `${(goal.current / goal.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#a39c8e]">
                      {goal.current} tasks down, {goal.total - goal.current} to go.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* BOTTOM */}
        <section className="text-center pt-8 border-t border-[#2d2b27]">
          <p className="text-[#a39c8e] text-sm flex items-center justify-center gap-2 cursor-pointer hover:text-[#d4af37] transition-colors">
            Tomorrow: 3 tasks scheduled. Stay ahead. <ChevronRight className="w-4 h-4" />
          </p>
        </section>

      </div>
    </div>
  );
}
