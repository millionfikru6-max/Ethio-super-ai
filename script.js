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
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

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

const form = document.getElementById("ethio-form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const button = form.querySelector(".submit-glow");

    button.innerText = "CONNECTED";

    setTimeout(() => {
      button.innerText = "Send Transmission";
      form.reset();
    }, 2000);
  });
}

function recommendMusic() {
  const mood = document.getElementById("mood").value;
  const result = document.getElementById("recommendResult");

  if (mood === "energetic") {
    result.innerHTML = "🔥 Recommended: Ethio Future Beat";
  } else if (mood === "calm") {
    result.innerHTML = "🌙 Recommended: Addis Night Dreams";
  } else if (mood === "traditional") {
    result.innerHTML = "🎻 Recommended: Ancient Abyssinia";
  } else {
    result.innerHTML = "🚀 Recommended: Cyber Addis 2099";
  }
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
  let input =
    document.getElementById("searchInput").value.toLowerCase();

  let cards =
    document.querySelectorAll(".searchable");

  cards.forEach(card => {
    let text = card.innerText.toLowerCase();

    if (text.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function generateMusicIdea() {

  const prompt =
    document.getElementById("promptInput").value;

  const result =
    document.getElementById("generatedResult");

  if (prompt === "") {
    result.innerHTML =
      "Please enter a music idea.";
    return;
  }

  result.innerHTML =
    "🎶 Generated Concept:<br><br>" +
    "Genre: " + prompt +
    "<br><br>" +
    "Mood: Futuristic Ethiopian Vibes" +
    "<br><br>" +
    "Tempo: 128 BPM" +
    "<br><br>" +
    "Instruments: Krar, Synths, AI Drums";
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
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  console.log("Firebase Connected!");
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
    auth.createUserWithEmailAndPassword(email, password)
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
    auth.signInWithEmailAndPassword(email, password)
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
    auth.signOut();
    document.getElementById("loginMessage").innerHTML = "✅ Logged Out";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

try {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userEmailElement = document.getElementById("userEmail");
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
      }
    }
  });
} catch (error) {
  console.error("Auth state change error:", error);
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

function playSong(songUrl, songName) {
  const player = document.getElementById("audioPlayer");

  if (!player) {
    console.error("Audio player not found");
    return;
  }

  console.log("Playing:", songUrl);

  player.src = songUrl;

  if (songName) {
    const currentSongElement = document.getElementById("currentSong");
    if (currentSongElement) {
      currentSongElement.textContent = songName;
    }
  }

  player.play().catch(error => {
    console.error("Playback error:", error);
  });
}

function followArtist() {

  let current =
    Number(
      document.getElementById("followers")
        .innerText
    );

  current++;

  document.getElementById("followers")
    .innerText = current;
}

function addComment() {

  const input =
    document.getElementById("commentInput");

  const comment =
    input.value;

  if (comment === "") return;

  const li =
    document.createElement("li");

  li.textContent = comment;

  document
    .getElementById("commentList")
    .appendChild(li);

  input.value = "";

}

function likeSong() {
  let likes = document.getElementById("likeCount");
  let count = parseInt(likes.textContent);

  count++;
  likes.textContent = count;

  localStorage.setItem("songLikes", count);
}

// Mobile menu toggle
const mobileMenu = document.getElementById("mobile-menu");
if (mobileMenu) {
  mobileMenu.addEventListener("click", function() {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
    }
  });
}
