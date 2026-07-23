/* =====================================================================
   ETHIO-SUPER-AI — PLATFORM EXPANSION
   Loads after enhancements.js. Purely additive: new DOM is injected into
   existing containers (.dashboard-grid, .sidebar-nav, <main class="workspace">),
   nothing here deletes or rewrites script.js / features-complete.js /
   enhancements.js. Where a name already exists (playTrack) it is
   redefined here on purpose to extend it — the original behaviour for
   every existing track id is preserved exactly, per the established
   pattern from enhancements.js.
   ===================================================================== */

(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function toast(msg, type) { if (typeof window.showNotification === "function") window.showNotification(msg, type || "success"); }
  function loadJSON(key, fallback) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } }
  function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }
  function timeAgo(ts) {
    const diff = Math.max(0, Date.now() - new Date(ts).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
  /* simple deterministic hash — used to seed generative art / pick a
     real audio file for any track id so behaviour is stable across reloads */
  function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }

  /* ==================================================================
   * 1. EXTENDED MUSIC CATALOG
   * ================================================================== */
  const REAL_AUDIO_FILES = ["./chanel.m4a", "./loyal.m4a", "./mystical.m4a"];
  const COVERS = ["./profile.png", "./profile2.png"];

  // The original 5 ids keep their EXACT original file mapping (from
  // script.js's playTrack) so nothing about existing tracks changes.
  const ORIGINAL_FILE_MAP = {
    "rift-valley": "./mystical.m4a",
    "nile-flow": "./chanel.m4a",
    "ethio-future-beat": "./loyal.m4a",
    "addis-night-dreams": "./mystical.m4a",
    "cyber-addis-2099": "./chanel.m4a"
  };

  const TRACKS = {
    "ethio-future-beat": { title: "Ethio Future Beat", artist: "Ethio Future", genre: "Cyberpunk", plays: 18400 },
    "addis-night-dreams": { title: "Addis Night Dreams", artist: "Neural Beats", genre: "Ambient", plays: 12100 },
    "cyber-addis-2099": { title: "Cyber Addis 2099", artist: "Ethio Future", genre: "Electronic", plays: 24700 },
    "rift-valley": { title: "Rift Valley Echoes", artist: "Neural Beats", genre: "Ambient", plays: 9800 },
    "nile-flow": { title: "Digital Nile Flow", artist: "Ethio Future", genre: "Electronic", plays: 15600 },
    "urban-pulse": { title: "Urban Pulse", artist: "Neural Beats", genre: "Electronic", plays: 7300 },
    "desert-mirage": { title: "Desert Mirage", artist: "Ethio Future", genre: "Ambient", plays: 6100 },
    "zion-echoes": { title: "Zion Echoes", artist: "Tizita Collective", genre: "Ethio-Jazz", plays: 21200 },
    "modern-tizita": { title: "Modern Tizita", artist: "Tizita Collective", genre: "Ethio-Jazz", plays: 19300 },
    "neon-liturgy": { title: "Neon Liturgy", artist: "Neural Beats", genre: "Cyberpunk", plays: 11400 },
    "fusion-dawn": { title: "Fusion Dawn", artist: "Ethio Future", genre: "Ethio-Pop", plays: 8700 },
    "addis-sunrise": { title: "Addis Sunrise", artist: "Tizita Collective", genre: "Ethio-Pop", plays: 13900 }
  };
  Object.keys(TRACKS).forEach((id, i) => {
    TRACKS[id].id = id;
    TRACKS[id].file = ORIGINAL_FILE_MAP[id] || REAL_AUDIO_FILES[hashStr(id) % REAL_AUDIO_FILES.length];
    TRACKS[id].cover = COVERS[i % COVERS.length];
  });

  const ALBUMS = [
    { id: "album-cyber-visions", title: "Cyber Visions", artist: "Ethio Future", cover: "./profile.png", trackIds: ["ethio-future-beat", "cyber-addis-2099", "nile-flow", "desert-mirage"] },
    { id: "album-night-signals", title: "Night Signals", artist: "Neural Beats", cover: "./profile2.png", trackIds: ["addis-night-dreams", "rift-valley", "urban-pulse", "neon-liturgy"] },
    { id: "album-tizita-roots", title: "Tizita Roots", artist: "Tizita Collective", cover: "./profile.png", trackIds: ["zion-echoes", "modern-tizita", "addis-sunrise"] },
    { id: "album-fusion-tapes", title: "The Fusion Tapes", artist: "Various Artists", cover: "./profile2.png", trackIds: ["fusion-dawn", "addis-sunrise", "urban-pulse"] }
  ];

  const CATEGORIES = [
    { id: "cyberpunk", name: "Cyberpunk", icon: "🌆", genre: "Cyberpunk" },
    { id: "ambient", name: "Ambient", icon: "🌫️", genre: "Ambient" },
    { id: "electronic", name: "Electronic", icon: "⚡", genre: "Electronic" },
    { id: "ethio-jazz", name: "Ethio-Jazz", icon: "🎷", genre: "Ethio-Jazz" },
    { id: "ethio-pop", name: "Ethio-Pop", icon: "🎤", genre: "Ethio-Pop" }
  ];

  const LYRICS = {
    "ethio-future-beat": "[Verse]\nCity lights like fire in the rift valley night\nCircuits humming to an ancient beat, burning bright\n\n[Chorus]\nWe are the future, born of the old and new\nEthio future beat, running straight through you",
    "cyber-addis-2099": "[Intro]\nAddis in neon, two thousand ninety-nine\nSignal towers singing an old familiar line\n\n[Chorus]\nCyber Addis, glowing skyline\nHeartbeat of a city out of time",
    "zion-echoes": "[Verse]\nEchoes down the valley, calling out my name\nEvery drum a memory, every string the same\n\n[Chorus]\nZion echoes carry me back home",
    "addis-night-dreams": "[Verse]\nStreetlights blur to static, the city starts to dream\nEvery window a story, every rooftop a screen\n\n[Chorus]\nAddis night dreams, drifting overhead\nHold the silence gently, till the dark is fed",
    "rift-valley": "[Verse]\nWind across the valley, older than the stone\nCarries every signal back to where I'm from\n\n[Chorus]\nRift valley echoes, rolling through the years\nFar beneath the static, still the drum appears",
    "nile-flow": "[Verse]\nData like a river, cutting through the sand\nCarrying the old songs to a newer land\n\n[Chorus]\nDigital Nile flow, current running deep\nEvery byte a story that the water keeps",
    "urban-pulse": "[Verse]\nConcrete keeps the rhythm that the city breathes\nEvery corner counting to a beat it needs\n\n[Chorus]\nUrban pulse, wired and alive\nFeel it in the traffic, feel it when you drive",
    "desert-mirage": "[Verse]\nHeat waves bending skylines out along the dune\nSomewhere past the static there's an older tune\n\n[Chorus]\nDesert mirage, shimmering and slow\nChasing something distant that we'll never know",
    "modern-tizita": "[Verse]\nAn old song remembered through a modern frame\nSame ache, same longing, wearing a new name\n\n[Chorus]\nModern tizita, calling from before\nEvery generation finds it at the door",
    "neon-liturgy": "[Intro]\nCandlelight replaced by a cyan glow\nStill the same old hymn, just a different flow\n\n[Chorus]\nNeon liturgy, sung beneath the wire\nSacred in the static, holy in the fire",
    "fusion-dawn": "[Verse]\nHorns and synths waking up together\nOld roots, new roads, tied by the same feather\n\n[Chorus]\nFusion dawn breaking on the skyline\nEverything we are, all at one time",
    "addis-sunrise": "[Verse]\nGold across the rooftops, waking up the town\nEvery quiet corner slowly turning round\n\n[Chorus]\nAddis sunrise, soft and wide awake\nAnother day of building, for everybody's sake"
  };

  function trackMeta(id) { return TRACKS[id] || { title: id, artist: "Unknown Artist", genre: "Unknown", file: REAL_AUDIO_FILES[hashStr(id) % REAL_AUDIO_FILES.length], cover: COVERS[0], plays: 0 }; }

  /* ==================================================================
   * 2. GLOBAL AUDIO ENGINE — real playback + real Web Audio waveform
   * ================================================================== */
  let audioCtx = null, analyser = null, sourceNode = null, waveformRAF = null;
  let currentQueue = loadJSON("esaQueue", []);
  let queueHistory = [];
  let currentTrackId = loadJSON("esaCurrentTrack", null);

  function getAudioEl() { return $("#studio-player"); }

  function ensureAudioGraph() {
    const audioEl = getAudioEl();
    if (!audioEl || sourceNode) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      console.warn("Waveform analyser unavailable:", e.message);
    }
  }

  function drawWaveform() {
    const canvas = $("#esa-waveform-canvas");
    if (!canvas) { waveformRAF = requestAnimationFrame(drawWaveform); return; }
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    let data;
    if (analyser) {
      data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
    } else {
      data = new Uint8Array(32).map(() => 20 + Math.random() * 200 * (getAudioEl()?.paused ? 0.15 : 1));
    }
    const barCount = 40;
    const step = Math.floor(data.length / barCount) || 1;
    const barWidth = w / barCount;
    for (let i = 0; i < barCount; i++) {
      const v = data[i * step] || 0;
      const barH = Math.max(2, (v / 255) * h);
      const grad = ctx.createLinearGradient(0, h - barH, 0, h);
      grad.addColorStop(0, "#00f2ff");
      grad.addColorStop(1, "#bc13fe");
      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth + 1, h - barH, barWidth - 2, barH);
    }
    waveformRAF = requestAnimationFrame(drawWaveform);
  }

  /* ==================================================================
   * 3. PLAYER BAR UI
   * ================================================================== */
  function ensurePlayerBar() {
    if ($("#esa-player-bar")) return;
    document.body.classList.add("esa-has-player");
    const bar = document.createElement("div");
    bar.id = "esa-player-bar";
    bar.innerHTML = `
      <div class="esa-player-track">
        <img class="esa-player-cover" id="esa-player-cover" src="./profile.png" alt="">
        <div class="esa-player-meta">
          <div class="esa-player-title" id="esa-player-title">No track playing</div>
          <div class="esa-player-artist" id="esa-player-artist">—</div>
        </div>
      </div>
      <div class="esa-player-controls">
        <button class="esa-player-btn" id="esa-player-fav" title="Favorite">🤍</button>
        <button class="esa-player-btn" id="esa-player-prev" title="Previous">⏮</button>
        <button class="esa-player-btn esa-play-main" id="esa-player-toggle" title="Play/Pause">▶</button>
        <button class="esa-player-btn" id="esa-player-next" title="Next">⏭</button>
      </div>
      <div class="esa-player-center">
        <canvas id="esa-waveform-canvas" class="esa-waveform-canvas" width="600" height="30"></canvas>
        <div class="esa-player-seek-row">
          <span id="esa-player-time-current">0:00</span>
          <input type="range" id="esa-player-seek" min="0" max="100" value="0" step="0.1">
          <span id="esa-player-time-total">0:00</span>
        </div>
      </div>
      <div class="esa-player-extra">
        <button class="esa-player-btn" id="esa-player-lyrics" title="Lyrics">📜</button>
        <button class="esa-player-btn" id="esa-player-queue" title="Queue">📋</button>
        <button class="esa-player-btn" id="esa-player-download" title="Download">⬇️</button>
        <div class="esa-player-volume">
          <span>🔊</span>
          <input type="range" id="esa-player-volume" min="0" max="1" step="0.01" value="1">
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    const audioEl = getAudioEl();
    const seek = $("#esa-player-seek");
    const volume = $("#esa-player-volume");
    const toggleBtn = $("#esa-player-toggle");

    $("#esa-player-prev").addEventListener("click", playPrevious);
    $("#esa-player-next").addEventListener("click", playNextInQueue);
    $("#esa-player-lyrics").addEventListener("click", toggleLyricsDrawer);
    $("#esa-player-queue").addEventListener("click", toggleQueueDrawer);
    $("#esa-player-download").addEventListener("click", () => {
      if (!audioEl || !audioEl.src) return;
      const a = document.createElement("a");
      a.href = audioEl.src; a.download = (trackMeta(currentTrackId).title || "track") + ".m4a";
      document.body.appendChild(a); a.click(); a.remove();
      if (typeof window.logActivity === "function") window.logActivity("Downloaded track", trackMeta(currentTrackId).title);
      if (typeof window.downloadTrack === "function") window.downloadTrack(currentTrackId);
    });
    $("#esa-player-fav").addEventListener("click", () => {
      if (!currentTrackId || typeof window.toggleFavorite !== "function") return;
      window.toggleFavorite(currentTrackId);
      syncFavIcon();
    });

    if (audioEl) {
      toggleBtn.addEventListener("click", () => {
        ensureAudioGraph();
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        if (audioEl.paused) audioEl.play().catch(() => {}); else audioEl.pause();
      });
      audioEl.addEventListener("play", () => { toggleBtn.textContent = "⏸"; bar.classList.add("esa-player-visible"); });
      audioEl.addEventListener("pause", () => { toggleBtn.textContent = "▶"; });
      audioEl.addEventListener("timeupdate", () => {
        if (!audioEl.duration) return;
        seek.value = (audioEl.currentTime / audioEl.duration) * 100;
        $("#esa-player-time-current").textContent = formatTime(audioEl.currentTime);
      });
      audioEl.addEventListener("loadedmetadata", () => { $("#esa-player-time-total").textContent = formatTime(audioEl.duration); });
      audioEl.addEventListener("ended", () => playNextInQueue());
      seek.addEventListener("input", () => { if (audioEl.duration) audioEl.currentTime = (seek.value / 100) * audioEl.duration; });
      volume.addEventListener("input", () => { audioEl.volume = Number(volume.value); });
    }

    if (!waveformRAF) drawWaveform();
  }

  function formatTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function syncFavIcon() {
    const btn = $("#esa-player-fav");
    if (!btn || !currentTrackId) return;
    const active = typeof window.isFavorite === "function" && window.isFavorite(currentTrackId);
    btn.textContent = active ? "❤️" : "🤍";
  }

  function updatePlayerBarUI(meta) {
    ensurePlayerBar();
    $("#esa-player-bar").classList.add("esa-player-visible");
    $("#esa-player-cover").src = meta.cover || "./profile.png";
    $("#esa-player-title").textContent = meta.title;
    $("#esa-player-artist").textContent = meta.artist;
    syncFavIcon();
    renderQueueDrawer();
    renderLyricsDrawer();
  }

  /* ==================================================================
   * 4. QUEUE (playlist) + history stack + PLAYTRACK (extends original)
   * ================================================================== */
  function persistQueue() { saveJSON("esaQueue", currentQueue); saveJSON("esaCurrentTrack", currentTrackId); }

  function addToQueue(trackId) {
    currentQueue.push(trackId);
    persistQueue();
    renderQueueDrawer();
    toast(`Added "${trackMeta(trackId).title}" to queue`, "success");
  }

  function playNextInQueue() {
    if (currentTrackId) queueHistory.push(currentTrackId);
    const next = currentQueue.shift();
    persistQueue();
    renderQueueDrawer();
    if (next) window.playTrack(next);
    else toast("Queue is empty", "info");
  }

  function playPrevious() {
    const prev = queueHistory.pop();
    if (prev) window.playTrack(prev);
  }

  function renderQueueDrawer() {
    const body = $("#esa-queue-drawer .esa-drawer-body");
    if (!body) return;
    if (!currentQueue.length) { body.innerHTML = `<div class="esa-projects-empty">Queue is empty. Use "+ Queue" on any track.</div>`; return; }
    body.innerHTML = currentQueue.map((id, i) => `
      <div class="esa-queue-row" data-i="${i}">
        <span class="esa-q-title">${escapeHtml(trackMeta(id).title)}</span>
        <button data-play="${i}" title="Play now">▶</button>
        <button data-remove="${i}" title="Remove">✕</button>
      </div>
    `).join("");
    $all("[data-play]", body).forEach(b => b.addEventListener("click", () => {
      const i = Number(b.dataset.play);
      const id = currentQueue.splice(i, 1)[0];
      persistQueue(); renderQueueDrawer();
      window.playTrack(id);
    }));
    $all("[data-remove]", body).forEach(b => b.addEventListener("click", () => {
      currentQueue.splice(Number(b.dataset.remove), 1);
      persistQueue(); renderQueueDrawer();
    }));
  }

  function toggleQueueDrawer() {
    let drawer = $("#esa-queue-drawer");
    if (drawer) { drawer.remove(); return; }
    $("#esa-lyrics-drawer")?.remove();
    drawer = document.createElement("div");
    drawer.id = "esa-queue-drawer";
    drawer.className = "esa-drawer";
    drawer.innerHTML = `<div class="esa-drawer-header"><h4>Up Next</h4><button class="esa-drawer-close">×</button></div><div class="esa-drawer-body"></div>`;
    document.body.appendChild(drawer);
    drawer.querySelector(".esa-drawer-close").addEventListener("click", () => drawer.remove());
    renderQueueDrawer();
  }

  function renderLyricsDrawer() {
    const body = $("#esa-lyrics-drawer .esa-drawer-body");
    if (!body) return;
    const lyrics = LYRICS[currentTrackId];
    body.innerHTML = `<div class="esa-lyrics-text">${lyrics ? escapeHtml(lyrics).replace(/\[(.+?)\]/g, "<strong>[$1]</strong>") : "Lyrics aren't available for this track yet."}</div>`;
  }

  function toggleLyricsDrawer() {
    let drawer = $("#esa-lyrics-drawer");
    if (drawer) { drawer.remove(); return; }
    $("#esa-queue-drawer")?.remove();
    drawer = document.createElement("div");
    drawer.id = "esa-lyrics-drawer";
    drawer.className = "esa-drawer";
    drawer.innerHTML = `<div class="esa-drawer-header"><h4>Lyrics</h4><button class="esa-drawer-close">×</button></div><div class="esa-drawer-body"></div>`;
    document.body.appendChild(drawer);
    drawer.querySelector(".esa-drawer-close").addEventListener("click", () => drawer.remove());
    renderLyricsDrawer();
  }

  /* Redefine playTrack: preserves the exact file used for every one of
     the 5 original ids (ORIGINAL_FILE_MAP), and extends support to every
     id in the wider TRACKS catalog + logs history + drives the player bar. */
  window.playTrack = function (trackId) {
    const audioEl = getAudioEl();
    if (!audioEl) { toast("Music player not found!", "error"); return; }
    const meta = trackMeta(trackId);
    ensureAudioGraph();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    audioEl.src = meta.file;
    audioEl.play()
      .then(() => {
        currentTrackId = trackId;
        persistQueue();
        toast(`Playing: ${meta.title}`, "success");
        if (window.userStats) { window.userStats.hours++; if (typeof window.updateDashboard === "function") window.updateDashboard(); }
        if (typeof window.addToHistory === "function") window.addToHistory(trackId, meta.title);
        updatePlayerBarUI(meta);
        renderContinueListening();
      })
      .catch(error => {
        console.error("Error playing audio:", error);
        toast("Failed to play track.", "error");
      });
  };

  /* ==================================================================
   * 5. QUEUE BUTTONS on every track/discovery/library card
   * ================================================================== */
  function addQueueButtons() {
    $all("[onclick*=\"playTrack\"]").forEach(btn => {
      const m = btn.getAttribute("onclick").match(/playTrack\(['"]([^'"]+)['"]\)/);
      if (!m) return;
      const trackId = m[1];
      const card = btn.closest(".discovery-card, .library-item");
      if (!card || card.querySelector(".esa-queue-add-btn")) return;
      const qBtn = document.createElement("button");
      qBtn.className = "action-icon esa-queue-add-btn";
      qBtn.title = "Add to queue";
      qBtn.style.cssText = "background:none;border:none;cursor:pointer;font-size:0.95rem;";
      qBtn.textContent = "➕";
      qBtn.addEventListener("click", (e) => { e.stopPropagation(); addToQueue(trackId); });
      const actions = card.querySelector(".item-actions");
      const stats = card.querySelector(".card-stats");
      if (actions) actions.appendChild(qBtn);
      else if (stats) stats.parentElement.appendChild(qBtn);
      else card.querySelector(".card-info, .item-info")?.appendChild(qBtn);
    });
  }

  /* ==================================================================
   * 6. DASHBOARD: Continue Listening + Recently Played
   * ================================================================== */
  function ensureDashboardMusicSections() {
    const grid = $("#workspace-dashboard .dashboard-grid");
    if (!grid || $("#esa-continue-listening-card")) return;
    const continueCard = document.createElement("div");
    continueCard.id = "esa-continue-listening-card";
    continueCard.className = "dashboard-card";
    continueCard.innerHTML = `<h3>Continue Listening</h3><div id="esa-continue-body"></div>`;
    const recentCard = document.createElement("div");
    recentCard.id = "esa-recently-played-card";
    recentCard.className = "dashboard-card";
    recentCard.innerHTML = `<h3>Recently Played</h3><div class="esa-recent-row" id="esa-recent-body"></div>`;
    grid.appendChild(continueCard);
    grid.appendChild(recentCard);
  }

  function renderContinueListening() {
    ensureDashboardMusicSections();
    const history = (typeof musicHistory !== "undefined" ? musicHistory : []);
    const body = $("#esa-continue-body");
    const recentBody = $("#esa-recent-body");
    if (!body || !recentBody) return;
    if (!history.length) {
      body.innerHTML = `<p style="color:var(--text-secondary);font-size:0.85rem;">Nothing played yet — head to Discovery to start listening.</p>`;
      recentBody.innerHTML = "";
      return;
    }
    const last = history[0];
    const meta = trackMeta(last.trackId);
    body.innerHTML = `
      <div class="esa-continue-card">
        <img src="${meta.cover}" alt="">
        <div class="esa-continue-info"><h4>${escapeHtml(meta.title)}</h4><p>${escapeHtml(meta.artist)} · ${timeAgo(last.timestamp)}</p></div>
        <button class="esa-resume-btn" data-resume="${last.trackId}">Resume ▶</button>
      </div>`;
    $("[data-resume]", body)?.addEventListener("click", (e) => window.playTrack(e.target.dataset.resume));
    recentBody.innerHTML = history.slice(0, 8).map(h => {
      const m = trackMeta(h.trackId);
      return `<div class="esa-recent-item" data-play="${h.trackId}"><img src="${m.cover}" alt=""><div class="t">${escapeHtml(m.title)}</div><div class="a">${escapeHtml(m.artist)}</div></div>`;
    }).join("");
    $all("[data-play]", recentBody).forEach(el => el.addEventListener("click", () => window.playTrack(el.dataset.play)));
  }

  /* ==================================================================
   * 7. DISCOVERY EXPANSION: tabs for For You / Trending / Charts / Albums / Categories
   * ================================================================== */
  function trackCardHtml(t) {
    return `
      <div class="discovery-card" data-genre="${escapeHtml(t.genre)}">
        <div class="card-image">
          <img src="${t.cover}" alt="${escapeHtml(t.title)}" loading="lazy">
          <div class="play-overlay"><button class="play-btn" onclick="playTrack('${t.id}')">▶</button></div>
        </div>
        <div class="card-info"><h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.artist)} · ${escapeHtml(t.genre)}</p></div>
        <div class="card-stats"><span>${t.plays.toLocaleString()} plays</span></div>
      </div>`;
  }

  function ensureDiscoveryTabs() {
    const workspace = $("#workspace-discovery .discovery-workspace") || $("#workspace-discovery");
    if (!workspace || $("#esa-discovery-tabs")) return;
    // Capture the ORIGINAL "For You" grid before inserting any new
    // siblings — querying for ".discovery-grid" later would otherwise
    // also match grids we render dynamically inside #esa-discovery-panel.
    const originalGrid = workspace.querySelector(".discovery-grid");

    const tabs = document.createElement("div");
    tabs.id = "esa-discovery-tabs";
    tabs.className = "esa-discovery-tabs library-tabs";
    tabs.innerHTML = ["for-you", "trending", "charts", "albums", "categories"].map((t, i) => `
      <button class="tab-btn esa-discovery-tab${i === 0 ? " active" : ""}" data-tab="${t}">${t === "for-you" ? "For You" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
    `).join("");
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "esa-discovery-search";
    searchInput.id = "esa-discovery-search";
    searchInput.placeholder = "Search tracks, albums, genres…";

    const panel = document.createElement("div");
    panel.id = "esa-discovery-panel";

    workspace.insertBefore(panel, workspace.firstChild);
    workspace.insertBefore(searchInput, panel);
    workspace.insertBefore(tabs, searchInput);

    $all(".esa-discovery-tab", tabs).forEach(btn => {
      btn.addEventListener("click", () => {
        $all(".esa-discovery-tab", tabs).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const isForYou = btn.dataset.tab === "for-you";
        panel.style.display = isForYou ? "none" : "block";
        if (originalGrid) originalGrid.style.display = isForYou ? "" : "none";
        renderDiscoveryTab(btn.dataset.tab);
      });
    });
    searchInput.addEventListener("input", () => renderDiscoveryTab($(".esa-discovery-tab.active", tabs)?.dataset.tab || "for-you", searchInput.value));
    panel.style.display = "none";
  }

  function renderDiscoveryTab(tab, query) {
    const panel = $("#esa-discovery-panel");
    if (!panel) return;
    const q = (query || "").toLowerCase();
    const allTracks = Object.values(TRACKS);

    if (tab === "for-you") { panel.innerHTML = ""; return; }

    if (tab === "trending") {
      const sorted = allTracks.slice().sort((a, b) => b.plays - a.plays).filter(t => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
      panel.innerHTML = `<div class="discovery-grid">${sorted.map(trackCardHtml).join("")}</div>`;
    } else if (tab === "charts") {
      const sorted = allTracks.slice().sort((a, b) => b.plays - a.plays).filter(t => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
      panel.innerHTML = `<div class="esa-chart-list">${sorted.map((t, i) => `
        <div class="esa-chart-row">
          <span class="esa-chart-rank">#${i + 1}</span>
          <div class="esa-chart-info"><div class="t">${escapeHtml(t.title)}</div><div class="a">${escapeHtml(t.artist)}</div></div>
          <span class="esa-chart-plays">${t.plays.toLocaleString()} plays</span>
          <button class="action-icon" onclick="playTrack('${t.id}')" aria-label="Play">▶</button>
        </div>`).join("")}</div>`;
    } else if (tab === "albums") {
      const filtered = ALBUMS.filter(a => !q || a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
      panel.innerHTML = `<div class="esa-albums-grid">${filtered.map(a => `
        <div class="esa-album-card" data-album="${a.id}">
          <img class="esa-album-cover" src="${a.cover}" alt="">
          <h4>${escapeHtml(a.title)}</h4>
          <p>${escapeHtml(a.artist)} · ${a.trackIds.length} tracks</p>
        </div>`).join("")}</div>`;
      $all("[data-album]", panel).forEach(card => card.addEventListener("click", () => openAlbumDetail(card.dataset.album)));
    } else if (tab === "categories") {
      const filtered = CATEGORIES.filter(c => !q || c.name.toLowerCase().includes(q));
      panel.innerHTML = `<div class="esa-categories-grid">${filtered.map(c => `
        <div class="esa-category-card" data-genre="${escapeHtml(c.genre)}">
          <span class="esa-category-icon">${c.icon}</span><h4>${escapeHtml(c.name)}</h4>
        </div>`).join("")}</div>`;
      $all("[data-genre]", panel).forEach(card => card.addEventListener("click", () => {
        const genre = card.dataset.genre;
        $all(".esa-discovery-tab", $("#esa-discovery-tabs")).forEach(b => b.classList.remove("active"));
        $(`.esa-discovery-tab[data-tab="trending"]`, $("#esa-discovery-tabs"))?.classList.add("active");
        panel.innerHTML = `<div class="discovery-grid">${allTracks.filter(t => t.genre === genre).map(trackCardHtml).join("")}</div>`;
        addQueueButtons();
      }));
    }
    addQueueButtons();
    if (typeof window.EthioRefreshFavoriteButtons === "function") window.EthioRefreshFavoriteButtons();
  }

  function openAlbumDetail(albumId) {
    const album = ALBUMS.find(a => a.id === albumId);
    if (!album) return;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:520px;">
        <button class="modal-close">×</button>
        <h2>${escapeHtml(album.title)}</h2>
        <p style="color:var(--text-secondary);margin-bottom:16px;">${escapeHtml(album.artist)} · ${album.trackIds.length} tracks</p>
        <div class="library-list">${album.trackIds.map(id => {
          const t = trackMeta(id);
          return `<div class="library-item">
            <div class="item-info"><h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.artist)}</p></div>
            <div class="item-actions"><button class="action-icon" data-play="${id}">▶</button></div>
          </div>`;
        }).join("")}</div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
    $all("[data-play]", modal).forEach(b => b.addEventListener("click", () => window.playTrack(b.dataset.play)));
  }

  /* ==================================================================
   * 8. ARTISTS: real follow/unfollow persistence
   * ================================================================== */
  function wireArtistFollow() {
    let followed = loadJSON("followedArtists", []);
    $all(".artist-profile-card").forEach(card => {
      const name = card.querySelector("h3")?.textContent.trim();
      const btn = card.querySelector(".follow-btn");
      if (!name || !btn) return;
      const isFollowed = followed.includes(name);
      btn.textContent = isFollowed ? "Following" : "Follow";
      btn.classList.toggle("esa-active", isFollowed);
      btn.onclick = (e) => {
        e.preventDefault();
        followed = loadJSON("followedArtists", []);
        const idx = followed.indexOf(name);
        if (idx >= 0) {
          followed.splice(idx, 1); btn.textContent = "Follow"; btn.classList.remove("esa-active");
          toast(`Unfollowed ${name}`, "info");
        } else {
          followed.push(name); btn.textContent = "Following"; btn.classList.add("esa-active");
          toast(`Following ${name}!`, "success");
          if (typeof window.logActivity === "function") window.logActivity("Followed artist", name);
        }
        saveJSON("followedArtists", followed);
      };
    });
  }

  /* ==================================================================
   * INIT
   * ================================================================== */
  function initMusicPlatform() {
    ensurePlayerBar();
    ensureDashboardMusicSections();
    renderContinueListening();
    ensureDiscoveryTabs();
    addQueueButtons();
    wireArtistFollow();

    if (currentTrackId && getAudioEl()) {
      updatePlayerBarUI(trackMeta(currentTrackId));
      $("#esa-player-bar").classList.remove("esa-player-visible");
    }

    const _origSwitchWorkspace2 = window.switchWorkspace;
    window.switchWorkspace = function (workspace) {
      _origSwitchWorkspace2(workspace);
      if (workspace === "discovery") addQueueButtons();
      if (workspace === "artists") wireArtistFollow();
      if (workspace === "library") addQueueButtons();
    };
  }

  window.EthioMusicPlatform = { TRACKS, ALBUMS, CATEGORIES, LYRICS, addToQueue, playNextInQueue, trackMeta };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMusicPlatform);
  else initMusicPlatform();
})();
