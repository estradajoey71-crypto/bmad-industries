// Founders waitlist form: posts to BMAD's signup receiver when the page was built with an endpoint; otherwise it
// opens a pre-filled email (no third party either way). The campaign label store.js keeps in this tab is included so
// a signup can say where it came from. Nothing is sent anywhere until the person presses the button.
(() => {
  const form = document.querySelector("form[data-waitlist-form]");
  if (!form) return;
  const endpoint = form.getAttribute("data-endpoint") || "";
  const status = form.querySelector("[data-status]");
  let campaign = "";
  try { campaign = (sessionStorage.getItem("bmad_ref") || "").replace(/[^A-Za-z0-9_.-]/g, ""); } catch { /* storage blocked */ }
  const field = (n) => (form.querySelector(`[name="${n}"]`) || {}).value || "";
  const say = (t, ok) => { if (status) { status.textContent = t; status.className = `small ${ok ? "" : "mute"}`; } };
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const consent = form.querySelector('[name="consent"]');
    if (!consent || !consent.checked) { say("Please tick the consent box so we may keep your address.", false); return; }
    const body = { name: field("name").trim(), email: field("email").trim(), consent: true, campaign, os: field("os").trim(), games: field("games").trim(), website: field("website") };
    if (!endpoint) {
      const mail = form.getAttribute("data-mailto") || "";
      const extra = `\nName: ${body.name}\nOS: ${body.os}\nGames: ${body.games}\n(consent given on the founders page)`;
      location.href = mail + encodeURIComponent(extra);
      say("Your email app should open with the request filled in; send it and you are on the list.", true);
      return;
    }
    const btn = form.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    say("Sending…", true);
    try {
      const r = await fetch(endpoint.replace(/\/$/, "") + "/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await r.json().catch(() => ({}));
      if (r.ok && out.ok) { location.href = form.getAttribute("data-thanks") || "thanks.html"; return; }
      say(out.error ? `Not saved: ${out.error}` : "Not saved. Please try again later or email us.", false);
    } catch { say("Could not reach the signup service. Please email us instead (button above).", false); }
    if (btn) btn.disabled = false;
  });
})();
