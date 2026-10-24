// The "Let's work together" page that demos link to: names the business it was
// made for and remembers which demo the reply is about.
// Paste the share link of a Google Calendar "appointment schedule" here (Calendar → Create → Appointment schedule →
// Share). While it is empty the form simply asks for good times and Adam replies to arrange a Meet.
const BOOKING_URL = "https://calendar.app.google/GvaQ5vw37gjjEsdH8";

(() => {
  const params = new URLSearchParams(location.search);
  const demo = params.get("demo") || "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(demo) || demo.length > 60) return;
  const business = (params.get("business") || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 120);
  document.getElementById("hello-demo").value = demo;
  document.getElementById("hello-business").value = business;
  if (business) {
    document.getElementById("hello-kicker").textContent = "MADE FOR " + business.toUpperCase();
    document.getElementById("hello-intro").textContent = "That demo was made just for " + business + ". If you’d like it to be yours, leave your details and I’ll set up a quick 15-minute Google Meet at a time that works for you.";
    document.title = "Let's work together, " + business + " | The Little Things Studios";
  }
  const back = document.getElementById("hello-back");
  back.href = "https://demo.tlt-studios.com/" + demo + "/";
  back.hidden = false;
})();

// With a booking link, the visitor picks a slot right after sending their details.
(() => {
  if (!BOOKING_URL || !/^https:\/\/calendar\.(?:app\.)?google(?:\.com)?\//.test(BOOKING_URL)) return;
  const form = document.querySelector(".contact-form");
  const panel = document.getElementById("hello-book");
  document.getElementById("hello-times-field").hidden = true;
  document.getElementById("hello-times").disabled = true;
  document.getElementById("hello-form-intro").textContent = "Just your name and email are needed. You'll pick a time for a 15-minute Google Meet next.";
  form.addEventListener("inquiry:sent",() => {
    document.getElementById("hello-book-link").href = BOOKING_URL;
    form.hidden = true;
    panel.hidden = false;
    panel.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  });
})();
