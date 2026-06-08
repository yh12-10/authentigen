import { Marquee } from "./Marquee";
import { DETECTORS } from "./_data";

export function DetectorLogos() {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <Marquee durationSeconds={40}>
        {DETECTORS.map(d => {
          const initials = d
            .split(" ")
            .map(w => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div key={d} className="flex items-center gap-3 py-3">
              <div className="size-9 rounded-md border border-border/50 bg-secondary/30 flex items-center justify-center font-serif text-xs">
                {initials}
              </div>
              <span className="font-serif italic text-lg text-muted-foreground tracking-wide">
                {d}
              </span>
            </div>
          );
        })}
      </Marquee>
    </div>
  );
}
