import { getUncachableStripeClient } from './stripeClient';
import { stripeStorage } from './stripeStorage';

export class StripeService {
  async createCustomer(email: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.customers.create({ email, metadata: { app: 'liftiq' } });
  }

  async createCheckoutSession(customerId: string, priceId: string, baseUrl: string) {
    const stripe = getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    const stripe = getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    status: string | null;
    planName: string | null;
    currentPeriodEnd: number | null;
    stripeCustomerId: string | null;
  }> {
    const profile = await stripeStorage.getProfile();
    if (!profile?.stripeCustomerId) {
      return { isActive: false, status: null, planName: null, currentPeriodEnd: null, stripeCustomerId: null };
    }

    const sub = await stripeStorage.getActiveSubscriptionForCustomer(profile.stripeCustomerId);
    if (!sub) {
      return { isActive: false, status: null, planName: null, currentPeriodEnd: null, stripeCustomerId: profile.stripeCustomerId };
    }

    // Get plan name from price/product
    let planName: string | null = null;
    try {
      const priceResult = await stripeStorage.getProduct((sub as any).items?.[0]?.price?.product ?? '');
      planName = (priceResult as any)?.name ?? 'LiftIQ Pro';
    } catch {
      planName = 'LiftIQ Pro';
    }

    return {
      isActive: ['active', 'trialing'].includes((sub as any).status),
      status: (sub as any).status,
      planName,
      currentPeriodEnd: (sub as any).current_period_end ?? null,
      stripeCustomerId: profile.stripeCustomerId,
    };
  }
}

export const stripeService = new StripeService();
