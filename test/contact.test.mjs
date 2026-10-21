import test from "node:test";
import assert from "node:assert/strict";
import {onRequestPost,inquiryMessage} from "../functions/api/contact.js";
const fields={name:"Adam <test>",email:"adam@example.com",project_type:"New website",message:"Hello, I would like a website."};
function setup(options={}) {
 const sent=[];
 const env={CONTACT_RATE_LIMIT:{limit:async()=>({success:options.allowed!==false})},CONTACT_EMAIL:{send:async m=>{sent.push(m);if(options.error)throw Error("private provider details");return options.result??{messageId:"test-1"};}}};
 return {env,sent};
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
