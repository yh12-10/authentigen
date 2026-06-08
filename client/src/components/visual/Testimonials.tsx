import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { TESTIMONIALS } from "./_data";
import { motion } from "framer-motion";

const AVATAR_COLORS = [
  "#F5A623",
  "#4F8EF7",
  "#10B981",
  "#A855F7",
  "#EC4899",
  "#FB923C",
];

export function Testimonials() {
  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[
        Autoplay({ delay: 5000, stopOnInteraction: true }) as unknown as never,
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {TESTIMONIALS.map((t, i) => (
          <CarouselItem
            key={t.name}
            className="pl-4 sm:basis-2/3 md:basis-1/2 lg:basis-1/3"
          >
            <Card className="glass h-full relative overflow-hidden">
              <motion.div
                className="absolute -top-4 -left-2 text-[120px] leading-none font-serif text-[#F5A623]/15 select-none"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Quote />
              </motion.div>
              <CardContent className="pt-6 pb-5 relative">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="size-4 fill-[#F5A623] text-[#F5A623]"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground/90">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center font-medium text-black"
                    style={{
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
