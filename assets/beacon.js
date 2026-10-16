// Privacy-conscious page-view beacon: only active when the site was built with an analytics endpoint (the privacy
// policy must say so first). Sends the page path, the referrer's host and the UTM labels; no cookie, no identifier,
// nothing stored in the browser. The receiver keeps per-day counts only.
(() => {
  const m = document.querySelector('meta[name="bmad-analytics"]');
  const endpoint = m && m.content;
  if (!endpoint) return;
  try {
    if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    const q = new URLSearchParams(location.search);
    const body = JSON.stringify({ path: location.pathname.replace(/^\/bmad-industries/, ""), ref: document.referrer ? new URL(document.referrer).origin : "", utm_source: q.get("utm_source") || "", utm_campaign: q.get("utm_campaign") || "" });
    const url = endpoint.replace(/\/$/, "") + "/api/view";
    // A plain-text body keeps this a "simple" request (no preflight); the receiver parses it as JSON anyway.
    if (!(navigator.sendBeacon && navigator.sendBeacon(url, body))) fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
  } catch { /* never break the page */ }
})();
