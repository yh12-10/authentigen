import { useCountUp } from "@/hooks/useCountUp";

interface CounterProps {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function Counter({ to, prefix = "", suffix = "", decimals = 0, duration = 1600, className }: CounterProps) {
  const { ref, display } = useCountUp({ to, duration, decimals });
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
