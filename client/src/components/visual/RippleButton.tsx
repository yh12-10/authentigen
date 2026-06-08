import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, type ComponentProps, type MouseEvent } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

type RippleButtonProps = ComponentProps<typeof Button>;

export function RippleButton({
  children,
  className,
  onMouseDown,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();
    setRipples(rs => [...rs, { id, x, y, size }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), 700);
    onMouseDown?.(e);
  }

  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            background: "rgba(245,166,35,0.35)",
            animation: "rippleExpand 700ms ease-out forwards",
          }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
      <style>{`@keyframes rippleExpand { from { transform: scale(0); opacity: 0.6; } to { transform: scale(1); opacity: 0; } }`}</style>
    </Button>
  );
}
