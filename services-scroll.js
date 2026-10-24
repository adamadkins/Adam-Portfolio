// Services: the page's vertical scrolling drives a sideways slide through the four services, and each panel's
// illustration plays when it reaches the middle of the screen. On phones, with reduced motion, or without
// JavaScript the panels are an ordinary swipeable row.
(() => {
  const hs = document.querySelector(".hs");
  if (!hs) return;
  const stage = hs.querySelector(".hs-stage");
  const track = hs.querySelector(".hs-track");
  const panels = [...track.querySelectorAll(".hs-panel")];
  const fill = hs.querySelector(".hs-fill");
  const hint = hs.querySelector(".hs-hint");
  const desktop = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let travel = 0, pinned = false, watcher = null;

  const mark = () => {
    const vw = innerWidth;
    panels.forEach(panel => {
      const box = panel.getBoundingClientRect();
      const center = (box.left + box.right) / 2;
      panel.classList.toggle("is-in", center > vw * 0.12 && center < vw * 0.9);
    });
  };
  const measure = () => {
    pinned = desktop.matches;
    hs.classList.toggle("is-pinned", pinned);
    track.style.transform = "";
    if (!pinned) {
      hs.style.height = "";
      // Swipe mode: only the panels actually on screen animate, which keeps scrolling light on phones.
      if (!watcher && "IntersectionObserver" in window) {
        watcher = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("is-in", entry.isIntersecting)), { root: track, threshold: 0.5 });
        panels.forEach(panel => watcher.observe(panel));
      } else if (!watcher) panels.forEach(p => p.classList.add("is-in"));
      return;
    }
    if (watcher) { watcher.disconnect(); watcher = null; }
    travel = Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
    hs.style.height = stage.offsetHeight + travel + "px";
    update();
  };
  const update = () => {
    if (!pinned) return;
    const top = hs.getBoundingClientRect().top - parseFloat(getComputedStyle(stage).top || 0);
    const progress = clamp(-top / travel, 0, 1);
    track.style.transform = "translate3d(" + -progress * travel + "px,0,0)";
    fill.style.transform = "scaleX(" + progress + ")";
    hint.style.opacity = progress < 0.04 ? 1 : 0;
    mark();
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", measure);
  desktop.addEventListener("change", measure);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  measure();
})();
