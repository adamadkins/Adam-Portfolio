const ADDRESS = "hello@tlt-studios.com";
const TYPES = new Set(["New website", "Website Essentials ($750)", "Website + Lifetime Support ($1500)", "Website redesign", "Technical support", "Other inquiry"]);
const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function inquiryMessage({name, email, project_type, message}) {
  return {
    to: ADDRESS,
    from: {email: ADDRESS, name: "The Little Things Studios"},
    replyTo: {email, name},
    subject: "New project inquiry: " + project_type,
    text: ["A little idea just landed.", "", "Name: " + name, "Email: " + email, "Project: " + project_type, "", message, "", "Reply to this email to contact " + name + ".", "The Little Things Studios | tlt-studios.com"].join("\n"),
    html: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f1f4f6;color:#14202e;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#fff;border:1px solid #dce3e8"><tr><td style="padding:32px;background:#14202e;color:#fff"><img src="https://tlt-studios.com/apple-touch-icon.png?v=3" alt="" width="44" height="44" style="display:block;margin-bottom:22px;border:0"><p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#bdcbd5">THE LITTLE THINGS STUDIOS</p><h1 style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-1px">A little idea just landed<span style="color:#8a9faf">.</span></h1><p style="margin:14px 0 0;color:#bdcbd5;font-size:14px">A new project inquiry from your website.</p></td></tr><tr><td style="padding:30px 32px"><p style="font-size:11px;letter-spacing:1.5px;color:#6a8194;margin:0 0 8px">FROM</p><h2 style="font-size:23px;line-height:1.4;margin:0 0 6px">${escape(name)}</h2><p style="margin:0 0 26px;font-size:15px;overflow-wrap:anywhere"><a href="mailto:${escape(email)}" style="color:#36566d">${escape(email)}</a></p><p style="font-size:11px;letter-spacing:1.5px;color:#6a8194;margin:0 0 8px">THE PROJECT</p><p style="margin:0 0 25px;font-size:16px;line-height:1.6">${escape(project_type)}</p><div style="border-top:1px solid #dce3e8;padding-top:24px;font-size:16px;line-height:1.8;overflow-wrap:anywhere">${escape(message).replace(/\n/g,"<br>")}</div><p style="margin:30px 0 0;padding-top:22px;border-top:1px solid #dce3e8;color:#65727b;font-size:13px;line-height:1.7">Just hit reply to continue the conversation with ${escape(name)}.</p></td></tr></table><p style="max-width:600px;margin:20px auto;color:#6a8194;font-size:11px;text-align:center;line-height:1.6">The difference between good and great is the little things.<br><a href="https://tlt-studios.com" style="color:#36566d">tlt-studios.com</a></p></td></tr></table></body></html>`
  };
}

function respond(request, status, message, accepted = false) {
  const headers = {"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
  if (status === 429) headers["Retry-After"] = "60";
  if (request.headers.get("Accept")?.includes("application/json"))
    return Response.json({accepted, message}, {status, headers});
  headers["Content-Type"] = "text/html; charset=utf-8";
  return new Response(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project inquiry | The Little Things Studios</title><link rel="stylesheet" href="/styles.css"></head><body><main class="inquiry-receipt"><img src="/apple-touch-icon.png?v=3" alt="The Little Things Studios" width="56" height="56"><p class="eyebrow">THE LITTLE THINGS STUDIOS</p><h1>${accepted ? "A little idea. A great beginning." : "Let’s try that again."}</h1><p>${escape(message)}</p><a class="inline-link" href="/contact.html">Return to the contact form ↗</a></main></body></html>`, {status, headers});
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
    if (!fields.name || fields.name.length>120 || /[\r\n\x00-\x1f]/.test(fields.name)
      || fields.email.length>254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fields.email)
      || /[\x00-\x1f\x7f]/.test(fields.email) || !TYPES.has(fields.project_type)
      || fields.message.length<10 || fields.message.length>4000 || fields.message.includes("\0"))
      return respond(request,400,"Please check your name, email, project type, and message (10–4,000 characters).");
    const result = await env.CONTACT_EMAIL.send(inquiryMessage(fields));
    if (!result?.messageId) throw Object.assign(new Error("Missing acceptance"),{code:"NO_MESSAGE_ID"});
    return respond(request,200,"Your inquiry has been submitted. I’ll review the details and get back to you by email. No payment is due.",true);
  } catch (error) {
    console.error("Contact submission failed:",error?.code || "UNKNOWN");
    return respond(request,502,"We couldn’t confirm your submission. Your message is still here. Please try again later or email hello@tlt-studios.com.");
  }
}
