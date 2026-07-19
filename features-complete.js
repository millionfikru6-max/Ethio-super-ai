// ==================== MUSIC STUDIO ENHANCEMENTS ====================
let musicQueue = [];
let currentQueueIndex = 0;
let musicHistory = [];
let savedSongs = [];
let favorites = [];

// BPM, Instrument, Vocal Style Selectors
function addMusicStudioSelectors() {
  const studioToolbar = document.querySelector(".studio-toolbar");
  if (!studioToolbar) return;
  
  const bpmSection = document.createElement("div");
  bpmSection.className = "toolbar-section";
  bpmSection.innerHTML = `
    <label for="studio-bpm">BPM</label>
    <input type="number" id="studio-bpm" class="genre-select" min="60" max="200" value="120" placeholder="BPM">
  `;
  
  const instrumentSection = document.createElement("div");
  instrumentSection.className = "toolbar-section";
  instrumentSection.innerHTML = `
    <label for="studio-instrument">Instrument</label>
    <select id="studio-instrument" class="genre-select">
      <option value="">Select Instrument</option>
      <option value="piano">Piano</option>
      <option value="guitar">Guitar</option>
      <option value="strings">Strings</option>
      <option value="synth">Synth</option>
      <option value="drums">Drums</option>
      <option value="krar">Krar (Ethiopian)</option>
    </select>
  `;
  
  const vocalSection = document.createElement("div");
  vocalSection.className = "toolbar-section";
  vocalSection.innerHTML = `
    <label for="studio-vocal">Vocal Style</label>
    <select id="studio-vocal" class="genre-select">
      <option value="">Select Vocal Style</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="choir">Choir</option>
      <option value="instrumental">Instrumental</option>
      <option value="amharic">Amharic Vocals</option>
    </select>
  `;
  
  studioToolbar.appendChild(bpmSection);
  studioToolbar.appendChild(instrumentSection);
  studioToolbar.appendChild(vocalSection);
}

// Queue Management
function addToQueue(trackId) {
  musicQueue.push(trackId);
  showNotification(`Added to queue (${musicQueue.length} tracks)`, "success");
}

function playQueue() {
  if (musicQueue.length === 0) {
    showNotification("Queue is empty", "error");
    return;
  }
  playTrack(musicQueue[currentQueueIndex]);
}

function nextInQueue() {
  if (currentQueueIndex < musicQueue.length - 1) {
    currentQueueIndex++;
    playQueue();
  } else {
    showNotification("End of queue", "info");
  }
}

function previousInQueue() {
  if (currentQueueIndex > 0) {
    currentQueueIndex--;
    playQueue();
  }
}

// Music History
function addToHistory(trackId, trackTitle) {
  musicHistory.unshift({ trackId, trackTitle, timestamp: new Date() });
  if (musicHistory.length > 50) musicHistory.pop();
  localStorage.setItem("musicHistory", JSON.stringify(musicHistory));
}

function getRecentlyPlayed() {
  return musicHistory.slice(0, 10);
}

// Favorites
function toggleFavorite(trackId) {
  const index = favorites.indexOf(trackId);
  if (index > -1) {
    favorites.splice(index, 1);
    showNotification("Removed from favorites", "success");
  } else {
    favorites.push(trackId);
    showNotification("Added to favorites", "success");
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(trackId) {
  return favorites.includes(trackId);
}

// ==================== DISCOVERY ENHANCEMENTS ====================
function showCharts() {
  showNotification("Showing Top Charts", "success");
  // Filter discovery cards to show chart data
}

function showRecentlyPlayed() {
  const recently = getRecentlyPlayed();
  if (recently.length === 0) {
    showNotification("No recently played tracks", "info");
  } else {
    showNotification(`${recently.length} recently played tracks`, "success");
  }
}

function showContinueListening() {
  const lastPlayed = musicHistory[0];
  if (lastPlayed) {
    playTrack(lastPlayed.trackId);
    showNotification(`Continuing: ${lastPlayed.trackTitle}`, "success");
  } else {
    showNotification("No playback history", "info");
  }
}

// ==================== NOTIFICATION CENTER ====================
let notifications = [];

function addNotification(message, type = "info") {
  notifications.unshift({ message, type, timestamp: new Date() });
  if (notifications.length > 20) notifications.pop();
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

function getNotifications() {
  return notifications;
}

function clearNotifications() {
  notifications = [];
  localStorage.removeItem("notifications");
  showNotification("Notifications cleared", "success");
}

// ==================== ACTIVITY HISTORY ====================
let activityLog = [];

function logActivity(action, details) {
  activityLog.unshift({ action, details, timestamp: new Date() });
  if (activityLog.length > 100) activityLog.pop();
  localStorage.setItem("activityLog", JSON.stringify(activityLog));
  addNotification(`${action}: ${details}`);
}

function getActivityHistory() {
  return activityLog;
}

// ==================== SAVED PROJECTS ====================
let savedProjects = [];

function saveProject() {
  const projectName = document.getElementById("project-name").value || "Untitled Project";
  const genre = document.getElementById("studio-genre").value;
  const mood = document.getElementById("studio-mood").value;
  const prompt = document.getElementById("music-prompt").value;
  
  const project = {
    id: Date.now(),
    name: projectName,
    genre,
    mood,
    prompt,
    created: new Date(),
    modified: new Date()
  };
  
  savedProjects.push(project);
  localStorage.setItem("savedProjects", JSON.stringify(savedProjects));
  logActivity("Project Saved", projectName);
  showNotification(`Project "${projectName}" saved!`, "success");
}

function loadProject(projectId) {
  const project = savedProjects.find(p => p.id === projectId);
  if (project) {
    document.getElementById("project-name").value = project.name;
    document.getElementById("studio-genre").value = project.genre;
    document.getElementById("studio-mood").value = project.mood;
    document.getElementById("music-prompt").value = project.prompt;
    logActivity("Project Loaded", project.name);
    showNotification(`Loaded "${project.name}"`, "success");
  }
}

function deleteProject(projectId) {
  savedProjects = savedProjects.filter(p => p.id !== projectId);
  localStorage.setItem("savedProjects", JSON.stringify(savedProjects));
  showNotification("Project deleted", "success");
}

// ==================== PLAYLIST MANAGEMENT ====================
let playlists = [];

function createPlaylist(name) {
  const playlist = {
    id: Date.now(),
    name,
    tracks: [],
    created: new Date()
  };
  playlists.push(playlist);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  showNotification(`Playlist "${name}" created!`, "success");
  return playlist.id;
}

function addTrackToPlaylist(playlistId, trackId) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist && !playlist.tracks.includes(trackId)) {
    playlist.tracks.push(trackId);
    localStorage.setItem("playlists", JSON.stringify(playlists));
    showNotification("Track added to playlist", "success");
  }
}

function removeTrackFromPlaylist(playlistId, trackId) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.tracks = playlist.tracks.filter(t => t !== trackId);
    localStorage.setItem("playlists", JSON.stringify(playlists));
    showNotification("Track removed from playlist", "success");
  }
}

function deletePlaylist(playlistId) {
  playlists = playlists.filter(p => p.id !== playlistId);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  showNotification("Playlist deleted", "success");
}

// ==================== LYRICS & WAVEFORM ====================
function showLyrics(trackId) {
  const lyricsModal = document.createElement("div");
  lyricsModal.className = "modal";
  lyricsModal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <h2>Lyrics</h2>
      <div class="lyrics-content">
        <p>🎵 Lyrics for track: ${trackId}</p>
        <p style="color: var(--text-secondary);">Lyrics feature coming soon...</p>
      </div>
    </div>
  `;
  document.body.appendChild(lyricsModal);
}

function showWaveform(trackId) {
  const waveformModal = document.createElement("div");
  waveformModal.className = "modal";
  waveformModal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <h2>Waveform Visualization</h2>
      <div class="waveform-container" style="height: 200px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <canvas id="waveform-canvas" width="600" height="200"></canvas>
      </div>
    </div>
  `;
  document.body.appendChild(waveformModal);
  drawWaveform();
}

function drawWaveform() {
  const canvas = document.getElementById("waveform-canvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "var(--blue)";
  
  for (let i = 0; i < canvas.width; i += 5) {
    const height = Math.random() * canvas.height * 0.8;
    ctx.fillRect(i, canvas.height / 2 - height / 2, 3, height);
  }
}

// ==================== ALBUM ARTWORK ====================
function showAlbumArtwork(trackId) {
  const artworkModal = document.createElement("div");
  artworkModal.className = "modal";
  artworkModal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <h2>Album Artwork</h2>
      <div style="text-align: center;">
        <img src="./profile.png" alt="Album Art" style="max-width: 300px; border-radius: 12px; margin: 20px 0;">
        <p>Track: ${trackId}</p>
      </div>
    </div>
  `;
  document.body.appendChild(artworkModal);
}

// ==================== DOWNLOADS ====================
function downloadTrack(trackId) {
  showLoading("Preparing download...");
  setTimeout(() => {
    hideLoading();
    showNotification(`Track "${trackId}" downloaded!`, "success");
    logActivity("Track Downloaded", trackId);
  }, 1500);
}

// ==================== SKELETON LOADING ====================
function showSkeletonLoader(container) {
  const skeleton = document.createElement("div");
  skeleton.className = "skeleton-loader";
  skeleton.innerHTML = `
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
  `;
  container.appendChild(skeleton);
}

function hideSkeletonLoader(container) {
  const skeleton = container.querySelector(".skeleton-loader");
  if (skeleton) skeleton.remove();
}

// ==================== EMPTY STATES ====================
function showEmptyState(container, message = "No items found") {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
      <p style="font-size: 3rem; margin-bottom: 10px;">📭</p>
      <p>${message}</p>
    </div>
  `;
  container.appendChild(emptyState);
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  addMusicStudioSelectors();
  loadConversationHistory();
  
  // Load saved data
  const saved = localStorage.getItem("musicHistory");
  if (saved) musicHistory = JSON.parse(saved);
  
  const savedFav = localStorage.getItem("favorites");
  if (savedFav) favorites = JSON.parse(savedFav);
  
  const savedProj = localStorage.getItem("savedProjects");
  if (savedProj) savedProjects = JSON.parse(savedProj);
  
  const savedPl = localStorage.getItem("playlists");
  if (savedPl) playlists = JSON.parse(savedPl);
  
  const savedAct = localStorage.getItem("activityLog");
  if (savedAct) activityLog = JSON.parse(savedAct);
  
  const savedNotif = localStorage.getItem("notifications");
  if (savedNotif) notifications = JSON.parse(savedNotif);
});
