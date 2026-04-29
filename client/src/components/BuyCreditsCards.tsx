import { trpc } from "@/lib/trpc";
import { RippleButton } from "@/components/visual/RippleButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PACK_META: Record<string, { icon: any; gradient: string; popular?: boolean }> = {
  starter: { icon: Coins, gradient: "from-zinc-700 to-zinc-900" },
  pro: { icon: Sparkles, gradient: "from-amber-500/20 to-amber-700/10", popular: true },
  studio: { icon: Crown, gradient: "from-blue-500/15 to-blue-700/5" },
};

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BuyCreditsCards() {
  const config = trpc.payments.isConfigured.useQuery();
  const packs = trpc.payments.packs.useQuery();
  const checkout = trpc.payments.createCheckoutSession.useMutation();
  const [busy, setBusy] = useState<string | null>(null);

  if (!config.data?.configured) {
    return (
      <Card className="glass border-amber-500/20">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-gold">Stripe not configured</CardTitle>
          <CardDescription>
            Credit purchases are temporarily unavailable. Set <code className="text-xs">STRIPE_SECRET_KEY</code>,{" "}
            <code className="text-xs">STRIPE_WEBHOOK_SECRET</code>, and the three Stripe price IDs in your{" "}
            <code className="text-xs">.env</code> to enable checkout.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!packs.data) {
    return <div className="text-muted-foreground">Loading packs…</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {packs.data.map((pack) => {
        const meta = PACK_META[pack.key];
        const Icon = meta?.icon ?? Coins;
        const onBuy = async () => {
          try {
            setBusy(pack.key);
            const { url } = await checkout.mutateAsync({ pack: pack.key });
            window.location.href = url;
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Checkout failed";
            toast.error(msg);
            setBusy(null);
          }
        };
        return (
          <Card
            key={pack.key}
            className={cn(
              "glass relative overflow-hidden transition-transform hover:-translate-y-1",
              meta?.popular && "gradient-border-animated glow-gold"
            )}
          >
            {meta?.popular && (
              <div className="absolute right-3 top-3 rounded-full bg-[#F5A623] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black">
                Most Popular
              </div>
            )}
            <CardHeader>
              <div className={cn("inline-flex size-10 items-center justify-center rounded-md bg-gradient-to-br", meta?.gradient)}>
                <Icon className="size-5 text-[#F5A623]" />
              </div>
              <CardTitle className="font-serif text-2xl mt-3">{pack.label}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">{formatUsd(pack.priceCents)}</span>
                <span className="text-sm ml-2 text-muted-foreground">one-time</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-serif text-gold">{pack.credits}</div>
              <div className="text-xs text-muted-foreground">credits</div>
              <RippleButton
                className="w-full"
                disabled={busy === pack.key}
                onClick={onBuy}
              >
                {busy === pack.key ? "Redirecting…" : `Buy ${pack.credits} credits`}
              </RippleButton>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
