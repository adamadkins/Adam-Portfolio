import { logoAttachment } from "./email-logo.js";

const ADDRESS = "hello@tlt-studios.com";
// The inquiry notification comes from its own address, not from hello@ to hello@: mail a mailbox sends to itself through an outside
// server is easily mistaken for spoofing. Replying goes to the visitor (replyTo).
const FORM_SENDER = "forms@tlt-studios.com";
const TYPES = new Set(["New website", "Website Essentials ($750)", "Website + Lifetime Support ($1500)", "Website redesign", "Technical support", "Other inquiry", "Demo website", "Event Page ($150 + $15/mo)", "Event Site ($250 + $20/mo)"]);
const DEMO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Gmail's iOS dark mode inverts colors but leaves background images alone. Navy panels paint
// with a gradient so they stay navy, and the Gmail-only (u + .body) blend wrappers flip the
// inverted header text back. Keep images outside keepLight() so they are not inverted.
const EMAIL_HEAD = `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><style>u + .body .gmail-screen{background:#000;mix-blend-mode:screen}u + .body .gmail-difference{background:#000;mix-blend-mode:difference}</style>`;
const NAVY_PANEL = "background-color:#14202e;background-image:linear-gradient(#14202e,#14202e)";
const keepLight = html => `<div class="gmail-screen"><div class="gmail-difference">${html}</div></div>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function inquiryMessage({name, email, project_type, message, subject}) {
  return {
    to: ADDRESS,
    from: {email: FORM_SENDER, name: "TLT Studios website"},
    replyTo: {email, name},
    subject: subject || "New project inquiry: " + project_type,
    text: ["A little idea just landed.", "", "Name: " + name, "Email: " + email, "Project: " + project_type, "", message, "", "Reply to this email to contact " + name + ".", "The Little Things Studios | tlt-studios.com"].join("\n"),
    html: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">${EMAIL_HEAD}</head><body class="body" style="margin:0;background:#f1f4f6;color:#14202e;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border:1px solid #dce3e8"><tr><td bgcolor="#14202e" style="padding:32px;${NAVY_PANEL};color:#fff"><img src="cid:tlt-logo" alt="" width="44" height="44" style="display:block;margin-bottom:22px;border:0">${keepLight(`<p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#bdcbd5">THE LITTLE THINGS STUDIOS</p><h1 style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-1px">A little idea just landed<span style="color:#8a9faf">.</span></h1><p style="margin:14px 0 0;color:#bdcbd5;font-size:14px">A new project inquiry from your website.</p>`)}</td></tr><tr><td style="padding:30px 32px"><p style="font-size:11px;letter-spacing:1.5px;color:#6a8194;margin:0 0 8px">FROM</p><h2 style="font-size:23px;line-height:1.4;margin:0 0 6px">${escape(name)}</h2><p style="margin:0 0 26px;font-size:15px;overflow-wrap:anywhere"><a href="mailto:${escape(email)}" style="color:#36566d">${escape(email)}</a></p><p style="font-size:11px;letter-spacing:1.5px;color:#6a8194;margin:0 0 8px">THE PROJECT</p><p style="margin:0 0 25px;font-size:16px;line-height:1.6">${escape(project_type)}</p><div style="border-top:1px solid #dce3e8;padding-top:24px;font-size:16px;line-height:1.8;overflow-wrap:anywhere">${escape(message).replace(/\n/g,"<br>")}</div><p style="margin:30px 0 0;padding-top:22px;border-top:1px solid #dce3e8;color:#65727b;font-size:13px;line-height:1.7">Just hit reply to continue the conversation with ${escape(name)}.</p></td></tr></table><p style="max-width:600px;margin:20px auto;color:#6a8194;font-size:11px;text-align:center;line-height:1.6">The difference between good and great is the little things.<br><a href="https://tlt-studios.com" style="color:#36566d">tlt-studios.com</a></p></td></tr></table></body></html>`,
    attachments: [logoAttachment()]
  };
}

export function confirmationMessage({name, email, project_type}) {
  const safeName = escape(name);
  const safeProject = escape(project_type);
  return {
    to: email,
    from: {email: ADDRESS, name: "The Little Things Studios"},
    replyTo: {email: ADDRESS, name: "The Little Things Studios"},
    subject: "We received your project inquiry | The Little Things Studios",
    text: [
      "THE LITTLE THINGS STUDIOS",
      "",
      "A little idea. A great beginning.",
      "",
      "Hi " + name + ",",
      "",
      "Thanks for reaching out! Your project inquiry is in and we'll review it personally.",
      "",
      "Project type: " + project_type,
      "",
      "WHAT HAPPENS NEXT",
      "We'll read over your request, follow up by email if we need more details, and talk through the next steps before any payment is requested.",
      "",
      "This is just a confirmation that we received your message. No payment is due.",
      "",
      "Questions or something to add? Reply directly to this email.",
      "",
      "The Little Things Studios",
      "Thoughtful websites. Built with intention.",
      "https://tlt-studios.com"
    ].join("\n"),
    html: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8">${EMAIL_HEAD}</head>
<body class="body" style="margin:0;padding:0;background:#f2f4f6;color:#14202e;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#f2f4f6"><tr><td align="center" style="padding:30px 14px 36px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid #e1e6e9">
<tr><td bgcolor="#14202e" style="${NAVY_PANEL};padding:34px 28px 36px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
<td style="vertical-align:middle;padding-right:14px"><img src="cid:tlt-logo" alt="" width="56" height="56" style="display:block;width:56px;height:56px;border:0"></td>
<td style="vertical-align:middle">${keepLight(`<div style="font-size:18px;font-weight:800;line-height:1.2;color:#ffffff;letter-spacing:-.5px">the little things<span style="color:#9bb1bf">.</span></div><div style="font-size:10px;letter-spacing:2px;color:#bacbd6;padding-top:6px">WEBSITE DESIGN</div>`)}</td></tr></table>
${keepLight(`<p style="font-size:10px;letter-spacing:2px;color:#b6c9d7;font-weight:700;margin:34px 0 12px">INQUIRY RECEIVED</p>
<h1 style="margin:0;color:#ffffff;font-weight:800;font-size:32px;line-height:1.18;letter-spacing:-1px">A little idea.<br>A great beginning<span style="color:#9bb1bf">.</span></h1>
<p style="font-size:15px;color:#d9e3e9;line-height:1.7;margin:16px 0 0">Your message has made it to the studio.</p>`)}</td></tr>
<tr><td style="padding:34px 28px 36px">
<p style="font-size:19px;font-weight:700;line-height:1.45;margin:0 0 15px">Hi ${safeName},</p>
<p style="font-size:15px;line-height:1.8;color:#43515c;margin:0 0 22px">Thanks for reaching out! We've received your inquiry and will review it personally.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f3f6f7;border-left:3px solid #8199ac"><tr><td style="padding:17px 19px">
<div style="color:#6a8194;font-size:10px;font-weight:700;letter-spacing:1.6px;margin-bottom:8px">YOUR PROJECT</div>
<div style="color:#14202e;font-size:16px;font-weight:700;line-height:1.45">${safeProject}</div></td></tr></table>
<p style="font-size:11px;letter-spacing:1.5px;color:#6a8194;font-weight:700;margin:28px 0 8px">WHAT COMES NEXT</p>
<p style="font-size:15px;line-height:1.8;color:#43515c;margin:0">We'll look over your request, follow up if we need more details, and discuss next steps. <strong style="color:#14202e">No payment is due.</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:27px"><tr><td style="background:#14202e;border-radius:6px"><a href="mailto:hello@tlt-studios.com" style="display:inline-block;color:#ffffff;text-decoration:none;padding:13px 20px;font-size:13px;font-weight:700">Questions? Reply to this email ↗</a></td></tr></table>
<p style="font-size:13px;line-height:1.7;color:#7a8790;margin:27px 0 0;border-top:1px solid #e1e6e9;padding-top:19px">This is an automatic confirmation from The Little Things Studios. A personal follow-up will come separately.</p>
</td></tr></table>
<p style="font-size:11px;line-height:1.8;color:#75838d;margin:21px auto 0;text-align:center">THE LITTLE THINGS STUDIOS<br><a style="color:#36566d" href="https://tlt-studios.com/">tlt-studios.com</a> · Thoughtful websites. Built with intention.</p>
</td></tr></table></body></html>`,
    attachments: [logoAttachment()]
  };
}

function respond(request, status, message, accepted = false) {
  const headers = {"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
  if (status === 429) headers["Retry-After"] = "60";
  if (request.headers.get("Accept")?.includes("application/json"))
    return Response.json({accepted, message}, {status, headers});
  headers["Content-Type"] = "text/html; charset=utf-8";
  return new Response(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project inquiry | The Little Things Studios</title><link rel="stylesheet" href="/styles.css"></head><body><main class="inquiry-receipt"><img src="/apple-touch-icon.png?v=4" alt="The Little Things Studios" width="56" height="56"><p class="eyebrow">THE LITTLE THINGS STUDIOS</p><h1>${accepted ? "A little idea. A great beginning." : "Let’s try that again."}</h1><p>${escape(message)}</p><a class="inline-link" href="/contact.html">Return to the contact form ↗</a></main></body></html>`, {status, headers});
}

export async function onRequestPost({request, env}) {
  const origin = request.headers.get("Origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("Sec-Fetch-Site") === "cross-site")
    return respond(request,403,"Please send your inquiry from our contact page.");
  if (!(request.headers.get("Content-Type") || "").startsWith("application/x-www-form-urlencoded"))
    return respond(request,415,"Please use the contact form to submit your inquiry.");
  if (!env.CONTACT_EMAIL?.send || !env.CONTACT_RATE_LIMIT?.limit)
    return respond(request,503,"The form is temporarily unavailable. Please email hello@tlt-studios.com.");
  try {
    const {success} = await env.CONTACT_RATE_LIMIT.limit({key:"contact:" + (request.headers.get("CF-Connecting-IP") || "unknown")});
    if (!success) return respond(request,429,"Please wait a minute before submitting another inquiry.");
    // Limit the actual streamed body, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return respond(request,400,"Please complete the contact form.");
    let bytes = 0, raw = "";
    const decoder = new TextDecoder();
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 65536) { await reader.cancel(); return respond(request,413,"Your inquiry is too long. Please shorten it and try again."); }
      raw += decoder.decode(value,{stream:true});
    }
    raw += decoder.decode();
    const data = new URLSearchParams(raw);
    if (data.get("_honey")) return respond(request,200,"Thank you for your inquiry.",true);
    const fields = Object.fromEntries(["name","email","project_type","message"].map(key=>[key,(data.get(key)||"").trim()]));
    // A reply from a demo's "Let's work together" page: the message is built from
    // its own fields, and the email says which demo it came from.
    if (fields.project_type === "Demo website") {
      const demo = (data.get("demo")||"").trim(), business = (data.get("business")||"").trim();
      const phone = (data.get("phone")||"").trim(), times = (data.get("meet_time")||"").trim(), site = (data.get("site")||"").trim();
      if ((demo && !DEMO_SLUG.test(demo)) || demo.length > 60 || business.length > 120 || /[\x00-\x1f<>]/.test(business)
        || phone.length > 40 || !/^[0-9+().\-\s]*$/.test(phone) || times.length > 300 || /[\x00-\x1f]/.test(times) || site.length > 200 || /[\x00-\x1f<>\s]/.test(site) || fields.message.length > 3000)
        return respond(request,400,"Please check your name, email, phone number and website.");
      fields.subject = "Demo reply: " + (business || demo || fields.name);
      fields.message = ["Interested in the demo" + (business ? " made for " + business : "") + (demo ? ": https://demo.tlt-studios.com/" + demo + "/" : " (opened without a demo link)"),
        "", "Phone: " + (phone || "not given"), "Website: " + (site || "not given"), "Good times for a Google Meet: " + (times || "not given"),
        ...(fields.message ? ["", "Anything to change or add:", fields.message] : [])].join("\n");
    }
    // The conversation on /contact.html adds optional answers about the project; they are folded into the message.
    const userMessage = fields.message;
    let details = [];
    if (fields.project_type !== "Demo website") {
      const picks = key => data.getAll(key).map(value => value.trim()).filter(Boolean);
      const site = (data.get("site")||"").trim(), colors = (data.get("colors")||"").trim();
      const lists = {changes: picks("changes"), tools: picks("tools"), vibe: picks("vibe")};
      const clean = value => value.length <= 80 && !/[\x00-\x1f<>]/.test(value);
      if ((site && (site.length > 200 || /[\s<>\x00-\x1f]/.test(site))) || colors.length > 150 || !clean(colors)
        || Object.values(lists).some(list => list.length > 12 || !list.every(clean)))
        return respond(request,400,"Please check the website address and the details you picked.");
      if (site) details.push("Current website: " + site);
      if (lists.changes.length) details.push("Wants to change: " + lists.changes.join(", "));
      if (lists.tools.length) details.push("Currently uses: " + lists.tools.join(", "));
      if (lists.vibe.length) details.push("Vibe: " + lists.vibe.join(", "));
      if (colors) details.push("Colors: " + colors);
    }
    if (!fields.name || fields.name.length>120 || /[\r\n\x00-\x1f]/.test(fields.name)
      || fields.email.length>254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fields.email)
      || /[\x00-\x1f\x7f]/.test(fields.email) || !TYPES.has(fields.project_type)
      || (fields.message.length<10 && !details.length) || fields.message.length>4000 || fields.message.includes("\0"))
      return respond(request,400,"Please check your name, email, project type, and message (10–4,000 characters).");
    if (details.length) fields.message = details.join("\n") + (userMessage ? "\n\nIn their words:\n" + userMessage : "");
    const result = await env.CONTACT_EMAIL.send(inquiryMessage(fields));
    if (!result?.messageId) throw Object.assign(new Error("Missing acceptance"),{code:"NO_MESSAGE_ID"});
    // A receipt is deliberately separate from the required inbox notification.
    // Never tell a visitor to resubmit an already accepted inquiry.
    let confirmationAccepted = false;
    try {
      if (env.CONTACT_CONFIRMATION_EMAIL?.send) {
        // Use a separate key in the existing limiter to reduce repeated unsolicited receipts
        // to one email address, even when requests originate from different IPs.
        const {success} = await env.CONTACT_RATE_LIMIT.limit({key:"contact-confirm:" + fields.email.toLowerCase()});
        if (success) {
          const receipt = await env.CONTACT_CONFIRMATION_EMAIL.send(confirmationMessage(fields.project_type === "Demo website"
            ? {...fields, project_type: "Making your demo website yours"} : fields));
          confirmationAccepted = Boolean(receipt?.messageId);
        }
      }
    } catch (confirmationError) {
      console.warn("Contact receipt could not be queued:", confirmationError?.code || "UNKNOWN");
    }
    return respond(request,200,confirmationAccepted
      ? "Your inquiry has been submitted, and a confirmation email is on its way. I’ll review the details and get back to you. No payment is due."
      : "Your inquiry has been submitted. I’ll review the details and get back to you by email. We couldn't send a separate confirmation right now. No payment is due.",true);
  } catch (error) {
    console.error("Contact submission failed:",error?.code || "UNKNOWN");
    return respond(request,502,"We couldn’t confirm your submission. Your message is still here. Please try again later or email hello@tlt-studios.com.");
  }
}
