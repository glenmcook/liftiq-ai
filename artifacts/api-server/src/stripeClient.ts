import Stripe from 'stripe';
import { StripeSync } from 'stripe-replit-sync';

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. ' +
      'Add it as a Replit Secret to enable Stripe payments.'
    );
  }
  return key;
}

export function getUncachableStripeClient(): Stripe {
  return new Stripe(getSecretKey());
}

export async function getStripeSync(): Promise<StripeSync> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required');

  const secretKey = getSecretKey();
  return new StripeSync({
    poolConfig: { connectionString: databaseUrl },
    stripeSecretKey: secretKey,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  });
}
