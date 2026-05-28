import { Link } from "wouter";
import { Brain, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="size-16 rounded-3xl bg-gradient-primary grid place-items-center mx-auto mb-6 shadow-glow animate-pulse-glow">
          <Brain className="size-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-gradient-primary mb-2 tabular-nums">404</h1>
        <p className="text-lg font-semibold mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          Even the most disciplined minds sometimes take a wrong turn. Let's get back on track.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-95 transition"
        >
          <Home className="size-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
