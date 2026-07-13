// ==================== PARTICLE BACKGROUND ==================== 
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

// ==================== CUSTOM CURSOR ==================== 
const cursor = document.getElementById("custom-cursor");

document.addEventListener("mousemove", (e) => {
  if (cursor) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }
});

// ==================== AUTHENTICATION STATE ==================== 
let currentUser = null;
let userStats = {
  tracks: 0,
  favorites: 0,
  listeners: 0,
  hours: 0
};

// ==================== UI STATE MANAGEMENT ==================== 
let currentWorkspace = "dashboard";
let sidebarOpen = false;

// ==================== LANDING PAGE FUNCTIONS ==================== 
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

function showAuthModal(type) {
  const modal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  modal.style.display = "flex";

  if (type === "login") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

function closeAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}

function switchAuthForm(type) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (type === "login") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

// ==================== AUTHENTICATION FUNCTIONS ==================== 
function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showNotification("Please enter email and password", "error");
    return;
  }

  showLoading("Logging in...");

  setTimeout(() => {
    currentUser = {
      email: email,
      name: email.split("@")[0],
      avatar: "./profile.png"
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    hideLoading();
    showNotification("Login successful!", "success");
    switchToDashboard();
  }, 1500);
}

function signupUser() {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!name || !email || !password || !confirm) {
    showNotification("Please fill all fields", "error");
    return;
  }

  if (password !== confirm) {
    showNotification("Passwords do not match", "error");
    return;
  }

  showLoading("Creating account...");

  setTimeout(() => {
    currentUser = {
      email: email,
      name: name,
      avatar: "./profile.png"
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    hideLoading();
    showNotification("Account created successfully!", "success");
    switchToDashboard();
  }, 1500);
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  switchToLanding();
  showNotification("Logged out successfully", "success");
}

// ==================== DASHBOARD NAVIGATION ==================== 
function switchToDashboard() {
  const landingPage = document.getElementById("landing-page");
  const dashboardPage = document.getElementById("dashboard-page");

  landingPage.style.display = "none";
  dashboardPage.style.display = "flex";

  updateDashboard();
  closeAuthModal();
}

function switchToLanding() {
  const landingPage = document.getElementById("landing-page");
  const dashboardPage = document.getElementById("dashboard-page");

  landingPage.style.display = "block";
  dashboardPage.style.display = "none";
}

function switchWorkspace(workspace) {
  currentWorkspace = workspace;

  // Update sidebar
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
  event.target.closest(".nav-item").classList.add("active");

  // Update workspace content
  document.querySelectorAll(".workspace-content").forEach(content => {
    content.classList.remove("active");
  });

  const workspaceElement = document.getElementById(`workspace-${workspace}`);
  if (workspaceElement) {
    workspaceElement.classList.add("active");
  }

  // Update title
  const titles = {
    "dashboard": "Dashboard",
    "chat": "AI Chat Assistant",
    "music-studio": "Music Studio",
    "discovery": "Music Discovery",
    "library": "My Library",
    "artists": "Artists",
    "settings": "Settings",
    "profile": "My Profile"
  };

  document.getElementById("workspace-title").textContent = titles[workspace] || "Dashboard";

  // Close sidebar on mobile
  if (window.innerWidth < 768) {
    toggleSidebar();
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle("active");
}

function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  dropdown.classList.toggle("active");
}

// ==================== DASHBOARD FUNCTIONS ==================== 
function updateDashboard() {
  if (currentUser) {
    document.getElementById("user-display-name").textContent = currentUser.name;
    document.getElementById("profile-name").textContent = currentUser.name;
    document.getElementById("profile-email").textContent = currentUser.email;
  }

  // Update stats
  document.getElementById("stat-tracks").textContent = userStats.tracks;
  document.getElementById("stat-favorites").textContent = userStats.favorites;
  document.getElementById("stat-listeners").textContent = userStats.listeners;
  document.getElementById("stat-hours").textContent = userStats.hours;

  // Update profile stats
  document.getElementById("profile-tracks").textContent = userStats.tracks;
  document.getElementById("profile-followers").textContent = Math.floor(Math.random() * 1000);
  document.getElementById("profile-following").textContent = Math.floor(Math.random() * 500);
}

// ==================== AI CHAT FUNCTIONS ==================== 
function sendChatMessage() {
  const chatInput = document.getElementById("chat-input");
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message
  addChatMessage(message, "user");
  chatInput.value = "";

  // Simulate AI response
  setTimeout(() => {
    const responses = [
      "That's a great question! I can help you with music creation, discovery, and more.",
      "I'm here to assist you with your music journey. What would you like to explore?",
      "Interesting! Let me help you find the perfect music for that mood.",
      "I can recommend some amazing tracks based on your preferences.",
      "That sounds exciting! Would you like me to generate some music for you?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(randomResponse, "ai");
  }, 1000);
}

function addChatMessage(message, sender) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const avatar = sender === "user" ? "👤" : "🤖";
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <p>${message}</p>
    </div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== MUSIC STUDIO FUNCTIONS ==================== 
function generateMusic() {
  const prompt = document.getElementById("music-prompt").value;
  const genre = document.getElementById("studio-genre").value;

  if (!prompt) {
    showNotification("Please describe your music idea", "error");
    return;
  }

  showLoading("Generating your music...");

  setTimeout(() => {
    hideLoading();

    const trackName = `Generated ${genre || "Track"} - ${new Date().toLocaleTimeString()}`;
    const trackPreview = document.getElementById("track-preview");

    trackPreview.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: 2rem; margin-bottom: 15px;">✨</p>
        <p style="font-weight: bold; margin-bottom: 10px;">${trackName}</p>
        <p style="color: #b0b0b0; font-size: 0.9rem;">Genre: ${genre || "Mixed"}</p>
        <p style="color: #b0b0b0; font-size: 0.9rem;">Prompt: ${prompt.substring(0, 50)}...</p>
      </div>
    `;

    userStats.tracks++;
    updateDashboard();
    showNotification("Music generated successfully!", "success");
  }, 3000);
}

function saveProject() {
  const projectName = document.getElementById("project-name").value || "Untitled Project";
  showNotification(`Project "${projectName}" saved!`, "success");
}

function exportMusic() {
  showNotification("Music exported! Download starting...", "success");
}

// ==================== DISCOVERY FUNCTIONS ==================== 
function filterDiscovery(filter) {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  showNotification(`Showing ${filter} music`, "success");
}

function playTrack(trackId) {
  showNotification("Playing track...", "success");
  userStats.hours++;
  updateDashboard();
}

// ==================== LIBRARY FUNCTIONS ==================== 
function switchLibraryTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

// ==================== SETTINGS FUNCTIONS ==================== 
function saveSettings() {
  const email = document.getElementById("settings-email").value;
  const name = document.getElementById("settings-name").value;

  if (email) currentUser.email = email;
  if (name) currentUser.name = name;

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateDashboard();
  showNotification("Settings saved successfully!", "success");
}

// ==================== UI UTILITIES ==================== 
function showLoading(text = "Loading...") {
  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.getElementById("loading-text");
  loadingText.textContent = text;
  overlay.style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

function showNotification(message, type = "success") {
  const toast = document.getElementById("notification-toast");
  toast.textContent = message;
  toast.className = `notification-toast ${type}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ==================== INITIALIZATION ==================== 
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    switchToDashboard();
  }

  // Close auth modal on outside click
  document.getElementById("auth-modal").addEventListener("click", (e) => {
    if (e.target.id === "auth-modal") {
      closeAuthModal();
    }
  });

  // Close user dropdown on outside click
  document.addEventListener("click", (e) => {
    const userMenu = document.querySelector(".user-menu");
    if (userMenu && !userMenu.contains(e.target)) {
      document.getElementById("user-dropdown").classList.remove("active");
    }
  });

  // Enter key in chat
  document.getElementById("chat-input")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });

  // Mobile menu toggle
  document.getElementById("mobile-menu")?.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("active");
  });

  // Sidebar toggle
  document.querySelector(".sidebar-toggle")?.addEventListener("click", toggleSidebar);

  // Global search
  document.getElementById("global-search")?.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query.length > 2) {
      showNotification(`Searching for "${query}"...`, "success");
    }
  });
});

// ==================== FIREBASE CONFIGURATION ==================== 
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
    console.log("Firebase initialized successfully");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// ==================== SMOOTH SCROLLING ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#auth-modal') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ==================== RESPONSIVE SIDEBAR ==================== 
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    document.querySelector(".sidebar").classList.remove("active");
    sidebarOpen = false;
  }
});

// ==================== PERFORMANCE OPTIMIZATION ==================== 
// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== ANALYTICS ==================== 
function trackEvent(eventName, eventData) {
  console.log(`Event: ${eventName}`, eventData);
  // Send to analytics service
}

// Track workspace changes
const originalSwitchWorkspace = switchWorkspace;
switchWorkspace = function(workspace) {
  trackEvent('workspace_switch', { workspace });
  originalSwitchWorkspace(workspace);
};

// ==================== ERROR HANDLING ==================== 
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('An error occurred. Please try again.', 'error');
});
