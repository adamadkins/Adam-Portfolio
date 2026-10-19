(() => {
  "use strict";
  const invoiceForm = document.getElementById("invoice-payment-form");
  const invoiceFeedback = document.getElementById("invoice-feedback");
  async function post(path, body) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(payload.message || "Unable to start payment. Please try again.");
    const url = new URL(payload.url);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".stripe.com")) throw new Error("Invalid payment destination.");
    window.location.assign(url.href);
  }
  invoiceForm.addEventListener("submit", async event => {
    event.preventDefault();
    const button = invoiceForm.querySelector("button[type=submit]");
    button.disabled = true;
    invoiceFeedback.textContent = "";
    try {
      await post("/api/payments/invoice", {
        invoiceNumber: invoiceForm.elements.invoiceNumber.value.trim(),
        email: invoiceForm.elements.email.value.trim()
      });
    } catch (error) { invoiceFeedback.textContent = error.message; button.disabled = false; }
  });
})();
