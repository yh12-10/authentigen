import express, { type Express } from "express";
import { ENV, isStripeConfigured } from "./env";
import { getStripe, handleCheckoutCompleted } from "../payments";

/**
 * Mount the Stripe webhook handler.
 *
 * MUST be called BEFORE `express.json()` is registered globally — Stripe
 * signature verification requires the raw request body bytes, not a parsed
 * object. We use express.raw scoped to this route.
 */
export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      if (!isStripeConfigured()) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      if (!sig || typeof sig !== "string") {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event;
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "signature verification failed";
        console.error("[Stripe] webhook signature verification failed:", msg);
        return res.status(400).json({ error: "Invalid signature" });
      }

      try {
        if (event.type === "checkout.session.completed") {
          await handleCheckoutCompleted(event);
        }
        return res.json({ received: true });
      } catch (err) {
        console.error("[Stripe] error handling event", event.type, err);
        // Return 500 so Stripe retries.
        return res.status(500).json({ error: "Handler failed" });
      }
    }
  );
}
