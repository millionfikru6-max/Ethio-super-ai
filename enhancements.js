/* =====================================================================
   ETHIO-SUPER-AI — ENHANCEMENTS
   Completes: Notifications, Activity History, Favorites, Saved Projects,
   Settings, Search Everywhere, Command Palette, Keyboard Shortcuts,
   Conversation History (rename/delete/pin/search), Markdown, Code
   Highlighting, Copy Buttons, Streaming, Typing Animation, Voice Input,
   Voice Playback, Image Upload, File Upload.

   Rules followed:
   - Does not delete or rewrite script.js / features-complete.js.
   - Loads last, so where a name (saveProject, switchLibraryTab, etc.)
     already exists it is intentionally REDEFINED here to add the missing
     behaviour while preserving what already worked (still writes to the
     same localStorage keys / globals the rest of the app already uses).
   - Everything else is additive: new DOM nodes are injected into existing
     containers instead of replacing markup.
   ===================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Utilities
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function timeAgo(ts) {
    const d = new Date(ts);
    const diff = Math.max(0, Date.now() - d.getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  function toast(msg, type) {
    if (typeof window.showNotification === "function") window.showNotification(msg, type || "success");
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore quota errors */ }
  }

  /* Track catalog — mirrors the track ids already used across the app
     (discovery grid, library, recommendations, playTrack switch). */
  const TRACK_CATALOG = {
    "ethio-future-beat": { title: "Ethio Future Beat", artist: "Electronic Producer" },
    "addis-night-dreams": { title: "Addis Night Dreams", artist: "Ambient Artist" },
    "cyber-addis-2099": { title: "Cyber Addis 2099", artist: "Futuristic Electronic Fusion" },
    "rift-valley": { title: "Rift Valley Echoes", artist: "Ambient Ethiopian Soundscape" },
    "nile-flow": { title: "Digital Nile Flow", artist: "Electronic Fusion" }
  };
  function trackMeta(id) { return TRACK_CATALOG[id] || { title: id, artist: "Unknown Artist" }; }

  /* ==================================================================
   * 1. NOTIFICATION CENTER
   * (uses `notifications`, addNotification/getNotifications/clearNotifications
   *  already declared in features-complete.js — same script scope)
   * ================================================================== */
  function ensureNotifPanel() {
    let panel = $("#esa-notif-panel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "esa-notif-panel";
    panel.className = "esa-notif-panel esa-hidden";
    panel.innerHTML = `
      <div class="esa-notif-header">
        <h4>Notifications</h4>
        <button class="esa-notif-clear" id="esa-notif-clear">Clear all</button>
      </div>
      <div class="esa-notif-list" id="esa-notif-list"></div>
    `;
    document.body.appendChild(panel);
    $("#esa-notif-clear", panel).addEventListener("click", () => {
      if (typeof window.clearNotifications === "function") window.clearNotifications();
      renderNotifPanel();
      updateNotifBadge();
    });
    return panel;
  }

  function renderNotifPanel() {
    const list = $("#esa-notif-list");
    if (!list) return;
    const items = (typeof window.getNotifications === "function" ? window.getNotifications() : (window.notifications || []));
    if (!items.length) {
      list.innerHTML = `<div class="esa-notif-empty">You're all caught up 🎧</div>`;
      return;
    }
    list.innerHTML = items.map(n => `
      <div class="esa-notif-item">
        <span class="esa-icon">${n.type === "error" ? "⚠️" : n.type === "info" ? "ℹ️" : "🔔"}</span>
        <div>
          <div class="esa-notif-msg">${escapeHtml(n.message)}</div>
          <div class="esa-notif-time">${timeAgo(n.timestamp)}</div>
        </div>
      </div>
    `).join("");
  }

  function updateNotifBadge() {
    const btn = $(".notification-btn");
    if (!btn) return;
    btn.classList.add("esa-relbtn");
    let badge = $("#esa-notif-badge");
    const items = (typeof window.getNotifications === "function" ? window.getNotifications() : (window.notifications || []));
    if (!items.length) { if (badge) badge.remove(); return; }
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "esa-notif-badge";
      badge.className = "esa-badge";
      btn.appendChild(badge);
    }
    badge.textContent = items.length > 9 ? "9+" : String(items.length);
  }

  function wireNotificationBell() {
    const btn = $(".notification-btn");
    if (!btn) return;
    ensureNotifPanel();
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const panel = $("#esa-notif-panel");
      const willOpen = panel.classList.contains("esa-hidden");
      $all(".esa-notif-panel, .esa-palette-overlay").forEach(p => p.classList.add("esa-hidden"));
      closeSearchPanel();
      if (willOpen) { renderNotifPanel(); panel.classList.remove("esa-hidden"); }
      else panel.classList.add("esa-hidden");
    });
    document.addEventListener("click", (e) => {
      const panel = $("#esa-notif-panel");
      if (panel && !panel.classList.contains("esa-hidden") && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.add("esa-hidden");
      }
    });
    updateNotifBadge();
    // Refresh the badge whenever the app raises a toast (best-effort: poll lightly)
    setInterval(updateNotifBadge, 4000);
  }

  /* Wrap logActivity so every logged activity also becomes a notification
     and refreshes the badge — completes the "Notifications" feature by
     tying it to the activity system that already existed. */
  const _origLogActivity = window.logActivity;
  window.logActivity = function (action, details) {
    if (typeof _origLogActivity === "function") _origLogActivity(action, details);
    updateNotifBadge();
    renderDashboardActivity();
  };

  /* ==================================================================
   * 2. ACTIVITY HISTORY (full modal, backed by activityLog)
   * ================================================================== */
  function openActivityHistory() {
    const items = (typeof window.getActivityHistory === "function" ? window.getActivityHistory() : (window.activityLog || []));
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:600px;">
        <button class="modal-close" aria-label="Close">×</button>
        <h2>Activity History</h2>
        <div class="esa-activity-list">
          ${items.length ? items.map(a => `
            <div class="esa-activity-row">
              <span class="esa-icon">${iconForAction(a.action)}</span>
              <div>
                <div class="esa-title">${escapeHtml(a.action)}${a.details ? ": " + escapeHtml(String(a.details)) : ""}</div>
                <div class="esa-time">${timeAgo(a.timestamp)}</div>
              </div>
            </div>
          `).join("") : `<div class="esa-notif-empty">No activity yet — start creating!</div>`}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  }

  function iconForAction(action) {
    const a = (action || "").toLowerCase();
    if (a.includes("save")) return "💾";
    if (a.includes("delete")) return "🗑️";
    if (a.includes("download")) return "📥";
    if (a.includes("favorite")) return "❤️";
    if (a.includes("load")) return "📂";
    if (a.includes("play")) return "▶️";
    return "🔔";
  }

  function renderDashboardActivity() {
    const list = $("#activity-list");
    if (!list) return;
    const items = (typeof window.getActivityHistory === "function" ? window.getActivityHistory() : (window.activityLog || []));
    if (!items.length) return; // keep the existing sample markup if nothing logged yet
    list.innerHTML = items.slice(0, 6).map(a => `
      <div class="activity-item">
        <span class="activity-icon">${iconForAction(a.action)}</span>
        <div class="activity-details">
          <p class="activity-title">${escapeHtml(a.action)}${a.details ? ": " + escapeHtml(String(a.details)) : ""}</p>
          <p class="activity-time">${timeAgo(a.timestamp)}</p>
        </div>
      </div>
    `).join("");
  }

  function wireActivityHistory() {
    const viewAll = $(".activity-card .view-all");
    if (viewAll) {
      viewAll.addEventListener("click", (e) => { e.preventDefault(); openActivityHistory(); });
    }
    renderDashboardActivity();
  }

  /* ==================================================================
   * 3. FAVORITES (wired to real toggleFavorite/isFavorite + Library tab)
   * ================================================================== */
  function markFavoriteButtons() {
    $all("[onclick*=\"playTrack\"]").forEach(btn => {
      const m = btn.getAttribute("onclick").match(/playTrack\(['"]([^'"]+)['"]\)/);
      if (!m) return;
      const trackId = m[1];
      const card = btn.closest(".discovery-card, .library-item");
      if (!card) return;
      let heart = card.querySelector(".esa-fav-btn");
      if (!heart) {
        heart = document.createElement("button");
        heart.className = "action-icon esa-fav-btn";
        heart.setAttribute("aria-label", "Toggle favorite");
        heart.style.cssText = "background:none;border:none;cursor:pointer;font-size:1rem;";
        const stats = card.querySelector(".card-stats");
        const actions = card.querySelector(".item-actions");
        if (actions) actions.appendChild(heart);
        else if (stats) stats.parentElement.appendChild(heart);
        else card.querySelector(".card-info, .item-info")?.appendChild(heart);
      }
      const active = typeof window.isFavorite === "function" && window.isFavorite(trackId);
      heart.textContent = active ? "❤️" : "🤍";
      heart.classList.toggle("esa-fav-active", !!active);
      heart.onclick = (e) => {
        e.stopPropagation();
        window.toggleFavorite(trackId);
        const now = window.isFavorite(trackId);
        heart.textContent = now ? "❤️" : "🤍";
        heart.classList.toggle("esa-fav-active", now);
        if (typeof window.logActivity === "function") {
          window.logActivity(now ? "Added to favorites" : "Removed from favorites", trackMeta(trackId).title);
        }
        if ($(".tab-btn.active")?.textContent.toLowerCase().includes("favorite")) renderLibraryTab("favorites");
      };
    });
  }

  /* ==================================================================
   * 4. LIBRARY TABS — real content per tab (Favorites/Playlists/History/Downloads)
   * ================================================================== */
  function trackRowHtml(id, extra) {
    const meta = trackMeta(id);
    return `
      <div class="library-item">
        <div class="item-image"><img src="./profile.png" alt="Track" loading="lazy"></div>
        <div class="item-info"><h4>${escapeHtml(meta.title)}</h4><p>${escapeHtml(meta.artist)}${extra ? " · " + extra : ""}</p></div>
        <div class="item-actions">
          <button class="action-icon" onclick="playTrack('${id}')" aria-label="Play track">▶</button>
        </div>
      </div>`;
  }

  function renderLibraryTab(tab) {
    const container = $("#library-content");
    if (!container) return;
    // NOTE: favorites/playlists/musicHistory are declared with `let` at the
    // top level of features-complete.js. Classic (non-module) scripts share
    // one global scope, so they're reachable as bare identifiers here — but
    // they are NOT properties of `window`, hence the typeof guards below.
    const favList = (typeof favorites !== "undefined" ? favorites : []);
    const playlistsList = (typeof playlists !== "undefined" ? playlists : []);
    const historyList = (typeof musicHistory !== "undefined" ? musicHistory : []);

    if (tab === "favorites") {
      container.innerHTML = `<div class="library-list">${
        favList.length ? favList.map(id => trackRowHtml(id)).join("") : `<div class="esa-projects-empty">No favorites yet — tap ❤️ on any track.</div>`
      }</div>`;
    } else if (tab === "playlists") {
      container.innerHTML = `
        <div style="margin-bottom:14px;display:flex;gap:8px;">
          <input type="text" id="esa-new-playlist-name" class="settings-input" placeholder="New playlist name" style="flex:1;">
          <button class="save-settings-btn" id="esa-new-playlist-btn">Create</button>
        </div>
        <div class="library-list">${
          playlistsList.length ? playlistsList.map(p => `
            <div class="library-item">
              <div class="item-info"><h4>${escapeHtml(p.name)}</h4><p>${p.tracks.length} track${p.tracks.length === 1 ? "" : "s"}</p></div>
              <div class="item-actions">
                <button class="action-icon" onclick="deletePlaylist(${p.id});renderLibraryTabPublic('playlists')" aria-label="Delete playlist">🗑️</button>
              </div>
            </div>`).join("") : `<div class="esa-projects-empty">No playlists yet.</div>`
        }</div>`;
      $("#esa-new-playlist-btn")?.addEventListener("click", () => {
        const input = $("#esa-new-playlist-name");
        const name = input.value.trim();
        if (!name) { toast("Enter a playlist name", "error"); return; }
        window.createPlaylist(name);
        input.value = "";
        renderLibraryTab("playlists");
      });
    } else if (tab === "history") {
      container.innerHTML = `<div class="library-list">${
        historyList.length ? historyList.slice(0, 25).map(h => trackRowHtml(h.trackId, timeAgo(h.timestamp))).join("") : `<div class="esa-projects-empty">Nothing played yet.</div>`
      }</div>`;
    } else if (tab === "downloads") {
      const downloads = loadJSON("downloadedTracks", []);
      container.innerHTML = `<div class="library-list">${
        downloads.length ? downloads.map(d => trackRowHtml(d.trackId, timeAgo(d.timestamp))).join("") : `<div class="esa-projects-empty">No downloads yet.</div>`
      }</div>`;
    }
    markFavoriteButtons();
  }
  window.renderLibraryTabPublic = renderLibraryTab;

  const _origSwitchLibraryTab = window.switchLibraryTab;
  window.switchLibraryTab = function (tab) {
    if (typeof _origSwitchLibraryTab === "function") _origSwitchLibraryTab(tab);
    renderLibraryTab(tab);
  };

  /* also log + persist a "download" record so the Downloads tab has data */
  const _origDownloadTrack = window.downloadTrack;
  window.downloadTrack = function (trackId) {
    if (typeof _origDownloadTrack === "function") _origDownloadTrack(trackId);
    const downloads = loadJSON("downloadedTracks", []);
    downloads.unshift({ trackId, timestamp: new Date() });
    saveJSON("downloadedTracks", downloads.slice(0, 50));
  };

  /* ==================================================================
   * 5. SAVED PROJECTS PANEL (Music Studio)
   * ================================================================== */
  function ensureProjectsPanel() {
    let panel = $("#esa-projects-panel");
    if (panel) return panel;
    const editor = $(".studio-editor");
    if (!editor) return null;
    panel = document.createElement("div");
    panel.id = "esa-projects-panel";
    panel.className = "esa-projects-panel";
    panel.innerHTML = `<h3>Saved Projects</h3><div class="esa-projects-grid" id="esa-projects-grid"></div>`;
    editor.appendChild(panel);
    return panel;
  }

  function renderSavedProjects() {
    const panel = ensureProjectsPanel();
    if (!panel) return;
    const grid = $("#esa-projects-grid");
    const projects = (typeof savedProjects !== "undefined" ? savedProjects : []);
    if (!projects.length) {
      grid.innerHTML = `<div class="esa-projects-empty">No saved projects yet. Fill in the composer and hit "Save Project".</div>`;
      return;
    }
    grid.innerHTML = projects.slice().reverse().map(p => `
      <div class="esa-project-card">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="esa-project-meta">${escapeHtml(p.genre || "No genre")} · ${escapeHtml(p.mood || "No mood")}</div>
        <div class="esa-project-actions">
          <button data-action="load" data-id="${p.id}">Load</button>
          <button data-action="rename" data-id="${p.id}">Rename</button>
          <button data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join("");
    $all("[data-action]", grid).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const project = (typeof savedProjects !== "undefined" ? savedProjects : []).find(p => p.id === id);
        if (btn.dataset.action === "load") { window.loadProject(id); }
        else if (btn.dataset.action === "delete") {
          if (confirm(`Delete project "${project ? project.name : ""}"?`)) { window.deleteProject(id); renderSavedProjects(); }
        } else if (btn.dataset.action === "rename") {
          const name = prompt("Rename project:", project ? project.name : "");
          if (name && project) {
            project.name = name;
            saveJSON("savedProjects", savedProjects);
            renderSavedProjects();
            toast("Project renamed", "success");
          }
        }
      });
    });
  }

  /* Redefine saveProject globally so it (a) actually saves like
     features-complete.js intended, and (b) refreshes the visible list —
     script.js's earlier stub version is superseded here on purpose. */
  window.saveProject = function () {
    const nameEl = $("#project-name");
    const genreEl = $("#studio-genre");
    const moodEl = $("#studio-mood");
    const promptEl = $("#music-prompt");
    const projectName = (nameEl && nameEl.value) || "Untitled Project";
    const project = {
      id: Date.now(),
      name: projectName,
      genre: genreEl ? genreEl.value : "",
      mood: moodEl ? moodEl.value : "",
      prompt: promptEl ? promptEl.value : "",
      created: new Date(),
      modified: new Date()
    };
    savedProjects.push(project);
    saveJSON("savedProjects", savedProjects);
    if (typeof window.logActivity === "function") window.logActivity("Project Saved", projectName);
    toast(`Project "${projectName}" saved!`, "success");
    renderSavedProjects();
  };

  window.loadProject = function (projectId) {
    const project = savedProjects.find(p => p.id === projectId);
    if (!project) return;
    const nameEl = $("#project-name"), genreEl = $("#studio-genre"), moodEl = $("#studio-mood"), promptEl = $("#music-prompt");
    if (nameEl) nameEl.value = project.name;
    if (genreEl) genreEl.value = project.genre;
    if (moodEl) moodEl.value = project.mood;
    if (promptEl) promptEl.value = project.prompt;
    if (typeof window.logActivity === "function") window.logActivity("Project Loaded", project.name);
    toast(`Loaded "${project.name}"`, "success");
  };

  window.deleteProject = function (projectId) {
    savedProjects = savedProjects.filter(p => p.id !== projectId);
    saveJSON("savedProjects", savedProjects);
    toast("Project deleted", "success");
  };

  /* ==================================================================
   * 6. SETTINGS — small missing pieces: persistence for the two toggles
   *    already present in the markup, plus a shortcuts entry point.
   * ================================================================== */
  function wireSettingsExtras() {
    const settingsSection = $("#workspace-settings .settings-workspace");
    if (!settingsSection) return;

    const checkboxes = $all("#workspace-settings input[type=checkbox]");
    const savedPrefs = loadJSON("notificationPrefs", { email: true, newMusic: true });
    if (checkboxes[0]) checkboxes[0].checked = savedPrefs.email;
    if (checkboxes[1]) checkboxes[1].checked = savedPrefs.newMusic;
    checkboxes.forEach((cb, i) => {
      cb.addEventListener("change", () => {
        const prefs = loadJSON("notificationPrefs", { email: true, newMusic: true });
        if (i === 0) prefs.email = cb.checked; else if (i === 1) prefs.newMusic = cb.checked;
        saveJSON("notificationPrefs", prefs);
        toast("Preference updated", "success");
      });
    });

    if (!$("#esa-shortcuts-settings-link")) {
      const section = document.createElement("div");
      section.className = "settings-section";
      section.innerHTML = `
        <h3>Keyboard & Search</h3>
        <div class="settings-group">
          <button id="esa-shortcuts-settings-link" class="save-settings-btn" type="button">View Keyboard Shortcuts</button>
        </div>
      `;
      settingsSection.appendChild(section);
      $("#esa-shortcuts-settings-link").addEventListener("click", openShortcutsModal);
    }
  }

  /* ==================================================================
   * 7. KEYBOARD SHORTCUTS MODAL + GLOBAL KEY HANDLING
   * ================================================================== */
  const SHORTCUTS = [
    { keys: "Ctrl/Cmd + K", desc: "Open Command Palette" },
    { keys: "Ctrl/Cmd + /", desc: "Show keyboard shortcuts (this window)" },
    { keys: "/", desc: "Focus global search (when not typing)" },
    { keys: "Esc", desc: "Close palette, search, notifications or any modal" },
    { keys: "Enter", desc: "Send chat message (when chat input is focused)" }
  ];

  function openShortcutsModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:480px;">
        <button class="modal-close" aria-label="Close">×</button>
        <h2>Keyboard Shortcuts</h2>
        <div class="esa-shortcuts-grid">
          ${SHORTCUTS.map(s => `<div class="esa-shortcut-row"><span>${escapeHtml(s.desc)}</span><span class="esa-kbd">${escapeHtml(s.keys)}</span></div>`).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  }

  function closeAllOverlays() {
    $all(".esa-notif-panel").forEach(p => p.classList.add("esa-hidden"));
    closeSearchPanel();
    closePalette();
    $all(".modal").forEach(m => { if (m.id !== "auth-modal") m.remove(); });
  }

  function isTypingTarget(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }

  function wireGlobalKeys() {
    document.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        openPalette();
        return;
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        openShortcutsModal();
        return;
      }
      if (e.key === "Escape") {
        closeAllOverlays();
        return;
      }
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        const search = $("#global-search");
        if (search) search.focus();
      }
    });
  }

  /* ==================================================================
   * 8. GLOBAL SEARCH INDEX + "Search Everywhere" dropdown + Command Palette
   * ================================================================== */
  function buildSearchIndex() {
    const items = [];
    const workspaces = {
      dashboard: "Dashboard", chat: "AI Chat", "music-studio": "Music Studio",
      discovery: "Discovery", library: "My Library", artists: "Artists",
      settings: "Settings", profile: "Profile"
    };
    Object.keys(workspaces).forEach(w => items.push({
      group: "Go to", label: workspaces[w], icon: "🧭", action: () => window.switchWorkspace(w)
    }));
    Object.keys(TRACK_CATALOG).forEach(id => items.push({
      group: "Tracks", label: TRACK_CATALOG[id].title, sub: TRACK_CATALOG[id].artist, icon: "🎵",
      action: () => { window.switchWorkspace("discovery"); window.playTrack(id); }
    }));
    (typeof savedProjects !== "undefined" ? savedProjects : []).forEach(p => items.push({
      group: "Saved Projects", label: p.name, icon: "💾",
      action: () => { window.switchWorkspace("music-studio"); window.loadProject(p.id); }
    }));
    (window.esaConversations || []).forEach(c => items.push({
      group: "Conversations", label: c.title, icon: "💬",
      action: () => { window.switchWorkspace("chat"); window.EthioChat.switchTo(c.id); }
    }));
    items.push(
      { group: "Actions", label: "Start New Chat", icon: "➕", action: () => { window.switchWorkspace("chat"); window.EthioChat.newConversation(); } },
      { group: "Actions", label: "Generate Music", icon: "✨", action: () => window.switchWorkspace("music-studio") },
      { group: "Actions", label: "View Activity History", icon: "🕘", action: openActivityHistory },
      { group: "Actions", label: "Keyboard Shortcuts", icon: "⌨️", action: openShortcutsModal },
      { group: "Actions", label: "Toggle Sidebar", icon: "☰", action: () => window.toggleSidebar() },
      { group: "Actions", label: "Log Out", icon: "🚪", action: () => window.logoutUser() }
    );
    return items;
  }

  function closeSearchPanel() { const p = $("#esa-search-panel"); if (p) p.remove(); }

  function wireGlobalSearch() {
    const input = $("#global-search");
    if (!input) return;
    const box = input.closest(".search-box");
    if (box) box.style.position = "relative";
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      closeSearchPanel();
      if (!q) return;
      const results = buildSearchIndex().filter(it => it.label.toLowerCase().includes(q));
      const panel = document.createElement("div");
      panel.id = "esa-search-panel";
      panel.className = "esa-search-panel";
      if (!results.length) {
        panel.innerHTML = `<div class="esa-search-empty">No matches for "${escapeHtml(input.value)}"</div>`;
      } else {
        const groups = {};
        results.slice(0, 30).forEach(r => { (groups[r.group] = groups[r.group] || []).push(r); });
        panel.innerHTML = Object.keys(groups).map(g => `
          <div class="esa-search-group-label">${escapeHtml(g)}</div>
          ${groups[g].map((r, i) => `<div class="esa-search-result" data-g="${escapeHtml(g)}" data-i="${i}"><span>${r.icon}</span><span>${escapeHtml(r.label)}</span></div>`).join("")}
        `).join("");
        $all(".esa-search-result", panel).forEach(el => {
          const r = groups[el.dataset.g][Number(el.dataset.i)];
          el.addEventListener("click", () => { r.action(); closeSearchPanel(); input.value = ""; });
        });
      }
      (box || input.parentElement).appendChild(panel);
    });
    document.addEventListener("click", (e) => {
      if (e.target !== input && !e.target.closest("#esa-search-panel")) closeSearchPanel();
    });
  }

  /* ---- Command Palette ---- */
  let paletteState = { items: [], active: 0 };

  function ensurePaletteEl() {
    let overlay = $("#esa-palette-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "esa-palette-overlay";
    overlay.className = "esa-overlay esa-hidden";
    overlay.innerHTML = `
      <div class="esa-palette">
        <input type="text" class="esa-palette-input" id="esa-palette-input" placeholder="Type a command or search…" autocomplete="off">
        <div class="esa-palette-list" id="esa-palette-list"></div>
        <div class="esa-palette-hint"><span><span class="esa-kbd">↑↓</span> navigate</span><span><span class="esa-kbd">Enter</span> select</span><span><span class="esa-kbd">Esc</span> close</span></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closePalette(); });
    const input = $("#esa-palette-input", overlay);
    input.addEventListener("input", () => renderPaletteList(input.value));
    input.addEventListener("keydown", (e) => {
      const list = $("#esa-palette-list");
      const rows = $all(".esa-palette-item", list);
      if (e.key === "ArrowDown") { e.preventDefault(); paletteState.active = Math.min(paletteState.active + 1, rows.length - 1); paintActive(rows); }
      else if (e.key === "ArrowUp") { e.preventDefault(); paletteState.active = Math.max(paletteState.active - 1, 0); paintActive(rows); }
      else if (e.key === "Enter") { e.preventDefault(); rows[paletteState.active]?.click(); }
    });
    return overlay;
  }

  function paintActive(rows) {
    rows.forEach((r, i) => r.classList.toggle("active", i === paletteState.active));
    rows[paletteState.active]?.scrollIntoView({ block: "nearest" });
  }

  function renderPaletteList(query) {
    const q = (query || "").trim().toLowerCase();
    const all = buildSearchIndex();
    const filtered = q ? all.filter(it => it.label.toLowerCase().includes(q) || it.group.toLowerCase().includes(q)) : all.slice(0, 20);
    paletteState.items = filtered;
    paletteState.active = 0;
    const list = $("#esa-palette-list");
    if (!filtered.length) { list.innerHTML = `<div class="esa-palette-empty">No matching commands</div>`; return; }
    list.innerHTML = filtered.slice(0, 40).map((it, i) => `
      <div class="esa-palette-item${i === 0 ? " active" : ""}" data-i="${i}">
        <span class="esa-icon">${it.icon || "•"}</span>
        <span class="esa-main">${escapeHtml(it.label)}</span>
        <span class="esa-sub">${escapeHtml(it.group)}${it.sub ? " · " + escapeHtml(it.sub) : ""}</span>
      </div>
    `).join("");
    $all(".esa-palette-item", list).forEach(el => {
      el.addEventListener("click", () => {
        const item = paletteState.items[Number(el.dataset.i)];
        if (item) item.action();
        closePalette();
      });
    });
  }

  function openPalette() {
    closeAllOverlays();
    const overlay = ensurePaletteEl();
    overlay.classList.remove("esa-hidden");
    const input = $("#esa-palette-input");
    input.value = "";
    renderPaletteList("");
    setTimeout(() => input.focus(), 10);
  }
  function closePalette() { $("#esa-palette-overlay")?.classList.add("esa-hidden"); }

  /* ==================================================================
   * 9. MARKDOWN RENDERING + LIGHTWEIGHT SYNTAX HIGHLIGHTING
   * ================================================================== */
  const LANG_KEYWORDS = {
    js: ["const","let","var","function","return","if","else","for","while","class","import","export","default","new","this","async","await","try","catch","typeof","null","undefined","true","false"],
    python: ["def","return","if","elif","else","for","while","class","import","from","as","try","except","with","lambda","None","True","False","print","self"],
    html: ["div","span","html","head","body","script","style","class","id"],
    css: ["color","background","margin","padding","display","flex","grid","border","width","height"]
  };

  function highlightCode(code, lang) {
    // Single-pass tokenizer over the RAW code. Sequential regex .replace()
    // calls on already-escaped/tagged HTML would corrupt earlier matches
    // (e.g. the "class" keyword matching inside a just-inserted
    // class="tok-comment" attribute) — so every token is found in one pass
    // over the original string and only then individually HTML-escaped.
    const language = (lang || "").toLowerCase();
    const kws = LANG_KEYWORDS[language] || LANG_KEYWORDS.js;
    const kwPattern = kws.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const master = new RegExp(
      "(//[^\\n]*)" +                    // 1: line comment
      "|(#[^\\n]*)" +                    // 2: python-style comment
      "|(\"[^\"]*\"|'[^']*'|`[^`]*`)" +  // 3: string literal
      "|\\b(\\d+(?:\\.\\d+)?)\\b" +      // 4: number
      "|\\b(" + kwPattern + ")\\b" +     // 5: keyword
      "|\\b([a-zA-Z_]\\w*)(?=\\()",      // 6: function call
      "g"
    );
    let result = "";
    let lastIndex = 0;
    let m;
    while ((m = master.exec(code)) !== null) {
      result += escapeHtml(code.slice(lastIndex, m.index));
      if (m[1]) result += `<span class="tok-comment">${escapeHtml(m[1])}</span>`;
      else if (m[2]) result += language === "python" ? `<span class="tok-comment">${escapeHtml(m[2])}</span>` : escapeHtml(m[2]);
      else if (m[3]) result += `<span class="tok-string">${escapeHtml(m[3])}</span>`;
      else if (m[4]) result += `<span class="tok-number">${escapeHtml(m[4])}</span>`;
      else if (m[5]) result += `<span class="tok-keyword">${escapeHtml(m[5])}</span>`;
      else if (m[6]) result += `<span class="tok-func">${escapeHtml(m[6])}</span>`;
      lastIndex = master.lastIndex;
    }
    result += escapeHtml(code.slice(lastIndex));
    return result;
  }

  function renderMarkdown(raw) {
    if (!raw) return "";
    const codeBlocks = [];
    // Extract fenced code blocks from the RAW text first — highlightCode()
    // does its own HTML-escaping internally, so escaping the whole message
    // up front here would double-escape code content (e.g. "&lt;" becoming
    // "&amp;lt;").
    let text = raw.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const idx = codeBlocks.length;
      const highlighted = highlightCode(code.replace(/\n$/, ""), lang);
      codeBlocks.push(`<pre><button class="esa-code-copy" data-code-idx="${idx}">Copy</button><code class="lang-${escapeHtml(lang || "text")}">${highlighted}</code></pre>`);
      return `%%CODEBLOCK${idx}%%`;
    });
    // Now escape everything that ISN'T a code block.
    text = escapeHtml(text);
    // headers
    text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>")
               .replace(/^## (.*)$/gm, "<h2>$1</h2>")
               .replace(/^# (.*)$/gm, "<h1>$1</h1>");
    // blockquote
    text = text.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");
    // bold / italic / inline code
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    // links
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // unordered / ordered lists (simple line-based grouping)
    text = text.replace(/(?:^|\n)((?:- .*(?:\n|$))+)/g, (m, block) => {
      const items = block.trim().split("\n").map(l => `<li>${l.replace(/^- /, "")}</li>`).join("");
      return `\n<ul>${items}</ul>`;
    });
    text = text.replace(/(?:^|\n)((?:\d+\. .*(?:\n|$))+)/g, (m, block) => {
      const items = block.trim().split("\n").map(l => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
      return `\n<ol>${items}</ol>`;
    });
    // paragraphs / line breaks
    text = text.split(/\n{2,}/).map(chunk => {
      if (/^<h[1-3]>|^<ul>|^<ol>|^<blockquote>|^%%CODEBLOCK/.test(chunk.trim())) return chunk;
      return `<p>${chunk.replace(/\n/g, "<br>")}</p>`;
    }).join("");
    // restore code blocks
    text = text.replace(/%%CODEBLOCK(\d+)%%/g, (m, idx) => codeBlocks[Number(idx)]);
    return text;
  }

  function wireCodeCopyButtons(root) {
    $all(".esa-code-copy", root).forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.nextElementSibling?.textContent || "";
        navigator.clipboard.writeText(code).then(() => {
          const old = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = old; }, 1500);
        });
      });
    });
  }

  /* ==================================================================
   * 10. CONVERSATION MANAGEMENT (multi-chat: rename/delete/pin/search)
   *     + STREAMING + TYPING ANIMATION + VOICE + ATTACHMENTS
   * ================================================================== */
  const AI_RESPONSES = [
    "That's a great question! I can help you with music creation, discovery, and more.",
    "I'm here to assist you with your music journey. What would you like to explore?",
    "Interesting! Let me help you find the perfect music for that mood.",
    "I can recommend some amazing tracks based on your preferences.",
    "That sounds exciting! Would you like me to generate some music for you?\n\nHere's a quick idea:\n```js\nconst mood = \"uplifting\";\nconst genre = \"ethio-jazz\";\ngenerateTrack(mood, genre);\n```",
    "Here are a few things I can do:\n- Suggest tracks by mood\n- Explain Ethiopian music traditions\n- Draft lyrics ideas\n- Help plan your next project"
  ];

  let esaConversations = loadJSON("esaConversations", []);
  let esaActiveId = loadJSON("esaActiveConversationId", null);
  window.esaConversations = esaConversations;

  function persistConversations() {
    saveJSON("esaConversations", esaConversations);
    saveJSON("esaActiveConversationId", esaActiveId);
  }

  function migrateOldHistoryIfNeeded() {
    if (esaConversations.length) return;
    const legacy = loadJSON("chatHistory", []);
    const initialGreeting = { sender: "ai", message: "Hello! I'm your AI assistant. I can help you discover music, create tracks, learn about Ethiopian culture, or just chat. What would you like to explore today?", timestamp: new Date() };
    const conv = {
      id: uid(),
      title: "Welcome Chat",
      pinned: false,
      createdAt: new Date().toISOString(),
      messages: legacy.length ? legacy : [initialGreeting]
    };
    esaConversations.push(conv);
    esaActiveId = conv.id;
    persistConversations();
  }

  function getActiveConversation() {
    return esaConversations.find(c => c.id === esaActiveId) || esaConversations[0];
  }

  function renderChatMessagesForActive() {
    const container = $("#chat-messages");
    if (!container) return;
    const conv = getActiveConversation();
    if (!conv) return;
    container.innerHTML = "";
    conv.messages.forEach(m => appendMessageToDOM(m, false));
    container.scrollTop = container.scrollHeight;
  }

  function appendMessageToDOM(m, animate) {
    const container = $("#chat-messages");
    if (!container) return null;
    const div = document.createElement("div");
    div.className = `message ${m.sender === "user" ? "user" : "ai"}-message`;
    const avatar = m.sender === "user" ? "👤" : "🤖";
    const bodyHtml = m.sender === "ai" ? renderMarkdown(m.message) : `<p>${escapeHtml(m.message).replace(/\n/g, "<br>")}</p>`;
    const attachmentsHtml = renderAttachmentsHtml(m.attachments);
    const actions = m.sender === "ai" ? `
      <div class="message-actions">
        <button class="action-btn" onclick="copyMessage(this)" title="Copy">📋</button>
        <button class="action-btn" onclick="regenerateResponse(this)" title="Regenerate">🔄</button>
        <button class="action-btn esa-speak-btn" title="Play voice">🔊</button>
      </div>` : "";
    div.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">${bodyHtml}${attachmentsHtml}${actions}</div>
    `;
    container.appendChild(div);
    wireCodeCopyButtons(div);
    const speakBtn = div.querySelector(".esa-speak-btn");
    if (speakBtn) speakBtn.addEventListener("click", () => speakText(m.message, speakBtn));
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function renderAttachmentsHtml(attachments) {
    if (!attachments || !attachments.length) return "";
    return `<div class="esa-msg-attachments">${attachments.map(a => {
      if (a.type === "image") return `<img src="${a.data}" alt="${escapeHtml(a.name)}">`;
      return `<span class="esa-msg-file-chip">📄 ${escapeHtml(a.name)}</span>`;
    }).join("")}</div>`;
  }

  function speakText(text, btn) {
    if (!("speechSynthesis" in window)) { toast("Voice playback isn't supported in this browser", "error"); return; }
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); if (btn) btn.textContent = "🔊"; return; }
    const plain = text.replace(/```[\s\S]*?```/g, " code block ").replace(/[#*_`>]/g, "");
    const utter = new SpeechSynthesisUtterance(plain);
    if (btn) { btn.textContent = "⏸"; utter.onend = () => { btn.textContent = "🔊"; }; }
    window.speechSynthesis.speak(utter);
  }

  function renderConversationList(filter) {
    const list = $("#conversation-list");
    if (!list) return;
    const q = (filter || "").toLowerCase();
    const sorted = esaConversations.slice().sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt)));
    const filtered = q ? sorted.filter(c => c.title.toLowerCase().includes(q)) : sorted;
    list.innerHTML = filtered.map(c => `
      <div class="conversation-item ${c.id === esaActiveId ? "active" : ""} ${c.pinned ? "pinned" : ""}" data-id="${c.id}">
        <span class="conv-title">${escapeHtml(c.title)}</span>
        <span class="esa-conv-actions">
          <button data-act="pin" title="Pin">📌</button>
          <button data-act="rename" title="Rename">✏️</button>
          <button data-act="delete" title="Delete">🗑️</button>
        </span>
      </div>
    `).join("") || `<div class="esa-projects-empty">No conversations found.</div>`;

    $all(".conversation-item", list).forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("[data-act]")) return;
        switchConversation(row.dataset.id);
      });
    });
    $all("[data-act]", list).forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.closest(".conversation-item").dataset.id;
        const act = btn.dataset.act;
        if (act === "pin") togglePin(id);
        else if (act === "rename") renameConversation(id);
        else if (act === "delete") deleteConversation(id);
      });
    });
  }

  function switchConversation(id) {
    esaActiveId = id;
    persistConversations();
    renderConversationList($("#esa-chat-search-input")?.value || "");
    renderChatMessagesForActive();
  }

  function newConversation() {
    const conv = { id: uid(), title: "New Chat", pinned: false, createdAt: new Date().toISOString(), messages: [] };
    esaConversations.unshift(conv);
    esaActiveId = conv.id;
    persistConversations();
    renderConversationList();
    renderChatMessagesForActive();
  }

  function togglePin(id) {
    const c = esaConversations.find(c => c.id === id);
    if (c) { c.pinned = !c.pinned; persistConversations(); renderConversationList($("#esa-chat-search-input")?.value || ""); }
  }

  function renameConversation(id) {
    const c = esaConversations.find(c => c.id === id);
    if (!c) return;
    const name = prompt("Rename conversation:", c.title);
    if (name && name.trim()) {
      c.title = name.trim();
      persistConversations();
      renderConversationList($("#esa-chat-search-input")?.value || "");
    }
  }

  function deleteConversation(id) {
    if (!confirm("Delete this conversation?")) return;
    esaConversations = esaConversations.filter(c => c.id !== id);
    window.esaConversations = esaConversations;
    if (esaActiveId === id) esaActiveId = esaConversations[0]?.id || null;
    if (!esaConversations.length) newConversation(); else persistConversations();
    renderConversationList();
    renderChatMessagesForActive();
  }

  function ensureChatToolbar() {
    const sidebar = $(".chat-sidebar");
    if (!sidebar || $("#esa-chat-tools")) return;
    const heading = sidebar.querySelector("h3");
    const tools = document.createElement("div");
    tools.id = "esa-chat-tools";
    tools.className = "esa-chat-tools";
    tools.innerHTML = `<button class="esa-new-chat-btn" id="esa-new-chat-btn">+ New Chat</button>`;
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "esa-chat-search-input";
    searchInput.className = "esa-chat-search";
    searchInput.placeholder = "Search chats…";
    heading.insertAdjacentElement("afterend", searchInput);
    heading.insertAdjacentElement("afterend", tools);
    $("#esa-new-chat-btn").addEventListener("click", newConversation);
    searchInput.addEventListener("input", () => renderConversationList(searchInput.value));
  }

  /* ---- Attachments (image + file upload) ---- */
  let pendingAttachments = [];

  function ensureChatInputExtras() {
    const area = $(".chat-input-area");
    if (!area || $("#esa-attach-img-input")) return;
    const imgInput = document.createElement("input");
    imgInput.type = "file"; imgInput.accept = "image/*"; imgInput.id = "esa-attach-img-input"; imgInput.className = "esa-hidden";
    const fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.id = "esa-attach-file-input"; fileInput.className = "esa-hidden";

    const imgBtn = document.createElement("button");
    imgBtn.type = "button"; imgBtn.className = "esa-chat-extra-btn"; imgBtn.title = "Upload image"; imgBtn.textContent = "🖼️";
    const fileBtn = document.createElement("button");
    fileBtn.type = "button"; fileBtn.className = "esa-chat-extra-btn"; fileBtn.title = "Upload file"; fileBtn.textContent = "📎";
    const micBtn = document.createElement("button");
    micBtn.type = "button"; micBtn.className = "esa-chat-extra-btn"; micBtn.title = "Voice input"; micBtn.textContent = "🎤";

    const chatInputEl = $("#chat-input");
    area.insertBefore(fileBtn, chatInputEl);
    area.insertBefore(imgBtn, chatInputEl);
    area.insertBefore(micBtn, chatInputEl);
    area.appendChild(imgInput);
    area.appendChild(fileInput);

    imgBtn.addEventListener("click", () => imgInput.click());
    fileBtn.addEventListener("click", () => fileInput.click());
    imgInput.addEventListener("change", () => handleFileSelect(imgInput.files, "image"));
    fileInput.addEventListener("change", () => handleFileSelect(fileInput.files, "file"));
    micBtn.addEventListener("click", () => toggleVoiceInput(micBtn));

    const previewRow = document.createElement("div");
    previewRow.id = "esa-attach-preview";
    previewRow.className = "esa-attach-preview";
    area.parentElement.insertBefore(previewRow, area);
  }

  function handleFileSelect(files, type) {
    Array.from(files).forEach(file => {
      if (type === "image") {
        const reader = new FileReader();
        reader.onload = () => {
          pendingAttachments.push({ type, name: file.name, data: reader.result });
          renderAttachPreview();
        };
        reader.readAsDataURL(file);
      } else {
        pendingAttachments.push({ type, name: file.name, data: null });
        renderAttachPreview();
      }
    });
  }

  function renderAttachPreview() {
    const row = $("#esa-attach-preview");
    if (!row) return;
    row.innerHTML = pendingAttachments.map((a, i) => `
      <span class="esa-attach-chip" data-i="${i}">
        ${a.type === "image" ? `<img src="${a.data}" alt="">` : "📄"} ${escapeHtml(a.name)}
        <button data-remove="${i}">×</button>
      </span>
    `).join("");
    $all("[data-remove]", row).forEach(btn => btn.addEventListener("click", () => {
      pendingAttachments.splice(Number(btn.dataset.remove), 1);
      renderAttachPreview();
    }));
  }

  /* ---- Voice input (Web Speech API) ---- */
  let recognition = null;
  let recognizing = false;

  function toggleVoiceInput(btn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Voice input isn't supported in this browser", "error"); return; }
    if (recognizing) { recognition.stop(); return; }
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => { recognizing = true; btn.classList.add("esa-recording"); };
    recognition.onerror = () => { recognizing = false; btn.classList.remove("esa-recording"); };
    recognition.onend = () => { recognizing = false; btn.classList.remove("esa-recording"); };
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      const input = $("#chat-input");
      if (input) input.value = transcript;
    };
    recognition.start();
  }

  /* ---- Streaming + typing animation ---- */
  function streamAssistantReply(fullText, onDone) {
    const container = $("#chat-messages");
    const div = document.createElement("div");
    div.className = "message ai-message";
    div.innerHTML = `<div class="message-avatar">🤖</div><div class="message-content"><span class="esa-stream-text"></span><span class="stream-cursor"></span></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    const textEl = div.querySelector(".esa-stream-text");
    let i = 0;
    const step = () => {
      const chunkSize = 2 + Math.floor(Math.random() * 3);
      i += chunkSize;
      textEl.textContent = fullText.slice(0, i);
      container.scrollTop = container.scrollHeight;
      if (i < fullText.length) setTimeout(step, 18 + Math.random() * 30);
      else finalize();
    };
    const finalize = () => {
      const contentDiv = div.querySelector(".message-content");
      contentDiv.innerHTML = `${renderMarkdown(fullText)}
        <div class="message-actions">
          <button class="action-btn" onclick="copyMessage(this)" title="Copy">📋</button>
          <button class="action-btn" onclick="regenerateResponse(this)" title="Regenerate">🔄</button>
          <button class="action-btn esa-speak-btn" title="Play voice">🔊</button>
        </div>`;
      wireCodeCopyButtons(contentDiv);
      const speakBtn = contentDiv.querySelector(".esa-speak-btn");
      if (speakBtn) speakBtn.addEventListener("click", () => speakText(fullText, speakBtn));
      if (onDone) onDone();
    };
    setTimeout(step, 120);
  }

  /* ---- Override sendChatMessage: attachments + per-conversation persistence + streaming ---- */
  window.sendChatMessage = function () {
    const chatInput = $("#chat-input");
    const message = chatInput.value.trim();
    if (!message && pendingAttachments.length === 0) return;

    let conv = getActiveConversation();
    if (!conv) { newConversation(); conv = getActiveConversation(); }
    if (conv.title === "New Chat" && message) conv.title = message.slice(0, 40);

    const userMsg = { sender: "user", message: message || "(sent an attachment)", attachments: pendingAttachments.slice(), timestamp: new Date().toISOString() };
    conv.messages.push(userMsg);
    appendMessageToDOM(userMsg);
    chatInput.value = "";
    pendingAttachments = [];
    renderAttachPreview();
    renderConversationList($("#esa-chat-search-input")?.value || "");
    persistConversations();

    if (typeof window.showThinkingAnimation === "function") window.showThinkingAnimation();

    setTimeout(() => {
      if (typeof window.hideThinkingAnimation === "function") window.hideThinkingAnimation();
      const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      streamAssistantReply(reply, () => {
        conv.messages.push({ sender: "ai", message: reply, timestamp: new Date().toISOString() });
        persistConversations();
        if (typeof window.logActivity === "function") window.logActivity("Chatted with AI", conv.title);
      });
    }, 700);
  };

  function initChatSystem() {
    migrateOldHistoryIfNeeded();
    window.esaConversations = esaConversations;
    ensureChatToolbar();
    ensureChatInputExtras();
    renderConversationList();
    renderChatMessagesForActive();
  }

  window.EthioChat = {
    newConversation, switchTo: switchConversation, rename: renameConversation,
    remove: deleteConversation, togglePin
  };

  /* ==================================================================
   * 11. INITIALISATION
   * ================================================================== */
  function init() {
    wireNotificationBell();
    wireActivityHistory();
    wireGlobalKeys();
    wireGlobalSearch();
    wireSettingsExtras();
    markFavoriteButtons();
    renderSavedProjects();
    initChatSystem();

    // Keep favourite hearts / saved-project list / library tab in sync
    // whenever the user switches workspace (existing function, wrapped).
    const _origSwitchWorkspace = window.switchWorkspace;
    window.switchWorkspace = function (workspace) {
      _origSwitchWorkspace(workspace);
      if (workspace === "discovery" || workspace === "library") markFavoriteButtons();
      if (workspace === "library") renderLibraryTab("favorites");
      if (workspace === "music-studio") renderSavedProjects();
      closeAllOverlays();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
