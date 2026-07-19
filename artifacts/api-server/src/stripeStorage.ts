import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db, userProfilesTable } from '@workspace/db';

export class StripeStorage {
  // ─── Stripe schema queries ────────────────────────────────────────────────

  async getProduct(productId: string) {
    const result = await db.execute(sql`SELECT * FROM stripe.products WHERE id = ${productId}`);
    return result.rows[0] ?? null;
  }

  async listProductsWithPrices() {
    const result = await db.execute(sql`
      WITH paginated_products AS (
        SELECT id, name, description, metadata, active
        FROM stripe.products
        WHERE active = true
        ORDER BY name
      )
      SELECT
        p.id        AS product_id,
        p.name      AS product_name,
        p.description AS product_description,
        p.active    AS product_active,
        p.metadata  AS product_metadata,
        pr.id       AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active   AS price_active,
        pr.metadata AS price_metadata
      FROM paginated_products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      ORDER BY p.name, pr.unit_amount
    `);
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] ?? null;
  }

  async getActiveSubscriptionForCustomer(customerId: string) {
    const result = await db.execute(sql`
      SELECT * FROM stripe.subscriptions
      WHERE customer = ${customerId}
        AND status IN ('active', 'trialing')
      ORDER BY created DESC
      LIMIT 1
    `);
    return result.rows[0] ?? null;
  }

  // ─── User profile (single-user app) ──────────────────────────────────────

  async getProfile() {
    const [profile] = await db.select().from(userProfilesTable).limit(1);
    return profile ?? null;
  }

  async updateStripeInfo(stripeCustomerId: string | null, stripeSubscriptionId: string | null) {
    const [profile] = await db.select().from(userProfilesTable).limit(1);
    if (!profile) return null;
    const [updated] = await db
      .update(userProfilesTable)
      .set({ stripeCustomerId, stripeSubscriptionId, updatedAt: new Date() })
      .where(eq(userProfilesTable.id, profile.id))
      .returning();
    return updated;
  }
}

export const stripeStorage = new StripeStorage();
