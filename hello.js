// The "Let's work together" page that demos link to: names the business it was
// made for and remembers which demo the reply is about.
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
