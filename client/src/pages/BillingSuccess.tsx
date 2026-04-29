import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BillingSuccess() {
  const startBalance = useRef<number | null>(null);
  const [creditedDelta, setCreditedDelta] = useState<number | null>(null);

  const balance = trpc.credits.balance.useQuery(undefined, {
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      if (startBalance.current === null) {
        startBalance.current = data.credits;
        return 1500;
      }
      const delta = data.credits - (startBalance.current ?? 0);
      if (delta > 0) {
        return false; // stop polling
      }
      return 1500;
    },
  });

  useEffect(() => {
    if (!balance.data) return;
    if (startBalance.current !== null) {
      const delta = balance.data.credits - startBalance.current;
      if (delta > 0 && creditedDelta === null) {
        setCreditedDelta(delta);
      }
    }
  }, [balance.data, creditedDelta]);

  return (
    <div className="container py-20 max-w-xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/15 glow-gold"
      >
        <CheckCircle2 className="size-10 text-emerald-400" />
      </motion.div>
      <h1 className="font-serif text-4xl mb-3">Payment <span className="text-gold">Successful</span></h1>
      {creditedDelta === null ? (
        <p className="text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Crediting your account…
        </p>
      ) : (
        <p className="text-lg">
          We've added <span className="text-gold font-semibold">{creditedDelta}</span> credits to your balance.
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/dashboard"><Button variant="outline">View Dashboard</Button></Link>
        <Link href="/upload"><Button>Start Humanizing</Button></Link>
      </div>
    </div>
  );
}
