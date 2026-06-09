import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "./_data";

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          value={`q-${i}`}
          className="rounded-2xl border border-border/50 bg-secondary/20 px-5 transition-colors hover:border-[#F5A623]/30 data-[state=open]:border-[#F5A623]/35 data-[state=open]:bg-secondary/30"
        >
          <AccordionTrigger className="py-4 font-serif text-lg text-left hover:text-gold hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
