import React from "react";
import "./_group.css";

const CommandCenter = () => {
  return (
    <div className="min-h-screen bg-[#080b10] text-gray-300 font-sans p-4 flex flex-col gap-4 overflow-hidden" style={{ height: '100vh' }}>
      
      {/* Top Bar */}
      <header className="flex justify-between items-center bg-[#0a0e14] border border-[#10b981]/20 p-3 rounded shadow-sm dx-panel-glow">
        <div className="font-bold text-xl tracking-wider text-[#10b981] uppercase dx-text-glow flex items-center gap-2">
          <span>DisciplineX</span>
          <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-1.5 py-0.5 rounded border border-[#10b981]/20">SYS.ONLINE</span>
        </div>
        <div className="text-center">
          <div className="text-[#f59e0b] font-mono text-sm tracking-widest uppercase animate-pulse">
            LOCKED IN — Day 7 — Session Active
          </div>
        </div>
        <div className="flex gap-6 font-mono text-sm">
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[10px] uppercase">XP Counter</span>
            <span className="text-[#10b981] dx-text-glow">4,280 <span className="text-gray-500">XP</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[10px] uppercase">System Time</span>
            <span className="text-gray-300">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* 4-Column Grid Body */}
      <main className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* COL 1: Score & Tier */}
        <section className="dx-panel-glow rounded p-5 flex flex-col items-center justify-center relative">
          <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-500 uppercase">SYS.STATUS</div>
          
          <div className="relative w-48 h-48 mb-6 mt-4 dx-ring-glow">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="4" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="4" 
                strokeDasharray="282.7" strokeDashoffset="76.3" /* 73% */
                strokeLinecap="round"
                className="opacity-90"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono text-white dx-text-glow">73</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>
          
          <div className="text-center w-full">
            <div className="inline-block bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-3 py-1 rounded text-sm uppercase tracking-wider mb-4 dx-text-glow font-bold">
              Rank: Locked In
            </div>
            
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-gray-500 uppercase">Momentum</span>
              <span className="font-mono text-[#f59e0b] text-lg">2.1×</span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                <span>Next Tier</span>
                <span>85%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded overflow-hidden">
                <div className="h-full bg-[#10b981] w-[85%] shadow-[0_0_8px_#10b981]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* COL 2: Today's Tasks */}
        <section className="dx-panel-glow rounded p-4 flex flex-col relative">
          <div className="absolute top-0 right-0 bg-[#10b981]/10 text-[#10b981] border-l border-b border-[#10b981]/20 px-2 py-0.5 text-[10px] font-mono">3/5 Complete</div>
          <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Daily Operations</h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {[
              { title: "Read Ch12 Bio", sub: "Biology", dur: "25m", xp: "+100", done: true },
              { title: "Math Problems", sub: "Math", dur: "40m", xp: "+160", done: true },
              { title: "Essay Outline", sub: "English", dur: "30m", xp: "+120", done: true },
              { title: "Vocab Spanish", sub: "Spanish", dur: "20m", xp: "+80", done: false },
              { title: "Physics Notes", sub: "Physics", dur: "35m", xp: "+140", done: false },
            ].map((task, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 border rounded ${task.done ? 'bg-[#10b981]/5 border-[#10b981]/20' : 'bg-gray-800/30 border-gray-700/50'}`}>
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${task.done ? 'bg-[#10b981] border-[#10b981]' : 'border-gray-600'}`}>
                  {task.done && <svg className="w-3 h-3 text-[#080b10]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${task.done ? 'text-gray-300' : 'text-gray-400'}`}>{task.title}</div>
                  <div className="text-[10px] text-gray-500 uppercase">{task.sub} • {task.dur}</div>
                </div>
                <div className={`font-mono text-xs ${task.done ? 'text-[#10b981]' : 'text-gray-500'}`}>{task.xp}</div>
              </div>
            ))}
          </div>
          
          <button className="mt-4 w-full py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded text-xs uppercase tracking-widest text-gray-400 transition-colors flex items-center justify-center gap-2">
            <span>+</span> Add Task
          </button>
        </section>

        {/* COL 3: Momentum & Subjects */}
        <section className="flex flex-col gap-4">
          <div className="dx-panel-glow rounded p-4 flex-1 flex flex-col">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">7D Momentum</h2>
            
            {/* Fake Sparkline */}
            <div className="flex-1 relative border-b border-gray-700 mb-2 flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#10b981]/10 to-transparent"></div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 70 L16 65 L33 58 L50 48 L66 52 L83 45 L100 42" fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" className="dx-ring-glow" />
                <path d="M0 100 L0 70 L16 65 L33 58 L50 48 L66 52 L83 45 L100 42 L100 100 Z" fill="url(#grad)" opacity="0.2" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Streak Dots */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-gray-500 font-mono uppercase">14D Streak</span>
              <div className="flex gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-3 rounded-sm ${i < 7 ? 'bg-[#10b981] shadow-[0_0_4px_#10b981]' : 'bg-gray-800'}`} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="dx-panel-glow rounded p-4 flex-1">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Subject Load</h2>
            <div className="space-y-3">
              {[
                { name: "Math", val: "30%", w: "30%" },
                { name: "Biology", val: "25%", w: "25%" },
                { name: "English", val: "20%", w: "20%" },
                { name: "Spanish", val: "15%", w: "15%" },
                { name: "Physics", val: "10%", w: "10%" },
              ].map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-[10px] mb-1 font-mono text-gray-400">
                    <span className="uppercase">{s.name}</span>
                    <span>{s.val}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded">
                    <div className="h-full bg-gray-500 rounded" style={{ width: s.w }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COL 4: Goals & Insights */}
        <section className="flex flex-col gap-4">
          <div className="dx-panel-glow rounded p-4 flex-[2] flex flex-col">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4 flex justify-between">
              <span>Active Goals</span>
              <span className="text-[#10b981]">3</span>
            </h2>
            <div className="space-y-4 flex-1">
              {[
                { name: "Bio Midterm Prep", val: "53%" },
                { name: "Math 30d Streak", val: "23%" },
                { name: "Finish English Essay", val: "80%" },
              ].map(g => (
                <div key={g.name} className="border border-gray-700/50 bg-gray-800/20 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">{g.name}</span>
                    <span className="font-mono text-xs text-[#10b981]">{g.val}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded">
                    <div className="h-full bg-[#10b981]" style={{ width: g.val }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="dx-panel-glow rounded p-4 flex-1 border-[#f59e0b]/20">
            <h2 className="text-xs font-mono text-[#f59e0b] uppercase tracking-widest mb-3">System Insights</h2>
            <div className="space-y-2">
              <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] p-2 rounded text-xs">
                ⚠️ Low Spanish engagement this week.
              </div>
              <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] p-2 rounded text-xs">
                ✓ Math performance +15% over 7d.
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Status Bar */}
      <footer className="bg-[#0a0e14] border-t border-gray-800 p-2 flex justify-between text-[10px] font-mono text-gray-500 uppercase">
        <div className="flex gap-6">
          <span>USER: Alex Chen</span>
          <span className="text-[#10b981]">SCORE: 73</span>
          <span className="text-[#f59e0b]">STREAK: 7D</span>
        </div>
        <div className="flex gap-6">
          <span>TOTAL XP: 4,280</span>
          <span>RANK: TOP 12%</span>
          <span>NET: STABLE</span>
        </div>
      </footer>

    </div>
  );
};

export default CommandCenter;
