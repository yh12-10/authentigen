import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FloatCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Vertical drift in pixels (peak-to-peak). Default 6 px. */
  amplitude?: number;
  /** Loop duration in seconds. Default randomized 4–7 s. */
  duration?: number;
  /** Initial phase delay in seconds. Default randomized. */
  delay?: number;
}

/**
 * Wraps children with a continuous gentle Y-bob. Each instance picks a random
 * phase and duration so a grid of FloatCards doesn't move in lockstep.
 */
export function FloatCard({
  children,
  amplitude = 6,
  duration,
  delay,
  ...rest
}: FloatCardProps) {
  const reduced = useReducedMotion();

  // Stable per-mount random values so nothing re-rolls on re-render.
  const { d, dly } = useMemo(
    () => ({
      d: duration ?? 4 + Math.random() * 3,
      dly: delay ?? Math.random() * 2,
    }),
    [duration, delay]
  );

  if (reduced) {
    return <motion.div {...rest}>{children}</motion.div>;
  }

  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0, amplitude * 0.6, 0] }}
      transition={{ duration: d, delay: dly, repeat: Infinity, ease: "easeInOut" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
