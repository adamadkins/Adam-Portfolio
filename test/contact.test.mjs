import test from "node:test";
import assert from "node:assert/strict";
import {onRequestPost,inquiryMessage,confirmationMessage} from "../functions/api/contact.js";
const fields={name:"Adam <test>",email:"adam@example.com",project_type:"New website",message:"Hello, I would like a website."};
function setup(options={}) {
 const sent=[];
 const confirmations=[];
 const keys=[];
 const env={CONTACT_RATE_LIMIT:{limit:async ({key})=>{keys.push(key);return {success: key.startsWith("contact-confirm:") ? options.confirmAllowed!==false : options.allowed!==false};}},CONTACT_EMAIL:{send:async m=>{sent.push(m);if(options.error)throw Error("private provider details");return options.result??{messageId:"test-1"};}},CONTACT_CONFIRMATION_EMAIL:{send:async m=>{confirmations.push(m);if(options.confirmError)throw Object.assign(Error("private confirmation error"),{code:"E_FAKE"});return options.confirmResult??{messageId:"receipt-1"};}}};
 if(options.noReceiptBinding)delete env.CONTACT_CONFIRMATION_EMAIL;
 return {env,sent,confirmations,keys};
}
function request(data=fields,headers={}) {
 return new Request("https://tlt-studios.com/api/contact",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json","Origin":"https://tlt-studios.com","CF-Connecting-IP":"192.0.2.1",...headers},body:new URLSearchParams(data)});
}
test("sends a branded multipart inquiry to the fixed inbox, using safe Reply-To",async()=>{
 const {env,sent}=setup();
 const r=await onRequestPost({request:request({...fields,to:"attacker@example.com",from:"attacker@example.com"}),env});
 assert.equal(r.status,200);assert.equal((await r.json()).accepted,true);
 assert.equal(sent.length,1);assert.equal(sent[0].to,"hello@tlt-studios.com");
 assert.equal(sent[0].from.email,"hello@tlt-studios.com");assert.equal(sent[0].replyTo.email,fields.email);
 assert.match(sent[0].html,/Adam &lt;test&gt;/);assert.ok(!sent[0].html.includes("Adam <test>"));
 assert.match(sent[0].text,/Hello, I would like/);
});
test("cross-origin submission is rejected before any send",async()=>{
 const {env,sent}=setup();assert.equal((await onRequestPost({request:request(fields,{Origin:"https://evil.example"}),env})).status,403);assert.equal(sent.length,0);
});
test("honeypot returns generic success without sending",async()=>{
 const {env,sent}=setup();assert.equal((await onRequestPost({request:request({...fields,_honey:"bot"}),env})).status,200);assert.equal(sent.length,0);
});
test("rate limit returns retry information without sending",async()=>{
 const {env,sent}=setup({allowed:false});const r=await onRequestPost({request:request(),env});assert.equal(r.status,429);assert.equal(r.headers.get("Retry-After"),"60");assert.equal(sent.length,0);
});
test("invalid fields and header injection are rejected",async()=>{
 for(const update of [{email:"a@example.com\r\nBcc: x@example.com"},{name:"A\r\nB"},{message:"short"},{project_type:"untrusted"},{message:"x".repeat(4001)}]){
 const {env,sent}=setup();assert.equal((await onRequestPost({request:request({...fields,...update}),env})).status,400);assert.equal(sent.length,0);
 }
});
test("oversized streamed bodies are rejected",async()=>{
 const {env,sent}=setup();assert.equal((await onRequestPost({request:request({...fields,message:"x".repeat(66000)}),env})).status,413);assert.equal(sent.length,0);
});
test("missing configuration fails closed",async()=>{
 assert.equal((await onRequestPost({request:request(),env:{}})).status,503);
});
test("provider errors and missing acceptance do not claim success or leak details",async()=>{
 for(const options of [{error:true},{result:{}}]){
 const {env}=setup(options);const r=await onRequestPost({request:request(),env});assert.equal(r.status,502);const b=await r.json();assert.equal(b.accepted,false);assert.ok(!b.message.includes("private provider"));
 }
});
test("native form submission receives a branded HTML result",async()=>{
 const {env}=setup();const r=await onRequestPost({request:request(fields,{Accept:"text/html"}),env});assert.equal(r.status,200);assert.match(r.headers.get("Content-Type"),/text\/html/);assert.match(await r.text(),/inquiry-receipt/);
});
test("email message escapes script markup and preserves newlines",()=>{
 const m=inquiryMessage({...fields,message:"<script>alert(1)</script>\nNext line"});assert.ok(!m.html.includes("<script>"));assert.match(m.html,/&lt;script&gt;/);assert.match(m.html,/<br>Next line/);
});

test("receipts are sent only after the studio notification and use the verified sender",async()=>{
 const {env,sent,confirmations,keys}=setup();
 const res=await onRequestPost({request:request(),env});const body=await res.json();
 assert.equal(res.status,200);assert.equal(body.accepted,true);assert.match(body.message,/confirmation email/);
 assert.equal(sent.length,1);assert.equal(confirmations.length,1);
 assert.equal(confirmations[0].to,fields.email);
 assert.equal(confirmations[0].from.email,"hello@tlt-studios.com");
 assert.equal(confirmations[0].replyTo.email,"hello@tlt-studios.com");
 assert.equal(confirmations[0].attachments[0].contentId,"tlt-logo");
 assert.equal(confirmations[0].attachments[0].type,"image/png");
 assert.match(confirmations[0].html,/src="cid:tlt-logo"/);
 assert.match(sent[0].html,/src="cid:tlt-logo"/);
 // A string is sent as quoted-printable text, which Gmail shows as a broken image.
 assert.ok(sent[0].attachments[0].content instanceof ArrayBuffer);
 assert.ok(keys.includes("contact-confirm:"+fields.email.toLowerCase()));
});
test("acknowledgement escapes visitor name, supports plain text and does not echo arbitrary project message",()=>{
 const m=confirmationMessage({...fields,name:"<img src=x onerror=alert(1)>",message:"<script>something bad</script>"});
 assert.ok(!m.html.includes("<img src=x onerror="));assert.match(m.html,/&lt;img/);
 assert.ok(!m.html.includes("<script>"));
 assert.match(m.text,/No payment is due/);
 assert.ok(!m.text.includes("something bad"));
});
test("failed or missing confirmation still keeps the already accepted inquiry",async()=>{
 for(const options of [{confirmError:true},{confirmResult:{}},{noReceiptBinding:true},{confirmAllowed:false}]){
   const {env,sent,confirmations}=setup(options);
   const res=await onRequestPost({request:request(),env});const body=await res.json();
   assert.equal(res.status,200);assert.equal(body.accepted,true);
   assert.equal(sent.length,1);
   assert.match(body.message,/inquiry has been submitted/);
   if(options.confirmError||options.noReceiptBinding||options.confirmAllowed===false)
     assert.match(body.message,/couldn't send a separate confirmation/);
 }
});
test("invalid, cross-site, honeypot, failed inbox notifications never send visitor confirmations",async()=>{
 const samples=[
  {req:request({ ...fields,message:"bad" })},
  {req:request(fields,{Origin:"https://evil.example"})},
  {req:request({...fields,_honey:"hidden"})},
 ];
 for(const {req} of samples){const {env,confirmations}=setup();await onRequestPost({request:req,env});assert.equal(confirmations.length,0);}
 const {env,confirmations}=setup({error:true});await onRequestPost({request:request(),env});assert.equal(confirmations.length,0);
});
test("inline email logo is a complete, valid PNG identical to the site icon",async()=>{
 const {crc32}=await import("node:zlib");const {readFileSync}=await import("node:fs");
 const png=Buffer.from(confirmationMessage(fields).attachments[0].content);
 assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 let i=8,types=[];
 while(i<png.length){
  const n=png.readUInt32BE(i),type=png.subarray(i+4,i+8);
  assert.ok(i+12+n<=png.length,"truncated "+type);
  assert.equal(crc32(png.subarray(i+4,i+8+n))>>>0,png.readUInt32BE(i+8+n),"bad CRC in "+type);
  types.push(type.toString());i+=12+n;
 }
 assert.equal(types[0],"IHDR");assert.equal(types.at(-1),"IEND");
 assert.ok(png.equals(readFileSync(new URL("../apple-touch-icon.png",import.meta.url))));
});
test("navy headers survive Gmail dark mode without wrapping the logo",()=>{
 for(const m of [inquiryMessage(fields),confirmationMessage(fields)]){
  assert.match(m.html,/<body class="body"/);assert.match(m.html,/u \+ \.body \.gmail-difference/);
  assert.match(m.html,/bgcolor="#14202e" style="[^"]*background-image:linear-gradient\(#14202e,#14202e\)/);
  for(const wrapped of m.html.split('<div class="gmail-difference">').slice(1))
   assert.ok(!wrapped.split("</div></div>")[0].includes("cid:tlt-logo"),"logo must not be color-blended");
 }
});
