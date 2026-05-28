import { useState } from "react";
import { Brain, User } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardPage({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitted(true);
    const profile = { id: "local-user", name: trimmed, created_at: new Date().toISOString() };
    localStorage.setItem("dx_profile", JSON.stringify(profile));
    setTimeout(() => onComplete(), 300);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(290 65% 62%), transparent)" }} />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(246 65% 64%), transparent)" }} />
        <div className="absolute top-1/3 left-1/4 size-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(290 65% 62%), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="size-16 rounded-3xl bg-gradient-primary grid place-items-center mx-auto mb-5 shadow-glow animate-pulse-glow"
          >
            <Brain className="size-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gradient-primary"
          >
            DisciplineX
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-2 text-sm"
          >
            Your discipline journey starts here.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-3xl p-7 shadow-elevated"
        >
          <h2 className="text-lg font-semibold mb-1">What should we call you?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This is how you'll appear on your dashboard and profile.
          </p>

          <form onSubmit={handleStart} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={40}
                data-testid="input-name"
                className="w-full rounded-2xl bg-input pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || submitted}
              data-testid="button-start"
              className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitted ? "Let's go…" : "Start my journey →"}
            </button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/50 mt-6"
        >
          All data stays on your device. Nothing is sent anywhere.
        </motion.p>
      </motion.div>
    </div>
  );
}
