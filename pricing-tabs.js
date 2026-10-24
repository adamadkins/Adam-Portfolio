// Pricing shows a website or an event at a time. The two groups slide past each other and the pill follows
// the selected tab. Without JavaScript both groups simply stack.
(() => {
  const bar = document.querySelector(".price-tabs");
  const viewport = document.querySelector(".price-viewport");
  if (!bar || !viewport) return;
  const tabs = [...bar.querySelectorAll(".price-tab")];
  const track = viewport.querySelector(".price-track");
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
  const pill = bar.querySelector(".price-pill");
  let index = 0;

  const fit = () => {
    pill.style.width = tabs[index].offsetWidth + "px";
    pill.style.transform = "translateX(" + tabs[index].offsetLeft + "px)";
    viewport.style.height = panels[index].offsetHeight + "px";
  };
  const select = (to, focus = false) => {
    index = to;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === to));
      tab.tabIndex = i === to ? 0 : -1;
      panels[i].inert = i !== to;
      panels[i].setAttribute("aria-hidden", String(i !== to));
    });
    track.style.transform = "translateX(" + -100 * to + "%)";
    fit();
    if (focus) tabs[to].focus();
  };

  bar.hidden = false;
  viewport.classList.add("is-slider");
  bar.classList.add("is-ready");
  select(0);
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", event => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (step) select((i + step + tabs.length) % tabs.length, true);
    });
  });
  // Cards change height with the width of the page and when fonts load.
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(track), panels.forEach(panel => new ResizeObserver(fit).observe(panel));
  addEventListener("resize", fit);
})();

// The fine print opens with a turning arrow and a smooth height change instead of appearing all at once.
(() => {
  const box = document.querySelector(".price-fine");
  if (!box) return;
  const toggle = box.querySelector(".price-fine-toggle");
  const body = box.querySelector(".price-fine-body");
  body.inert = true;
  box.classList.add("is-js");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    box.classList.toggle("is-open", open);
    body.inert = !open;
  });
})();
