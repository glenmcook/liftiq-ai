import { Router, type IRouter } from "express";
import { stripeStorage } from "../stripeStorage";
import { stripeService } from "../stripeService";

const router: IRouter = Router();

// ─── GET /api/stripe/status ──────────────────────────────────────────────────
// Returns subscription status for the single user profile

router.get("/stripe/status", async (_req, res): Promise<void> => {
  try {
    const status = await stripeService.getSubscriptionStatus();
    res.json(status);
  } catch {
    // Graceful fallback when Stripe isn't configured
    res.json({ isActive: false, status: null, planName: null, currentPeriodEnd: null, stripeCustomerId: null });
  }
});

// ─── GET /api/stripe/products ────────────────────────────────────────────────
// Fetches directly from Stripe API so it works even before sync runs

router.get("/stripe/products", async (_req, res): Promise<void> => {
  try {
    const { getUncachableStripeClient } = await import("../stripeClient");
    let stripe: any;
    try {
      stripe = getUncachableStripeClient();
    } catch {
      res.json({ data: [] }); // Stripe not configured yet
      return;
    }

    const products = await stripe.products.list({ active: true, limit: 20 });
    const result = await Promise.all(
      products.data.map(async (product: any) => {
        const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          metadata: product.metadata ?? {},
          prices: prices.data.map((p: any) => ({
            id: p.id,
            unitAmount: p.unit_amount,
            currency: p.currency,
            recurring: p.recurring,
          })),
        };
      })
    );

    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/stripe/checkout ───────────────────────────────────────────────

router.post("/stripe/checkout", async (req, res): Promise<void> => {
  try {
    const { priceId, email } = req.body ?? {};
    if (!priceId) { res.status(400).json({ error: "priceId is required" }); return; }

    const profile = await stripeStorage.getProfile();
    if (!profile) { res.status(404).json({ error: "Profile not found. Complete onboarding first." }); return; }

    // Create or reuse Stripe customer
    let customerId = profile.stripeCustomerId;
    if (!customerId) {
      const customerEmail = email || profile.email || "user@liftiq.app";
      const customer = await stripeService.createCustomer(customerEmail);
      await stripeStorage.updateStripeInfo(customer.id, null);
      customerId = customer.id;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const session = await stripeService.createCheckoutSession(customerId, priceId, baseUrl);

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/stripe/portal ─────────────────────────────────────────────────

router.post("/stripe/portal", async (req, res): Promise<void> => {
  try {
    const profile = await stripeStorage.getProfile();
    if (!profile?.stripeCustomerId) {
      res.status(400).json({ error: "No Stripe customer found." });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const session = await stripeService.createPortalSession(
      profile.stripeCustomerId,
      `${baseUrl}/settings`
    );

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
