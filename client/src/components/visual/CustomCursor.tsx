import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useHasTouch } from "@/hooks/useHasTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CustomCursor() {
  const touch = useHasTouch();
  const reduced = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ag-cursor") !== "native";
  });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.5 });

  useEffect(() => {
    const onStorage = () => {
      setEnabled(localStorage.getItem("ag-cursor") !== "native");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (touch || reduced || !enabled) {
      document.body.classList.remove("cursor-none");
      return;
    }
    document.body.classList.add("cursor-none");

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("button, a, [role='button'], input, textarea, select, [data-cursor-hover]");
      setHovering(Boolean(interactive));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.classList.remove("cursor-none");
    };
  }, [touch, reduced, enabled, x, y]);

  if (touch || reduced || !enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="size-2 rounded-full bg-[#F5A623]" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: hovering ? 1.6 : 1,
        }}
      >
        <div
          className="rounded-full border border-[#F5A623]/60"
          style={{
            width: hovering ? 44 : 30,
            height: hovering ? 44 : 30,
            boxShadow: "0 0 18px rgba(245,166,35,0.4)",
            transition: "width 200ms ease, height 200ms ease",
          }}
        />
      </motion.div>
    </>
  );
}
