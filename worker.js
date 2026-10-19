import { onRequestPost as invoice } from "./functions/api/payments/invoice.js";
import { onRequestPost as checkout } from "./functions/api/payments/checkout.js";
import { onRequestGet as plans } from "./functions/api/payments/plans.js";
import { fail } from "./functions/api/payments/_shared.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const routes = {
      "/api/payments/invoice": { POST: invoice },
      "/api/payments/checkout": { POST: checkout },
      "/api/payments/plans": { GET: plans }
    };
    const route = routes[url.pathname];
    if (!route) return fail("Not found.", 404);
    const handler = route[request.method];
    if (!handler) return new Response("Method not allowed", { status: 405, headers: { Allow: Object.keys(route).join(", ") } });
    try { return await handler({ request, env }); }
    catch (error) { console.error("Payment route error:", error); return fail("Payment service temporarily unavailable.", 503); }
  }
};
