import { json, fail, validEmail, sameOrigin, stripe, configuredPlans } from "./_shared.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request not allowed.", 403);
  if (!env.STRIPE_SECRET_KEY) return fail("Website checkout is not configured yet.", 503);
  let body;
  try { body = await request.json(); } catch { return fail("Invalid request."); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!validEmail(email)) return fail("Enter a valid billing email.");
  const plan = configuredPlans(env).find(p => p.id === body.plan);
  if (!plan || !/^price_[a-zA-Z0-9]+$/.test(plan.price || "")) return fail("This website package is not available.", 404);
  try {
    const price = await stripe(env, "GET", "/prices/" + encodeURIComponent(plan.price));
    if (!price.active || price.type !== "one_time" || price.currency !== "usd" || price.unit_amount !== plan.cents) return fail("This website package is not available.", 404);
    const origin = new URL(request.url).origin;
    const session = await stripe(env, "POST", "/checkout/sessions", {
      mode: "payment",
      "line_items[0][price]": plan.price,
      "line_items[0][quantity]": "1",
      customer_email: email,
      "payment_intent_data[metadata][website_package]": plan.id,
      success_url: origin + "/payments.html?status=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/payments.html?status=cancelled",
      "billing_address_collection": "auto"
    });
    if (!session.url?.startsWith("https://checkout.stripe.com/")) return fail("Secure checkout is unavailable.", 503);
    return json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout failed:", error.message);
    return fail("Unable to start checkout. Please try again later.", 503);
  }
}
