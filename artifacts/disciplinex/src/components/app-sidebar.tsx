import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart3, Target, Brain, User, LogOut, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { useTasks } from "@/hooks/use-tasks";
import { streakDays, disciplineScore, initials } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/planner", icon: Calendar, label: "Planner" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/insights", icon: Brain, label: "Insights" },
  { href: "/profile", icon: User, label: "Profile" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { signOut } = useAuth();
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
              onClick={onNav}
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
          onClick={() => signOut()}
          data-testid="button-signout"
          className="text-muted-foreground hover:text-foreground transition p-1 rounded-xl hover:bg-muted"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-sidebar-border bg-sidebar shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar + drawer */}
      <div className="lg:hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-gradient-primary grid place-items-center">
              <Zap className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">DisciplineX</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition"
            data-testid="button-menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
        {/* Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-xl hover:bg-muted transition text-muted-foreground"
                >
                  <X className="size-5" />
                </button>
                <SidebarContent onNav={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
