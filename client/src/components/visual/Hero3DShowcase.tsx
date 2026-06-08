import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHasTouch } from "@/hooks/useHasTouch";

interface Hero3DShowcaseProps {
  src: string;
  alt: string;
}

const DETECTORS = [
  "Hive",
  "GPTZero",
  "Originality.ai",
  "AIornot",
  "Sightengine",
  "Illuminarty",
];

export function Hero3DShowcase({ src, alt }: Hero3DShowcaseProps) {
  const reduced = useReducedMotion();
  const isTouch = useHasTouch();
  const interactive = !reduced && !isTouch;

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateY = useSpring(useTransform(x, [-1, 1], [-10, 10]), {
    stiffness: 80,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(y, [-1, 1], [8, -8]), {
    stiffness: 80,
    damping: 18,
  });

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

  // Animate detector chips ticking off, looping
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setActiveIdx(i => (i + 1) % (DETECTORS.length + 1));
    }, 900);
    return () => clearInterval(id);
  }, [reduced]);

  const progressPct = Math.min(
    100,
    Math.round((activeIdx / DETECTORS.length) * 100)
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center lg:justify-end w-full"
      style={{ perspective: 1400 }}
    >
      {/* Outer ambient gold halo */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        animate={
          reduced ? {} : { scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }
        }
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          inset: "-8%",
          background:
            "radial-gradient(circle at 55% 55%, rgba(245,166,35,0.55) 0%, rgba(245,166,35,0) 60%)",
          filter: "blur(60px)",
        }}
      />
      {/* Cooler blue accent halo */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none"
        animate={
          reduced ? {} : { scale: [1.08, 1, 1.08], opacity: [0.25, 0.55, 0.25] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          inset: "10%",
          background:
            "radial-gradient(circle at 35% 65%, rgba(79,142,247,0.45) 0%, rgba(79,142,247,0) 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* The 3D-tilted floating card */}
      <motion.div
        animate={reduced ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative w-full max-w-[560px]"
      >
        <div
          className="relative rounded-3xl overflow-hidden border border-[#F5A623]/25"
          style={{
            background: "rgba(20,20,20,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(245,166,35,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Image area with scan effects */}
          <div className="relative aspect-[1/1] overflow-hidden">
            <img
              src={src}
              alt={alt}
              loading="eager"
              fetchPriority="high"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Top vignette so the verdict badge stays readable */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-24 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
              }}
            />

            {/* Vertical scan line sweeping top→bottom→top */}
            {!reduced ? (
              <motion.div
                aria-hidden
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  height: "3px",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.95) 50%, transparent 100%)",
                  boxShadow:
                    "0 0 24px rgba(245,166,35,0.9), 0 0 48px rgba(245,166,35,0.5)",
                }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}

            {/* Subtle scan-grid overlay */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(245,166,35,0.18) 0, rgba(245,166,35,0.18) 1px, transparent 1px, transparent 6px)",
              }}
            />

            {/* Verdict badge — top right */}
            <motion.div
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border"
              style={{
                background: "rgba(0,0,0,0.65)",
                borderColor: "rgba(52,211,153,0.45)",
                boxShadow: "0 0 20px rgba(52,211,153,0.35)",
              }}
              animate={reduced ? {} : { scale: [1, 1.05, 1] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ShieldCheck
                className="w-4 h-4 text-emerald-400"
                strokeWidth={2.5}
              />
              <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
                Camera-Real
              </span>
            </motion.div>

            {/* Tag chip — top left */}
            <div
              className="absolute top-4 left-4 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] uppercase tracking-[0.15em]"
              style={{
                background: "rgba(0,0,0,0.55)",
                borderColor: "rgba(245,166,35,0.35)",
                color: "#F5A623",
              }}
            >
              Live Scan
            </div>
          </div>

          {/* Bottom dashboard panel */}
          <div
            className="relative px-5 py-4"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.96) 100%)",
              borderTop: "1px solid rgba(245,166,35,0.18)",
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Applying Camera Realism
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#F5A623] tabular-nums">
                {progressPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] rounded-full bg-white/5 overflow-hidden mb-3">
              <motion.div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(90deg, #F5A623 0%, #FFD27A 50%, #F5A623 100%)",
                  boxShadow: "0 0 10px rgba(245,166,35,0.7)",
                }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Detector chips */}
            <div className="flex flex-wrap gap-1.5">
              {DETECTORS.map((d, i) => {
                const cleared = i < activeIdx;
                const active = i === activeIdx;
                return (
                  <motion.div
                    key={d}
                    initial={false}
                    animate={
                      active && !reduced
                        ? { scale: [1, 1.08, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors"
                    style={{
                      background: cleared
                        ? "rgba(52,211,153,0.12)"
                        : active
                          ? "rgba(245,166,35,0.12)"
                          : "rgba(255,255,255,0.04)",
                      borderColor: cleared
                        ? "rgba(52,211,153,0.35)"
                        : active
                          ? "rgba(245,166,35,0.45)"
                          : "rgba(255,255,255,0.08)",
                      color: cleared
                        ? "rgb(110,231,183)"
                        : active
                          ? "#F5A623"
                          : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {cleared ? (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    ) : (
                      <span className="w-3 h-3 inline-flex items-center justify-center">
                        <span
                          className="block rounded-full"
                          style={{
                            width: 4,
                            height: 4,
                            background: active
                              ? "#F5A623"
                              : "rgba(255,255,255,0.3)",
                          }}
                        />
                      </span>
                    )}
                    {d}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating accent dots — subtle */}
        {!reduced ? (
          <>
            <motion.div
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 10,
                height: 10,
                top: "8%",
                right: "-3%",
                background: "#F5A623",
                boxShadow:
                  "0 0 16px rgba(245,166,35,0.95), 0 0 32px rgba(245,166,35,0.6)",
                transform: "translateZ(40px)",
              }}
              animate={{ y: [0, -8, 0], opacity: [0.85, 1, 0.85] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 6,
                height: 6,
                bottom: "12%",
                left: "-3%",
                background: "#4F8EF7",
                boxShadow: "0 0 14px rgba(79,142,247,0.95)",
                transform: "translateZ(40px)",
              }}
              animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
