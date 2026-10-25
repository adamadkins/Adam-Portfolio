// Builds the work pages from work/projects.json:
//   work.html            the showcase (featured project, filters, grid)
//   work/<slug>.html     one page per project, with previous / next
// Run: node scripts/build-work.mjs   (add --check to fail if the pages are out of date)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "work/projects.json"), "utf8"));
const check = process.argv.includes("--check");

// Width and height of a .webp, read from its header.
const webpSize = (file) => {
  const b = readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8L") { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  throw new Error(`Not a webp: ${file}`);
};

// The site's own header and footer come from about.html, so the work pages never drift from the rest of the site.
const about = readFileSync(join(root, "about.html"), "utf8");
const top = about.slice(about.indexOf('  <a class="skip-link"'), about.indexOf("  <main"))
  .replace('<a class="nav-link" href="/work.html">Showcase</a>', '<a class="nav-link" href="/work.html" aria-current="page">Showcase</a>')
  .replace(' aria-current="page">About', ">About");
const foot = about.slice(about.indexOf("  <footer"), about.indexOf("</footer>") + 9)
  .replace('href="/#work"', 'href="/work.html"')
  .replace('<a href="/about.html" aria-current="page">About</a>', '<a href="/about.html">About</a>');

const page = ({ title, description, path, body, ogTitle }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#fafafa" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="https://tlt-studios.com${path}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="The Little Things Studios" />
  <meta property="og:url" content="https://tlt-studios.com${path}" />
  <meta property="og:title" content="${ogTitle || title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="https://tlt-studios.com/social-preview.png?v=5" />
  <meta property="og:image:alt" content="The Little Things Studios" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle || title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="https://tlt-studios.com/social-preview.png?v=5" />
  <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/work.css" />
  <script src="/script.js" defer></script>
  <script src="/work.js" defer></script>
</head>
<body>
${top}  <main id="main" class="work-page">
${body}
  </main>

${foot}

<script src="/season.js" defer></script>
</body>
</html>
`;

const projects = data.projects.map((p) => {
  const dir = join(root, "images/work/page");
  const tallFile = join(dir, `${p.slug}-tall.webp`);
  if (!existsSync(tallFile)) throw new Error(`Missing ${p.slug}-tall.webp in images/work/page`);
  const [tw, th] = webpSize(tallFile);
  const phones = readdirSync(dir).filter((f) => new RegExp(`^${p.slug}-m-\\d+\\.webp$`).test(f)).sort();
  if (phones.length !== p.phones.length) throw new Error(`${p.slug}: ${phones.length} phone images but ${p.phones.length} phone captions`);
  return { ...p, tw, th, phoneFiles: phones.map((f) => ({ file: f, size: webpSize(join(dir, f)) })), cat: data.categories[p.category] };
});
const bar = '<span class="wk-bar" aria-hidden="true"><i></i><i></i><i></i></span>';
const tall = (p, lazy = true) => `<img class="wk-tall" src="/images/work/page/${p.slug}-tall.webp" width="${p.tw}" height="${p.th}"${lazy ? ' loading="lazy"' : ""} decoding="async" alt="${p.alt}">`;
const pad = (n) => String(n).padStart(2, "0");

// ---------- the showcase ----------
const card = (p, i) => {
  const ph = p.phoneFiles[0];
  const alt = p.phones[0][0];
  return `
        <a class="wk-card${p.featured ? " wk-card--feature" : ""}" href="/work/${p.slug}.html" data-cat="${p.category}" style="--panel:${p.panel}">
          <div class="wk-card-stage">
            <div class="wk-card-browser">${bar}<div class="wk-view">${tall(p, !p.featured)}</div></div>
            <div class="wk-card-phone"><img src="/images/work/page/${ph.file}" width="${ph.size[0]}" height="${ph.size[1]}" loading="lazy" decoding="async" alt="${alt}"></div>
          </div>
          <div class="wk-card-copy">
            <p class="project-meta">${pad(i + 1)} / ${p.meta}</p>
            <h2>${p.name}</h2>
            <p>${p.summary}</p>
            <span class="wk-card-go">View project <span aria-hidden="true">→</span></span>
          </div>
        </a>`;
};
const cats = Object.entries(data.categories).filter(([k]) => projects.some((p) => p.category === k));
const filters = cats.length > 1 ? `
      <div class="wk-filters" role="group" aria-label="Filter projects">
        <button type="button" class="wk-chip is-on" data-filter="all" aria-pressed="true">All <span>${projects.length}</span></button>${cats.map(([k, label]) => `
        <button type="button" class="wk-chip" data-filter="${k}" aria-pressed="false">${label} <span>${projects.filter((p) => p.category === k).length}</span></button>`).join("")}
      </div>` : "";
const sorted = [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
const word = projects.length === 1 ? "project" : "projects";
const indexBody = `    <section class="wk-hero container" aria-labelledby="wk-title">
      <p class="eyebrow section-kicker">SHOWCASE / ${pad(projects.length)} ${word.toUpperCase()}</p>
      <h1 id="wk-title">Real sites,<br /><span class="text-secondary">for real businesses.</span></h1>
      <p class="wk-intro">Everything here is live and in use. Open any project to scroll through the site, see it on a phone, and read how I approached it.</p>${filters}
    </section>
    <section class="wk-showcase container" aria-label="Projects">
      <div class="wk-grid-cards">${sorted.map(card).join("")}
      </div>
    </section>
    <section class="wk-end container reveal" aria-labelledby="wk-end-title">
      <p class="eyebrow section-kicker">YOUR TURN</p>
      <h2 id="wk-end-title">Want one of these<br /><span class="text-secondary">for your business?</span></h2>
      <p>Tell me a little about what you do and I will tell you what I would build.</p>
      <a class="wk-visit" href="/contact.html">Tell me about it <span aria-hidden="true">↗</span></a>
    </section>`;

// ---------- one page per project ----------
const detail = (p, i) => {
  const prev = projects[(i + projects.length - 1) % projects.length], next = projects[(i + 1) % projects.length];
  const facts = p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const tags = p.tags.map((t) => `<li>${t}</li>`).join("");
  const notes = p.notes.map(([h, t], j) => `<li class="reveal"><span class="wk-note-n">${pad(j + 1)}</span><h3>${h}</h3><p>${t}</p></li>`).join("");
  const phones = p.phoneFiles.map((f, j) => `<figure class="wk-phone reveal"><div class="wk-phone-frame"><img src="/images/work/page/${f.file}" width="${f.size[0]}" height="${f.size[1]}" loading="lazy" decoding="async" alt="${p.phones[j][0]}"></div><figcaption>${p.phones[j][1]}</figcaption></figure>`).join("");
  const more = projects.length > 1 ? `
    <nav class="wk-more container" aria-label="More work">
      <a class="wk-more-link wk-more-prev" href="/work/${prev.slug}.html"><span>← Previous</span><b>${prev.name}</b></a>
      <a class="wk-more-all" href="/work.html">Full showcase</a>
      <a class="wk-more-link wk-more-next" href="/work/${next.slug}.html"><span>Next →</span><b>${next.name}</b></a>
    </nav>` : "";
  return page({
    title: `${p.name} | Showcase | The Little Things Studios`,
    description: p.summary,
    path: `/work/${p.slug}.html`,
    body: `    <section class="wk-chapter wk-chapter--solo" id="${p.slug}" style="--panel:${p.panel}" aria-labelledby="${p.slug}-title">
      <div class="container"><a class="wk-back" href="/work.html"><span aria-hidden="true">←</span> Full showcase</a></div>
      <div class="container wk-grid">
        <div class="wk-copy reveal">
          <p class="wk-num" aria-hidden="true">${pad(i + 1)}</p>
          <p class="project-meta">${p.meta}</p>
          <h1 id="${p.slug}-title">${p.name}</h1>
          <p class="wk-lead">${p.lead}</p>
          <dl class="wk-facts">${facts}</dl>
          <ul class="wk-tags" aria-label="What I did">${tags}</ul>
          <a class="wk-visit" href="${p.url}" target="_blank" rel="noopener noreferrer">Visit the live site <span aria-hidden="true">↗</span></a>
        </div>
        <div class="wk-stage reveal">
          <div class="wk-browser">${bar}<div class="wk-view">${tall(p, false)}</div></div>
          <p class="wk-hint" aria-hidden="true">Scroll down the page to see the whole site <span>↓</span></p>
        </div>
      </div>
      <div class="container">
        <ol class="wk-notes">${notes}</ol>
        <div class="wk-phones">${phones}</div>
      </div>
    </section>${more}`,
  });
};

const out = new Map();
out.set("work.html", page({
  title: "Showcase | The Little Things Studios",
  description: "Live websites for real businesses, built by Adam Adkins at The Little Things Studios. Scroll through each one, see it on a phone, then visit it.",
  path: "/work.html",
  ogTitle: "Showcase | The Little Things Studios",
  body: indexBody,
}));
projects.forEach((p, i) => out.set(`work/${p.slug}.html`, detail(p, i)));

let stale = 0;
for (const [file, html] of out) {
  const path = join(root, file);
  if (check) { if (!existsSync(path) || readFileSync(path, "utf8") !== html) { console.error("Out of date:", file); stale++; } continue; }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log("wrote", file);
}
if (check && stale) { console.error("Run: node scripts/build-work.mjs"); process.exit(1); }
