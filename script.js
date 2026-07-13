/**
 * ETHIO-SUPER-AI Main Script
 * Handles UI interactions, authentication simulation, and platform logic.
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  particleCount: 100,
  notificationDuration: 3000,
  simulatedDelay: 1500,
  colors: {
    blue: "#00f2ff",
    purple: "#bc13fe"
  }
};

// ==================== STATE MANAGEMENT ====================
let state = {
  currentUser: null,
  currentWorkspace: "dashboard",
  sidebarOpen: false,
  userStats: {
    tracks: 0,
    favorites: 0,
    listeners: 0,
    hours: 0
  }
};

// ==================== PARTICLE BACKGROUND ====================
const initParticles = () => {
  const canvas = document.getElementById("particle-background");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.color = Math.random() > 0.5 ? CONFIG.colors.blue : CONFIG.colors.purple;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
        this.reset();
      }
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  };

  animate();
};

// ==================== UI UTILITIES ====================
const showNotification = (message, type = "success") => {
  const toast = document.getElementById("notification-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `notification-toast ${type}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, CONFIG.notificationDuration);
};

const showLoading = (text = "Loading...") => {
  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.getElementById("loading-text");
  if (overlay && loadingText) {
    loadingText.textContent = text;
    overlay.style.display = "flex";
  }
};

const hideLoading = () => {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
};

// ==================== NAVIGATION ====================
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const toggleSidebar = () => {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    state.sidebarOpen = !state.sidebarOpen;
    sidebar.classList.toggle("active");
  }
};

const switchWorkspace = (workspaceId) => {
  // Update UI state
  state.currentWorkspace = workspaceId;

  // Update Sidebar Items
  document.querySelectorAll(".nav-item").forEach(item => {
    const onclick = item.getAttribute("onclick");
    if (onclick && onclick.includes(`'${workspaceId}'`)) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update Workspace Content
  document.querySelectorAll(".workspace-content").forEach(content => {
    content.classList.remove("active");
  });

  const target = document.getElementById(`workspace-${workspaceId}`);
  if (target) {
    target.classList.add("active");
  }

  // Update Title
  const titleMap = {
    dashboard: "Dashboard",
    chat: "AI Chat Assistant",
    "music-studio": "Music Studio",
    discovery: "Music Discovery",
    library: "My Library",
    artists: "Featured Artists",
    settings: "Account Settings",
    profile: "User Profile"
  };

  const titleEl = document.getElementById("workspace-title");
  if (titleEl) titleEl.textContent = titleMap[workspaceId] || "Dashboard";

  // Auto-close sidebar on mobile
  if (window.innerWidth <= 1024 && state.sidebarOpen) {
    toggleSidebar();
  }
};

// ==================== AUTHENTICATION ====================
const showAuthModal = (type = 'login') => {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;

  modal.style.display = "flex";
  switchAuthForm(type);
};

const closeAuthModal = () => {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.style.display = "none";
};

const switchAuthForm = (type) => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (type === 'login') {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
};

const loginUser = () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  showLoading("Authenticating...");
  setTimeout(() => {
    state.currentUser = { email, name: email.split('@')[0] };
    localStorage.setItem("ethio_user", JSON.stringify(state.currentUser));
    hideLoading();
    showNotification("Welcome back!");
    switchToDashboard();
  }, CONFIG.simulatedDelay);
};

const signupUser = () => {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!name || !email || !password || !confirm) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (password !== confirm) {
    showNotification("Passwords do not match", "error");
    return;
  }

  showLoading("Creating account...");
  setTimeout(() => {
    state.currentUser = { email, name };
    localStorage.setItem("ethio_user", JSON.stringify(state.currentUser));
    hideLoading();
    showNotification("Account created successfully!");
    switchToDashboard();
  }, CONFIG.simulatedDelay);
};

const logoutUser = () => {
  state.currentUser = null;
  localStorage.removeItem("ethio_user");
  document.getElementById("dashboard-page").style.display = "none";
  document.getElementById("landing-page").style.display = "block";
  showNotification("Logged out successfully");
};

const switchToDashboard = () => {
  document.getElementById("landing-page").style.display = "none";
  document.getElementById("dashboard-page").style.display = "flex";
  closeAuthModal();
  updateUI();
};

const updateUI = () => {
  if (state.currentUser) {
    const nameEls = document.querySelectorAll("#user-display-name, #profile-name");
    nameEls.forEach(el => el.textContent = state.currentUser.name);
    
    const emailEls = document.querySelectorAll("#profile-email");
    emailEls.forEach(el => el.textContent = state.currentUser.email);
  }

  document.getElementById("stat-tracks").textContent = state.userStats.tracks;
  document.getElementById("stat-favorites").textContent = state.userStats.favorites;
  document.getElementById("stat-listeners").textContent = state.userStats.listeners;
  document.getElementById("stat-hours").textContent = state.userStats.hours;
};

// ==================== FEATURE LOGIC ====================
const sendChatMessage = () => {
  const input = document.getElementById("chat-input");
  const container = document.getElementById("chat-messages");
  if (!input || !input.value.trim()) return;

  const msg = input.value.trim();
  appendMessage(msg, 'user');
  input.value = "";

  setTimeout(() => {
    appendMessage("I'm analyzing your request using ETHIO-SUPER-AI neural networks...", 'ai');
  }, 800);
};

const appendMessage = (text, sender) => {
  const container = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `message ${sender}-message`;
  div.innerHTML = `
    <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
    <div class="message-content"><p>${text}</p></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
};

const generateMusic = () => {
  const prompt = document.getElementById("music-prompt").value;
  if (!prompt) return showNotification("Please enter a prompt", "error");

  showLoading("Neural Synthesis in progress...");
  setTimeout(() => {
    state.userStats.tracks++;
    updateUI();
    hideLoading();
    document.getElementById("track-preview").innerHTML = `
      <div class="generated-track">
        <h4>✨ AI Composition Ready</h4>
        <p>Based on: ${prompt.substring(0, 30)}...</p>
        <button class="play-btn">▶ Play Preview</button>
      </div>
    `;
    showNotification("Music generated!");
  }, 2500);
};

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  initParticles();

  // Check Session
  const saved = localStorage.getItem("ethio_user");
  if (saved) {
    state.currentUser = JSON.parse(saved);
    switchToDashboard();
  }

  // Mobile Menu
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Custom Cursor
  const cursor = document.getElementById("custom-cursor");
  document.addEventListener("mousemove", (e) => {
    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
  });

  // Global Error Handling
  window.onerror = (msg, url, line) => {
    console.error(`Error: ${msg} at ${url}:${line}`);
    showNotification("An unexpected error occurred", "error");
    return false;
  };
});
