// About page: one dot follows the reader down the page. It starts as the period after "a little
// gallery", then hops to the period after "Adam Adkins", "stayed with me" and "A shared outlook".
// When a heading's period reaches a focus line 45% of the way down the screen, the dot is exactly on
// it; in between it eases across to the next one. Skipped for reduced motion.
(() => {
  const slots = [...document.querySelectorAll(".tt-dot-slot")];
  if (slots.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.createElement("i");
  dot.className = "tt-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.append(dot);
  document.documentElement.classList.add("tt-dot-travel");

  const FOCUS = 0.45;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const measure = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2, s: r.width };
  };

  // The scroll position at which each period sits on the focus line, kept within what the page can
  // actually scroll to, so the dot starts exactly on the first period and ends exactly on the last.
  // Each period's own color (lighter on the dark section); the dot blends between them as it travels.
  const rgb = (el) => (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || [106, 129, 148]).slice(0, 3).map(Number);
  let colors = slots.map(rgb);
  const mix = (a, b, t) => "rgb(" + a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",") + ")";

  let queued = false;
  function place() {
    queued = false;
    const a = slots.map(measure);
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const f = a.map((p) => Math.min(max, Math.max(0, p.y - innerHeight * FOCUS)));
    let p = { ...a[0], c: mix(colors[0], colors[0], 0) };
    if (scrollY > f[0]) {
      let i = 0;
      while (i < a.length - 1 && scrollY >= f[i + 1]) i++;
      if (i >= a.length - 1) p = { ...a[a.length - 1], c: mix(colors[a.length - 1], colors[a.length - 1], 0) };
      else {
        const span = f[i + 1] - f[i];
        const t = span > 0 ? ease((scrollY - f[i]) / span) : 1;
        p = { x: a[i].x + (a[i + 1].x - a[i].x) * t, y: a[i].y + (a[i + 1].y - a[i].y) * t, s: a[i].s + (a[i + 1].s - a[i].s) * t, c: mix(colors[i], colors[i + 1], t) };
      }
    }
    dot.style.width = dot.style.height = p.s + "px";
    dot.style.backgroundColor = p.c;
    dot.style.transform = "translate3d(" + (p.x - p.s / 2) + "px," + (p.y - p.s / 2) + "px,0)";
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", () => { colors = slots.map(rgb); queue(); });
  addEventListener("load", queue);
  if (document.fonts?.ready) document.fonts.ready.then(queue);
  // Lazy images and reveal animations move the headings, so follow them.
  if ("ResizeObserver" in window) new ResizeObserver(queue).observe(document.body);
  place();
})();
