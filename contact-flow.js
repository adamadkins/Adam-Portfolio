// The contact page asks one question at a time, and the questions depend on the answers:
// no website yet, an existing website, or something else. Without JavaScript every question shows at once.
(() => {
  const form = document.querySelector(".convo");
  if (!form) return;
  const steps = Object.fromEntries([...form.querySelectorAll(".convo-step")].map(step => [step.dataset.step, step]));
  const progress = form.querySelector(".convo-progress");
  const back = form.querySelector(".convo-back");
  const next = form.querySelector(".convo-next");
  const projectType = form.querySelector('input[name="project_type"]');
  const notes = form.querySelector("#contact-message");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const checked = name => form.querySelector('input[name="' + name + '"]:checked')?.value || "";
  const preset = Boolean(checked("plan")); // a package link already chose "I need a website" and the plan
  // A service link (?path=new|have) has already answered "what brings you here".
  const presetPath = (() => {
    const wanted = new URLSearchParams(location.search).get("path");
    const radio = ["new", "have", "other"].includes(wanted) && form.querySelector('input[name="path"][value="' + wanted + '"]');
    if (radio && !preset) radio.checked = true;
    return radio && !preset ? wanted : "";
  })();
  const order = Object.keys(steps);
  const branching = Boolean(steps.path); // pages without a "what brings you here" question just ask everything in order

  const path = () => (preset ? "new" : checked("path"));
  const skipPath = preset || Boolean(presetPath);
  const flow = () => {
    if (!branching) return order;
    const kind = path() || "new";
    const middle = kind === "have" ? ["site", "changes", "tools"] : kind === "other" ? [] : preset ? ["vibe"] : ["plan", "vibe"];
    return ["name", ...(skipPath ? [] : ["path"]), ...middle, "notes", "email"];
  };
  let current = order[0];

  const sync = () => {
    const active = flow();
    const kind = path();
    if (branching) projectType.value = kind === "have" ? "Website redesign" : kind === "other" ? "Other inquiry" : checked("plan") || "New website";
    // Questions that are not part of this path must not block or join the submission.
    Object.entries(steps).forEach(([id, step]) => step.querySelectorAll("input,textarea").forEach(field => { field.disabled = !active.includes(id); }));
    if (branching) {
      notes.required = kind === "other";
      notes.minLength = kind === "other" ? 10 : 0;
      form.querySelector("[data-notes-title]").innerHTML = kind === "other" ? "Tell me about it<em>.</em>" : "Anything else I should know<em>?</em>";
      form.querySelector("[data-notes-hint]").textContent = kind === "other" ? "A sentence or two is plenty." : "Optional. A sentence or two is plenty.";
    }
    progress.replaceChildren(...active.map(() => document.createElement("li")));
    const here = active.indexOf(current);
    [...progress.children].forEach((dot, i) => { dot.classList.toggle("done", i < here); dot.classList.toggle("now", i === here); });
    back.hidden = here <= 0;
    form.classList.toggle("is-last", current === active[active.length - 1]);
    next.firstChild.textContent = (steps[current].dataset.next || "Continue") + " ";
  };
  const valid = step => [...step.querySelectorAll("input,textarea")].filter(field => !field.disabled).every(field => field.reportValidity());
  const show = (id, focus = true) => {
    current = id;
    Object.entries(steps).forEach(([key, step]) => step.classList.toggle("is-active", key === id));
    if (id === "path") {
      const first = form.querySelector('[name="name"]').value.trim().split(/\s+/)[0];
      form.querySelector("[data-greeting]").textContent = first ? "Nice to meet you, " + first : "Nice to meet you";
    }
    sync();
    if (focus) steps[id].querySelector("input:not([type=radio]):not([type=checkbox]):not(:disabled),textarea")?.focus({ preventScroll: true });
  };
  const go = offset => { const active = flow(); show(active[Math.max(0, Math.min(active.length - 1, active.indexOf(current) + offset))]); };
  const advance = () => { sync(); if (valid(steps[current])) go(1); };

  form.classList.add("is-stepper");
  show(order[0], false);
  next.addEventListener("click", advance);
  back.addEventListener("click", () => go(-1));
  form.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing || current === flow()[flow().length - 1]) return;
    const target = event.target;
    if (target.tagName === "BUTTON" || (target.tagName === "TEXTAREA" && !(event.metaKey || event.ctrlKey))) return;
    event.preventDefault();
    advance();
  });
  // Picking one answer moves on by itself; multi-select questions wait for Continue.
  form.querySelectorAll('input[name="path"],input[name="plan"]').forEach(radio => radio.addEventListener("change", () => {
    sync();
    setTimeout(() => { if (current === radio.name) go(1); }, reduced ? 0 : 260);
  }));
  form.addEventListener("change", sync);
  form.addEventListener("inquiry:sent", () => { form.classList.add("is-sent"); form.classList.remove("is-last"); });
})();
