import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, AlertOctagon } from "lucide-react";

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorState({ message, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/15"
      >
        <AlertOctagon className="size-8 text-destructive" />
      </motion.div>
      <h2 className="font-serif text-2xl mb-2">Something went wrong</h2>
      <p className="text-sm text-destructive/80 mb-5 max-w-md mx-auto">
        {message ?? "An unexpected error occurred while processing your file."}
      </p>
      <div className="flex justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RotateCcw className="size-4 mr-2" /> Retry
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
        )}
      </div>
    </div>
  );
}
