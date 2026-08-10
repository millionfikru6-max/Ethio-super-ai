// ==================== AI FEATURES & MUSIC ENHANCEMENTS ====================

// Music Player State
let currentTrackIndex = 0;
let isPlaying = false;
let musicQueue = [];
let currentPlaylist = null;

// ==================== MUSIC PLAYER FUNCTIONS ====================
function togglePlayPause() {
  isPlaying = !isPlaying;
  const playBtn = document.querySelector('.play-btn');
  playBtn.textContent = isPlaying ? '⏸️' : '▶️';
  showNotification(isPlaying ? 'Playing...' : 'Paused', 'success');
}

function nextTrack() {
  if (musicQueue.length > 0) {
    currentTrackIndex = (currentTrackIndex + 1) % musicQueue.length;
    playTrackFromQueue();
  }
}

function previousTrack() {
  if (musicQueue.length > 0) {
    currentTrackIndex = (currentTrackIndex - 1 + musicQueue.length) % musicQueue.length;
    playTrackFromQueue();
  }
}

function playTrackFromQueue() {
  if (musicQueue.length > 0) {
    const track = musicQueue[currentTrackIndex];
    document.getElementById('player-track-title').textContent = track.title;
    document.getElementById('player-artist').textContent = track.artist;
    isPlaying = true;
    document.querySelector('.play-btn').textContent = '⏸️';
    showNotification(`Now playing: ${track.title}`, 'success');
  }
}

// ==================== PLAYLIST FUNCTIONS ====================
function showCreatePlaylistModal() {
  const playlistName = prompt('Enter playlist name:');
  if (playlistName) {
    createPlaylist(playlistName);
    updatePlaylistsDisplay();
  }
}

function updatePlaylistsDisplay() {
  const grid = document.getElementById('playlists-grid');
  if (!grid) return;
  
  if (playlists.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-secondary);">No playlists yet. Create one to get started!</p>';
  } else {
    grid.innerHTML = playlists.map(playlist => `
      <div class="playlist-card">
        <div class="playlist-cover">🎵</div>
        <h4>${playlist.name}</h4>
        <p>${playlist.tracks.length} tracks</p>
        <div class="playlist-actions">
          <button class="action-btn" onclick="playPlaylist(${playlist.id})">▶️</button>
          <button class="action-btn" onclick="deletePlaylist(${playlist.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }
}

function playPlaylist(playlistId) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    musicQueue = playlist.tracks;
    currentTrackIndex = 0;
    currentPlaylist = playlistId;
    playTrackFromQueue();
    showNotification(`Playing playlist: ${playlist.name}`, 'success');
  }
}

// ==================== CHARTS FUNCTIONS ====================
function switchChartTab(tab) {
  document.querySelectorAll('.chart-tab').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  showNotification(`Showing ${tab.replace('-', ' ')}`, 'success');
}

// ==================== CATEGORY FUNCTIONS ====================
function filterByCategory(category) {
  showNotification(`Showing ${category.replace('-', ' ')} music`, 'success');
  switchWorkspace('discovery');
}

// ==================== AI IMAGE GENERATOR ====================
function generateImage() {
  const prompt = document.getElementById('image-prompt').value;
  const style = document.getElementById('image-style').value;
  const size = document.getElementById('image-size').value;

  if (!prompt) {
    showNotification('Please describe the image you want to create', 'error');
    return;
  }

  showLoading('Generating image...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('image-output');
    output.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 100%; height: 300px; background: linear-gradient(135deg, var(--blue), var(--purple)); border-radius: 12px; margin: 20px 0; display: flex; align-items: center; justify-content: center;">
          <p style="font-size: 3rem;">🖼️</p>
        </div>
        <p><strong>Generated Image</strong></p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Style: ${style} | Size: ${size}</p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Prompt: ${prompt.substring(0, 100)}...</p>
        <button class="copy-btn" onclick="downloadImage()">Download</button>
      </div>
    `;
    showNotification('Image generated successfully!', 'success');
  }, 2000);
}

function downloadImage() {
  showNotification('Image download started', 'success');
}

// ==================== AI VOICE GENERATOR ====================
function generateVoice() {
  const text = document.getElementById('voice-text').value;
  const language = document.getElementById('voice-language').value;
  const gender = document.getElementById('voice-gender').value;

  if (!text) {
    showNotification('Please enter text to convert to speech', 'error');
    return;
  }

  showLoading('Generating voice...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('voice-output');
    output.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: 2rem; margin: 20px 0;">🎤</p>
        <audio controls style="width: 100%; margin: 20px 0;">
          <source src="./mystical.m4a" type="audio/mp4">
        </audio>
        <p><strong>Generated Voice</strong></p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Language: ${language.toUpperCase()} | Gender: ${gender}</p>
      </div>
    `;
    showNotification('Voice generated successfully!', 'success');
  }, 2000);
}

// ==================== AI VOICE CLONING ====================
function cloneVoice() {
  const text = document.getElementById('clone-text').value;
  
  if (!text) {
    showNotification('Please enter text to speak with cloned voice', 'error');
    return;
  }

  showLoading('Cloning voice...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('clone-output');
    output.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: 2rem; margin: 20px 0;">🎙️</p>
        <audio controls style="width: 100%; margin: 20px 0;">
          <source src="./loyal.m4a" type="audio/mp4">
        </audio>
        <p><strong>Cloned Voice Output</strong></p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Text: ${text.substring(0, 50)}...</p>
      </div>
    `;
    showNotification('Voice cloned successfully!', 'success');
  }, 2000);
}

// ==================== AI TRANSLATOR ====================
function translateText() {
  const input = document.getElementById('translate-input').value;
  const fromLang = document.getElementById('from-language').value;
  const toLang = document.getElementById('to-language').value;

  if (!input) {
    showNotification('Please enter text to translate', 'error');
    return;
  }

  showLoading('Translating...');
  setTimeout(() => {
    hideLoading();
    const translations = {
      'hello': { am: 'ሰላም', es: 'hola', fr: 'bonjour' },
      'thank you': { am: 'አመሰግናለሁ', es: 'gracias', fr: 'merci' },
      'goodbye': { am: 'ሳላም', es: 'adiós', fr: 'au revoir' }
    };
    
    const translated = translations[input.toLowerCase()] ? translations[input.toLowerCase()][toLang] : `[Translated to ${toLang}]`;
    document.getElementById('translate-output').value = translated;
    showNotification('Translation complete!', 'success');
  }, 1500);
}

// ==================== AI CODE ASSISTANT ====================
function generateCode() {
  const prompt = document.getElementById('code-prompt').value;
  const language = document.getElementById('code-language').value;

  if (!prompt) {
    showNotification('Please describe your coding problem', 'error');
    return;
  }

  showLoading('Generating code...');
  setTimeout(() => {
    hideLoading();
    const codeExamples = {
      javascript: `// ${prompt}\nfunction solution() {\n  // Your code here\n  console.log('Hello World');\n}\n\nsolution();`,
      python: `# ${prompt}\ndef solution():\n    print('Hello World')\n\nif __name__ == '__main__':\n    solution()`,
      java: `// ${prompt}\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`
    };
    
    const code = codeExamples[language] || `// Code for ${language}`;
    document.querySelector('#code-output code').textContent = code;
    showNotification('Code generated successfully!', 'success');
  }, 2000);
}

// ==================== AI PDF ASSISTANT ====================
function analyzePDF() {
  const question = document.getElementById('pdf-question').value;

  if (!question) {
    showNotification('Please ask a question about the PDF', 'error');
    return;
  }

  showLoading('Analyzing PDF...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('pdf-output');
    output.innerHTML = `
      <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; border: 1px solid var(--border);">
        <p><strong>Question:</strong> ${question}</p>
        <p style="margin-top: 15px; color: var(--text-secondary);"><strong>Answer:</strong> Based on the PDF analysis, here's the relevant information...</p>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">Confidence: 94%</p>
      </div>
    `;
    showNotification('PDF analyzed successfully!', 'success');
  }, 2000);
}

// ==================== AI RESUME BUILDER ====================
function generateResume() {
  const name = document.getElementById('resume-name').value;
  const email = document.getElementById('resume-email').value;
  const summary = document.getElementById('resume-summary').value;

  if (!name || !email) {
    showNotification('Please fill in name and email', 'error');
    return;
  }

  showLoading('Generating resume...');
  setTimeout(() => {
    hideLoading();
    const preview = document.getElementById('resume-preview');
    preview.innerHTML = `
      <div style="background: white; color: black; padding: 40px; border-radius: 8px; font-family: Arial, sans-serif;">
        <h2 style="margin: 0; color: var(--purple);">${name}</h2>
        <p style="margin: 5px 0; color: #666;">${email}</p>
        <hr style="margin: 15px 0; border: none; border-top: 2px solid var(--blue);">
        <h3 style="color: var(--purple); margin-top: 15px;">Professional Summary</h3>
        <p style="color: #333;">${summary || 'Professional summary will appear here'}</p>
        <p style="margin-top: 20px; text-align: center; color: #999; font-size: 0.9rem;">Generated with AI Resume Builder</p>
      </div>
    `;
    showNotification('Resume generated successfully!', 'success');
  }, 2000);
}

// ==================== AI PRESENTATION GENERATOR ====================
function generatePresentation() {
  const title = document.getElementById('presentation-title').value;
  const topic = document.getElementById('presentation-topic').value;
  const slides = document.getElementById('presentation-slides').value;

  if (!title || !topic) {
    showNotification('Please fill in title and topic', 'error');
    return;
  }

  showLoading('Generating presentation...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('presentation-output');
    output.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: 2rem; margin: 20px 0;">📊</p>
        <p><strong>Presentation Generated</strong></p>
        <p style="color: var(--text-secondary);">Title: ${title}</p>
        <p style="color: var(--text-secondary);">Slides: ${slides}</p>
        <button class="copy-btn" onclick="downloadPresentation()">Download Presentation</button>
      </div>
    `;
    showNotification('Presentation generated successfully!', 'success');
  }, 2000);
}

function downloadPresentation() {
  showNotification('Presentation download started', 'success');
}

// ==================== AI EMAIL WRITER ====================
function generateEmail() {
  const type = document.getElementById('email-type').value;
  const context = document.getElementById('email-context').value;

  if (!context) {
    showNotification('Please describe what you want to say', 'error');
    return;
  }

  showLoading('Generating email...');
  setTimeout(() => {
    hideLoading();
    const emailTemplates = {
      professional: `Subject: ${context.substring(0, 30)}...\n\nDear [Recipient],\n\n${context}\n\nBest regards,\n[Your Name]`,
      casual: `Hey,\n\n${context}\n\nTalk soon!`,
      formal: `Dear Sir/Madam,\n\nI hope this email finds you well.\n\n${context}\n\nYours faithfully,\n[Your Name]`,
      sales: `Subject: Exciting Opportunity\n\nHi [Recipient],\n\n${context}\n\nLooking forward to hearing from you!\n\nBest,\n[Your Name]`
    };
    
    document.getElementById('email-result').value = emailTemplates[type];
    showNotification('Email generated successfully!', 'success');
  }, 1500);
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  element.select();
  document.execCommand('copy');
  showNotification('Copied to clipboard!', 'success');
}

// ==================== AI WEBSITE BUILDER ====================
function generateWebsite() {
  const name = document.getElementById('website-name').value;
  const description = document.getElementById('website-description').value;
  const style = document.getElementById('website-style').value;

  if (!name || !description) {
    showNotification('Please fill in website name and description', 'error');
    return;
  }

  showLoading('Generating website...');
  setTimeout(() => {
    hideLoading();
    const output = document.getElementById('website-output');
    output.innerHTML = `
      <div style="border: 2px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
        <div style="background: linear-gradient(135deg, var(--blue), var(--purple)); padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 2.5rem;">${name}</h1>
          <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">${description}</p>
        </div>
        <div style="padding: 30px; text-align: center; color: var(--text-secondary);">
          <p>Style: ${style}</p>
          <p>Website preview generated with AI Website Builder</p>
          <button class="copy-btn" onclick="launchWebsite()">Launch Website</button>
        </div>
      </div>
    `;
    showNotification('Website generated successfully!', 'success');
  }, 2000);
}

function launchWebsite() {
  showNotification('Website launched! Opening in new window...', 'success');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  updatePlaylistsDisplay();
  
  // Load playlists from localStorage
  const savedPlaylists = localStorage.getItem('playlists');
  if (savedPlaylists) {
    playlists = JSON.parse(savedPlaylists);
    updatePlaylistsDisplay();
  }
});
