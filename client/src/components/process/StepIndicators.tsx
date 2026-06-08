import { motion } from "framer-motion";
import { Upload, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorsProps {
  progress: number;
  status: "pending" | "processing" | "completed" | "failed";
}

const STEPS = [
  { key: "upload", label: "Uploading", icon: Upload, range: [0, 10] as const },
  { key: "analyze", label: "Analyzing", icon: Search, range: [10, 30] as const },
  { key: "humanize", label: "Humanizing", icon: Sparkles, range: [30, 90] as const },
  { key: "finalize", label: "Finalizing", icon: CheckCircle2, range: [90, 100] as const },
];

export function stepStateAt(progress: number, status: StepIndicatorsProps["status"], stepIdx: number) {
  if (status === "completed") return "done";
  if (status === "failed") return progress > STEPS[stepIdx].range[0] ? "current" : "pending";
  const [start, end] = STEPS[stepIdx].range;
  if (progress >= end) return "done";
  if (progress >= start) return "current";
  return "pending";
}

export function StepIndicators({ progress, status }: StepIndicatorsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {STEPS.map((step, i) => {
        const state = stepStateAt(progress, status, i);
        const Icon = step.icon;
        return (
          <div key={step.key} className="relative">
            <motion.div
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl py-3 px-2 text-center transition-colors",
                state === "done" && "bg-emerald-500/15",
                state === "current" && "bg-[#F5A623]/15 glow-gold-sm",
                state === "pending" && "bg-secondary/30"
              )}
              animate={state === "current" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
              transition={{ duration: 1.6, repeat: state === "current" ? Infinity : 0, ease: "easeInOut" }}
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  state === "done" && "bg-emerald-500 text-black",
                  state === "current" && "bg-[#F5A623] text-black",
                  state === "pending" && "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wide",
                  state === "pending" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {step.label}
              </span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="absolute top-7 right-0 hidden h-px w-3 -translate-y-1/2 bg-border md:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
