import { json, stripe, configuredPlans } from "./_shared.js";
export async function onRequestGet({ env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ plans: [] }, 503);
  const available = configuredPlans(env);
  if (available.some(plan => !/^price_[a-zA-Z0-9]+$/.test(plan.price || ""))) return json({ plans: [] }, 503);
  try {
    const results = await Promise.all(available.map(async plan => {
      const price = await stripe(env, "GET", "/prices/" + encodeURIComponent(plan.price));
      if (!price.active || price.type !== "one_time" || price.currency !== "usd" || price.unit_amount !== plan.cents) throw new Error("Configured Stripe price does not match the published package");
      return { id: plan.id, name: plan.name, displayPrice: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(plan.cents / 100) };
    }));
    return json({ plans: results });
  } catch (error) {
    console.error("Unable to load website package prices:", error.message);
    return json({ plans: [] }, 503);
  }
}
