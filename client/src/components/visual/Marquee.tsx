import { Children, type ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  durationSeconds?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  durationSeconds = 30,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const items = Children.toArray(children);
  return (
    <div
      className={`overflow-hidden ${pauseOnHover ? "marquee-pause" : ""} ${className ?? ""}`}
      style={{ ["--marquee-duration" as any]: `${durationSeconds}s` }}
    >
      <div className="marquee-track">
        {items.map((node, i) => (
          <div key={`a-${i}`} className="shrink-0 px-6">
            {node}
          </div>
        ))}
        {items.map((node, i) => (
          <div key={`b-${i}`} className="shrink-0 px-6" aria-hidden>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
