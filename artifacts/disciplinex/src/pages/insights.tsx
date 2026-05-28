import { Layout } from "@/components/layout";
import { InsightCard } from "@/components/insight-card";
import { WeeklyReport } from "@/components/weekly-report";
import { useTasks } from "@/hooks/use-tasks";
import { useProfile } from "@/hooks/use-profile";
import { useDiscipline } from "@/hooks/use-momentum";
import { generateInsights, streakDays, completionPct, firstName } from "@/lib/analytics";
import { ScoreRing } from "@/components/score-ring";
import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const QUOTES = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "Discipline is choosing between what you want now and what you want most. — Augusta F. Kantra",
  "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
  "The secret of getting ahead is getting started. — Mark Twain",
  "Your future is created by what you do today, not tomorrow. — Robert Kiyosaki",
];

export default function Insights() {
  const tasks = useTasks();
  const { profile } = useProfile();
  const disc = useDiscipline();
  const name = firstName(profile?.name);
  const score = disc.score;
  const streak = streakDays(tasks);
  const pct = completionPct(tasks);
  const insights = generateInsights(tasks, name);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-sm text-muted-foreground">Your patterns, decoded</p>
        </div>

        {/* Profile score card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-hero border border-primary/20 p-6 flex flex-col sm:flex-row items-center gap-6"
        >
          <ScoreRing score={score} tier={disc.tier} size={120} />
          <div className="text-center sm:text-left">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">Discipline Tier</p>
            <h2 className={`text-3xl font-bold mb-1 ${disc.tier.textClass}`}>{disc.tier.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">
              {streak > 0 ? `${streak}-day streak · ` : ""}{pct}% today · {disc.tier.peerLabel}
            </p>
            {disc.ptsToNextTier > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5">
                <Sparkles className="size-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {disc.ptsToNextTier} pts to {disc.nextTierName}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily quote */}
        <blockquote className="rounded-2xl border border-accent/20 bg-accent/6 p-4">
          <div className="flex gap-3 items-start">
            <Brain className="size-4 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
          </div>
        </blockquote>

        {/* AI Insights */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Personalised Insights
          </h2>
          {insights.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Brain className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium mb-1">Add your first task to unlock insights</p>
              <p className="text-sm text-muted-foreground">Your AI coach needs data to work with. Start tracking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <InsightCard key={i} title={ins.title} body={ins.body} tone={ins.tone} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Weekly report */}
        <WeeklyReport tasks={tasks} name={name} />

        {/* Psychological framework cards */}
        <div>
          <h2 className="font-semibold mb-3">Build Your Discipline</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                title: "Identity-based habits",
                body: "Don't say 'I need to study.' Say 'I am a disciplined student.' Identity precedes action. Every task you complete is a vote for who you are becoming.",
                tone: "accent" as const,
              },
              {
                title: "Implementation intentions",
                body: "Plan: 'When X happens, I will do Y for Z minutes.' Vague intentions fail. Specific if-then plans stick because they bypass willpower entirely.",
                tone: "primary" as const,
              },
              {
                title: "Loss aversion is your ally",
                body: "A streak isn't just motivating — losing it hurts twice as much as building it feels good. Use that asymmetry: protect your chain at all costs.",
                tone: "warning" as const,
              },
              {
                title: "The compound effect",
                body: "1% better each day = 37x improvement in a year. 1% worse = near zero. Your task list is a compounding machine. Feed it every day.",
                tone: "success" as const,
              },
            ].map((card, i) => (
              <InsightCard key={i} title={card.title} body={card.body} tone={card.tone} index={i} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
