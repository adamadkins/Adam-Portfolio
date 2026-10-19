import { json, stripe, configuredPlans } from "./_shared.js";
export async function onRequestGet({ env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ plans: [] }, 503);
  const available = configuredPlans(env);
  if (!available.length) return json({ plans: [] });
  try {
    const results = await Promise.all(available.map(async plan => {
      const price = await stripe(env, "GET", "/prices/" + encodeURIComponent(plan.price));
      if (!price.active || price.type !== "recurring" || price.recurring?.interval !== "month" || price.unit_amount == null) return null;
      const displayPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency.toUpperCase() }).format(price.unit_amount / 100) + "/month";
      return { id: plan.id, name: plan.name, displayPrice };
    }));
    return json({ plans: results.filter(Boolean) });
  } catch (error) {
    console.error("Unable to load Stripe plans:", error.message);
    return json({ plans: [] }, 503);
  }
}
