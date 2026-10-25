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
  let travel = 0, pinned = false, onScreen = false, settleTimer = 0, stickyTop = 0, queued = false;

  // Swipe mode: while you are swiping nothing starts or stops (so the swipe stays light); once it comes to rest the
  // card in the middle plays its illustration, and the others stand still.
  const settle = () => {
    if (pinned) return;
    if (!onScreen) { panels.forEach(panel => panel.classList.remove("is-in")); return; }
    const view = track.getBoundingClientRect();
    const middle = view.left + view.width / 2;
    let best = panels[0], bestGap = Infinity;
    panels.forEach(panel => {
      const box = panel.getBoundingClientRect();
      const gap = Math.abs((box.left + box.right) / 2 - middle);
      if (gap < bestGap) { bestGap = gap; best = panel; }
    });
    panels.forEach(panel => panel.classList.toggle("is-in", panel === best));
  };
  const queueSettle = delay => { clearTimeout(settleTimer); settleTimer = setTimeout(settle, delay); };
  track.addEventListener("scroll", () => { if (!pinned) queueSettle(150); }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; if (!pinned) queueSettle(200); }, { threshold: 0.2 }).observe(hs);
  } else onScreen = true;

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
      queueSettle(60);
      return;
    }
    stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    travel = Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
    hs.style.height = stage.offsetHeight + travel + "px";
    update();
  };
  const update = () => {
    queued = false;
    if (!pinned) return;
    const top = hs.getBoundingClientRect().top - stickyTop;
    const progress = clamp(-top / travel, 0, 1);
    track.style.transform = "translate3d(" + -progress * travel + "px,0,0)";
    fill.style.transform = "scaleX(" + progress + ")";
    hint.style.opacity = progress < 0.04 ? 1 : 0;
    mark();
  };
  addEventListener("scroll", () => { if (pinned && !queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", measure);
  desktop.addEventListener("change", measure);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  measure();
})();
