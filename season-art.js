// The art for each seasonal theme, built when a theme is switched on and removed when it is switched off. Everything
// is light on purpose: a handful of SVG pieces, and moving parts that are single compositor-friendly animations (a
// snowfall is one tiled layer, not hundreds of flakes), so a theme never makes the page heavy on a phone.
(() => {
  const $ = selector => document.querySelector(selector);
  const touch = matchMedia("(hover: none)").matches;
  const made = [];
  let bulbBackup = null, onResize = null, resizeTimer = 0, scrollCleanup = null;

  const make = markup => { const t = document.createElement("template"); t.innerHTML = markup.trim(); return t.content.firstElementChild; };
  const put = (parent, markup) => {
    if (!parent) return null;
    const node = typeof markup === "string" ? make(markup) : markup;
    parent.append(node); made.push(node);
    return node;
  };

  // ---------- a string of things hanging from the header: lights, bunting or eggs ----------
  // `piece` draws one hanging item at x, y; `colors` are grouped so each group can twinkle as ONE animation.
  const strip = (className, step, sag, piece, groups = 1) => {
    const header = $(".site-header");
    if (!header) return;
    const build = () => {
      const w = innerWidth, s = w < 600 ? step * 0.78 : step;
      let wire = "M0 2";
      const buckets = Array.from({ length: groups }, () => "");
      let i = 0;
      for (let x = 0; x < w; x += s, i++) {
        const end = Math.min(x + s, w);
        wire += ` Q${(x + end) / 2} ${2 + sag * 2} ${end} 2`;
        if (end - x > s * 0.6) buckets[i % groups] += piece((x + end) / 2, 2 + sag, i);
      }
      return `<svg class="season-strip ${className}" width="${w}" height="${sag + 34}" viewBox="0 0 ${w} ${sag + 34}" aria-hidden="true" focusable="false"><path class="wire" d="${wire}" fill="none"/>${buckets.map((b, k) => `<g class="g${k}">${b}</g>`).join("")}</svg>`;
    };
    let node = put(header, build());
    const rebuild = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { const next = make(build()); node.replaceWith(next); made[made.indexOf(node)] = next; node = next; }, 200); };
    let width = innerWidth;
    onResize = () => { if (innerWidth !== width) { width = innerWidth; rebuild(); } };
    addEventListener("resize", onResize);
  };

  // ---------- small things ----------
  const web = (size, flip) => {
    const n = 6, rays = Array.from({ length: n }, (_, i) => { const a = (i / (n - 1)) * Math.PI / 2; return [Math.cos(a) * size, Math.sin(a) * size]; });
    let d = rays.map(([x, y]) => `M0 0L${x.toFixed(1)} ${y.toFixed(1)}`).join("");
    for (let r = 1; r <= 5; r++) {
      const k = r / 5.4;
      d += `M${rays[0][0] * k} ${rays[0][1] * k}` + rays.slice(1).map(([x, y], i) => { const px = rays[i][0] * k, py = rays[i][1] * k, qx = x * k, qy = y * k; return `Q${((px + qx) / 2 * 0.82).toFixed(1)} ${((py + qy) / 2 * 0.82).toFixed(1)} ${qx.toFixed(1)} ${qy.toFixed(1)}`; }).join("");
    }
    return `<svg class="season-web${flip ? " flip" : ""}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false"><path d="${d}" fill="none"/></svg>`;
  };
  const heartBadge = () => `<svg class="season-badge" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="#e0457b" stroke="#fff" stroke-width="1.6"/></svg>`;
  // Halloween, Christmas and Easter replace the logo with a version wearing the season's costume. The pictures are drawn on
  // a larger canvas, so each is sized and offset (in logo-tiles, from the tile's centre) to put its tile exactly over the normal one. Easter's is drawn a little smaller so its tall ears stay on the page.
  const LOGOS = {
    halloween: { k: 1.4266, x: -0.2486, y: -0.8623 },
    christmas: { k: 1.4138, x: -0.2587, y: -0.8343 },
    easter: { k: 1.3337, x: -0.1668, y: -0.9109 },
    thanksgiving: { k: 1.3811, x: -0.2285, y: -0.8343 },
    newyear: { k: 1.2875, x: -0.1607, y: -0.7136 },
  };
  const marked = [];
  const costume = name => {
    const art = LOGOS[name];
    document.querySelectorAll(".brand, .footer-brand").forEach(brand => {
      if (!brand.querySelector(".brand-symbol, .footer-brand-icon")) return;
      put(brand, `<img class="season-logo" src="/images/season/logo-${name}.webp" alt="" width="300" height="300" aria-hidden="true" style="--k:${art.k};--x:${art.x};--y:${art.y}">`);
      brand.classList.add("has-season-logo");
      marked.push(brand);
    });
  };
  const spider = () => `<div class="season-spider" aria-hidden="true"><span class="thread"></span><img class="spider" src="/images/season/spider.webp" width="48" height="39" alt=""></div>`;
  const bat = () => `<span class="bat"><img class="hang" src="/images/season/bat-hang.webp" width="15" height="36" alt=""><span class="fly"><img class="wing-up" src="/images/season/bat-up.webp" width="38" height="27" alt=""><img class="wing-down" src="/images/season/bat-down.webp" width="38" height="27" alt=""></span></span>`;
  const bats = () => `<div class="season-bats" aria-hidden="true">${bat()}${bat()}${touch ? "" : bat()}</div>`;
  const layer = className => put(document.body, `<div class="${className}" aria-hidden="true"></div>`);
  const firework = (className, colors) => {
    const rays = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, c = colors[i % colors.length]; return `<line x1="${50 + Math.cos(a) * 9}" y1="${50 + Math.sin(a) * 9}" x2="${50 + Math.cos(a) * 36}" y2="${50 + Math.sin(a) * 36}" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="${50 + Math.cos(a) * 44}" cy="${50 + Math.sin(a) * 44}" r="2.4" fill="${c}"/>`; }).join("");
    return put(document.body, `<svg class="season-fw ${className}" width="150" height="150" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${rays}</svg>`);
  };

  // ---------- the lightbulb in the closing section becomes something seasonal ----------
  const OUT = `fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"`;
  const icons = {
    valentines: {
      // Just a heart: no glow, no lighting up.
      solid: `<path d="M110 250s-70-44-70-102a38 38 0 0 1 70-22 38 38 0 0 1 70 22c0 58-70 102-70 102z" fill="#e0457b"/><path d="M62 146c0-14 9-24 22-27" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="7" stroke-linecap="round"/>`,
    },
    newyear: {
      glow: "#ffd75e",
      outline: `<circle cx="110" cy="170" r="66"/><path d="M110 112v10M110 218v10M52 170h10M158 170h10M81 120l5 8.7M139 220l-5-8.7M81 220l5-8.7M139 120l-5 8.7M60 148l8.7 5M151 187l8.7 5M60 192l8.7-5M151 153l8.7-5"/><path d="M110 170V130M110 170V140"/><circle cx="110" cy="170" r="4"/>`,
      lit: `<circle cx="110" cy="170" r="66" fill="rgba(255,215,94,.16)" stroke="#ffd75e" stroke-width="3"/><path d="M110 170V128M110 170V142" stroke="#fff3c4" stroke-width="4"/><circle cx="110" cy="170" r="5" fill="#fff3c4" stroke="none"/><g class="tw tw0"><path d="M182 96l3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5z" fill="#fff" stroke="none"/></g><g class="tw tw1"><path d="M36 112l2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6z" fill="#ffd75e" stroke="none"/></g><g class="tw tw2"><path d="M190 232l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#fff" stroke="none"/></g>`,
    },
    halloween: {
      glow: "#ffb347",
      outline: `<image href="/images/season/pumpkin-outline.webp" x="20" y="100" width="180" height="167"/><path d="M80 188l12-15 12 15zM116 188l12-15 12 15zM105 204l5-9 5 9zM78 218l11 11 9-7 12 9 12-9 9 7 11-11-5 15-15 9H98l-15-9z" stroke-width="2.5"/>`,
      lit: `<image href="/images/season/pumpkin-lit.webp" x="20" y="100" width="180" height="167"/><path class="flick" d="M80 188l12-15 12 15zM116 188l12-15 12 15zM105 204l5-9 5 9zM78 218l11 11 9-7 12 9 12-9 9 7 11-11-5 15-15 9H98l-15-9z" fill="#ffd27a" stroke="#fff0c4" stroke-width="2.5"/>`,
    },
    thanksgiving: {
      glow: "#ffc267",
      outline: `<path d="M84 262V164a26 8 0 0 1 52 0V262"/><path d="M84 164a26 8 0 0 0 52 0M96 168v18a4 4 0 0 0 8 0v-14M110 160v-14"/><path d="M110 92c10 16 18 26 18 40a18 18 0 0 1-36 0c0-14 8-24 18-40z"/><path d="M84 262c0 6 52 6 52 0"/><ellipse cx="110" cy="272" rx="54" ry="9"/>`,
      lit: `<path d="M84 262V164a26 8 0 0 1 52 0V262" fill="rgba(255,226,170,.1)" stroke="#f0d9b0" stroke-width="3"/><g class="flame"><path d="M110 92c10 16 18 26 18 40a18 18 0 0 1-36 0c0-14 8-24 18-40z" fill="rgba(255,168,64,.85)" stroke="#ffd27a" stroke-width="3"/><path d="M110 112c5 9 9 14 9 21a9 9 0 0 1-18 0c0-7 4-12 9-21z" fill="#fff0bf" stroke="none"/></g>`,
    },
    christmas: {
      glow: "#9cf0b6",
      outline: `<path d="M110 66L80 118H96L64 168H84L50 222H170L136 168H156L124 118H140Z"/><path d="M100 222V252H120V222"/><path d="M110 46l4.4 9 9.9 1.4-7.2 7 1.7 9.8-8.8-4.7-8.8 4.7 1.7-9.8-7.2-7 9.9-1.4z"/>`,
      lit: `<path d="M110 66L80 118H96L64 168H84L50 222H170L136 168H156L124 118H140Z" fill="rgba(80,200,120,.16)" stroke="#8ee6a8" stroke-width="3"/><path d="M110 46l4.4 9 9.9 1.4-7.2 7 1.7 9.8-8.8-4.7-8.8 4.7 1.7-9.8-7.2-7 9.9-1.4z" fill="#ffd75e" stroke="#fff0a8" stroke-width="2.5"/><g class="tw tw0"><circle cx="96" cy="146" r="5" fill="#ff5a64"/><circle cx="116" cy="190" r="5" fill="#ff5a64"/><circle cx="142" cy="208" r="5" fill="#ff5a64"/></g><g class="tw tw1"><circle cx="122" cy="132" r="5" fill="#ffd75e"/><circle cx="84" cy="198" r="5" fill="#ffd75e"/><circle cx="156" cy="214" r="0" fill="#ffd75e"/></g><g class="tw tw2"><circle cx="106" cy="104" r="4.5" fill="#6bb4ff"/><circle cx="132" cy="168" r="5" fill="#6bb4ff"/><circle cx="70" cy="212" r="5" fill="#6bb4ff"/></g>`,
    },
    easter: {
      glow: "#f6b8ee",
      outline: `<path d="M110 70c-40 0-62 62-62 112 0 44 28 74 62 74s62-30 62-74c0-50-22-112-62-112z"/><path d="M54 158l14-14 14 14 14-14 14 14 14-14 14 14 14-14 14 14M50 214q15-14 30 0t30 0 30 0 30 0"/><circle cx="84" cy="116" r="3.5"/><circle cx="116" cy="100" r="3.5"/><circle cx="142" cy="126" r="3.5"/>`,
      lit: `<path d="M110 70c-40 0-62 62-62 112 0 44 28 74 62 74s62-30 62-74c0-50-22-112-62-112z" fill="rgba(246,184,238,.16)" stroke="#f6b8ee" stroke-width="3"/><path d="M54 158l14-14 14 14 14-14 14 14 14-14 14 14 14-14 14 14 14-14" stroke="#9fd8ff" stroke-width="4"/><path d="M50 214q15-14 30 0t30 0 30 0 30 0" stroke="#ffe08a" stroke-width="4"/><circle cx="84" cy="116" r="4.5" fill="#9fd8ff" stroke="none"/><circle cx="116" cy="100" r="4.5" fill="#ffe08a" stroke="none"/><circle cx="142" cy="126" r="4.5" fill="#b9f0c8" stroke="none"/>`,
    },
    july4: {
      glow: "#8fb8ff",
      outline: `<path d="M110 118v-36M110 222v36M58 170H22M198 170h-36M73 133l-26-26M147 207l26 26M147 133l26-26M73 207l-26 26"/><path d="M110 132l9.6 19.4 21.4 3.1-15.5 15.1 3.7 21.3-19.2-10.1-19.2 10.1 3.7-21.3-15.5-15.1 21.4-3.1z"/>`,
      lit: `<g stroke-width="4"><path d="M110 118v-36M110 222v36M73 133l-26-26M147 207l26 26" stroke="#ff6a70"/><path d="M58 170H22M198 170h-36M147 133l26-26M73 207l-26 26" stroke="#7ab0ff"/></g><path d="M110 132l9.6 19.4 21.4 3.1-15.5 15.1 3.7 21.3-19.2-10.1-19.2 10.1 3.7-21.3-15.5-15.1 21.4-3.1z" fill="#fff" stroke="#dfe9ff" stroke-width="2.5"/><circle cx="110" cy="76" r="4" fill="#ff6a70" stroke="none"/><circle cx="110" cy="264" r="4" fill="#ff6a70" stroke="none"/><circle cx="16" cy="170" r="4" fill="#7ab0ff" stroke="none"/><circle cx="204" cy="170" r="4" fill="#7ab0ff" stroke="none"/>`,
    },
  };
  const swapBulb = name => {
    const bulb = $(".idea-bulb"), art = icons[name];
    if (!bulb || !art) return;
    if (bulbBackup === null) bulbBackup = bulb.innerHTML;
    if (art.solid) { bulb.innerHTML = `<svg class="season-icon season-solid" viewBox="0 0 220 320" focusable="false">${art.solid}</svg>`; return; }
    bulb.innerHTML = `<svg class="season-icon" viewBox="0 0 220 320" focusable="false"><defs><radialGradient id="season-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${art.glow}" stop-opacity=".42"/><stop offset=".55" stop-color="${art.glow}" stop-opacity=".12"/><stop offset="1" stop-color="${art.glow}" stop-opacity="0"/></radialGradient></defs><g class="season-outline" ${OUT}>${art.outline}</g><g class="season-lit" ${OUT}><circle class="season-halo" cx="110" cy="170" r="124" fill="url(#season-glow)" stroke="none"/>${art.lit}</g></svg>`;
  };

  // ---------- the themes ----------
  const themes = {
    valentines() {
      strip("season-hearts-garland", 54, 9, (x, y, i) => {
        const fill = ["#e0457b", "#ff8fb5", "#c2305f", "#ffc2d6"][i % 4];
        return `<path d="M${x} ${y - 2}v5" stroke="#b86a86" stroke-width="1.6"/><path transform="translate(${x - 10.5} ${y + 1}) scale(.88)" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="${fill}"/>`;
      });
      layer("season-hearts season-hearts-far");
      layer("season-hearts season-hearts-near");
      put($(".brand"), heartBadge());
    },
    newyear() {
      strip("season-stars", 54, 9, (x, y, i) => {
        const fill = ["#f4c542", "#d6dde4", "#f4c542", "#ffe9a8"][i % 4];
        return `<path d="M${x} ${y - 2}v4" stroke="#a89a6a" stroke-width="1.6"/><path transform="translate(${x - 9.5} ${y + 1}) scale(.8)" d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.3 5.8 21.1l1.6-7L2 9.3l7.1-.7z" fill="${fill}"/>`;
      });
      layer("season-confetti season-confetti-far");
      layer("season-confetti season-confetti-near");
      costume("newyear");
      firework("fw-a", ["#ffd75e", "#ffffff", "#ffe9a8"]);
      if (!touch) firework("fw-b", ["#ffffff", "#ffd75e", "#ffe9a8"]);
    },
    halloween() {
      const spiderBox = put($(".site-header"), spider());
      // The spider lowers itself at the top of the page and climbs back up out of sight as soon as you scroll; scroll back
      // to the top and it comes down again. Touch it and it scurries away for a few seconds too.
      if (spiderBox) {
        let scrolled = scrollY > 40, fled = false, timer = 0;
        const sync = () => spiderBox.classList.toggle("is-climbing", scrolled || fled);
        const flee = () => { clearTimeout(timer); fled = true; sync(); timer = setTimeout(() => { fled = false; sync(); }, 3800); };
        spiderBox.addEventListener("pointerenter", flee);
        spiderBox.addEventListener("pointerdown", flee);
        const onScroll = () => { const now = scrollY > (scrolled ? 8 : 40); if (now !== scrolled) { scrolled = now; sync(); } };
        addEventListener("scroll", onScroll, { passive: true });
        scrollCleanup = () => removeEventListener("scroll", onScroll);
        sync();
        setTimeout(() => spiderBox.style.setProperty("--delay", ".25s"), 4200);   // after the first long descent, coming back is quick
      }
      put($(".site-header"), web(96));
      put($(".contact-teaser"), web(260));
      put($(".site-footer"), web(160, true));
      costume("halloween");
      put(document.body, bats());
    },
    thanksgiving() {
      costume("thanksgiving");
      put(document.body, `<div class="season-leaves-wrap" aria-hidden="true"><div class="season-leaves season-leaves-far"></div><div class="season-leaves season-leaves-near"></div></div>`);
    },
    christmas() {
      strip("season-lights", 46, 9, (x, y, i) => {
        const color = ["#ff4d57", "#ffc83d", "#4ddc8a", "#5aa7ff"][i % 4];
        return `<path d="M${x} ${y - 2}v4" stroke="#2d4a3a" stroke-width="2"/><circle cx="${x}" cy="${y + 9}" r="12" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y + 9}" r="5.2" fill="${color}"/>`;
      }, 4);
      layer("season-snow season-snow-far");
      layer("season-snow season-snow-near");
      costume("christmas");
    },
    easter() {
      strip("season-eggs", 58, 9, (x, y, i) => {
        const [base, band] = [["#f6b8cf", "#fff"], ["#bfe3ff", "#ffe08a"], ["#cfeec9", "#fff"], ["#e3d2ff", "#ffd1e3"], ["#ffe9a8", "#bfe3ff"]][i % 5];
        return `<path d="M${x} ${y - 2}v5" stroke="#8b7aa6" stroke-width="1.6"/><ellipse cx="${x}" cy="${y + 13}" rx="8" ry="10.5" fill="${base}"/><path d="M${x - 7.4} ${y + 11}l3.7-3 3.7 3 3.7-3 3.7 3" fill="none" stroke="${band}" stroke-width="2.2"/>`;
      });
      costume("easter");
    },
    july4() {
      strip("season-bunting", 52, 8, (x, y, i) => {
        const fill = ["#e5484d", "#ffffff", "#3b6fd4"][i % 3];
        return `<path d="M${x - 11} ${y - 1}h22l-11 20z" fill="${fill}" stroke="${fill === "#ffffff" ? "#c9d3df" : "none"}" stroke-width="1"/>`;
      });
      firework("fw-a", ["#ff6a70", "#ffffff", "#7ab0ff"]);
      firework("fw-b", ["#ffd75e", "#ff6a70", "#ffffff"]);
      if (!touch) firework("fw-c", ["#7ab0ff", "#ffffff", "#ff6a70"]);
    },
  };

  window.TLTSeason = {
    mount(name) {
      this.unmount();
      if (!themes[name]) return;
      document.documentElement.dataset.season = name;
      themes[name]();
      swapBulb(name);
    },
    unmount() {
      made.splice(0).forEach(node => node.remove());
      marked.splice(0).forEach(brand => brand.classList.remove("has-season-logo"));
      const bulb = $(".idea-bulb");
      if (bulb && bulbBackup !== null) { bulb.innerHTML = bulbBackup; bulbBackup = null; }
      if (onResize) { removeEventListener("resize", onResize); onResize = null; }
      if (scrollCleanup) { scrollCleanup(); scrollCleanup = null; }
      delete document.documentElement.dataset.season;
    },
  };
})();
