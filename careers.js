// The Join the team form (/careers.html): sends through /api/contact as "Joining the team" and says so on the page.
(() => {
  const form = document.getElementById("careers-form");
  if (!form) return;
  const button = form.querySelector('[type="submit"]'), feedback = document.getElementById("careers-feedback");
  const startedAt = form.querySelector('[name="_form_started_at"]');
  if (startedAt) startedAt.value = String(Date.now());
  let sending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true; button.disabled = true; button.textContent = "Sending…"; feedback.textContent = ""; feedback.classList.remove("is-ok");
    try {
      const r = await fetch(form.action, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: new URLSearchParams(new FormData(form)) });
      const result = await r.json();
      if (!r.ok || !result.accepted) throw new Error(result.message || "That didn't go through. Please try again.");
      form.reset();
      feedback.classList.add("is-ok"); feedback.textContent = result.message;
      button.textContent = "Sent ✓";
    } catch (error) {
      feedback.textContent = error instanceof TypeError || error instanceof SyntaxError ? "That didn't go through. Check your connection, or email hello@tlt-studios.com." : error.message;
      button.textContent = "Try again ↗";
    } finally { sending = false; button.disabled = false; }
  });
})();
