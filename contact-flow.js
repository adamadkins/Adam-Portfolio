// The contact page asks one question at a time. Without JavaScript every question simply shows at once.
(() => {
  const form = document.querySelector(".convo");
  if (!form) return;
  const steps = [...form.querySelectorAll(".convo-step")];
  const dots = [...form.querySelectorAll(".convo-progress li")];
  const back = form.querySelector(".convo-back");
  const next = form.querySelector(".convo-next");
  const name = form.querySelector('[name="name"]');
  const greeting = form.querySelector("[data-greeting]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;

  const valid = step => [...step.querySelectorAll("input,textarea")].every(field => field.reportValidity());
  const show = (to, focus = true) => {
    index = Math.max(0, Math.min(steps.length - 1, to));
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => { dot.classList.toggle("done", i < index); dot.classList.toggle("now", i === index); });
    form.classList.toggle("is-last", index === steps.length - 1);
    back.hidden = index === 0;
    if (index === 1) {
      const first = name.value.trim().split(/\s+/)[0];
      greeting.textContent = first ? "Nice to meet you, " + first : "Nice to meet you";
    }
    if (focus) {
      const field = steps[index].querySelector("input:not([type=radio]),textarea") || steps[index].querySelector("input:checked");
      if (field) field.focus({ preventScroll: true });
    }
  };
  const advance = () => { if (valid(steps[index])) show(index + 1); };

  form.classList.add("is-stepper");
  show(0, false);
  next.addEventListener("click", advance);
  back.addEventListener("click", () => show(index - 1));
  form.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing || index === steps.length - 1) return;
    const target = event.target;
    if (target.tagName === "TEXTAREA" && !(event.metaKey || event.ctrlKey)) return;
    if (target.tagName === "BUTTON") return;
    event.preventDefault();
    advance();
  });
  form.querySelectorAll('input[type="radio"]').forEach(radio => radio.addEventListener("change", () => {
    if (index === 1) setTimeout(() => show(2), reduced ? 0 : 260);
  }));
  form.addEventListener("inquiry:sent", () => { form.classList.add("is-sent"); form.classList.remove("is-last"); show(0, false); });
  // A package link (?package=…) has already chosen what the visitor is after; start at the first question regardless.
})();
