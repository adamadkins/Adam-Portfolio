import { json, fail, validEmail, sameOrigin, stripe } from "./_shared.js";
const generic = "We couldn't verify an open invoice with those details. Check the invoice number and billing email, or contact Adam.";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request not allowed.", 403);
  if (!env.STRIPE_SECRET_KEY) return fail("Online invoice payments are not configured yet.", 503);
  let body;
  try { body = await request.json(); } catch { return fail("Invalid request."); }
  const number = typeof body.invoiceNumber === "string" ? body.invoiceNumber.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[a-zA-Z0-9-]{3,80}$/.test(number) || !validEmail(email)) return fail("Enter a valid invoice number and billing email.");
  try {
    const search = await stripe(env, "GET", "/invoices/search?" + new URLSearchParams({ query: "number:'" + number + "'", limit: "10" }));
    const invoice = search.data?.find(item => item.number?.toLowerCase() === number.toLowerCase());
    if (!invoice || invoice.status !== "open" || !invoice.hosted_invoice_url || invoice.amount_remaining <= 0) return fail(generic, 404);
    let billingEmail = invoice.customer_email;
    if (!billingEmail && typeof invoice.customer === "string") {
      const customer = await stripe(env, "GET", "/customers/" + encodeURIComponent(invoice.customer));
      billingEmail = customer.email;
    }
    if (!billingEmail || billingEmail.trim().toLowerCase() !== email) return fail(generic, 404);
    const destination = new URL(invoice.hosted_invoice_url);
    if (destination.protocol !== "https:" || !destination.hostname.endsWith(".stripe.com")) return fail("Payment destination is unavailable.", 503);
    return json({ url: destination.toString() });
  } catch (error) {
    console.error("Invoice lookup failed:", error.message);
    return fail("Invoice lookup is temporarily unavailable. Please try again later.", 503);
  }
}
