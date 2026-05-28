import { Lightbulb, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";

type Tone = "primary" | "success" | "warning" | "accent";

type Props = {
  title: string;
  body: string;
  tone?: Tone;
  index?: number;
};

const toneConfig: Record<Tone, { bg: string; border: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  primary: {
    bg: "bg-primary/8",
    border: "border-primary/20",
    icon: Zap,
    iconColor: "text-primary",
  },
  success: {
    bg: "bg-success/8",
    border: "border-success/20",
    icon: TrendingUp,
    iconColor: "text-success",
  },
  warning: {
    bg: "bg-warning/8",
    border: "border-warning/20",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  accent: {
    bg: "bg-accent/8",
    border: "border-accent/20",
    icon: Lightbulb,
    iconColor: "text-accent",
  },
};

export function InsightCard({ title, body, tone = "primary", index = 0 }: Props) {
  const { bg, border, icon: Icon, iconColor } = toneConfig[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border p-4 ${bg} ${border}`}
      data-testid="insight-card"
    >
      <div className="flex gap-3 items-start">
        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}
