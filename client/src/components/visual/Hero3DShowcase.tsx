import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasTouch } from "@/hooks/useHasTouch";

interface Hero3DShowcaseProps {
  src: string;
  alt: string;
}

export function Hero3DShowcase({ src, alt }: Hero3DShowcaseProps) {
  const reduced = useReducedMotion();
  const isTouch = useHasTouch();
  const interactive = !reduced && !isTouch;

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateY = useSpring(useTransform(x, [-1, 1], [-14, 14]), { stiffness: 80, damping: 18 });
  const rotateX = useSpring(useTransform(y, [-1, 1], [10, -10]), { stiffness: 80, damping: 18 });
  const glareX = useSpring(useTransform(x, [-1, 1], [20, 80]), { stiffness: 80, damping: 18 });
  const glareY = useSpring(useTransform(y, [-1, 1], [20, 80]), { stiffness: 80, damping: 18 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(cx * 2);
    y.set(cy * 2);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const glareBackground = useTransform(
    [glareX, glareY] as never,
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center lg:justify-end w-full"
      style={{ perspective: 1400 }}
    >
      {/* Outer ambient gold halo — slow breathe */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        animate={reduced ? {} : { scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          inset: "-4%",
          background:
            "radial-gradient(circle at 55% 55%, rgba(245,166,35,0.55) 0%, rgba(245,166,35,0) 60%)",
          filter: "blur(50px)",
        }}
      />
      {/* Cooler blue accent halo — counter-phase */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        animate={reduced ? {} : { scale: [1.08, 1, 1.08], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          inset: "12%",
          background:
            "radial-gradient(circle at 35% 65%, rgba(79,142,247,0.45) 0%, rgba(79,142,247,0) 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* The 3D-tilted, floating image stack */}
      <motion.div
        className="relative"
        animate={reduced ? {} : { y: [0, -16, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          draggable={false}
          className="w-full max-w-[760px] h-auto select-none pointer-events-none relative z-10"
          style={{
            filter:
              "drop-shadow(0 35px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 90px rgba(245,166,35,0.38)) drop-shadow(0 0 30px rgba(79,142,247,0.18))",
            transform: "translateZ(60px)",
          }}
        />
        {/* Glossy mouse-tracking glare overlay (interactive only) */}
        {interactive ? (
          <motion.div
            aria-hidden
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen rounded-2xl"
            style={{
              background: glareBackground,
              transform: "translateZ(80px)",
            }}
          />
        ) : null}
        {/* Soft floor reflection puddle */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          animate={reduced ? {} : { opacity: [0.55, 0.9, 0.55], scaleX: [0.95, 1.05, 0.95] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            bottom: "-6%",
            width: "65%",
            height: "10%",
            background:
              "radial-gradient(ellipse at center, rgba(245,166,35,0.55) 0%, rgba(245,166,35,0) 70%)",
            filter: "blur(22px)",
            transform: "translateZ(-20px)",
          }}
        />
      </motion.div>

      {/* Orbiting sparkles — gold + blue, three independent orbits */}
      {!reduced ? (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {[
            { radius: 46, dur: 16, size: 8, color: "#F5A623", glow: "rgba(245,166,35,0.95)", delay: 0 },
            { radius: 40, dur: 22, size: 6, color: "#4F8EF7", glow: "rgba(79,142,247,0.95)", delay: 1.2 },
            { radius: 52, dur: 28, size: 5, color: "#F5A623", glow: "rgba(245,166,35,0.9)", delay: 2.4 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2"
              style={{ width: 0, height: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: s.dur, repeat: Infinity, ease: "linear", delay: s.delay }}
            >
              <motion.div
                className="absolute rounded-full"
                animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
                style={{
                  width: s.size,
                  height: s.size,
                  left: `${s.radius}%`,
                  top: 0,
                  background: s.color,
                  boxShadow: `0 0 14px ${s.glow}, 0 0 28px ${s.glow}`,
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
