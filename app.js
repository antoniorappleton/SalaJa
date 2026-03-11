/**
 * SalaJá - Ramalhão Reservas
 * Main Application JavaScript with PWA Support
 */

// ============================================
// PWA Service Worker Registration
// ============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log(
        "Service Worker registered successfully:",
        registration.scope,
      );
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}

// ============================================
// PWA Install Prompt
// ============================================
let deferredPrompt;
const installPrompt = document.getElementById("pwa-install-prompt");

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the default browser install prompt
  e.preventDefault();
  deferredPrompt = e;

  // Show our custom install prompt if it exists
  if (installPrompt) {
    installPrompt.classList.remove("hidden");
  }
});

window.addEventListener("appinstalled", () => {
  // Hide the install prompt
  if (installPrompt) {
    installPrompt.classList.add("hidden");
  }
  deferredPrompt = null;
  console.log("PWA installed successfully");
});

// Handle install button click
const installBtn = document.getElementById("btn-install");
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Install prompt outcome:", outcome);
      deferredPrompt = null;
    }
  });
}

// Handle dismiss button click
const dismissBtn = document.getElementById("btn-dismiss");
if (dismissBtn) {
  dismissBtn.addEventListener("click", () => {
    if (installPrompt) {
      installPrompt.classList.add("hidden");
    }
  });
}

// ============================================
// Sidebar Navigation
// ============================================
const sidebar = document.getElementById("appSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

function openSidebar() {
  if (sidebar) sidebar.classList.add("open");
  if (sidebarOverlay) sidebarOverlay.classList.add("open");
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("open");
  if (sidebarOverlay) sidebarOverlay.classList.remove("open");
}

if (openSidebarBtn) {
  openSidebarBtn.addEventListener("click", openSidebar);
}

if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", closeSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", closeSidebar);
}

// Close sidebar when clicking a link on mobile
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  });
});

// ============================================
// Category Pills Filtering
// ============================================
const pillBtns = document.querySelectorAll(".pill-btn");
const spaceCards = document.querySelectorAll(".space-card");

pillBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active state
    pillBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.textContent.trim().toLowerCase();

    // Filter spaces
    spaceCards.forEach((card) => {
      const spaceName = card.querySelector("h3").textContent.toLowerCase();

      if (category === "todos") {
        card.style.display = "flex";
      } else if (category === "desporto") {
        if (
          spaceName.includes("ginásio") ||
          spaceName.includes("polidesportivo")
        ) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      } else if (category === "estudo") {
        if (spaceName.includes("sala")) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      } else if (category === "especiais") {
        if (spaceName.includes("capela")) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      }
    });
  });
});

// ============================================
// Space Card Click Handler
// ============================================
spaceCards.forEach((card) => {
  card.addEventListener("click", () => {
    const spaceName = card.querySelector("h3").textContent;
    // Store selected space and navigate to reservation
    localStorage.setItem("selectedSpace", spaceName);
    window.location.href = "reserva.html";
  });
});

// ============================================
// Dashboard Stats (Mock Data)
// ============================================
function loadDashboardStats() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  const totalReservas = reservas.length;
  const pendentes = reservas.filter((r) => r.status === "pendente").length;
  const confirmadas = reservas.filter((r) => r.status === "confirmada").length;

  const statTotal = document.getElementById("statTotalReservas");
  const statPendentes = document.getElementById("statPendentes");
  const statConfirmadas = document.getElementById("statConfirmadas");

  if (statTotal) statTotal.textContent = totalReservas;
  if (statPendentes) statPendentes.textContent = pendentes;
  if (statConfirmadas) statConfirmadas.textContent = confirmadas;
}

// ============================================
// Render Reservation List
// ============================================
function renderReservasList(elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  if (reservas.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="calendar-x"></i>
                </div>
                <h3 class="empty-state-title">Sem reservas</h3>
                <p class="empty-state-text">Ainda não tens reservas. Faz a tua primeira reserva!</p>
            </div>
        `;
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
    return;
  }

  container.innerHTML = reservas
    .map(
      (reserva) => `
        <div class="list-item">
            <div class="list-item-icon">
                <i data-lucide="calendar"></i>
            </div>
            <div class="list-item-content">
                <div class="list-item-title">${reserva.espaco}</div>
                <div class="list-item-subtitle">${reserva.data} às ${reserva.hora}</div>
                <div class="list-item-meta">
                    <span class="status-badge ${reserva.status}">${reserva.status}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// Admin Functions
// ============================================
function loadAdminReservas() {
  const container = document.getElementById("adminReservasList");
  if (!container) return;

  // Mock pending reservations for admin
  const reservas = [
    {
      id: 1,
      espaco: "Ginásio Velho",
      usuario: "João Silva",
      data: "15/03/2026",
      hora: "14:00",
      status: "pendente",
    },
  ];

  container.innerHTML = reservas
    .map(
      (reserva) => `
        <div class="list-item">
            <div class="list-item-icon">
                <i data-lucide="calendar"></i>
            </div>
            <div class="list-item-content">
                <div class="list-item-title">${reserva.espaco}</div>
                <div class="list-item-subtitle">${reserva.usuario} - ${reserva.data} às ${reserva.hora}</div>
                <div class="list-item-meta">
                    <span class="status-badge ${reserva.status}">${reserva.status}</span>
                </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="aprovarReserva(${reserva.id})">Aprovar</button>
        </div>
    `,
    )
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function loadAdminUsers() {
  const container = document.getElementById("adminUsersList");
  if (!container) return;

  // Mock pending users for admin
  const users = [
    {
      id: 1,
      nome: "Maria Santos",
      email: "maria@email.com",
      data: "14/03/2026",
    },
  ];

  container.innerHTML = users
    .map(
      (user) => `
        <div class="list-item">
            <div class="list-item-icon">
                <i data-lucide="user"></i>
            </div>
            <div class="list-item-content">
                <div class="list-item-title">${user.nome}</div>
                <div class="list-item-subtitle">${user.email}</div>
                <div class="list-item-meta">Pedido: ${user.data}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="aprovarUtilizador(${user.id})">Aprovar</button>
        </div>
    `,
    )
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function aprobarReserva(id) {
  console.log("Aprovar reserva:", id);
  showToast("Reserva aprovada com sucesso!", "success");
  loadAdminReservas();
}

function aprobarUtilizador(id) {
  console.log("Aprovar utilizador:", id);
  showToast("Utilizador aprovado com sucesso!", "success");
  loadAdminUsers();
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i data-lucide="${type === "success" ? "check-circle" : type === "error" ? "x-circle" : "info"}"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// Toggle Switch Handler
// ============================================
const toggles = document.querySelectorAll(".toggle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
  });
});

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Load dashboard data if on dashboard page
  if (document.getElementById("dashboardReservasList")) {
    renderReservasList("dashboardReservasList");
    loadDashboardStats();
  }

  // Load admin data if on admin page
  if (document.getElementById("adminReservasList")) {
    loadAdminReservas();
  }

  if (document.getElementById("adminUsersList")) {
    loadAdminUsers();
  }

  console.log("SalaJá app initialized");
});
