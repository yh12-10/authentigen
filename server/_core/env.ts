export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceStarter: process.env.STRIPE_PRICE_STARTER ?? "",
  stripePricePro: process.env.STRIPE_PRICE_PRO ?? "",
  stripePriceStudio: process.env.STRIPE_PRICE_STUDIO ?? "",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  // Video pipeline
  videoMaxDurationSeconds: Number(process.env.VIDEO_MAX_DURATION_SECONDS ?? 30),
  videoFrameSampleEvery: Number(process.env.VIDEO_FRAME_SAMPLE_EVERY ?? 3),
};

export function isStripeConfigured(): boolean {
  return Boolean(
    ENV.stripeSecretKey &&
    ENV.stripeWebhookSecret &&
    ENV.stripePriceStarter &&
    ENV.stripePricePro &&
    ENV.stripePriceStudio
  );
}
