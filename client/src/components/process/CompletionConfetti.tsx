import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface CompletionConfettiProps {
  trigger: boolean;
}

export function CompletionConfetti({ trigger }: CompletionConfettiProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;

    const duration = 1000;
    const end = Date.now() + duration;
    const colors = ["#F5A623", "#FBC97A", "#4F8EF7"];

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.15, y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.85, y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });

    (function frame() {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;
      confetti({
        particleCount: 4,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 },
        colors,
        disableForReducedMotion: true,
      });
      requestAnimationFrame(frame);
    })();
  }, [trigger]);

  return null;
}
