import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProcessingOrbProps {
  size?: number;
  status?: "pending" | "processing" | "completed" | "failed";
}

export function ProcessingOrb({
  size = 120,
  status = "processing",
}: ProcessingOrbProps) {
  const reduced = useReducedMotion();
  if (status === "completed" || status === "failed") return null;

  const color = status === "pending" ? "#4F8EF7" : "#F5A623";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${color}, transparent 70%)`,
          filter: "blur(16px)",
        }}
        animate={
          reduced ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-2"
        style={{ borderColor: `${color}80` }}
        animate={reduced ? {} : { scale: [1, 1.1, 1], rotate: [0, 360] }}
        transition={{
          scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
      />
      <motion.div
        className="absolute inset-6 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${color}c0, ${color}20)`,
          boxShadow: `0 0 40px ${color}80`,
        }}
        animate={reduced ? {} : { scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
