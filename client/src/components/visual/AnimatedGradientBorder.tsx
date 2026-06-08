import { cn } from "@/lib/utils";
import { type HTMLAttributes, type ReactNode } from "react";

interface AnimatedGradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
}

export function AnimatedGradientBorder({
  children,
  active = true,
  className,
  ...rest
}: AnimatedGradientBorderProps) {
  return (
    <div
      className={cn(
        active ? "gradient-border-animated" : "gradient-border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
