// Small touches that make the about and philosophy sections respond to the visitor.
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // The portrait card follows the cursor: the glow, the monogram and the dot each move a little differently.
  const card = document.querySelector(".about-visual");
  if (card && !calm && matchMedia("(hover: hover)").matches) {
    card.addEventListener("pointermove", event => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width, y = (event.clientY - box.top) / box.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      card.style.setProperty("--px", (x - 0.5).toFixed(3));
      card.style.setProperty("--py", (y - 0.5).toFixed(3));
    });
    card.addEventListener("pointerleave", () => ["--mx", "--my", "--px", "--py"].forEach(name => card.style.removeProperty(name)));
  }

  // "shout." is set as a whisper. Hover, tap or focus it and it shouts.
  const layout = document.querySelector(".philosophy-layout");
  const word = layout?.querySelector(".whisper");
  if (word) {
    let timer = 0;
    const loud = on => {
      clearTimeout(timer);
      word.classList.toggle("is-loud", on);
      layout.classList.toggle("is-loud", on);
      if (on) layout.classList.add("has-shouted");
    };
    word.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") loud(true); });
    word.addEventListener("pointerleave", event => { if (event.pointerType === "mouse") loud(false); });
    word.addEventListener("click", event => { if (event.detail === 0 || matchMedia("(hover: none)").matches) { loud(true); timer = setTimeout(() => loud(false), 1800); } });
    word.addEventListener("focus", () => loud(true));
    word.addEventListener("blur", () => loud(false));
    word.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      loud(true);
      timer = setTimeout(() => loud(false), 1800);
    });
  }

  // The paragraph darkens word by word as the section scrolls into view, and the asterisks turn with the page.
  const copy = layout?.querySelector("p");
  const words = [];
  if (copy) {
    copy.innerHTML = copy.textContent.trim().split(/\s+/).map(text => '<span class="w">' + text.replace(/[<>&]/g, "") + "</span>").join(" ");
    words.push(...copy.querySelectorAll(".w"));
  }
  const spinners = document.querySelectorAll(".about-visual-cross,.philosophy-signoff span");
  const update = () => {
    if (calm) { words.forEach(w => w.classList.add("lit")); return; }
    if (copy) {
      const top = copy.getBoundingClientRect().top;
      const progress = clamp((innerHeight * 0.92 - top) / (innerHeight * 0.45), 0, 1);
      const lit = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < lit));
    }
    spinners.forEach(spin => spin.style.setProperty("--spin", (scrollY * 0.12).toFixed(1)));
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
})();
