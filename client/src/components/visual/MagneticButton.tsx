import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { useHasTouch } from "@/hooks/useHasTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** How far the button can be pulled toward the cursor. Default 12 px. */
  strength?: number;
  /** Activation radius in pixels. Default 120 px. */
  radius?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * Wraps children so they "pull toward" the cursor when it's within `radius` px.
 * Falls back to a static container on touch devices and reduced motion.
 */
export function MagneticButton({
  children,
  className,
  strength = 12,
  radius = 120,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useHasTouch();
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (touch || reduced) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
      const factor = (1 - dist / radius) * strength;
      x.set((dx / dist) * factor);
      y.set((dy / dist) * factor);
    } else {
      x.set(0);
      y.set(0);
    }
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <motion.div style={{ x: sx, y: sy }}>{children}</motion.div>
    </div>
  );
}
