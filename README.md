# Adam Adkins portfolio

Static HTML/CSS/JS portfolio deployed through Cloudflare Pages (branch `main`, no framework preset, no build command, output `/`). Payment APIs require **Cloudflare Pages Functions** in `functions/`, not static-only hosting.

## Stripe website packages

`/payments.html` sells exactly two **one-time** website packages:

| Package | One-time USD price | Stripe Price environment variable |
| --- | ---: | --- |
| Website Essentials | $750 | `STRIPE_PRICE_WEBSITE_ESSENTIAL` |
| Website + Lifetime Support | $1,500 | `STRIPE_PRICE_WEBSITE_LIFETIME` |

Create two Stripe products with **one-time USD Prices**, $750.00 and $1,500.00. Set their `price_...` IDs in **Cloudflare Pages > Settings > Variables and Secrets**, along with `STRIPE_SECRET_KEY` as a **secret**. The server verifies both the Price ID and exact amount/currency/frequency before creating a Checkout Session. No client-supplied amounts are accepted. The former monthly subscription plans and related variables are unused and may be removed from Cloudflare.

**Website Essentials:** responsive website, agreed essential pages and contact form, basic SEO setup, deployment and launch assistance. Corrections to defects present at delivery are included if reported within 30 days after launch; new work is quoted separately.

**Website + Lifetime Support:** Essentials plus bug fixes, troubleshooting, minor text/image changes, and reasonable compatibility and maintenance updates for the original delivered website while it remains operational and Adam Adkins continues providing website services. Excludes unlimited redesigns, major new pages or features, replacement websites, third-party hosting/domains/subscriptions, and work outside the original project scope. No guaranteed response time; exact scope, reasonable-use limits, and conditions should be agreed in writing before purchase. Lifetime does **not** mean unlimited free development.

## Custom invoices and quote-based deposits

Create a custom invoice in Stripe for the agreed quote or deposit, assign the customer's billing email, and finalize it. Clients enter the Stripe invoice number and matching billing email on `/payments.html` to open the Stripe-hosted invoice payment page. Amounts are controlled by the invoice. This is a separate workflow from purchasing a full website package. Invoice number plus email is **not strong identity verification**; consider email OTP verification before enabling public lookup, or send Stripe-hosted invoice links directly. Add Cloudflare rate limiting and bot protection for the payment API.

## Activation and testing

1. Configure `STRIPE_SECRET_KEY` (secret), `STRIPE_PRICE_WEBSITE_ESSENTIAL`, and `STRIPE_PRICE_WEBSITE_LIFETIME` in Cloudflare Pages.
2. Begin with Stripe test-mode keys and test-mode one-time Prices, test both Checkout packages and invoice lookup, then switch to live keys and live Prices.
3. Check the Stripe Dashboard for successful payment before starting work. A success-page redirect alone is not payment verification. This site does not automatically provision services, issue custom invoices, or process payment webhooks.
4. Define a signed project agreement, fulfillment timeline, refund/cancellation terms, scope of work, and lifetime support policy before accepting live purchases. Set up Stripe receipts and applicable taxes in Stripe. Never commit Stripe secret keys or customer data to GitHub.

## Contact

FormSubmit delivers the existing contact form to `adkins.adam04@gmail.com`; the first submission requires FormSubmit activation.
