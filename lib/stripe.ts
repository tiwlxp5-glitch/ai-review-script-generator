import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any,
  appInfo: {
    name: "ReviewScript AI",
    version: "1.0.0",
  },
  httpClient: Stripe.createFetchHttpClient(),
});

