import { useState, useEffect, useRef } from "react";

type Props = {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({ value, duration = 900, suffix = "", prefix = "", className = "" }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let startTs = 0;
    const from = 0;
    const to = value;

    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className} data-testid="animated-number">
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
}
