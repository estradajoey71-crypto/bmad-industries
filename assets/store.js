// BMAD Industries storefront client. On the store server it talks to its own origin. On the static copy
// (GitHub Pages) it reads the store's public status, and the Buy form posts to the store, which redirects to
// Stripe Checkout. Without a reachable store every action says plainly that it is not open yet; nothing is faked.
const STORE = (document.querySelector('meta[name="bmad-store"]')?.content || "").replace(/\/$/, "");
const REMOTE = !!STORE && new URL(STORE).origin !== location.origin;
const BASE = REMOTE ? STORE : "";
const api = async (path, opts = {}) => {
  // Cross-origin calls stay "simple" requests (no JSON content type, no cookies) so no preflight is needed.
  const headers = opts.body ? { "Content-Type": REMOTE ? "text/plain" : "application/json" } : {};
  const r = await fetch(BASE + path, { headers, credentials: REMOTE ? "omit" : "same-origin", ...opts });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error || `HTTP ${r.status}`), { status: r.status });
  return body;
};
const $ = (s) => document.querySelector(s);
const say = (el, text) => { if (el) el.textContent = text; };

async function storeStatus() {
  try { return await api("/api/products"); } catch { return null; }
}

async function pricing() {
  const forms = document.querySelectorAll("form[data-buy]");
  if (!forms.length) return;
  const status = await storeStatus();
  const params = new URLSearchParams(location.search);
  for (const f of forms) {
    const b = f.querySelector("button");
    const note = document.querySelector(`[data-buy-note="${f.dataset.buy}"]`);
    // The static copy sells only once the owner opened checkout there (site.json checkout_open + store_url).
    if (!status || !status.checkout_ready || (REMOTE && f.dataset.open !== "yes")) {
      b.disabled = true; b.setAttribute("aria-disabled", "true"); b.textContent = "Checkout opens soon";
      f.addEventListener("submit", (e) => e.preventDefault());
      say(note, status ? "Payments are being set up; no purchase is possible yet." : "Checkout is not open yet. The free download works today.");
      continue;
    }
    for (const k of ["utm_source", "utm_campaign"]) {
      const v = params.get(k);
      if (v && /^[\w.-]{1,60}$/.test(v)) f.insertAdjacentHTML("beforeend", `<input type="hidden" name="${k}" value="${v}">`);
    }
    b.disabled = false; b.removeAttribute("aria-disabled"); b.textContent = b.dataset.label || "Buy";
    say(note, status.mode === "test" ? "TEST MODE: use Stripe test cards; no money is charged." : "Secure checkout by Stripe.");
    f.addEventListener("submit", () => { b.setAttribute("aria-disabled", "true"); say(note, "Opening secure checkout…"); });
  }
}

/** Payment Links (static storefront): after the launch price's last day (US Pacific) a page that was built earlier
 * switches to the regular price and its link. Campaign labels travel to Stripe as the checkout's client_reference_id. */
function paymentLinks() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const params = new URLSearchParams(location.search);
  const label = (v) => (v && /^[\w-]{1,60}$/.test(v) ? v : "");
  // A campaign link usually lands on another page first; the label is kept for this tab only (never sent anywhere
  // except to Stripe with a purchase).
  let ref = [label(params.get("utm_source")), label(params.get("utm_campaign"))].filter(Boolean).join("__");
  try { if (ref) sessionStorage.setItem("bmad_ref", ref); else ref = sessionStorage.getItem("bmad_ref") || ""; } catch { /* storage blocked */ }
  for (const a of document.querySelectorAll("a[data-plink]")) {
    if (a.dataset.until && today > a.dataset.until && a.dataset.regular) {
      a.href = a.dataset.regular; a.textContent = a.dataset.regularLabel;
      const price = document.querySelector(`[data-price="${a.dataset.plink}"]`);
      if (price) { price.textContent = a.dataset.regularLabel.replace(/^Buy /, ""); if (price.nextElementSibling) price.nextElementSibling.textContent = " one-time"; }
      document.querySelector(`[data-price-note="${a.dataset.plink}"]`)?.remove();
    }
    if (ref) { const u = new URL(a.href); u.searchParams.set("client_reference_id", ref.slice(0, 200)); a.href = u.toString(); }
  }
}

async function success() {
  const el = $("#order-status");
  if (!el) return;
  const id = new URLSearchParams(location.search).get("session_id");
  if (!id) { say(el, "No order to show."); return; }
  for (let i = 0; i < 20; i++) {
    try {
      const o = await api(`/api/order?session_id=${encodeURIComponent(id)}`);
      if (o.status === "paid") {
        el.innerHTML = `Payment confirmed — order <b>${o.order}</b>${o.test ? ' <span class="pill-test">TEST ORDER (no money charged)</span>' : ""}. ` +
          (o.email_sent ? `We emailed ${o.email_hint} a link to your licence and downloads.`
            : `Your licence is ready, but the email to ${o.email_hint} has not gone out yet. We will send it; if it has not arrived within a day, contact support with order ${o.order}.`);
        return;
      }
    } catch { break; }
    await new Promise((r) => setTimeout(r, 1500));
  }
  say(el, "We are waiting for the payment confirmation from Stripe. Your email will arrive as soon as it does; you can also sign in on the account page.");
}

async function account() {
  const root = $("#account");
  if (!root) return;
  if (REMOTE) {  // accounts live on the store server (its own cookies); send the visitor there
    $("#login").hidden = true;
    root.innerHTML = `<p><a class="btn btn-primary" href="${STORE}/account.html">Open your account on the BMAD store</a></p><p class="small mute">Sign-in links and downloads are served from ${new URL(STORE).host}.</p>`;
    return;
  }
  const token = new URLSearchParams(location.search).get("token");
  if (token) {
    try { await api("/api/account/session", { method: "POST", body: JSON.stringify({ token }) }); history.replaceState(null, "", "account.html"); }
    catch (e) { say($("#account-msg"), e.message); }
  }
  try {
    const a = await api("/api/account");
    $("#login").hidden = true;
    root.innerHTML = `<p class="dim">Signed in as <b>${a.email}</b></p>` +
      a.orders.map((o) => `<div class="card" style="margin:12px 0"><b>${o.order}</b> · ${o.product_id} · ${o.status}${o.test ? ' <span class="pill-test">TEST</span>' : ""}${o.licence_url ? ` · <a href="${o.licence_url}">Download licence</a>` : ""}</div>`).join("") +
      (a.downloads.length ? `<h3>Downloads</h3><ul>${a.downloads.map((d) => `<li><a href="${d.url}">${d.file}</a> (${(d.size / 1048576).toFixed(1)} MB)</li>`).join("")}</ul><p class="small mute">Links expire after 10 minutes; reload this page for fresh ones.</p>` : "");
  } catch (e) {
    if (e.status !== 401) { say($("#account-msg"), "Accounts open together with checkout."); $("#login").hidden = true; }
  }
  const form = $("#login");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { say($("#account-msg"), (await api("/api/account/login", { method: "POST", body: JSON.stringify({ email: form.email.value }) })).message); }
    catch { say($("#account-msg"), "Accounts open together with checkout."); }
  });
}

async function support() {
  const form = $("#support-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { say($("#support-msg"), (await api("/api/support", { method: "POST", body: JSON.stringify({ email: form.email.value, topic: form.topic.value, message: form.message.value }) })).message); form.reset(); }
    catch (err) { say($("#support-msg"), err.status && ![404, 405].includes(err.status) ? err.message : "This form is not connected on this site yet. Please open an issue on GitHub (link below) — without private details."); }
  });
}

paymentLinks(); pricing(); success(); account(); support();
