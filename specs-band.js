// The benefits strip drifts sideways forever. The page holds each chip once; this script builds as many repeats as the
// screen needs (as few as possible, so there are few elements and the animated layer stays small). The drift is a plain
// CSS animation, run by the browser off the main thread, and scrolling the page nudges the strip along by one transform.
// Icons animate only while their chip is on screen.
(() => {
  const band = document.querySelector(".specs");
  const slide = band?.querySelector(".specs-slide");
  const track = band?.querySelector(".specs-track");
  const group = band?.querySelector(".specs-group");
  if (!band || !slide || !track || !group) return;
  const originals = [...group.children];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BASE = 34;        // pixels per second of constant drift
  const FOLLOW = 0.45;    // how far the strip travels for each pixel the page scrolls
  let width = 0, copies = 1, builtFor = 0, visible = false, hovering = false, queued = false;
  let live = null;

  const watch = chip => live?.observe(chip);
  if ("IntersectionObserver" in window) {
    live = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("is-live", entry.isIntersecting)));
    originals.forEach(watch);
  } else originals.forEach(chip => chip.classList.add("is-live"));

  const clones = source => source.map(chip => { const copy = chip.cloneNode(true); copy.setAttribute("aria-hidden", "true"); copy.classList.remove("is-live"); watch(copy); return copy; });

  // One group has to be wider than the screen, and the track holds three of them (the drift covers one group's width and
  // the scrolling can add up to one more).
  const makeGroup = real => {
    const list = document.createElement("ul");
    list.className = "specs-group";
    if (!real) list.setAttribute("aria-hidden", "true");
    real ? list.append(...originals) : list.append(...clones(originals));
    for (let i = 1; i < copies; i++) list.append(...clones(originals));
    return list;
  };
  const build = () => {
    // Measure one set of chips on its own, then work out how many sets one group needs.
    group.replaceChildren(...originals);
    track.replaceChildren(group);
    copies = Math.max(1, Math.ceil(innerWidth * 1.1 / (group.offsetWidth || 1)));
    track.replaceChildren(makeGroup(true), makeGroup(false), makeGroup(false));
    builtFor = innerWidth;
    measure();
  };
  const place = () => {
    queued = false;
    if (!width) return;
    slide.style.transform = "translate3d(" + -((scrollY * FOLLOW) % width) + "px,0,0)";
  };
  const measure = () => {
    width = track.firstElementChild.offsetWidth;
    if (width) band.style.setProperty("--dur", (width / BASE).toFixed(2) + "s");
    place();
  };
  const pause = () => band.classList.toggle("is-paused", !visible || hovering);

  if (calm) return;
  build();
  band.classList.add("is-ready");
  // Following the page's scrolling means touching the strip on every scroll frame, so it is left to mouse-and-keyboard
  // screens. On phones the strip simply drifts, entirely on the browser's own animation thread.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) addEventListener("scroll", () => {
    if (!visible || queued) return;
    queued = true;
    requestAnimationFrame(place);
  }, { passive: true });
  band.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") { hovering = true; pause(); } });
  band.addEventListener("pointerleave", () => { hovering = false; pause(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; pause(); if (visible) place(); }, { rootMargin: "80px" }).observe(band);
  } else visible = true;
  addEventListener("resize", () => { if (innerWidth !== builtFor) build(); });
  if (document.fonts?.ready) document.fonts.ready.then(build);
})();
