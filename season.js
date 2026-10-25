// Seasonal themes. The studio picks the theme in the portal; this asks which one is live and dresses the site for it.
// Nothing is downloaded unless a theme is on. Add ?season=halloween (or christmas, easter, thanksgiving, july4, off) to
// any page to preview a theme without changing what visitors see.
(() => {
  const NAMES = ["halloween", "thanksgiving", "christmas", "easter", "july4"];
  const API = "https://portal.tlt-studios.com/api/site/theme";
  const KEY = "tlt-season";
  const html = document.documentElement;
  let showing = null, loading = null;

  const asset = (tag, attrs) => new Promise((resolve, reject) => {
    const node = Object.assign(document.createElement(tag), attrs);
    node.onload = resolve; node.onerror = reject;
    document.head.append(node);
  });
  const ready = () => loading ||= Promise.all([
    asset("link", { rel: "stylesheet", href: "/season.css" }),
    asset("script", { src: "/season-art.js", async: true }),
  ]);
  const show = async name => {
    name = NAMES.includes(name) ? name : null;
    if (name === showing) return;
    showing = name;
    if (!name) { window.TLTSeason?.unmount(); return; }
    try { await ready(); } catch { return; }
    if (showing === name) window.TLTSeason.mount(name);
  };

  const preview = new URLSearchParams(location.search).get("season");
  if (preview) { show(preview); return; }

  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
  if (cached?.theme) show(cached.theme);   // the last known theme appears straight away on repeat visits
  const stop = new AbortController();
  setTimeout(() => stop.abort(), 4000);
  fetch(API, { signal: stop.signal, credentials: "omit" })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data) return;
      try { localStorage.setItem(KEY, JSON.stringify({ theme: data.theme || null })); } catch {}
      show(data.theme);
    })
    .catch(() => {});
})();
