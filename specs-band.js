// The benefits strip drifts sideways forever. The drift is a plain CSS animation (the browser runs it off the main
// thread), and scrolling the page nudges the strip along by a single transform, so the strip follows your scrolling:
// down moves it one way, back up moves it the other. Nothing here retimes an animation while you scroll.
(() => {
  const band = document.querySelector(".specs");
  const slide = band?.querySelector(".specs-slide");
  const group = band?.querySelector(".specs-group");
  if (!band || !slide || !group) return;

  // Icons animate only while their chip is on screen.
  const chips = band.querySelectorAll(".spec");
  if ("IntersectionObserver" in window) {
    const live = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("is-live", entry.isIntersecting)));
    chips.forEach(chip => live.observe(chip));
  } else chips.forEach(chip => chip.classList.add("is-live"));

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE = 34;        // pixels per second of constant drift
  const FOLLOW = 0.45;    // how far the strip travels for each pixel the page scrolls
  let width = 0, visible = false, queued = false;

  const place = () => {
    queued = false;
    if (!width) return;
    slide.style.transform = "translate3d(" + -((scrollY * FOLLOW) % width) + "px,0,0)";
  };
  const measure = () => {
    width = group.offsetWidth;
    if (width) band.style.setProperty("--dur", (width / BASE).toFixed(2) + "s");
    place();
  };
  const pause = () => band.classList.toggle("is-paused", !visible || hovering);
  let hovering = false;

  addEventListener("scroll", () => {
    if (!visible || queued) return;
    queued = true;
    requestAnimationFrame(place);
  }, { passive: true });
  band.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") { hovering = true; pause(); } });
  band.addEventListener("pointerleave", () => { hovering = false; pause(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; pause(); if (visible) place(); }, { rootMargin: "80px" }).observe(band);
  } else visible = true;
  addEventListener("resize", measure);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  measure();
})();
