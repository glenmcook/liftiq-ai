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

router.get("/stripe/products", async (_req, res): Promise<void> => {
  try {
    // Return empty if Stripe isn't configured yet
    let rows: any[];
    try {
      rows = await stripeStorage.listProductsWithPrices();
    } catch {
      res.json({ data: [] });
      return;
    }

    const map = new Map<string, any>();
    for (const row of rows) {
      const r = row as any;
      if (!map.has(r.product_id)) {
        map.set(r.product_id, {
          id: r.product_id,
          name: r.product_name,
          description: r.product_description,
          metadata: r.product_metadata ?? {},
          prices: [],
        });
      }
      if (r.price_id) {
        map.get(r.product_id).prices.push({
          id: r.price_id,
          unitAmount: r.unit_amount,
          currency: r.currency,
          recurring: r.recurring,
        });
      }
    }

    res.json({ data: Array.from(map.values()) });
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
