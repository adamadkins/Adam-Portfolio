(() => {
  "use strict";
  const invoiceForm = document.getElementById("invoice-payment-form");
  const packageForm = document.getElementById("package-payment-form");
  const invoiceFeedback = document.getElementById("invoice-feedback");
  const packageFeedback = document.getElementById("package-feedback");
  const packageList = document.getElementById("website-packages");
  const packageButton = packageForm.querySelector("button[type=submit]");
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
  async function loadPackages() {
    try {
      const response = await fetch("/api/payments/plans", { cache: "no-store" });
      if (!response.ok) throw new Error("Website purchases are not configured yet. Please contact Adam.");
      const payload = await response.json();
      if (!Array.isArray(payload.plans) || payload.plans.length !== 2) throw new Error("Website purchases are not configured yet. Please contact Adam.");
      packageList.replaceChildren();
      payload.plans.forEach((plan, index) => {
        const label = document.createElement("label");
        label.className = "plan-option";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "plan";
        radio.value = plan.id;
        radio.required = true;
        const requestedPackage = new URLSearchParams(window.location.search).get("package");
        if (requestedPackage ? plan.id === requestedPackage : index === 0) radio.checked = true;
        const text = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = plan.name;
        const price = document.createElement("small");
        price.textContent = plan.displayPrice + " · One-time payment";
        text.append(name, price);
        label.append(radio, text);
        packageList.append(label);
      });
      packageButton.disabled = false;
    } catch (error) { packageList.textContent = error.message; }
  }
  packageForm.addEventListener("submit", async event => {
    event.preventDefault();
    const selected = packageForm.querySelector("input[name=plan]:checked");
    if (!selected) return;
    packageButton.disabled = true;
    packageFeedback.textContent = "";
    try {
      await post("/api/payments/checkout", { plan: selected.value, email: packageForm.elements.email.value.trim() });
    } catch (error) { packageFeedback.textContent = error.message; packageButton.disabled = false; }
  });
  loadPackages();
})();