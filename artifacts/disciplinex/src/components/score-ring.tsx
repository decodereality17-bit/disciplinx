import { motion } from "framer-motion";
import { getTier, type TierConfig } from "@/lib/momentum";

type Props = {
  score: number;
  tier?: TierConfig;
  size?: number;
  strokeWidth?: number;
};

export function ScoreRing({ score, tier: tierProp, size = 140, strokeWidth = 9 }: Props) {
  const tier = tierProp ?? getTier(score);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const uid = `ring-${size}`;

  const glowLow = `hsl(${tier.glowHsl} / ${tier.glowOpacity * 0.3})`;
  const glowHigh = `hsl(${tier.glowHsl} / ${tier.glowOpacity})`;
  const glowPx = size * 0.18;
  const glowPxHigh = size * 0.36;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>

      {/* Pulsing ambient glow — Consistent and above */}
      {tier.pulseSeconds > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 ${glowPx}px ${glowLow}`,
              `0 0 ${glowPxHigh}px ${glowHigh}`,
              `0 0 ${glowPx}px ${glowLow}`,
            ],
          }}
          transition={{ duration: tier.pulseSeconds, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Static glow — Building tier */}
      {tier.glowOpacity > 0 && tier.pulseSeconds === 0 && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 ${glowPx}px ${glowHigh}` }}
        />
      )}

      {/* Ring SVG */}
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.ringFrom} />
            <stop offset="100%" stopColor={tier.ringTo} />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={Math.max(0.5, tier.glowOpacity * 4)} result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(240 8% 12%)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#grad-${uid})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          filter={tier.glowOpacity > 0.1 ? `url(#glow-${uid})` : undefined}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
        <motion.span
          className="font-bold text-white leading-none tabular-nums"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {score}
        </motion.span>
        <span
          className={`font-semibold uppercase tracking-widest leading-none ${tier.textClass}`}
          style={{ fontSize: size * 0.065 }}
        >
          {tier.name}
        </span>
      </div>
    </div>
  );
}
