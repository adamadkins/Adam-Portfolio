// About page: one dot that hops down the page with you. It rests on the period after "a little
// gallery". When the next heading's period reaches about 60% of the way down the screen, the dot hops
// across to it on its own timed arc (the same speed however fast you scroll), and hops back if you
// scroll up past it. While resting it just stays on its period and scrolls with the page.
// Skipped for reduced motion, where the periods stay as ordinary dots.
(() => {
  const slots = [...document.querySelectorAll(".tt-dot-slot")];
  if (slots.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.createElement("i");
  dot.className = "tt-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.append(dot);
  document.documentElement.classList.add("tt-dot-travel");

  const TRIGGER = 0.6;       // fraction of the screen height a period must reach to call the dot
  const BACK = 60;           // extra distance before it hops back, so it doesn't flutter at the line
  const DURATION = 850;      // ms for a hop
  const HEADER = 90;         // the dot starts a hop from below the sticky header
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rgb = (el) => (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || [106, 129, 148]).slice(0, 3).map(Number);
  const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
  let colors = slots.map(rgb);

  const measure = (i) => {
    const r = slots[i].getBoundingClientRect();
    return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2, s: r.width, c: colors[i] };
  };

  let index = 0;             // the period the dot belongs to
  let last = measure(0);     // where the dot was drawn last (page coordinates)
  let flight = null;         // { from, start } while hopping
  let raf = 0;

  function draw(p) {
    last = p;
    dot.style.width = dot.style.height = p.s + "px";
    dot.style.backgroundColor = "rgb(" + p.c.map(Math.round).join(",") + ")";
    dot.style.transform = "translate3d(" + (p.x - p.s / 2) + "px," + (p.y - p.s / 2 - (p.lift || 0)) + "px,0)";
  }

  function frame(now) {
    raf = 0;
    const target = measure(index);
    if (!flight) { draw(target); return; }
    const t = Math.min(1, (now - flight.start) / DURATION);
    const e = ease(t);
    const f = flight.from;
    draw({ x: f.x + (target.x - f.x) * e, y: f.y + (target.y - f.y) * e, s: f.s + (target.s - f.s) * e,
      c: mix(f.c, target.c, e), lift: Math.sin(Math.PI * t) * 36 });
    if (t >= 1) { flight = null; draw(target); return; }
    raf = requestAnimationFrame(frame);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function update() {
    const line = innerHeight * TRIGGER;
    let next = index;
    while (next < slots.length - 1 && slots[next + 1].getBoundingClientRect().top < line) next++;
    while (next > 0 && slots[next].getBoundingClientRect().top > line + BACK) next--;
    if (next !== index) {
      // Hop from where the dot is on screen; if its period has scrolled out of view, from the screen's edge.
      const y = Math.min(innerHeight - 30, Math.max(HEADER, last.y - scrollY)) + scrollY;
      flight = { from: { ...last, y, lift: 0 }, start: performance.now() };
      index = next;
    }
    schedule();
  }

  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => { colors = slots.map(rgb); update(); });
  addEventListener("load", update);
  if (document.fonts?.ready) document.fonts.ready.then(update);
  // Lazy images and reveal animations move the headings, so follow them.
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(document.body);
  update();
})();
