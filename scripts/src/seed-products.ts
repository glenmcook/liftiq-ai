import { getUncachableStripeClient } from './stripeClient';

/**
 * Seeds LiftIQ products and prices in Stripe.
 * Idempotent — safe to run multiple times.
 *
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 */
async function seedProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('🔍 Checking for existing LiftIQ Pro product...');

  const existing = await stripe.products.search({ query: "name:'LiftIQ Pro' AND active:'true'" });
  if (existing.data.length > 0) {
    const prod = existing.data[0];
    console.log(`✓ LiftIQ Pro already exists (${prod.id})`);
    const prices = await stripe.prices.list({ product: prod.id, active: true });
    prices.data.forEach(p => {
      const interval = (p.recurring as any)?.interval ?? 'one-time';
      console.log(`  └─ $${((p.unit_amount ?? 0) / 100).toFixed(2)}/${interval} — ${p.id}`);
    });
    return;
  }

  console.log('📦 Creating LiftIQ Pro product...');
  const product = await stripe.products.create({
    name: 'LiftIQ Pro',
    description: 'Unlock all AI features: plan generation, nutrition protocol, AI check-in, DEXA parsing, and more.',
    metadata: { tier: 'pro', app: 'liftiq' },
  });
  console.log(`✓ Created product: ${product.id}`);

  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 1299, // $12.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Pro Monthly',
  });
  console.log(`✓ Monthly: $12.99/mo — ${monthly.id}`);

  const annual = await stripe.prices.create({
    product: product.id,
    unit_amount: 9900, // $99/year (~$8.25/mo, 36% off)
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Pro Annual',
  });
  console.log(`✓ Annual:  $99.00/yr — ${annual.id}`);

  console.log('\n✅ LiftIQ Pro created. Webhooks will sync to your database shortly.');
}

seedProducts().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
