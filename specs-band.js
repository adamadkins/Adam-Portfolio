// The specimen strip drifts sideways forever. It speeds up when the page is scrolled and turns around when
// the page is scrolled back up, then settles into a calm drift again. Hovering stops it.
(() => {
  const track = document.querySelector(".specs-track");
  const band = document.querySelector(".specs");
  if (!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const BASE = 34;        // pixels per second at rest
  const group = track.firstElementChild;
  let x = 0, direction = 1, boost = 0, last = performance.now(), lastY = scrollY, paused = false, visible = true;

  band.addEventListener("pointerenter", () => { paused = true; });
  band.addEventListener("pointerleave", () => { paused = false; });
  if ("IntersectionObserver" in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(band);

  addEventListener("scroll", () => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (Math.abs(dy) < 1) return;
    direction = dy > 0 ? 1 : -1;
    boost = Math.min(900, boost + Math.abs(dy) * 2.2);
  }, { passive: true });

  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    boost *= Math.pow(0.04, dt);   // the boost fades out in about a second
    if (visible && !paused) {
      x -= direction * (BASE + boost) * dt;
      const width = group.offsetWidth;
      if (width) x = ((x % width) - width) % width;   // wraps seamlessly: the second group is an exact copy
      track.style.transform = "translate3d(" + x + "px,0,0)";
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
