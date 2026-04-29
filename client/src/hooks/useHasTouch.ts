import { useEffect, useState } from "react";

export function useHasTouch(): boolean {
  const [touch, setTouch] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = () => {
      setTouch(
        mq.matches ||
          "ontouchstart" in window ||
          (navigator.maxTouchPoints ?? 0) > 0
      );
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return touch;
}
