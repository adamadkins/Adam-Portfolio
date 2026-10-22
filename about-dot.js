// About page: one dot that hops down the page with you. It rests on the period after "a little
// gallery". When the next heading's period reaches about 60% of the way down the screen, the dot hops
// across to it on its own timed arc (the same speed however fast you scroll), and hops back if you
// scroll up past it.
//
// Built to stay off the main thread while you scroll: scrolling only does a bit of arithmetic, and a
// hop is one transform animation the browser runs on its own.
// Skipped for reduced motion, where the periods stay as ordinary dots.
(() => {
  // The drifting frames in the intro only need to move while you can see them.
  const collage = document.querySelector(".studio-story-frame-collage");
  if (collage && "IntersectionObserver" in window)
    new IntersectionObserver(([entry]) => collage.classList.toggle("is-paused", !entry.isIntersecting), { rootMargin: "120px" }).observe(collage);

  const slots = [...document.querySelectorAll(".tt-dot-slot")];
  if (slots.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE = 20;           // the flying dot's own size in CSS; it is scaled to match each period
  const TRIGGER = 0.6;       // fraction of the screen height a period must reach to call the dot
  const BACK = 60;           // extra distance before it hops back, so it doesn't flutter at the line
  const DURATION = 850;      // ms for a hop
  const HEADER = 90;         // a hop starts from below the sticky header
  const LIFT = 36;           // how high a hop arcs, in px
  const STEPS = 12;          // keyframes along a hop's arc
  const EASE = "cubic-bezier(.645,.045,.355,1)";

  // At rest the dot IS the heading's own period (a real element in the heading), so it can never be
  // misaligned. Only a hop uses a flying copy, measured fresh at takeoff.
  const flyer = document.createElement("i");
  flyer.className = "tt-dot";
  flyer.setAttribute("aria-hidden", "true");
  flyer.style.display = "none";
  document.body.append(flyer);
  document.documentElement.classList.add("tt-dot-travel");

  const rgbOf = (str) => (str.match(/[\d.]+/g) || [106, 129, 148]).slice(0, 3).map(Number);
  const css = (c) => "rgb(" + c.map(Math.round).join(",") + ")";
  const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
  const transform = (p, lift = 0) => "translate3d(" + (p.x - BASE / 2) + "px," + (p.y - BASE / 2 - lift) + "px,0) scale(" + p.s / BASE + ")";

  let index = 0;             // the period that currently has the dot
  let anim = null;           // the hop in progress, if any
  let tops = [];             // each period's page position, only used to decide when to hop

  const home = (i) => slots.forEach((el, k) => el.classList.toggle("is-home", k === i));

  // A period's centre in page coordinates, as it will be once its heading has finished sliding in.
  function live(i) {
    const el = slots[i], r = el.getBoundingClientRect();
    let x = r.left + scrollX + r.width / 2, y = r.top + scrollY + r.height / 2;
    const reveal = el.closest(".reveal");
    if (reveal) { const m = new DOMMatrixReadOnly(getComputedStyle(reveal).transform); x -= m.e; y -= m.f; }
    return { x, y, s: r.width, c: rgbOf(getComputedStyle(el).backgroundColor) };
  }

  function current() {
    if (!anim) return live(index);
    const style = getComputedStyle(flyer);
    const m = new DOMMatrixReadOnly(style.transform);
    return { x: m.e + BASE / 2, y: m.f + BASE / 2, s: m.a * BASE, c: rgbOf(style.backgroundColor) };
  }

  function hop(to) {
    const from = current();
    // If its period has scrolled out of view, start from the screen's edge instead.
    from.y = Math.min(scrollY + innerHeight - 30, Math.max(scrollY + HEADER, from.y));
    const target = live(to);
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
    home(-1);
    flyer.style.display = "block";
    const mine = (anim = flyer.animate(keyframes, { duration: DURATION, easing: EASE, fill: "both" }));
    mine.onfinish = () => {
      if (anim === mine) { home(index); flyer.style.display = "none"; anim = null; }
      mine.cancel();
    };
    index = to;
  }

  // Scrolling only compares cached positions with the scroll offset (no layout reads).
  function onScroll() {
    const line = scrollY + innerHeight * TRIGGER;
    let next = index;
    while (next < tops.length - 1 && tops[next + 1] < line) next++;
    while (next > 0 && tops[next] > line + BACK) next--;
    if (next !== index) hop(next);
  }

  function measure() { tops = slots.map((el) => { const r = el.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); }

  // Layout can change (fonts, lazy images, reveals), so measure again, but never during a scroll frame.
  let timer = 0;
  const remeasure = () => { clearTimeout(timer); timer = setTimeout(() => { measure(); onScroll(); }, 120); };

  let width = innerWidth;
  home(0);
  measure();
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  // Phones fire resize as the address bar shows and hides; only a width change moves anything.
  addEventListener("resize", () => { if (innerWidth !== width) { width = innerWidth; remeasure(); } });
  addEventListener("load", remeasure);
  if (document.fonts) { document.fonts.ready.then(remeasure); document.fonts.addEventListener?.("loadingdone", remeasure); }
  document.addEventListener("transitionend", (e) => { if (e.target.classList?.contains("reveal")) remeasure(); });
  if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);
})();
