import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Brain, Mail, Lock, User, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    if (mode === "signup" && !name.trim()) { toast.error("Please enter your name"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await signUp(email, password, name.trim());
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(290 65% 62%), transparent)" }} />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(246 65% 64%), transparent)" }} />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-14 rounded-3xl bg-gradient-primary grid place-items-center mx-auto mb-4 shadow-glow animate-pulse-glow">
            <Brain className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-primary">DisciplineX</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Welcome back, champion" : "Begin your discipline journey"}
          </p>
        </div>

        {/* Supabase not configured warning */}
        {!configured && (
          <div className="glass rounded-2xl p-3 mb-4 border border-warning/30 flex gap-2.5 items-start">
            <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-warning/90 leading-relaxed">
              Supabase is not configured. Add <code className="font-mono bg-card/80 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-card/80 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your environment.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="glass rounded-3xl p-6 shadow-elevated">
          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-muted p-1 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                data-testid={`tab-${m}`}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-gradient-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                  className="w-full rounded-2xl bg-input pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                className="w-full rounded-2xl bg-input pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full rounded-2xl bg-input pl-10 pr-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading
                ? "Loading…"
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {mode === "signin" ? "No account yet? " : "Already have one? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Discipline is the bridge between goals and accomplishment.
        </p>
      </div>
    </div>
  );
}
