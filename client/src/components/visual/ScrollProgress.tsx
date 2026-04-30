import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gold gradient progress bar pinned to the top of the viewport.
 * Width tracks document scroll progress 0→1.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[10001] h-[2px] origin-left pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, transparent, #F5A623 25%, #FBC97A 50%, #F5A623 75%, transparent)",
        boxShadow: "0 0 8px rgba(245, 166, 35, 0.6)",
      }}
    />
  );
}
