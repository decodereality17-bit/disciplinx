import React from "react";
import { Check, Circle, ArrowRight } from "lucide-react";
import "./_group.css";

export function FocusMode() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between text-zinc-100 font-['Space_Grotesk',sans-serif] px-6 py-12"
      style={{ backgroundColor: "#09090b" }}
    >
      {/* Top: Streak */}
      <div className="animate-fade-in text-zinc-500 text-sm tracking-widest uppercase font-medium flex items-center gap-2">
        <span className="text-orange-500">🔥</span> 7 Day Streak
      </div>

      {/* Center Hero: Completion Ring */}
      <div className="relative flex flex-col items-center justify-center my-16 animate-fade-in delay-200">
        <div className="absolute -top-6 text-zinc-500 text-xs tracking-[0.2em] uppercase font-bold">
          Locked In
        </div>
        
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Background Track */}
          <svg className="w-full h-full transform -rotate-90 absolute inset-0">
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke="#27272a"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke="#f97316" /* orange-500 */
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              className="animate-ring-progress drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]"
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tracking-tighter text-white drop-shadow-md">
              2<span className="text-zinc-600 font-light mx-2">/</span>5
            </span>
          </div>
        </div>
      </div>

      {/* Below Ring: Clean Task List */}
      <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in delay-300">
        <TaskItem status="completed" title="Read Chapter 12 — Biology" />
        <TaskItem status="completed" title="Practice Problems — Math" />
        <TaskItem status="next" title="Essay Outline — English" />
        <TaskItem status="pending" title="Vocab Review — Spanish" />
        <TaskItem status="pending" title="Physics Lab Notes" />
      </div>

      {/* Very Bottom: Single Line */}
      <div className="mt-20 text-zinc-500 text-sm tracking-wide animate-fade-in delay-500">
        <span className="text-white font-medium">73</span> discipline points today. Keep going.
      </div>
    </div>
  );
}

function TaskItem({
  status,
  title,
}: {
  status: "completed" | "next" | "pending";
  title: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 transition-all duration-300 ${
        status === "completed"
          ? "opacity-30"
          : status === "next"
          ? "opacity-100 scale-[1.02]"
          : "opacity-60 hover:opacity-80"
      }`}
    >
      <div className="shrink-0 flex items-center justify-center w-6 h-6">
        {status === "completed" && <Check className="w-5 h-5 text-zinc-100" />}
        {status === "next" && <ArrowRight className="w-5 h-5 text-orange-500 animate-pulse" />}
        {status === "pending" && <Circle className="w-5 h-5 text-zinc-600" />}
      </div>
      <div
        className={`text-lg font-medium tracking-tight ${
          status === "completed" ? "line-through text-zinc-400" : "text-zinc-100"
        } ${status === "next" ? "text-orange-50" : ""}`}
      >
        {title}
      </div>
    </div>
  );
}
