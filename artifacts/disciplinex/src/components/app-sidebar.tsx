import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart3, Target, Brain, User, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { streakDays, disciplineScore, initials } from "@/lib/analytics";
import { motion } from "framer-motion";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/planner", icon: Calendar, label: "Planner" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/insights", icon: Brain, label: "Insights" },
  { href: "/profile", icon: User, label: "Profile" },
];

function SidebarContent() {
  const [location] = useLocation();
  const { clearData } = useAuth();
  const { profile } = useProfile();
  const tasks = useTasks();
  const streak = streakDays(tasks);
  const score = disciplineScore(tasks);
  const name = profile?.name ?? "Disciplined";
  const ini = initials(name);

  return (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="size-8 rounded-xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
          <Zap className="size-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-tight">DisciplineX</span>
      </div>

      {/* Score badge */}
      <div className="mx-1 mb-5 rounded-2xl border border-primary/20 bg-primary/8 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Score</p>
            <p className="text-xl font-bold text-gradient-primary tabular-nums">{score}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Streak</p>
            <p className="text-xl font-bold text-orange-400 tabular-nums">{streak}🔥</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-white shadow-glow"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User row */}
      <div className="mt-4 pt-4 border-t border-sidebar-border flex items-center gap-2.5 px-1">
        <div className="size-8 rounded-xl bg-gradient-primary grid place-items-center text-xs font-bold text-white shrink-0">
          {ini}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{name}</p>
        </div>
        <button
          onClick={clearData}
          data-testid="button-cleardata"
          className="text-muted-foreground hover:text-destructive transition p-1 rounded-xl hover:bg-muted"
          title="Clear all data"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-sidebar/90 backdrop-blur-xl border-t border-sidebar-border" />

      <div className="relative flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[44px]"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-2xl bg-primary/15"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={`relative size-5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative text-[10px] font-medium leading-none transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppSidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-sidebar-border bg-sidebar shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile bottom nav */}
      <BottomNav />
    </>
  );
}
