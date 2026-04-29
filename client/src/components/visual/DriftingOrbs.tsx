import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function DriftingOrbs() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 size-[55vmax] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(245,166,35,0.12), transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ x: [0, 60, -40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 size-[60vmax] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(79,142,247,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, -80, 40, 0], y: [0, -30, 50, 0] }}
        transition={{ duration: 56, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 size-[45vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(245,166,35,0.05), transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
