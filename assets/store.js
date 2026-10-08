// BMAD Industries storefront client. Talks to the store server on the same origin. On static
// hosting (no server) every action says plainly that it is not open yet; nothing is faked.
const api = async (path, opts) => {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, credentials: "same-origin", ...opts });
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
  const buttons = document.querySelectorAll("[data-buy]");
  if (!buttons.length) return;
  const status = await storeStatus();
  for (const b of buttons) {
    const note = document.querySelector(`[data-buy-note="${b.dataset.buy}"]`);
    if (!status || !status.checkout_ready) {
      // The page ships in this state; keep it, and make sure the placeholder link does nothing.
      b.setAttribute("aria-disabled", "true");
      b.textContent = "Checkout opens soon";
      b.addEventListener("click", (e) => e.preventDefault());
      say(note, status ? "Payments are being set up; no purchase is possible yet." : "Checkout is not open yet. The free download works today.");
      continue;
    }
    b.textContent = b.dataset.label || "Buy";
    b.removeAttribute("aria-disabled");
    say(note, status.mode === "test" ? "TEST MODE: use Stripe test cards; no money is charged." : "");
    b.addEventListener("click", async (e) => {
      e.preventDefault();
      b.setAttribute("aria-disabled", "true"); say(note, "Opening secure checkout…");
      try { location.href = (await api("/api/checkout", { method: "POST", body: JSON.stringify({ product: b.dataset.buy }) })).url; }
      catch (err) { b.removeAttribute("aria-disabled"); say(note, `Checkout could not start: ${err.message}`); }
    });
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
        el.innerHTML = `Payment confirmed — order <b>${o.order}</b>${o.test ? ' <span class="pill-test">TEST ORDER (no money charged)</span>' : ""}. We emailed ${o.email_hint} a link to your licence and downloads.`;
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
    catch (err) { say($("#support-msg"), err.status ? err.message : "This form is not connected on this site yet. Please open an issue on GitHub (link below) — without private details."); }
  });
}

pricing(); success(); account(); support();
