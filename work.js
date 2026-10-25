// Work page: where the browser cannot tie an animation to scrolling, the sites scroll slowly by themselves while they are on screen.
(() => {
  if (CSS.supports("animation-timeline: view()")) return;
  document.documentElement.classList.add("wk-auto");
  const stages = document.querySelectorAll(".wk-stage");
  if (!("IntersectionObserver" in window)) { stages.forEach(s => s.classList.add("is-in")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle("is-in", e.isIntersecting)), { threshold: 0.25 });
  stages.forEach(s => io.observe(s));
})();
