const STRIPE_API = "https://api.stripe.com/v1";
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export function fail(message = "Payment could not be started.", status = 400) {
  return json({ message }, status);
}
export function validEmail(value) {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}
export async function stripe(env, method, path, params) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  const response = await fetch(STRIPE_API + path, {
    method,
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: params ? new URLSearchParams(params).toString() : undefined
  });
  const result = await response.json();
  if (!response.ok) throw new Error("Stripe request failed: " + (result.error?.type || response.status));
  return result;
}
export function configuredPlans(env) {
  return [
    { id: "essential", name: "Essential maintenance", price: env.STRIPE_PRICE_ESSENTIAL },
    { id: "care", name: "Website care", price: env.STRIPE_PRICE_CARE },
    { id: "priority", name: "Priority support", price: env.STRIPE_PRICE_PRIORITY }
  ].filter(plan => typeof plan.price === "string" && /^price_[a-zA-Z0-9]+$/.test(plan.price));
}
