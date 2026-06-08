import { useState, type ReactNode } from "react";
import { useHasTouch } from "@/hooks/useHasTouch";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface PricingCardFlipProps {
  front: ReactNode;
  back: ReactNode;
  height?: number;
  className?: string;
  popular?: boolean;
}

export function PricingCardFlip({
  front,
  back,
  height = 540,
  className,
  popular,
}: PricingCardFlipProps) {
  const touch = useHasTouch();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);

  if (touch) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <div className={className} style={{ minHeight: height }}>
          {front}
          <div className="px-6 pb-6">
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full">
                View details
              </Button>
            </DrawerTrigger>
          </div>
        </div>
        <DrawerContent className="glass-strong">
          <DrawerHeader>
            <DrawerTitle className="font-serif">Pack details</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">{back}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={`relative preserve-3d transition-transform duration-700 ${className ?? ""}`}
      style={{
        minHeight: height,
        transform: hovered ? "rotateY(180deg)" : "rotateY(0deg)",
        perspective: 1200,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 backface-hidden">{front}</div>
      <div className="absolute inset-0 backface-hidden rotate-y-180">
        {back}
      </div>
    </div>
  );
}
