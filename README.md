# Adam Adkins portfolio

Static HTML/CSS/JS portfolio deployed as a **Cloudflare Worker with static assets** from branch `main`. `wrangler.jsonc` defines the Worker entry point (`worker.js`) and asset binding (`ASSETS`). The Worker routes `/api/payments/*` to the existing Stripe handlers under `functions/`; all other requests are served as static assets. `.assetsignore` excludes backend/configuration files from public assets. **Deploy using Wrangler configuration from this repository**, not a static-assets-only upload. If Cloudflare's Git deployment ignores Wrangler configuration, set the Worker build/deploy command to `npx wrangler deploy` with repository root as working directory, or recreate the deployment as a Git-connected Worker with this configuration. Confirm that the deployment logs show a Worker script, not only static assets.

## Project inquiry and approval workflow

Website Essentials is $750 and Website + Lifetime Support is $1,500, both one-time package prices. Package buttons open the dedicated `/contact.html` project inquiry page and preselect the chosen option on its FormSubmit form. The homepage includes a brief Next Step call-to-action linking to this page. Clients are **not charged** at inquiry. Adam reviews the project, confirms the scope, timeline, written agreement and support terms, then manually sends a Stripe invoice or deposit request. Work starts after payment is verified.

The Worker only exposes invoice lookup, not public package checkout. Existing Stripe Price IDs may remain configured but are unused.

Lifetime support includes reasonable fixes, troubleshooting, minor content changes and compatibility updates for the original delivered website while operational and while Adam continues providing website services. It excludes redesigns, major features, replacement websites, hosting, domains, third-party fees and guaranteed response times. Terms are agreed before purchase.

## Custom invoices and quote-based deposits

Create a custom invoice in Stripe for the agreed quote or deposit, assign the customer's billing email, and finalize it. Clients enter the Stripe invoice number and matching billing email on `/payments.html` to open the Stripe-hosted invoice payment page. Amounts are controlled by the invoice. This is a separate workflow from purchasing a full website package. Invoice number plus email is **not strong identity verification**; consider email OTP verification before enabling public lookup, or send Stripe-hosted invoice links directly. Add Cloudflare rate limiting and bot protection for the payment API.

## Activation and testing

1. Configure `STRIPE_SECRET_KEY` as a Cloudflare Worker secret. Price IDs are not required for invoice-only payments.
2. Test package inquiries and invoice lookup in Stripe test mode before accepting live payments.
3. Check the Stripe Dashboard for successful payment before starting work. A success-page redirect alone is not payment verification. This site does not automatically provision services, issue custom invoices, or process payment webhooks.
4. Define a signed project agreement, fulfillment timeline, refund/cancellation terms, scope of work, and lifetime support policy before accepting live purchases. Set up Stripe receipts and applicable taxes in Stripe. Never commit Stripe secret keys or customer data to GitHub.

## Contact

FormSubmit delivers the existing contact form to `adkins.adam04@gmail.com`; the first submission requires FormSubmit activation.
