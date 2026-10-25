// Work pages: filter chips on the showcase; where the browser cannot tie an animation to scrolling, project pages scroll the site slowly by themselves.
(() => {
  const chips = document.querySelectorAll(".wk-chip");
  if (chips.length) {
    const cards = document.querySelectorAll(".wk-card");
    const apply = (key) => {
      chips.forEach((c) => { const on = c.dataset.filter === key; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", String(on)); });
      cards.forEach((card) => { card.hidden = key !== "all" && card.dataset.cat !== key; });
    };
    chips.forEach((c) => c.addEventListener("click", () => {
      apply(c.dataset.filter);
      try { history.replaceState(null, "", c.dataset.filter === "all" ? location.pathname : "#" + c.dataset.filter); } catch (e) {}
    }));
    const start = location.hash.slice(1);
    if (start && [...chips].some((c) => c.dataset.filter === start)) apply(start);
  }
  if (CSS.supports("animation-timeline: view()")) return;
  document.documentElement.classList.add("wk-auto");
  const stages = document.querySelectorAll(".wk-stage");
  if (!("IntersectionObserver" in window)) { stages.forEach((s) => s.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { threshold: 0.25 });
  stages.forEach((s) => io.observe(s));
})();
