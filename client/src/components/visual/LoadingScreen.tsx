import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const WORDMARK = "AuthentiGen";

export function LoadingScreen() {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("ag-loaded") !== "1";
  });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!show) return;
    const dur = reduced ? 600 : 2400;
    const t = setTimeout(() => {
      sessionStorage.setItem("ag-loaded", "1");
      setShow(false);
    }, dur);
    return () => clearTimeout(t);
  }, [show, reduced]);

  const letters = WORDMARK.split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#080808]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="font-serif text-5xl md:text-7xl tracking-tight flex">
              {letters.map((ch, i) => {
                const dx = (Math.random() - 0.5) * 200;
                const dy = (Math.random() - 0.5) * 200;
                const r = (Math.random() - 0.5) * 60;
                return (
                  <motion.span
                    key={i}
                    initial={{ x: dx, y: dy, rotate: r, opacity: 0 }}
                    animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    transition={{
                      duration: reduced ? 0.001 : 0.9,
                      delay: reduced ? 0 : 0.04 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={i === 8 ? "text-gold" : "text-[#F5F5F5]"}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </div>
            <motion.div
              className="mx-auto mt-3 h-[2px] origin-left rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #F5A623, transparent)",
              }}
              initial={{ scaleX: 0, width: "100%" }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.6,
                delay: reduced ? 0 : 0.9,
                ease: "easeOut",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
