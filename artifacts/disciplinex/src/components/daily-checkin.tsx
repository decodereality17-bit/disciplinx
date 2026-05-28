import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smile, Meh, Frown, Brain } from "lucide-react";
import { toast } from "sonner";

const MOODS = [
  { label: "Locked in", value: "locked_in", icon: Brain, color: "text-primary border-primary/40 bg-primary/10" },
  { label: "Good", value: "good", icon: Smile, color: "text-success border-success/40 bg-success/10" },
  { label: "Okay", value: "okay", icon: Meh, color: "text-warning border-warning/40 bg-warning/10" },
  { label: "Struggling", value: "struggling", icon: Frown, color: "text-destructive border-destructive/40 bg-destructive/10" },
];

const LS_KEY = "dx_checkins";

type Checkin = { date: string; mood: string; intent: number };

function getCheckins(): Checkin[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}

function saveCheckin(entry: Checkin) {
  const all = getCheckins().filter((c) => c.date !== entry.date);
  all.unshift(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function getTodayCheckin(): Checkin | null {
  const today = new Date().toISOString().slice(0, 10);
  return getCheckins().find((c) => c.date === today) ?? null;
}

type Props = { onClose: () => void };

export function DailyCheckin({ onClose }: Props) {
  const [mood, setMood] = useState("");
  const [intent, setIntent] = useState(3);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!mood) { toast.error("Please pick a mood"); return; }
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    saveCheckin({ date: today, mood, intent });
    setSaving(false);
    toast.success("Check-in saved. Let's conquer today.");
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          className="glass rounded-3xl p-6 w-full max-w-sm shadow-elevated"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest">Daily Check-in</p>
              <h2 className="text-lg font-bold mt-0.5">How are you feeling?</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition p-1 rounded-xl hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {MOODS.map(({ label, value, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setMood(value)}
                data-testid={`mood-${value}`}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all ${
                  mood === value
                    ? color + " scale-[1.03] shadow-glow"
                    : "border-border bg-card/50 text-muted-foreground hover:border-border/80 hover:bg-card"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Discipline intent today: <span className="text-foreground font-bold">{intent}/5</span>
            </p>
            <input
              type="range"
              min={1}
              max={5}
              value={intent}
              onChange={(e) => setIntent(Number(e.target.value))}
              data-testid="input-intent"
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>Minimal</span>
              <span>Maximal</span>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || !mood}
            data-testid="button-save-checkin"
            className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? "Saving…" : "Start My Day"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
