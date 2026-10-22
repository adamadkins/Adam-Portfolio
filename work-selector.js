// Selected work: one project stage at a time, with a selector that builds itself from the project blocks.
// Adding a project is just adding another <article class="work-case" data-name="..."> to the list, so the
// section stays the same height however many sites it holds, only the visible site's preview loads, and the
// stage's colors change with the project. Without this script every stage is simply shown in a stack.
(() => {
  const list = document.querySelector(".work-list");
  const cases = list ? [...list.querySelectorAll(".work-case")] : [];
  if (cases.length < 2) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const label = (el) => el.dataset.name || el.querySelector("h3")?.textContent.trim() || "Project";

  const nav = document.createElement("div");
  nav.className = "work-nav";
  const tabs = document.createElement("div");
  tabs.className = "work-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Selected projects");
  const step = document.createElement("div");
  step.className = "work-step";
  const count = document.createElement("span");
  count.className = "work-count";
  count.setAttribute("aria-hidden", "true");
  const arrow = (dir, text) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "work-arrow";
    b.setAttribute("aria-label", dir < 0 ? "Previous project" : "Next project");
    b.textContent = text;
    b.addEventListener("click", () => select((index + dir + cases.length) % cases.length, { focus: false }));
    return b;
  };
  step.append(count, arrow(-1, "←"), arrow(1, "→"));

  const buttons = cases.map((panel, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "work-tab";
    b.id = "work-tab-" + i;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", panel.id || (panel.id = "work-panel-" + i));
    const dot = document.createElement("i");
    dot.setAttribute("aria-hidden", "true");
    const cs = getComputedStyle(panel);
    dot.style.background = cs.getPropertyValue("--stage-swatch").trim() || cs.getPropertyValue("--stage-accent").trim() || "#8a9faf";
    b.append(dot, document.createTextNode(label(panel)));
    b.addEventListener("click", () => select(i, { focus: false }));
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", b.id);
    tabs.append(b);
    return b;
  });
  nav.append(tabs, step);
  list.before(nav);
  list.classList.add("work-ready");

  let index = -1;
  function select(next, { focus = false, instant = false } = {}) {
    if (next === index) return;
    index = next;
    cases.forEach((panel, i) => {
      const on = i === next;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
      buttons[i].setAttribute("aria-selected", String(on));
      buttons[i].tabIndex = on ? 0 : -1;
    });
    const frame = cases[next].querySelector("iframe[data-src]");
    if (frame && !frame.getAttribute("src")) frame.src = frame.dataset.src;
    count.textContent = String(next + 1).padStart(2, "0") + " / " + String(cases.length).padStart(2, "0");
    if (focus) buttons[next].focus();
    buttons[next].scrollIntoView({ inline: "center", block: "nearest", behavior: reduce.matches || instant ? "auto" : "smooth" });
  }

  tabs.addEventListener("keydown", (event) => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (move) { event.preventDefault(); select((index + move + cases.length) % cases.length, { focus: true }); }
    else if (event.key === "Home") { event.preventDefault(); select(0, { focus: true }); }
    else if (event.key === "End") { event.preventDefault(); select(cases.length - 1, { focus: true }); }
  });

  // A link like /#work-porter opens that project.
  const fromHash = cases.findIndex((panel) => "#" + panel.id === location.hash);
  select(fromHash >= 0 ? fromHash : 0, { instant: true });
})();
