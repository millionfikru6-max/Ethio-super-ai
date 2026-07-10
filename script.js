const canvas = document.getElementById("particle-background");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3;
    this.speedX = Math.random() - 0.5;
    this.speedY = Math.random() - 0.5;
    this.color = Math.random() > 0.5 ? "#00f2ff" : "#bc13fe";
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;

    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

const cursor = document.getElementById("custom-cursor");

document.addEventListener("mousemove", (e) => {
  if (cursor) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }
});

// Add loading spinner CSS and chat message styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--blue);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--blue);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
}

.recommendation-result {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid var(--blue);
  border-radius: 8px;
  background: rgba(0, 242, 255, 0.1);
  color: #fff;
  text-align: left;
  display: none; /* Hidden by default */
}

.recommendation-result p {
  margin-bottom: 10px;
}

.recommendation-result button {
  background: var(--purple);
  color: #fff;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.recommendation-result button:hover {
  background: var(--blue);
}

.error-message {
  color: #ff4d4d;
  font-weight: bold;
}

.success-message {
  color: #4dff4d;
  font-weight: bold;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 80%;
}

.chat-message.user {
  background-color: rgba(0, 242, 255, 0.2);
  margin-left: auto;
  text-align: right;
}

.chat-message.ai {
  background-color: rgba(188, 19, 254, 0.2);
  margin-right: auto;
  text-align: left;
}
`;
document.head.appendChild(styleSheet);

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
});

revealItems.forEach((item) => {
  observer.observe(item);
});

const numbers = document.querySelectorAll(".metric-num");

numbers.forEach((num) => {
  const updateCount = () => {
    const target = +num.getAttribute("data-val");
    const current = +num.innerText;

    const increment = target / 100;

    if (current < target) {
      num.innerText = Math.ceil(current + increment);
      setTimeout(updateCount, 20);
    } else {
      num.innerText = target;
    }
  };

  updateCount();
});

const mobileMenu = document.getElementById("mobile-menu");
if (mobileMenu) {
  mobileMenu.addEventListener("click", function() {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      navLinks.classList.toggle("active");
    }
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });

    // Close mobile menu after clicking a link
    const navLinks = document.querySelector(".nav-links");
    if (navLinks && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
    }
  });
});

// Contact Form Submission with enhanced feedback
const contactForm = document.getElementById("ethio-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitButton = contactForm.querySelector(".submit-glow");
    submitButton.innerText = "Sending...";
    submitButton.disabled = true;

    setTimeout(() => {
      // Simulate success or failure
      const success = Math.random() > 0.5; // 50% chance of success
      if (success) {
        submitButton.innerText = "Transmission Sent! ✅";
        contactForm.reset();
        // Display a success message for a short period
        const successMessage = document.createElement("p");
        successMessage.classList.add("success-message");
        successMessage.textContent = "Your message has been sent successfully!";
        submitButton.parentNode.insertBefore(successMessage, submitButton.nextSibling);
        setTimeout(() => { 
          submitButton.innerText = "Send Transmission"; 
          submitButton.disabled = false; 
          successMessage.remove();
        }, 3000);
      } else {
        submitButton.innerText = "Transmission Failed ❌";
        // Display an error message for a short period
        const errorMessage = document.createElement("p");
        errorMessage.classList.add("error-message");
        errorMessage.textContent = "Failed to send message. Please try again.";
        submitButton.parentNode.insertBefore(errorMessage, submitButton.nextSibling);
        setTimeout(() => { 
          submitButton.innerText = "Send Transmission"; 
          submitButton.disabled = false; 
          errorMessage.remove();
        }, 3000);
      }
    }, 2000);
  });
}

// AI Chat functionality
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");

function appendMessage(sender, message, type = "user") {
  if (!chatWindow) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", type);
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendChatMessage() {
  if (!chatInput || !chatWindow) return;
  const message = chatInput.value.trim();
  if (message === "") return;

  appendMessage("You", message, "user");
  chatInput.value = "";

  // Simulate AI response with a loading state
  const aiResponseElement = document.createElement("div");
  aiResponseElement.classList.add("chat-message", "ai");
  aiResponseElement.innerHTML = `<strong>AI:</strong> <span class="loading-spinner-small"></span> Thinking...`;
  chatWindow.appendChild(aiResponseElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  setTimeout(() => {
    let response = "";
    if (message.toLowerCase().includes("music")) {
      response = "I can help you discover new Ethio-AI music! What mood are you in, or what genre are you looking for?";
    } else if (message.toLowerCase().includes("ethiopian culture")) {
      response = "Ethiopian culture is rich and diverse! Would you like to know about traditional music, history, or art?";
    } else if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      response = "Hello there! How can I assist you today in your journey through Ethio-AI?";
    } else {
      response = "That's an interesting query! I'm still learning, but I can help with music discovery and Ethiopian culture. Try asking me about those!";
    }
    aiResponseElement.innerHTML = `<strong>AI:</strong> ${response}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1500);
}

// Add event listener for Enter key in chat input
if (chatInput) {
  chatInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      sendChatMessage();
    }
  });
}

// AI Music Generator functionality
function generateAIMusic() {
  const promptInput = document.getElementById("music-prompt-input");
  const genreSelect = document.getElementById("music-genre-select");
  const resultElement = document.getElementById("music-generator-result");

  if (!promptInput || !resultElement) return;

  const prompt = promptInput.value.trim();
  const genre = genreSelect ? genreSelect.value : "";

  if (prompt === "") {
    resultElement.innerHTML = "<p class=\"error-message\">❌ Please describe your music idea.</p>";
    resultElement.style.display = "block";
    return;
  }

  showLoading("music-generator-result");

  setTimeout(() => {
    let generatedTrackName = "";
    if (genre === "Ethio-Jazz") {
      generatedTrackName = "AI Ethio-Jazz Fusion: Echoes of Gondar";
    } else if (genre === "Cyber-Traditional") {
      generatedTrackName = "Cyber-Traditional Anthem: Digital Fikir";
    } else if (genre === "Ambient") {
      generatedTrackName = "Ambient Ethiopian Soundscape: Rift Valley Dreams";
    } else if (genre === "Trap") {
      generatedTrackName = "Ethio-Trap Beat: Addis Flow";
    } else {
      generatedTrackName = "AI Generated Track: " + prompt.substring(0, 20) + "...";
    }

    resultElement.innerHTML = `
      <p class="success-message">✅ Music Generated!</p>
      <p><strong>Track Name:</strong> ${generatedTrackName}</p>
      <p><strong>Prompt:</strong> ${prompt}</p>
      <p><strong>Genre:</strong> ${genre || 'Mixed AI Genre'}</p>
      <button onclick="playSong('./loyal.m4a', '${generatedTrackName}')">Play Track</button>
      <button onclick="downloadGeneratedMusic()">Download</button>
    `;
    resultElement.style.display = "block";
    hideLoading("music-generator-result");
  }, 3000);
}

function downloadGeneratedMusic() {
  alert("Downloading your AI-generated track! (Simulated)");
  // In a real application, this would trigger a file download
}

// Music Discovery functions
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = 
      `<div class="loading-spinner"></div><p>Generating...</p>`;
    element.style.display = 'block';
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

function getMoodRecommendation() {
  const mood = document.getElementById("mood-selector").value;
  const resultElement = document.getElementById("moodRecommendationResult");
  showLoading("moodRecommendationResult");

  setTimeout(() => {
    let recommendation = "";
    if (mood === "energetic") {
      recommendation = "🔥 Recommended: Ethio Future Beat - A high-energy track with traditional Ethiopian rhythms and modern electronic drops.";
    } else if (mood === "calm") {
      recommendation = "🌙 Recommended: Addis Night Dreams - A soothing ambient piece perfect for relaxation and reflection.";
    } else if (mood === "traditional") {
      recommendation = "🎻 Recommended: Ancient Abyssinia - A rich orchestral blend of traditional instruments and AI harmonies.";
    } else if (mood === "cyber") {
      recommendation = "🚀 Recommended: Cyber Addis 2099 - A hard-hitting cyberpunk anthem with glitchy vocals and heavy basslines.";
    } else if (mood === "ambient") {
      recommendation = "🌌 Recommended: Rift Valley Echoes - An ethereal soundscape that transports you to the serene landscapes of Ethiopia.";
    }
    resultElement.innerHTML = `<p>${recommendation}</p><button onclick="playRecommendedSong('${mood}')">Play Sample</button>`;
    hideLoading("moodRecommendationResult");
  }, 1500);
}

function getAICuratedPlaylist() {
  const resultElement = document.getElementById("aiPlaylistResult");
  showLoading("aiPlaylistResult");

  setTimeout(() => {
    const playlist = [
      "AI-Generated Playlist: Cybernetic Soul",
      "1. Ethio Future Beat",
      "2. Digital Nile Flow",
      "3. Neon Lights of Lalibela",
      "4. Quantum Krar",
      "5. Echoes of Axum"
    ];
    resultElement.innerHTML = `<p>${playlist.join('<br>')}</p><button onclick="playRecommendedSong('aiPlaylist')">Play Playlist Intro</button>`;
    hideLoading("aiPlaylistResult");
  }, 2000);
}

function exploreGenre() {
  const genreInput = document.getElementById("genreInput").value;
  const resultElement = document.getElementById("genreExplorerResult");
  showLoading("genreExplorerResult");

  setTimeout(() => {
    let result = "";
    if (genreInput.toLowerCase().includes("ethio-jazz")) {
      result = "🎷 Exploring Ethio-Jazz: Discover AI-generated tracks inspired by Mulatu Astatke and Getatchew Mekurya, fused with modern electronic elements.";
    } else if (genreInput.toLowerCase().includes("synthwave")) {
      result = "🌃 Exploring Synthwave: Dive into retro-futuristic soundscapes with an Ethiopian twist, featuring pulsating synths and driving beats.";
    } else if (genreInput.toLowerCase().includes("amapiano")) {
      result = "🥁 Exploring Amapiano: Experience the vibrant sounds of Amapiano infused with traditional Ethiopian vocal samples and rhythms.";
    } else {
      result = `🎶 Exploring ${genreInput}: AI is generating unique tracks based on your genre preference. Stay tuned!`;
    }
    resultElement.innerHTML = `<p>${result}</p><button onclick="playRecommendedSong('${genreInput}')">Listen Now</button>`;
    hideLoading("genreExplorerResult");
  }, 1800);
}

function playRecommendedSong(type) {
  let songUrl = '';
  let songName = '';
  if (type === 'energetic') { songUrl = './loyal.m4a'; songName = 'Ethio Future Beat'; }
  else if (type === 'calm') { songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'; songName = 'Addis Night Dreams'; }
  else if (type === 'traditional') { songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'; songName = 'Ancient Abyssinia'; }
  else if (type === 'cyber') { songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; songName = 'Cyber Addis 2099'; }
  else if (type === 'ambient') { songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'; songName = 'Rift Valley Echoes'; }
  else if (type === 'aiPlaylist') { songUrl = './loyal.m4a'; songName = 'AI Playlist Intro'; } // Placeholder
  else { songUrl = './loyal.m4a'; songName = 'Generic AI Track'; }
  playSong(songUrl, songName);
}

let favorites = [];

function addFavorite(songName) {
  if (!favorites.includes(songName)) {
    favorites.push(songName);

    const favoriteList = document.getElementById("favoriteList");
    if (favoriteList) {
      favoriteList.innerHTML = favorites
        .map((song) => `<li>${song}</li>`)
        .join("");
    }
  }
}

function searchSongs() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let musicCards = document.querySelectorAll(".music-card.searchable");
  let artistCards = document.querySelectorAll("#artists .music-card");

  musicCards.forEach(card => {
    let text = card.innerText.toLowerCase();
    if (text.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  artistCards.forEach(card => {
    let text = card.innerText.toLowerCase();
    if (text.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Original generateMusicIdea (now replaced by generateAIMusic)
// function generateMusicIdea() {
//   const prompt = document.getElementById("promptInput").value;
//   const result = document.getElementById("generatedResult");
//   if (prompt === "") {
//     result.innerHTML = "Please enter a music idea.";
//     return;
//   }
//   result.innerHTML = "🎶 Generated Concept:<br><br>" +
//     "Genre: " + prompt +
//     "<br><br>" +
//     "Mood: Futuristic Ethiopian Vibes" +
//     "<br><br>" +
//     "Tempo: 128 BPM" +
//     "<br><br>" +
//     "Instruments: Krar, Synths, AI Drums";
// }

function playSong(songUrl, songName) {
  const player = document.getElementById("audioPlayer");
  const currentSongElement = document.getElementById("currentSong");

  if (!player) {
    console.error("Audio player not found");
    return;
  }

  console.log("Playing:", songUrl);

  player.src = songUrl;

  if (currentSongElement) {
    currentSongElement.textContent = songName || 'Unknown Track';
  }

  player.play().then(() => {
    console.log(`Successfully playing: ${songName}`);
    // Optionally add a success message to the UI
  }).catch(error => {
    console.error("Playback error:", error);
    // Display an error message to the user
    if (currentSongElement) {
      currentSongElement.textContent = `Error playing ${songName || 'track'}: ${error.message}`;
    }
  });
}

function likeSong() {
  let likes = parseInt(localStorage.getItem("songLikes") || "0");
  likes++;
  localStorage.setItem("songLikes", likes);
  const likeCountElement = document.getElementById("likeCount");
  if (likeCountElement) {
    likeCountElement.textContent = likes;
  }
}

// Firebase Configuration
// NOTE: These are public API keys. Secure your Firebase with proper security rules in the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyDW-K6YPOX4ekTPyZmU-br71qTZPaVJzZQ",
  authDomain: "ethio-ai-92723.firebaseapp.com",
  projectId: "ethio-ai-92723",
  storageBucket: "ethio-ai-92723.firebasestorage.app",
  messagingSenderId: "341002895954",
  appId: "1:341002895954:web:95753f54f20101eefed58b",
  measurementId: "G-ZLYXQFFVWB"
};

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    console.log("Firebase Connected!");

    auth.onAuthStateChanged((user) => {
      if (user) {
        const userEmailElement = document.getElementById("userEmail");
        if (userEmailElement) {
          userEmailElement.textContent = user.email;
        }
      }
    });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

function signupUser() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!email || !password) {
    document.getElementById("signupMessage").innerHTML =
      "❌ Please enter email and password";
    return;
  }

  try {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById("signupMessage").innerHTML =
          "✅ Account Created!";
      })
      .catch(error => {
        document.getElementById("signupMessage").innerHTML =
          "❌ " + error.message;
      });
  } catch (error) {
    console.error("Signup error:", error);
  }
}

function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    document.getElementById("loginMessage").innerHTML =
      "❌ Please enter email and password";
    return;
  }

  try {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById("loginMessage").innerHTML = "✅ Login Successful!";
      })
      .catch(error => {
        document.getElementById("loginMessage").innerHTML = "❌ " + error.message;
      });
  } catch (error) {
    console.error("Login error:", error);
  }
}

function logoutUser() {
  try {
    firebase.auth().signOut();
    document.getElementById("loginMessage").innerHTML = "✅ Logged Out";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

window.onload = function() {

  let artists =
    JSON.parse(
      localStorage.getItem("artists")
    ) || [];

  artists.forEach(function(item) {

    const card =
      document.createElement("div");

    card.className =
      "artist-card";

    card.innerHTML =
      "<h3>" + item.name + "</h3>" +
      "<p>🎵 Latest Song: " +
      item.song +
      "</p>";

    const artistList = document.getElementById("artistList");
    if (artistList) {
      artistList.appendChild(card);
    }

  });

  // Load saved likes
  let savedLikes = localStorage.getItem("songLikes");
  if (savedLikes) {
    const likeCount = document.getElementById("likeCount");
    if (likeCount) {
      likeCount.textContent = savedLikes;
    }
  }

  // Update view count
  let views = localStorage.getItem("pageViews");
  if (!views) {
    views = 0;
  }
  views++;
  localStorage.setItem("pageViews", views);
  
  const viewCount = document.getElementById("viewCount");
  if (viewCount) {
    viewCount.textContent = views;
  }

};

function addFavoriteSong() {

  const song =
    document.getElementById("favoriteSong").value;

  if (song === "") return;

  const li =
    document.createElement("li");

  li.innerHTML = "🎵 " + song;

  document
    .getElementById("playlist")
    .appendChild(li);

  document
    .getElementById("favoriteSong")
    .value = "";
}

function uploadMusic() {

  const title =
    document.getElementById("songTitle").value;

  const file =
    document.getElementById("songFile").files[0];

  if (!title || !file) {

    document.getElementById(
      "uploadResult"
    ).innerHTML =
      "❌ Enter title and choose a file";

    return;
  }

  document.getElementById(
    "uploadResult"
  ).innerHTML =
    "✅ Uploaded: " + title;
}

function addArtist() {

  const artist =
    document.getElementById(
      "artistNameInput"
    ).value;

  const song =
    document.getElementById(
      "artistSongInput"
    ).value;

  if (!artist || !song) {
    return;
  }

  const card =
    document.createElement("div");

  card.className = "artist-card";

  card.innerHTML =
    "<h3>" + artist + "</h3>" +
    "<p>🎵 Latest Song: " + song + "</p>";

  document
    .getElementById("artistList")
    .appendChild(card);

  let artists =
    JSON.parse(
      localStorage.getItem("artists")
    ) || [];

  artists.push({
    name: artist,
    song: song
  });

  localStorage.setItem(
    "artists",
    JSON.stringify(artists)
  );
  
  document
    .getElementById("artistNameInput")
    .value = "";

  document
    .getElementById("artistSongInput")
    .value = "";
}

function registerUser() {

  const username =
    document.getElementById("username").value;

  if (!username) {
    document.getElementById("authResult").innerHTML =
      "❌ Please enter a username";
    return;
  }

  document.getElementById("authResult").innerHTML =
    "✅ Account created for " + username;
}

function processPayment() {
  const name =
    document.getElementById("cardName").value;

  if (!name) {
    document.getElementById("paymentResult").innerHTML =
      "❌ Please enter card holder name";
    return;
  }

  document.getElementById("paymentResult").innerHTML =
    "✅ Payment successful! Welcome " + name;
}

function updateProfile() {

  const name =
    document.getElementById(
      "profileInput"
    ).value;

  if (!name) {
    document.getElementById(
      "profileStatus"
    ).innerHTML = "❌ Please enter your name";
    return;
  }

  document.getElementById(
    "profileName"
  ).innerHTML = name;

  document.getElementById(
    "profileStatus"
  ).innerHTML =
    "🎵 Ethio AI Member";

}

// Firebase Configuration
// NOTE: These are public API keys. Secure your Firebase with proper security rules in the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyDW-K6YPOX4ekTPyZmU-br71qTZPaVJzZQ",
  authDomain: "ethio-ai-92723.firebaseapp.com",
  projectId: "ethio-ai-92723",
  storageBucket: "ethio-ai-92723.firebasestorage.app",
  messagingSenderId: "341002895954",
  appId: "1:341002895954:web:95753f54f20101eefed58b",
  measurementId: "G-ZLYXQFFVWB"
};

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    console.log("Firebase Connected!");

    auth.onAuthStateChanged((user) => {
      if (user) {
        const userEmailElement = document.getElementById("userEmail");
        if (userEmailElement) {
          userEmailElement.textContent = user.email;
        }
      }
    });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

function signupUser() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!email || !password) {
    document.getElementById("signupMessage").innerHTML =
      "❌ Please enter email and password";
    return;
  }

  try {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById("signupMessage").innerHTML =
          "✅ Account Created!";
      })
      .catch(error => {
        document.getElementById("signupMessage").innerHTML =
          "❌ " + error.message;
      });
  } catch (error) {
    console.error("Signup error:", error);
  }
}

function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    document.getElementById("loginMessage").innerHTML =
      "❌ Please enter email and password";
    return;
  }

  try {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById("loginMessage").innerHTML = "✅ Login Successful!";
      })
      .catch(error => {
        document.getElementById("loginMessage").innerHTML = "❌ " + error.message;
      });
  } catch (error) {
    console.error("Login error:", error);
  }
}

function logoutUser() {
  try {
    firebase.auth().signOut();
    document.getElementById("loginMessage").innerHTML = "✅ Logged Out";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

window.onload = function() {

  let artists =
    JSON.parse(
      localStorage.getItem("artists")
    ) || [];

  artists.forEach(function(item) {

    const card =
      document.createElement("div");

    card.className =
      "artist-card";

    card.innerHTML =
      "<h3>" + item.name + "</h3>" +
      "<p>🎵 Latest Song: " +
      item.song +
      "</p>";

    const artistList = document.getElementById("artistList");
    if (artistList) {
      artistList.appendChild(card);
    }

  });

  // Load saved likes
  let savedLikes = localStorage.getItem("songLikes");
  if (savedLikes) {
    const likeCount = document.getElementById("likeCount");
    if (likeCount) {
      likeCount.textContent = savedLikes;
    }
  }

  // Update view count
  let views = localStorage.getItem("pageViews");
  if (!views) {
    views = 0;
  }
  views++;
  localStorage.setItem("pageViews", views);
  
  const viewCount = document.getElementById("viewCount");
  if (viewCount) {
    viewCount.textContent = views;
  }

};
