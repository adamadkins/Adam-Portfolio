# Adam Adkins portfolio

Static HTML/CSS/JS portfolio deployed as a **Cloudflare Worker with static assets** from branch `main`. `wrangler.jsonc` defines the Worker entry point (`worker.js`) and asset binding (`ASSETS`). The Worker routes `/api/contact` to Cloudflare Email Sending and `/api/payments/*` to the existing Stripe handlers under `functions/`; all other requests are served as static assets. `.assetsignore` excludes backend/configuration files from public assets. **Deploy using Wrangler configuration from this repository**, not a static-assets-only upload. If Cloudflare's Git deployment ignores Wrangler configuration, set the Worker build/deploy command to `npx wrangler deploy` with repository root as working directory, or recreate the deployment as a Git-connected Worker with this configuration. Confirm that the deployment logs show a Worker script, not only static assets.

## Project inquiry and approval workflow

Website Essentials is $750 and Website + Lifetime Support is $1,500, both one-time package prices. Package buttons open the dedicated `/contact.html` project inquiry page and preselect the chosen option on its contact form. The homepage includes a brief Next Step call-to-action linking to this page. Clients are **not charged** at inquiry. Adam reviews the project, confirms the scope, timeline, written agreement and support terms, then manually sends a Stripe invoice or deposit request. Work starts after payment is verified.

The payment API only exposes invoice lookup, not public package checkout. Existing Stripe Price IDs may remain configured but are unused.

Lifetime support includes reasonable fixes, troubleshooting, minor content changes and compatibility updates for the original delivered website while operational and while Adam continues providing website services. It excludes redesigns, major features, replacement websites, hosting, domains, third-party fees and guaranteed response times. Terms are agreed before purchase.

## Custom invoices and quote-based deposits

Create a custom invoice in Stripe for the agreed quote or deposit, assign the customer's billing email, and finalize it. Clients enter the Stripe invoice number and matching billing email on `/payments.html` to open the Stripe-hosted invoice payment page. Amounts are controlled by the invoice. This is a separate workflow from purchasing a full website package. Invoice number plus email is **not strong identity verification**; consider email OTP verification before enabling public lookup, or send Stripe-hosted invoice links directly. Add Cloudflare rate limiting and bot protection for the payment API.

## Activation and testing

1. Configure `STRIPE_SECRET_KEY` as a Cloudflare Worker secret. Price IDs are not required for invoice-only payments.
2. Test package inquiries and invoice lookup in Stripe test mode before accepting live payments.
3. Check the Stripe Dashboard for successful payment before starting work. A success-page redirect alone is not payment verification. This site does not automatically provision services, issue custom invoices, or process payment webhooks.
4. Define a signed project agreement, fulfillment timeline, refund/cancellation terms, scope of work, and lifetime support policy before accepting live purchases. Set up Stripe receipts and applicable taxes in Stripe. Never commit Stripe secret keys or customer data to GitHub.

## Contact

The contact form posts to `/api/contact` on this Worker. The `CONTACT_EMAIL` binding is restricted to `hello@tlt-studios.com`. Inquiry emails use that same verified-domain sender, the visitor’s name/address as Reply-To, and branded HTML plus plain text. Both inbox notifications and visitor acknowledgments include the exact site logo as an inline Content-ID PNG rather than relying on Gmail to load a remote SVG or website URL. The `CONTACT_CONFIRMATION_EMAIL` binding is restricted to sending from `hello@tlt-studios.com` and addresses the validated visitor email only. After the inquiry notification is accepted, the Worker attempts to send one branded confirmation; failure to send a receipt never tells the visitor to re-submit an accepted inquiry. Repeated confirmations to a recipient are capped by a separate recipient key in `CONTACT_RATE_LIMIT` (five per minute). Cloudflare Email Routing for hello@ must continue forwarding to your verified inbox.

Deploy with `npx wrangler@latest deploy` (Wrangler 4.36.0 or newer is required for rate limiting). The tracked configuration creates CONTACT_EMAIL, CONTACT_CONFIRMATION_EMAIL, and CONTACT_RATE_LIMIT on **adam-portfolio**, separately from the portal’s EMAIL binding. Domain sending must be enabled. Verify hello@ is an allowed/verified destination if Cloudflare requests it. No SMTP credentials are needed.

The endpoint validates bounded input, escapes HTML, rejects cross-origin browser submissions, traps the existing honeypot, and limits requests to five per minute per connecting IP per Cloudflare location. This is basic abuse mitigation, not a global quota or a CAPTCHA. It never accepts a client-supplied recipient, sender, or subject. Failed submissions preserve the form in JavaScript-enabled browsers; native form submission gets a styled result page.

Run `node --test test/contact.test.mjs`. Tests use mocked email/rate-limit bindings and send no real email. After deployment, submit one inquiry from an email address you control and verify both messages: the studio notification arriving in Gmail with the correct Reply-To and the visitor's branded acknowledgment with a visible inline PNG logo. Also verify the mobile form layout and the ability to reply to the acknowledgment. Provider acceptance is not proof of inbox delivery. FormSubmit is no longer used.

## Seasonal themes

The studio switches the site's holiday dress-up from the client portal (Settings, "Seasonal themes"), with no redeploy. `season.js`
(loaded on every page) asks `https://portal.tlt-studios.com/api/site/theme` which theme is live, remembers the answer in
`localStorage` so repeat visits dress instantly, and only then downloads `season.css` and `season-art.js`. With no theme on, nothing else
is fetched. Themes: `valentines`, `easter`, `july4`, `halloween`, `thanksgiving`, `christmas`, `newyear`.

Add `?season=halloween` (or any theme name, or `off`) to any page to preview a theme without changing what visitors see.

To add a theme: draw its pieces in `season-art.js` (a function in `themes`, plus an entry in `icons` for the lightbulb's replacement),
style them in `season.css`, add its name to `NAMES` in `season.js`, and add it to `THEMES` in the portal's `src/site-theme.js` with its dates.
Keep moving parts to one transform or opacity animation each (a falling effect is one tiled layer), so a theme stays light on phones.

Images under `/images/` are cached by browsers for a week (see `_headers`), so when a picture changes, give it a new file name (for example `leaves-near-v3.webp`) and update the reference; otherwise visitors keep seeing the old one.

## Work pages

The showcase (`work.html`) and one page per project (`work/<slug>.html`) are generated from `work/projects.json`, so adding a project never means editing HTML.

To add a project:

1. Add an entry to `work/projects.json` (copy an existing one: name, category, colour, summary, facts, notes, phone captions). New categories go in `categories`.
2. Put its screenshots in `images/work/page/`: `<slug>-tall.webp` (a tall full-page desktop screenshot, about 960px wide) and `<slug>-m-1.webp`, `-m-2.webp`, `-m-3.webp` (phone screenshots, 390px wide). Rename an image if you replace it, because images are cached for 7 days.
3. Run `node scripts/build-work.mjs`, then commit the generated files.

`node --test test/contact.test.mjs test/work.test.mjs` fails if the generated pages are out of date. The first project with `"featured": true` is shown large at the top; the filter chips and the previous / next links appear on their own as projects are added. The header and footer are copied from `about.html` at build time.
