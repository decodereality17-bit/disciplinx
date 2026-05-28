import { motion } from "framer-motion";

type Props = {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
};

export function ScoreRing({ score, size = 140, strokeWidth = 10, label = "score", className = "" }: Props) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const id = `ring-${size}`;

  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(262 18% 22%)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          filter={`url(#glow-${id})`}
        />
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(290 65% 72%)" />
            <stop offset="100%" stopColor="hsl(246 65% 74%)" />
          </linearGradient>
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-bold text-gradient-primary leading-none tabular-nums"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          {score}
        </motion.span>
        <span className="text-muted-foreground leading-none mt-1" style={{ fontSize: size * 0.09 }}>
          {label}
        </span>
      </div>
    </div>
  );
}
