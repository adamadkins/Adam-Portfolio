// The screenshots further down the page are lazy, so on a slow connection they could start arriving in the middle of a
// scroll. Once the page has loaded and gone quiet, fetch and decode them in the background instead, so they are
// already there when you scroll to them. Skipped on Data Saver and very slow connections.
(() => {
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
  const warm = () => document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.loading = "eager";
    img.decode?.().catch(() => {});
  });
  const start = () => setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 4000 }) : warm()), 800);
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
})();
