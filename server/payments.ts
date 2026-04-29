import Stripe from "stripe";
import { ENV, isStripeConfigured } from "./_core/env";
import { getDb, getUserById } from "./db";
import { creditTransactions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs in .env.");
  }
  if (!_stripe) {
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

export type PackKey = "starter" | "pro" | "studio";

export const PRICE_PACKS: Record<
  PackKey,
  { credits: number; label: string; priceCents: number; getPriceId: () => string }
> = {
  starter: {
    credits: 50,
    label: "Starter",
    priceCents: 499,
    getPriceId: () => ENV.stripePriceStarter,
  },
  pro: {
    credits: 200,
    label: "Pro",
    priceCents: 1499,
    getPriceId: () => ENV.stripePricePro,
  },
  studio: {
    credits: 500,
    label: "Studio",
    priceCents: 2999,
    getPriceId: () => ENV.stripePriceStudio,
  },
};

export async function createCheckoutSession(userId: number, pack: PackKey): Promise<string> {
  const stripe = getStripe();
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const config = PRICE_PACKS[pack];
  const priceId = config.getPriceId();
  if (!priceId) throw new Error(`Stripe price ID for ${pack} is not configured`);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: String(userId),
    success_url: `${ENV.appBaseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ENV.appBaseUrl}/billing/cancel`,
    metadata: {
      userId: String(userId),
      pack,
      credits: String(config.credits),
    },
    customer_email: user.email ?? undefined,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/**
 * Idempotently grant credits for a completed checkout session.
 * Idempotency is enforced by the unique index on credit_transactions.stripeSessionId.
 */
export async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  if (event.type !== "checkout.session.completed") return;
  const session = event.data.object as Stripe.Checkout.Session;

  const userIdStr = session.metadata?.userId ?? session.client_reference_id;
  const pack = session.metadata?.pack as PackKey | undefined;
  const creditsStr = session.metadata?.credits;

  if (!userIdStr || !pack || !creditsStr) {
    console.error("[Stripe] missing metadata on session", session.id);
    return;
  }

  const userId = Number(userIdStr);
  const credits = Number(creditsStr);
  if (!Number.isFinite(userId) || !Number.isFinite(credits) || credits <= 0) {
    console.error("[Stripe] invalid metadata values on session", session.id);
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Stripe] DB unavailable; cannot grant credits for session", session.id);
    return;
  }

  const user = await getUserById(userId);
  if (!user) {
    console.error("[Stripe] user not found for completed session", userId, session.id);
    return;
  }

  // Insert the transaction first. Unique index on stripeSessionId is the idempotency guarantee.
  try {
    await db.insert(creditTransactions).values({
      userId,
      amount: credits,
      type: "purchase",
      description: `Purchased ${PRICE_PACKS[pack].label} pack (${credits} credits)`,
      stripeSessionId: session.id,
    });
  } catch (err) {
    // Duplicate insert means this session was already processed. Idempotent skip.
    console.log("[Stripe] duplicate webhook for session", session.id, "- skipping credit grant");
    return;
  }

  // Bump the user's credit balance.
  await db
    .update(users)
    .set({ credits: user.credits + credits })
    .where(eq(users.id, userId));

  // Persist the Stripe customer ID if present and we don't already have it.
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (stripeCustomerId && !user.stripeCustomerId) {
    await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
  }
}
