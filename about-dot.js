// About page: one dot that hops down the page with you. It rests on the period after "a little
// gallery". When the next heading's period reaches about 60% of the way down the screen, the dot hops
// across to it on its own timed arc (the same speed however fast you scroll), and hops back if you
// scroll up past it.
//
// Built to stay off the main thread while you scroll: heading positions are measured once and cached,
// the resting dot sits in page coordinates so the browser scrolls it natively, scrolling itself only
// does a bit of arithmetic, and a hop is one transform animation the browser runs on its own.
// Skipped for reduced motion, where the periods stay as ordinary dots.
(() => {
  // The drifting frames in the intro only need to move while you can see them.
  const collage = document.querySelector(".studio-story-frame-collage");
  if (collage && "IntersectionObserver" in window)
    new IntersectionObserver(([entry]) => collage.classList.toggle("is-paused", !entry.isIntersecting), { rootMargin: "120px" }).observe(collage);

  const slots = [...document.querySelectorAll(".tt-dot-slot")];
  if (slots.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE = 20;           // the dot's own size in CSS; it is scaled to match each period
  const TRIGGER = 0.6;       // fraction of the screen height a period must reach to call the dot
  const BACK = 60;           // extra distance before it hops back, so it doesn't flutter at the line
  const DURATION = 850;      // ms for a hop
  const HEADER = 90;         // a hop starts from below the sticky header
  const LIFT = 36;           // how high a hop arcs, in px
  const STEPS = 12;          // keyframes along a hop's arc
  const EASE = "cubic-bezier(.645,.045,.355,1)";

  const dot = document.createElement("i");
  dot.className = "tt-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.append(dot);
  document.documentElement.classList.add("tt-dot-travel");

  const rgb = (el) => (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || [106, 129, 148]).slice(0, 3).map(Number);
  const css = (c) => "rgb(" + c.map(Math.round).join(",") + ")";
  const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
  const transform = (p, lift = 0) => "translate3d(" + (p.x - BASE / 2) + "px," + (p.y - BASE / 2 - lift) + "px,0) scale(" + p.s / BASE + ")";

  let colors = slots.map(rgb);
  let pos = [];              // each period's centre in page coordinates, measured once
  let index = 0;             // the period the dot belongs to
  let anim = null;           // the hop in progress, if any
  let width = innerWidth;

  function measure() {
    pos = slots.map((el, i) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2, s: r.width, c: colors[i] };
    });
  }
  function rest() {
    dot.style.transform = transform(pos[index]);
    dot.style.backgroundColor = css(pos[index].c);
  }

  // Where the dot is right now, even mid-hop (read only when a hop starts).
  function current() {
    if (!anim) return { ...pos[index] };
    const style = getComputedStyle(dot);
    const m = new DOMMatrixReadOnly(style.transform);
    return { x: m.e + BASE / 2, y: m.f + BASE / 2, s: m.a * BASE, c: (style.backgroundColor.match(/[\d.]+/g) || [106, 129, 148]).slice(0, 3).map(Number) };
  }

  function hop(to) {
    const from = current();
    // If its period has scrolled out of view, start from the screen's edge instead.
    from.y = Math.min(scrollY + innerHeight - 30, Math.max(scrollY + HEADER, from.y));
    const target = pos[to];
    const keyframes = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      keyframes.push({
        offset: t,
        transform: transform({ x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t, s: from.s + (target.s - from.s) * t }, Math.sin(Math.PI * t) * LIFT),
        backgroundColor: css(mix(from.c, target.c, t)),
      });
    }
    if (anim) anim.cancel();
    const mine = (anim = dot.animate(keyframes, { duration: DURATION, easing: EASE, fill: "both" }));
    mine.onfinish = () => { if (anim === mine) { rest(); anim = null; } mine.cancel(); };
    index = to;
  }

  // Scrolling only compares cached positions with the scroll offset.
  function onScroll() {
    const line = scrollY + innerHeight * TRIGGER;
    let next = index;
    while (next < pos.length - 1 && pos[next + 1].y < line) next++;
    while (next > 0 && pos[next].y > line + BACK) next--;
    if (next !== index) hop(next);
  }

  // Layout can change (fonts, lazy images, reveals), so measure again, but never during a scroll frame.
  let timer = 0;
  function remeasure() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      measure();
      if (!anim) rest();
      onScroll();
    }, 120);
  }

  measure();
  rest();
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  // Phones fire resize as the address bar shows and hides; only a width change moves anything.
  addEventListener("resize", () => { if (innerWidth !== width) { width = innerWidth; colors = slots.map(rgb); remeasure(); } });
  addEventListener("load", remeasure);
  if (document.fonts?.ready) document.fonts.ready.then(remeasure);
  document.addEventListener("transitionend", (e) => { if (e.target.classList?.contains("reveal")) remeasure(); });
  if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);
})();
