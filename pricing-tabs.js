// Pricing shows one group at a time (a website, or an event). Without JavaScript both groups show.
(() => {
  const tabs = [...document.querySelectorAll(".price-tab")];
  if (!tabs.length) return;
  const select = tab => tabs.forEach(other => {
    const on = other === tab;
    other.setAttribute("aria-selected", String(on));
    other.tabIndex = on ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
  });
  document.querySelector(".price-tabs").hidden = false;
  select(tabs[0]);
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", event => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
})();
