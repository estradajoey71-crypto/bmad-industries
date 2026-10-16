// Fusion media: the hero loop plays only when the visitor's settings allow motion and the connection is not in
// data-saver mode (the poster shows otherwise), with a pause button; gallery cards load their video only when the
// visitor presses play. No third party, no tracking, nothing stored.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saver = navigator.connection && navigator.connection.saveData;
  const hero = document.querySelector("[data-hero-video]");
  if (hero) {
    const video = hero.querySelector("video");
    const btn = hero.querySelector("[data-hero-toggle]");
    const load = () => {
      if (video.dataset.loaded) return;
      for (const s of video.querySelectorAll("source[data-src]")) { s.src = s.dataset.src; s.removeAttribute("data-src"); }
      video.dataset.loaded = "1";
      video.load();
    };
    const setLabel = () => { if (btn) btn.textContent = video.paused ? "Play background video" : "Pause background video"; };
    if (!reduce && !saver) { load(); video.play().catch(() => {}); }
    video.addEventListener("play", setLabel); video.addEventListener("pause", setLabel); setLabel();
    if (btn) btn.addEventListener("click", () => { load(); if (video.paused) video.play().catch(() => {}); else video.pause(); });
  }
  for (const card of document.querySelectorAll("[data-media-card]")) {
    const play = card.querySelector("[data-play]");
    if (!play) continue;
    play.addEventListener("click", () => {
      const v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "metadata"; v.autoplay = true; v.muted = false;
      v.setAttribute("aria-label", play.getAttribute("aria-label") || "");
      v.poster = card.dataset.poster || "";
      v.width = +card.dataset.width || 960; v.height = +card.dataset.height || 540;
      const s = document.createElement("source"); s.src = card.dataset.src; s.type = "video/mp4"; v.appendChild(s);
      const a = document.createElement("a"); a.href = card.dataset.src; a.textContent = "Download the clip"; v.appendChild(a);
      play.replaceWith(v);
      v.play().catch(() => {});
    });
  }
})();
