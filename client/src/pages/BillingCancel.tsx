import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BillingCancel() {
  return (
    <div className="container py-20 max-w-xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-zinc-700/40"
      >
        <XCircle className="size-10 text-zinc-300" />
      </motion.div>
      <h1 className="font-serif text-4xl mb-3">Payment Cancelled</h1>
      <p className="text-muted-foreground">No charges were made to your card.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    </div>
  );
}
