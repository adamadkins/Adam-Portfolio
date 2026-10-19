(() => {
  "use strict";
  const invoiceForm = document.getElementById("invoice-payment-form");
  const maintenanceForm = document.getElementById("maintenance-payment-form");
  const invoiceFeedback = document.getElementById("invoice-feedback");
  const maintenanceFeedback = document.getElementById("maintenance-feedback");
  const planList = document.getElementById("maintenance-plans");
  const maintenanceButton = maintenanceForm.querySelector("button[type=submit]");

  async function post(path, body) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(payload.message || "Unable to start payment. Please try again.");
    if (!payload.url.startsWith("https://")) throw new Error("Invalid payment destination.");
    window.location.assign(payload.url);
  }
  invoiceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = invoiceForm.querySelector("button[type=submit]");
    button.disabled = true;
    invoiceFeedback.textContent = "";
    try {
      await post("/api/payments/invoice", {
        invoiceNumber: invoiceForm.elements.invoiceNumber.value.trim(),
        email: invoiceForm.elements.email.value.trim()
      });
    } catch (error) {
      invoiceFeedback.textContent = error.message;
      button.disabled = false;
    }
  });
  async function loadPlans() {
    try {
      const response = await fetch("/api/payments/plans", { cache: "no-store" });
      if (!response.ok) throw new Error("Maintenance plans aren't available yet. Please contact Adam.");
      const payload = await response.json();
      if (!Array.isArray(payload.plans) || !payload.plans.length) throw new Error("Maintenance plans aren't available yet. Please contact Adam.");
      planList.replaceChildren();
      payload.plans.forEach((plan, index) => {
        const label = document.createElement("label");
        label.className = "plan-option";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "plan";
        radio.value = plan.id;
        radio.required = true;
        if (index === 0) radio.checked = true;
        const text = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = plan.name;
        const price = document.createElement("small");
        price.textContent = plan.displayPrice;
        text.append(name, price);
        label.append(radio, text);
        planList.append(label);
      });
      maintenanceButton.disabled = false;
    } catch (error) {
      planList.textContent = error.message;
    }
  }
  maintenanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = maintenanceForm.querySelector("input[name=plan]:checked");
    if (!selected) return;
    maintenanceButton.disabled = true;
    maintenanceFeedback.textContent = "";
    try {
      await post("/api/payments/checkout", { plan: selected.value, email: maintenanceForm.elements.email.value.trim() });
    } catch (error) {
      maintenanceFeedback.textContent = error.message;
      maintenanceButton.disabled = false;
    }
  });
  loadPlans();
})();