const SPACE_IMAGES = {
  capela: "capela.jpg.jpeg",
  tenda: "tenda.jpg.jpeg",
  sala_12b: "sala_12b.jpg",
  ginasio_novo: "ginasio_novo.jpg.png",
  polidesportivo: "polideportivo.jpg.png",
  ginasio_velho: "ginasio_velho.jpeg",
  sala_profissional: "sala_profissional.jpeg",
  floresta: "floresta.jpeg",
};

const STATUS_LABELS = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Recusada",
  cancelled: "Cancelada",
};

const PAGE_TITLES = {
  spaces: "Explorar espaços",
  dashboard: "Dashboard",
  reserve: "Pedir reserva",
  reservations: "As minhas reservas",
  admin: "Validar pedidos",
  "gerir-espacos": "Gerir espaços",
};

const ESPACOS_BUCKET = "salaja-espacos";

let currentUser;
let currentProfessor;
let currentPage;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(message, type = "error") {
  const element = document.getElementById("pageMessage");
  if (!element) return;
  element.textContent = message;
  element.className = `notice notice-${type}`;
  element.hidden = !message;
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(value));
}

function statusBadge(status) {
  return `<span class="status-badge status-${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>`;
}

function localDateTimeValue(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function setActiveNavigation() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === currentPage);
  });
  document.querySelectorAll(".page-title").forEach((heading) => {
    heading.textContent = PAGE_TITLES[currentPage] || "SalaJá";
  });
  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.hidden = currentProfessor?.role !== "admin";
  });
}

async function loadSpaces() {
  const { data, error } = await window.supabase
    .from("salaja_espacos")
    .select("id,nome,categoria,descricao,ativo,capacidade,imagem_path")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return data || [];
}

// Admin: todos os espaços (incluindo inativos), para a página de gestão. A
// política salaja_espacos_read já deixa o Admin ver inativos (ativo OR
// salaja_is_admin()) — só não filtramos por "ativo" aqui.
async function loadAllSpacesForAdmin() {
  const { data, error } = await window.supabase
    .from("salaja_espacos")
    .select("id,nome,categoria,descricao,ativo,capacidade,imagem_path")
    .order("nome");
  if (error) throw error;
  return data || [];
}

// Fotografia de um espaço: prioriza a carregada via Gerir Espaços
// (imagem_path, no bucket público "salaja-espacos"); recorre ao mapa
// estático SPACE_IMAGES para os espaços originais, criados por SQL antes
// desta funcionalidade existir.
function spaceImageUrl(space) {
  if (space.imagem_path) {
    return window.supabase.storage.from(ESPACOS_BUCKET).getPublicUrl(space.imagem_path).data.publicUrl;
  }
  return SPACE_IMAGES[space.id] || null;
}

function renderSpaces(spaces, category = "Todos") {
  const container = document.getElementById("mainSpacesGrid");
  if (!container) return;
  const selected = category === "Todos"
    ? spaces
    : spaces.filter((space) => space.categoria === category);
  container.innerHTML = selected.length
    ? selected.map((space) => {
      const image = spaceImageUrl(space);
      return `<article class="space-card has-image">
        ${image ? `<img class="space-image" src="${escapeHtml(image)}" alt="" loading="lazy">` : ""}
        <div class="space-content">
          <div class="space-info">
            <span class="space-category">${escapeHtml(space.categoria)}</span>
            <h3>${escapeHtml(space.nome)}</h3>
            <p>${escapeHtml(space.descricao)}</p>
            ${space.capacidade ? `<p class="text-muted">Até ${escapeHtml(space.capacidade)} pessoas</p>` : ""}
          </div>
          <a class="btn btn-primary" href="reserva.html?espaco=${encodeURIComponent(space.id)}">Pedir</a>
        </div>
      </article>`;
    }).join("")
    : '<p class="empty-state">Não há espaços nesta categoria.</p>';
}

async function renderSpacesPage() {
  const spaces = await loadSpaces();
  const categories = ["Todos", ...new Set(spaces.map((space) => space.categoria))];
  const pills = document.getElementById("categoryPills");
  if (pills) {
    pills.innerHTML = categories.map((category, index) =>
      `<button class="pill-btn${index === 0 ? " active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    ).join("");
    pills.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      pills.querySelectorAll(".pill-btn").forEach((pill) => pill.classList.remove("active"));
      button.classList.add("active");
      renderSpaces(spaces, button.dataset.category);
    });
  }
  renderSpaces(spaces);
}

function renderReservationRows(reservations, showRequester = false) {
  if (!reservations.length) {
    return '<div class="empty-state">Ainda não existem pedidos de reserva.</div>';
  }
  return `<div class="reservation-list">${reservations.map((reservation) => `
    <article class="reservation-row">
      <div class="reservation-main">
        <div class="reservation-heading">
          <h3>${escapeHtml(reservation.espaco?.nome || "Espaço")}</h3>
          ${statusBadge(reservation.estado)}
        </div>
        <p>${escapeHtml(formatDate(reservation.inicio))} – ${escapeHtml(formatDate(reservation.fim, { timeStyle: "short", dateStyle: undefined }))}</p>
        <p>${escapeHtml(reservation.motivo)}</p>
        ${showRequester ? `<p class="text-muted">Pedido por ${escapeHtml(reservation.email_utilizador)}</p>` : ""}
        ${reservation.detalhes ? `<p>${escapeHtml(reservation.detalhes)}</p>` : ""}
        ${reservation.nota_admin ? `<p class="admin-note"><strong>Nota do Admin:</strong> ${escapeHtml(reservation.nota_admin)}</p>` : ""}
      </div>
      ${showRequester && reservation.estado === "pending" ? `
        <div class="reservation-actions">
          <button class="btn btn-primary" type="button" data-review="${escapeHtml(reservation.id)}" data-status="approved">Aprovar</button>
          <button class="btn btn-secondary" type="button" data-review="${escapeHtml(reservation.id)}" data-status="rejected">Recusar</button>
        </div>` : ""}
    </article>`).join("")}</div>`;
}

async function getReservations({ all = false, limit } = {}) {
  let query = window.supabase
    .from("salaja_reservas")
    .select("id,email_utilizador,inicio,fim,motivo,detalhes,estado,nota_admin,created_at,espaco:salaja_espacos(nome)")
    .order("inicio", { ascending: false });
  if (!all) query = query.eq("user_id", currentUser.id);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function renderReservationsPage() {
  const list = document.getElementById("reservationsList");
  list.innerHTML = '<p class="text-muted">A carregar pedidos…</p>';
  const reservations = await getReservations();
  list.innerHTML = renderReservationRows(reservations);
}

async function renderDashboardPage() {
  const reservations = await getReservations({
    all: currentProfessor?.role === "admin",
  });
  const counts = {
    pending: reservations.filter((item) => item.estado === "pending").length,
    approved: reservations.filter((item) => item.estado === "approved").length,
    rejected: reservations.filter((item) => item.estado === "rejected").length,
  };
  const stats = document.getElementById("dashboardStats");
  stats.innerHTML = Object.entries(counts).map(([status, count]) => `
    <article class="stat-card">
      <span>${escapeHtml(STATUS_LABELS[status])}</span>
      <strong>${count}</strong>
    </article>`).join("");
  const list = document.getElementById("dashboardReservations");
  const upcoming = reservations
    .filter((item) => new Date(item.inicio) >= new Date() && item.estado !== "rejected")
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
    .slice(0, 5);
  list.innerHTML = renderReservationRows(upcoming, currentProfessor?.role === "admin");
  if (currentProfessor?.role === "admin") {
    list.onclick = handleReviewClick;
  }
}

async function renderAdminPage() {
  const list = document.getElementById("adminReservations");
  list.innerHTML = '<p class="text-muted">A carregar pedidos…</p>';
  const reservations = await getReservations({ all: true });
  const pending = reservations.filter((item) => item.estado === "pending");
  const history = reservations.filter((item) => item.estado !== "pending");
  document.getElementById("adminPendingCount").textContent = String(pending.length);
  list.innerHTML = [
    '<h2>Por validar</h2>',
    renderReservationRows(pending, true),
    '<h2 class="mt-4">Decisões anteriores</h2>',
    renderReservationRows(history, true),
  ].join("");
  list.onclick = handleReviewClick;
}

async function handleReviewClick(event) {
  const button = event.target.closest("[data-review]");
  if (!button || button.disabled) return;
  const { review: reservationId, status } = button.dataset;
  const note = status === "rejected"
    ? window.prompt("Nota para o requerente (opcional):")
    : null;
  if (status === "rejected" && note === null) return;
  button.disabled = true;
  try {
    const { error } = await window.supabase.rpc("salaja_validar_reserva", {
      p_reserva_id: reservationId,
      p_estado: status,
      p_nota_admin: note?.trim() || null,
    });
    if (error) throw error;
    showMessage(status === "approved" ? "Pedido aprovado." : "Pedido recusado.", "success");
    await renderAdminPage();
  } catch (error) {
    showMessage(error.message || "Não foi possível validar o pedido.");
    button.disabled = false;
  }
}

function renderEspacosAdminList(spaces) {
  const container = document.getElementById("espacosAdminList");
  if (!container) return;
  container.innerHTML = spaces.length
    ? `<div class="spaces-grid">${spaces.map((space) => {
      const image = spaceImageUrl(space);
      return `<article class="space-card has-image" style="${space.ativo ? "" : "opacity:.55"}">
        ${image ? `<img class="space-image" src="${escapeHtml(image)}" alt="" loading="lazy">` : ""}
        <div class="space-content">
          <div class="space-info">
            <span class="space-category">${escapeHtml(space.categoria)}${space.ativo ? "" : " · Inativo"}</span>
            <h3>${escapeHtml(space.nome)}</h3>
            <p>${escapeHtml(space.descricao)}</p>
            ${space.capacidade ? `<p class="text-muted">Até ${escapeHtml(space.capacidade)} pessoas</p>` : ""}
          </div>
          <div style="display:flex; flex-direction:column; gap:.5rem;">
            <button class="btn btn-secondary" type="button" data-edit-espaco="${escapeHtml(space.id)}">Editar</button>
            <button class="btn btn-secondary" type="button" data-toggle-espaco="${escapeHtml(space.id)}" data-ativo="${space.ativo}">${space.ativo ? "Desativar" : "Ativar"}</button>
          </div>
        </div>
      </article>`;
    }).join("")}</div>`
    : '<p class="empty-state">Ainda não há espaços registados.</p>';
}

async function renderGerirEspacosPage() {
  const list = document.getElementById("espacosAdminList");
  list.innerHTML = '<p class="text-muted">A carregar espaços…</p>';
  let spaces = await loadAllSpacesForAdmin();
  renderEspacosAdminList(spaces);

  const form = document.getElementById("espacoForm");
  const formTitle = document.getElementById("espacoFormTitle");
  const idField = document.getElementById("espacoId");
  const cancelBtn = document.getElementById("cancelarEspacoBtn");

  function resetForm() {
    form.reset();
    idField.value = "";
    formTitle.textContent = "Novo espaço";
    cancelBtn.hidden = true;
  }

  async function recarregar() {
    spaces = await loadAllSpacesForAdmin();
    renderEspacosAdminList(spaces);
  }

  cancelBtn.addEventListener("click", resetForm);

  list.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("[data-edit-espaco]");
    const toggleBtn = event.target.closest("[data-toggle-espaco]");
    if (editBtn) {
      const space = spaces.find((item) => item.id === editBtn.dataset.editEspaco);
      if (!space) return;
      idField.value = space.id;
      document.getElementById("espacoNome").value = space.nome || "";
      document.getElementById("espacoCategoria").value = space.categoria || "";
      document.getElementById("espacoDescricao").value = space.descricao || "";
      document.getElementById("espacoCapacidade").value = space.capacidade || "";
      formTitle.textContent = `A editar: ${space.nome}`;
      cancelBtn.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (toggleBtn) {
      toggleBtn.disabled = true;
      try {
        const novoAtivo = toggleBtn.dataset.ativo !== "true";
        const { error } = await window.supabase
          .from("salaja_espacos")
          .update({ ativo: novoAtivo })
          .eq("id", toggleBtn.dataset.toggleEspaco);
        if (error) throw error;
        await recarregar();
      } catch (error) {
        showMessage(error.message || "Não foi possível atualizar o espaço.");
        toggleBtn.disabled = false;
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");
    const submit = form.querySelector('[type="submit"]');
    const nome = document.getElementById("espacoNome").value.trim();
    const categoria = document.getElementById("espacoCategoria").value.trim();
    const descricao = document.getElementById("espacoDescricao").value.trim();
    const capacidadeRaw = document.getElementById("espacoCapacidade").value;
    const capacidade = capacidadeRaw ? Number(capacidadeRaw) : null;
    const ficheiro = document.getElementById("espacoImagem").files[0];
    const existingId = idField.value || null;

    if (!nome || !categoria || !descricao) {
      showMessage("Nome, categoria e descrição são obrigatórios.");
      return;
    }
    if (capacidadeRaw && (!Number.isInteger(capacidade) || capacidade <= 0)) {
      showMessage("A capacidade, se indicada, tem de ser um número inteiro positivo.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "A guardar…";
    try {
      const id = existingId || crypto.randomUUID();
      let imagemPath;
      if (ficheiro) {
        imagemPath = `${id}/${Date.now()}-${ficheiro.name.replace(/\s+/g, "_")}`;
        const { error: uploadError } = await window.supabase.storage
          .from(ESPACOS_BUCKET)
          .upload(imagemPath, ficheiro);
        if (uploadError) throw uploadError;
      }

      const payload = { nome, categoria, descricao, capacidade };
      if (imagemPath) payload.imagem_path = imagemPath;

      if (existingId) {
        const { error } = await window.supabase.from("salaja_espacos").update(payload).eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await window.supabase.from("salaja_espacos").insert({ id, ativo: true, ...payload });
        if (error) throw error;
      }

      showMessage(existingId ? "Espaço atualizado." : "Espaço criado.", "success");
      resetForm();
      await recarregar();
    } catch (error) {
      showMessage(error.message || "Não foi possível guardar o espaço.");
    } finally {
      submit.disabled = false;
      submit.textContent = "Guardar espaço";
    }
  });
}

async function renderReservePage() {
  const spaces = await loadSpaces();
  const select = document.getElementById("spaceId");
  select.innerHTML = '<option value="">Selecionar espaço</option>' +
    spaces.map((space) => `<option value="${escapeHtml(space.id)}">${escapeHtml(space.nome)}</option>`).join("");
  const requestedSpace = new URLSearchParams(window.location.search).get("espaco");
  if (requestedSpace && spaces.some((space) => space.id === requestedSpace)) {
    select.value = requestedSpace;
  }

  const start = document.getElementById("startsAt");
  const end = document.getElementById("endsAt");
  const minimum = new Date(Date.now() + 60 * 60 * 1000);
  minimum.setMinutes(Math.ceil(minimum.getMinutes() / 30) * 30, 0, 0);
  start.min = localDateTimeValue(minimum);
  end.min = start.min;
  start.addEventListener("change", () => {
    end.min = start.value;
    if (end.value && end.value <= start.value) end.value = "";
  });

  document.getElementById("reservationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    const payload = {
      user_id: currentUser.id,
      email_utilizador: currentUser.email.toLowerCase(),
      espaco_id: select.value,
      inicio: new Date(start.value).toISOString(),
      fim: new Date(end.value).toISOString(),
      motivo: document.getElementById("purpose").value.trim(),
      detalhes: document.getElementById("details").value.trim() || null,
    };
    if (new Date(payload.inicio) <= new Date() || new Date(payload.fim) <= new Date(payload.inicio)) {
      showMessage("Escolha uma hora futura e uma hora de fim posterior à hora de início.");
      return;
    }
    submit.disabled = true;
    submit.textContent = "A enviar…";
    try {
      const { error } = await window.supabase.from("salaja_reservas").insert(payload);
      if (error) throw error;
      window.location.href = "minhas-reservas.html?enviado=1";
    } catch (error) {
      showMessage(error.message || "Não foi possível enviar o pedido.");
      submit.disabled = false;
      submit.textContent = "Enviar pedido";
    }
  });
}

function setupSidebar() {
  const sidebar = document.getElementById("appSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const close = () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  };
  document.getElementById("openSidebar")?.addEventListener("click", () => {
    sidebar?.classList.add("open");
    overlay?.classList.add("open");
  });
  document.getElementById("closeSidebar")?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
  document.querySelectorAll("[data-signout]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut();
    });
  });
}

async function initializeApp() {
  currentPage = document.body.dataset.page;
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("SalaJá service worker registration failed", error);
    });
  }
  if (window.supabaseReady) await window.supabaseReady;
  if (!window.supabase || typeof getCurrentSession !== "function") {
    throw new Error("Não foi possível iniciar a ligação segura ao Supabase.");
  }
  const session = await getCurrentSession();
  if (!session) {
    const returnPage = {
      spaces: "index.html",
      dashboard: "dashboard.html",
      reserve: "reserva.html",
      reservations: "minhas-reservas.html",
      admin: "admin.html",
      "gerir-espacos": "gerir-espacos.html",
    }[currentPage] || "index.html";
    const requestedSpace = currentPage === "reserve"
      ? new URLSearchParams(window.location.search).get("espaco")
      : null;
    const returnTo = requestedSpace
      ? `${returnPage}?espaco=${encodeURIComponent(requestedSpace)}`
      : returnPage;
    window.location.replace(`login.html?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }
  currentUser = session.user;
  currentProfessor = await getCurrentProfessor();
  if (!currentProfessor) {
    throw new Error("Não foi possível carregar o perfil. Confirme se a sua conta está registada na escola.");
  }
  // Mesma regra da Direção de Turma: quem ainda não mudou a password por
  // omissão é reencaminhado para lá antes de usar qualquer página aqui,
  // mesmo que tenha chegado direto (ex: atalho da PWA, não pelo login.html).
  if (currentProfessor.deve_mudar_password) {
    window.location.replace("https://antoniorappleton.github.io/direcao-turma/mudar-password.html");
    return;
  }
  if ((currentPage === "admin" || currentPage === "gerir-espacos") && currentProfessor.role !== "admin") {
    window.location.replace("dashboard.html?semPermissao=1");
    return;
  }

  setActiveNavigation();
  setupSidebar();
  if (new URLSearchParams(window.location.search).has("enviado")) {
    showMessage("Pedido enviado para validação do Admin.", "success");
  } else if (new URLSearchParams(window.location.search).has("semPermissao")) {
    showMessage("Só um Admin pode validar pedidos.");
  }

  if (currentPage === "spaces") await renderSpacesPage();
  if (currentPage === "reserve") await renderReservePage();
  if (currentPage === "reservations") await renderReservationsPage();
  if (currentPage === "dashboard") await renderDashboardPage();
  if (currentPage === "admin") await renderAdminPage();
  if (currentPage === "gerir-espacos") await renderGerirEspacosPage();
  window.lucide?.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp().catch((error) => {
    console.error("SalaJá initialization failed", error);
    showMessage(error.message || "Erro ao iniciar o SalaJá.");
  });
});
