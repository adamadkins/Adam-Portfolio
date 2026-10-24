// The strip drifts sideways forever. The motion runs on the browser's compositor (Web Animations), so it stays
// smooth even while the page is busy. Scrolling speeds it up and scrolling back up turns it around; hovering stops it.
(() => {
  const track = document.querySelector(".specs-track");
  const band = document.querySelector(".specs");
  const dots = document.querySelector(".specs-dots");
  const group = track?.firstElementChild;
  if (!track || !group || matchMedia("(prefers-reduced-motion: reduce)").matches || !track.animate) return;

  const BASE = 34;               // pixels per second at rest
  const TILE = 24;               // the dotted backdrop repeats every 24px
  const START = 1000 * 1000;     // start part-way through so the strip can also run backwards
  let drift, dotDrift, direction = 1, boost = 0, lastY = scrollY, hovering = false, visible = true, ticking = false, lastTick = 0;

  const build = () => {
    const width = group.offsetWidth;
    if (!width) return;
    const time = drift ? drift.currentTime : START;
    drift?.cancel(); dotDrift?.cancel();
    drift = track.animate([{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(" + -width + "px,0,0)" }], { duration: width / BASE * 1000, iterations: Infinity });
    dotDrift = dots.animate([{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(" + -TILE + "px,0,0)" }], { duration: TILE / (BASE * 0.35) * 1000, iterations: Infinity });
    drift.currentTime = time; dotDrift.currentTime = START;
    apply();
  };
  const apply = () => {
    if (!drift) return;
    const rate = direction * (1 + boost / BASE);
    // updatePlaybackRate keeps the current position moving smoothly while the speed changes
    for (const animation of [drift, dotDrift]) animation.updatePlaybackRate ? animation.updatePlaybackRate(rate) : (animation.playbackRate = rate);
    const stop = hovering || !visible;
    // Only change play state when it actually changes; poking a running animation every frame can stall it.
    if (stop && drift.playState === "running") { drift.pause(); dotDrift.pause(); }
    else if (!stop && drift.playState === "paused") { drift.play(); dotDrift.play(); }
  };
  const settle = now => {
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    boost *= Math.pow(0.04, dt);              // the extra speed fades out in about a second
    if (boost < 0.5) { boost = 0; ticking = false; apply(); return; }
    apply();
    requestAnimationFrame(settle);
  };
  addEventListener("scroll", () => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (Math.abs(dy) < 1) return;
    direction = dy > 0 ? 1 : -1;
    boost = Math.min(900, boost + Math.abs(dy) * 2.2);
    if (!ticking) { ticking = true; lastTick = performance.now(); requestAnimationFrame(settle); }
  }, { passive: true });
  band.addEventListener("pointerenter", () => { hovering = true; apply(); });
  band.addEventListener("pointerleave", () => { hovering = false; apply(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; apply(); }).observe(band);
    // Icons animate only while their chip is on screen.
    const live = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("is-live", entry.isIntersecting)));
    track.querySelectorAll(".spec").forEach(chip => live.observe(chip));
  } else track.querySelectorAll(".spec").forEach(chip => chip.classList.add("is-live"));
  addEventListener("resize", build);
  if (document.fonts?.ready) document.fonts.ready.then(build);
  build();
})();
