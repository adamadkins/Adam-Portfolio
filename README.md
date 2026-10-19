# Adam Adkins portfolio

Static HTML/CSS/JS portfolio for Cloudflare Pages.

## Deploy

Connect `adamadkins/Adam-Portfolio` to Cloudflare Pages, production branch `main`, no framework preset, no build command, output directory `/` (repository root). Cloudflare Pages Functions under `functions/` handle secure Stripe requests. **Do not deploy as a static-only Worker or via GitHub Pages**: the payment API requires Cloudflare Pages Functions.

## Contact

FormSubmit sends messages to `adkins.adam04@gmail.com`. Confirm the activation email after the first submission.

## Stripe setup

The public `/payments.html` page supports:

1. **Custom invoices and deposits**: Create a Stripe invoice for each agreed project quote or deposit in the Stripe Dashboard, assign the client's billing email, and finalize/send the invoice. The client can enter the **Stripe invoice number** and matching billing email to open the Stripe-hosted invoice payment page. Amounts come from the Stripe invoice; clients cannot choose arbitrary amounts. This lookup checks the billing email, but **email knowledge is not authentication**. Invoice numbers should be treated as sensitive and should not be sequentially guessable if using this public lookup. For stricter privacy, send Stripe-hosted invoice links directly or add an email OTP verification service before enabling lookup.
2. **Fixed monthly maintenance**: Create up to three active monthly recurring Prices in Stripe, then set the matching Cloudflare Pages environment variables. The public website displays the actual Stripe prices and starts Stripe-hosted Checkout subscriptions. Plan names are `Essential maintenance`, `Website care`, and `Priority support`. Rename these in `functions/api/payments/_shared.js` if desired.

In **Cloudflare Pages > Settings > Variables and Secrets**, configure:
- `STRIPE_SECRET_KEY` **secret**, set to your Stripe secret key. Never place it in a public file, JavaScript, or GitHub.
- `STRIPE_PRICE_ESSENTIAL` optional, monthly Stripe Price ID (`price_...`)
- `STRIPE_PRICE_CARE` optional, monthly Stripe Price ID (`price_...`)
- `STRIPE_PRICE_PRIORITY` optional, monthly Stripe Price ID (`price_...`)

Start with Stripe **test mode** credentials and test-mode Prices, and test invoice lookup, Checkout success/cancel, and subscription creation before switching to live keys and live Price IDs. Cloudflare production and preview environments need separate settings.

Subscriptions and invoices are managed in the Stripe Dashboard. Stripe handles billing emails and receipts when configured in Stripe. This integration **does not automatically provision maintenance services, verify fulfillment, create invoices, or process webhooks**. Stripe Checkout success redirect is not proof of payment; check Stripe Dashboard before providing services. Do not place real client data in the repo.

**Security/operations**: The invoice lookup requires both invoice number and billing email, uses generic mismatch responses, and does not expose invoice details. It is not a substitute for strong identity verification. Add Cloudflare WAF rate limits/bot protection for `/api/payments/invoice` and `/api/payments/checkout` before public launch. Configure Stripe billing and customer support policies, taxes, refund terms, and subscription cancellation policy. No Stripe keys or prices have been configured automatically.
