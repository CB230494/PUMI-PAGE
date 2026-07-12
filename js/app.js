import { ApiService } from "../services/api-service.js";

const api = new ApiService();

const state = {
  user: null,
  actividades: [],
  resumen: [],
  catalogos: [],
  delegaciones: [],
  activityOptions: [],
  dashboard: null,
  regionalQueue: null,
  nationalQueue: null,
  notificaciones: [],
  mapView: null,
  reviewMapView: null,
  formMapView: null,
  formMapGraphics: null,
  formMapGraphicClass: null,
  selectedPoint: null,
  editingObjectId: null,
  currentReviewLevel: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", initialize);

/* =========================================================
   INICIO
========================================================= */

async function initialize() {
  bindEvents();

  if (api.token) {
    try {
      const session = await api.me();
      state.user = session.user;
      showMain();
      await loadData();
      return;
    } catch {
      api.setToken("");
    }
  }

  showLogin();
}

function bindEvents() {
  $("login-form")?.addEventListener("submit", login);
  $("btn-logout")?.addEventListener("click", logout);
  $("btn-refresh")?.addEventListener("click", loadData);
  $("btn-toggle-sidebar")?.addEventListener("click", toggleSidebar);
  $("btn-open-notifications")?.addEventListener("click", openNotifications);
  $("btn-close-notifications")?.addEventListener("click", closeNotifications);
  $("drawer-backdrop")?.addEventListener("click", closeNotifications);
}

/* =========================================================
   LOGIN
========================================================= */

async function login(event) {
  event.preventDefault();

  const username = $("login-username").value.trim();
  const password = $("login-password").value;
  const button = $("btn-login");
  const original = button.textContent;

  button.disabled = true;
  button.textContent = "Ingresando...";

  try {
    const result = await api.login(username, password);

    api.setToken(result.token);
    state.user = result.user;

    $("login-password").value = "";

    showMain();
    await loadData();
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function showLogin() {
  $("login-view")?.classList.remove("hidden");
  $("main-view")?.classList.add("hidden");
}

function showMain() {
  $("login-view")?.classList.add("hidden");
  $("main-view")?.classList.remove("hidden");

  const name =
    state.user?.name ||
    state.user?.username ||
    "Usuario";

  const role =
    state.user?.role ||
    "Sin rol";

  $("sidebar-user-name").textContent = name;
  $("sidebar-user-role").textContent = role;
  $("sidebar-avatar").textContent = name.charAt(0).toUpperCase();
  $("welcome-title").textContent = `Bienvenido, ${name}`;

  $("page-scope").textContent = [
    state.user?.region,
    state.user?.delegation,
    state.user?.program
  ]
    .filter(Boolean)
    .join(" · ");

  buildNavigation();
}

function logout() {
  api.setToken("");
  window.location.reload();
}

/* =========================================================
   MENÚ
========================================================= */

function toggleSidebar() {
  document.querySelector(".sidebar")?.classList.toggle("compact");
  document.querySelector(".page-shell")?.classList.toggle("compact");
}

function buildNavigation() {
  const role = normalize(state.user?.role);

  const items = [
    {
      id: "dashboard",
      label: "Panel principal",
      icon: "📊"
    }
  ];

  if (role.includes("DELEG")) {
    items.push(
      {
        id: "delegacion",
        label: "Registrar actividad",
        icon: "➕"
      },
      {
        id: "mis-registros",
        label: "Mis registros",
        icon: "📋"
      }
    );
  }

  if (
    role.includes("REGIONAL") ||
    role.includes("COORDIN") ||
    role === "NACIONAL" ||
    role.includes("ADMIN")
  ) {
    items.push({
      id: "revision",
      label: "Revisión y validación",
      icon: "✅"
    });
  }

  if (
    role === "NACIONAL" ||
    role.includes("ADMIN")
  ) {
    items.push({
      id: "nacional",
      label: "Vista nacional",
      icon: "🗺️"
    });
  }

  if (role.includes("ADMIN")) {
    items.push({
      id: "usuarios",
      label: "Usuarios",
      icon: "👥"
    });
  }

  $("sidebar-nav").innerHTML = items
    .map(
      (item, index) => `
        <button
          class="nav-item ${index === 0 ? "active" : ""}"
          data-page="${item.id}"
        >
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      navigate(
        button.dataset.page,
        button.textContent.trim()
      );
    });
  });
}

/* =========================================================
   NAVEGACIÓN
========================================================= */

function navigate(pageId, title) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  $("page-title").textContent = title;

  if (pageId === "dashboard") {
    $("dashboard-page").classList.add("active");
    renderDashboard();
    return;
  }

  $("coming-page").classList.add("active");

  if (pageId === "delegacion") {
    renderActivityForm();
    return;
  }

  if (pageId === "mis-registros") {
    renderMyRecords();
    return;
  }

  if (pageId === "revision") {
    renderReviewModule();
    return;
  }

  renderComing(title);
}

function renderComing(title) {
  $("coming-page").innerHTML = `
    <article class="panel-card empty-state">
      <div class="empty-icon">🛠️</div>
      <h2>${escapeHtml(title)}</h2>
      <p>Este módulo será activado en la siguiente etapa.</p>
    </article>
  `;
}

/* =========================================================
   CARGA DE DATOS
========================================================= */

async function loadData() {
  try {
    const role = normalize(state.user?.role);

    const [
      activities,
      summary,
      catalogs,
      delegations,
      activityOptions,
      dashboard
    ] = await Promise.all([
      api.getActivities(),
      api.getSummary(),
      api.getCatalogs(),
      api.getDelegations(),
      api.getActivityOptions(),
      api.getDashboard()
    ]);

    state.actividades = activities.features || [];
    state.resumen = summary.features || [];
    state.catalogos = catalogs.features || [];
    state.delegaciones = delegations.features || [];
    state.activityOptions = activityOptions.options || [];
    state.dashboard = dashboard || null;

    state.regionalQueue = null;
    state.nationalQueue = null;

    if (
      role.includes("REGIONAL") ||
      role.includes("ADMIN")
    ) {
      state.regionalQueue = await api.getRegionalReviewQueue();
    }

    if (
      role.includes("COORDIN") ||
      role === "NACIONAL" ||
      role.includes("ADMIN")
    ) {
      state.nationalQueue = await api.getNationalReviewQueue();
    }

    state.notificaciones = createDerivedNotifications();

    renderDashboard();
    renderNotifications();

    showToast("Información actualizada.");
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   DATOS
========================================================= */

function getRows() {
  return state.actividades.map((feature) => ({
    ...(feature.attributes || {}),
    __geometry: feature.geometry || null
  }));
}

function getCatalogRows() {
  return state.catalogos.map(
    (feature) => feature.attributes || {}
  );
}

function getCatalogValues(type) {
  const normalizedType = normalize(type);

  return [
    ...new Set(
      getCatalogRows()
        .filter(
          (row) =>
            normalize(row.tipo_catalogo) === normalizedType
        )
        .map((row) =>
          String(
            row.descripcion ||
            row.codigo ||
            ""
          ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "es"));
}

function isHistorical(row) {
  return String(row.archivo_origen || "").trim() !== "";
}

function getObjectId(row) {
  return Number(row.OBJECTID);
}

function getCurrentRole() {
  return normalize(state.user?.role);
}

function isDelegationRole() {
  return getCurrentRole().includes("DELEG");
}

function isRegionalRole() {
  return (
    getCurrentRole().includes("REGIONAL") ||
    getCurrentRole().includes("ADMIN")
  );
}

function isNationalCoordinatorRole() {
  return getCurrentRole().includes("COORDIN");
}

function workflowLabel(row) {
  if (isHistorical(row)) {
    return "Revisado";
  }

  const regional = normalize(row.estado_regional);
  const national = normalize(row.estado_nacional);

  if (
    national.includes("VALIDAD") ||
    national.includes("APROB")
  ) {
    return "Validado nacional";
  }

  if (
    national.includes("OBSERV") ||
    national.includes("RECHAZ")
  ) {
    return "Observado nacional";
  }

  if (
    regional.includes("DEVUEL") ||
    regional.includes("OBSERV")
  ) {
    return "Devuelto regional";
  }

  if (
    regional.includes("REVISAD") ||
    regional.includes("VERIFIC") ||
    regional.includes("APROB")
  ) {
    return "Pendiente nacional";
  }

  return "Pendiente regional";
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  if (isDelegationRole()) {
    renderDelegationDashboard();
    return;
  }

  renderConsolidatedDashboard();
}

function renderDelegationDashboard() {
  toggleBreakdownPanel(true);

  renderKpisFromLocal();
  renderProgramSummaryFromLocal();
  renderActivityBreakdownFromLocal();
  renderStatusSummaryFromLocal();
  renderMap(state.actividades);

  renderDelegationOverview([]);
}

function renderConsolidatedDashboard() {
  toggleBreakdownPanel(false);

  const dashboard = state.dashboard || {};

  renderKpisFromDashboard(dashboard.kpis || {});
  renderProgramSummaryFromDashboard(dashboard.programs || []);
  renderStatusSummaryFromDashboard(dashboard.statuses || {});
  renderDelegationOverview(dashboard.delegations || []);
  renderMap(
    dashboard.map_features ||
    state.actividades
  );
}

function getBreakdownPanel() {
  let panel = $("activity-breakdown-panel");

  if (panel) {
    return panel;
  }

  const mapPanel =
    $("dashboard-map")?.closest(".panel-card");

  if (!mapPanel) {
    return null;
  }

  panel = document.createElement("article");
  panel.id = "activity-breakdown-panel";
  panel.className = "panel-card hidden";

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">
          Cumplimiento
        </span>

        <h3>
          Desglose por actividad
        </h3>
      </div>
    </div>

    <div id="activity-summary"></div>
  `;

  mapPanel.insertAdjacentElement(
    "beforebegin",
    panel
  );

  return panel;
}

function toggleBreakdownPanel(visible) {
  const panel = getBreakdownPanel();

  if (!panel) {
    return;
  }

  panel.classList.toggle(
    "hidden",
    !visible
  );
}

function renderKpisFromDashboard(kpis) {
  renderKpiCards([
    ["Registros", numberValue(kpis.registros)],
    ["Meta", numberValue(kpis.meta)],
    ["Avance", numberValue(kpis.avance)],
    ["Pendiente", numberValue(kpis.pendiente)],
    [
      "% avance",
      `${numberValue(
        kpis.porcentaje_avance
      ).toFixed(1)}%`
    ],
    ["Participantes", numberValue(kpis.participantes)]
  ]);
}

function renderKpisFromLocal() {
  const rows = getRows();
  const progress = buildProgressRows();

  const meta = sumBy(progress, "meta");
  const advance = sumBy(progress, "advance");
  const pending = Math.max(meta - advance, 0);

  const percentage =
    meta > 0
      ? (advance / meta) * 100
      : 0;

  const participants = rows.reduce(
    (total, row) =>
      total +
      numberValue(
        row.cantidad_participantes
      ),
    0
  );

  renderKpiCards([
    ["Registros", rows.length],
    ["Meta", meta],
    ["Avance", advance],
    ["Pendiente", pending],
    ["% avance", `${percentage.toFixed(1)}%`],
    ["Participantes", participants]
  ]);
}

function renderKpiCards(values) {
  $("dashboard-kpis").innerHTML = values
    .map(
      ([label, value]) => `
        <article class="kpi-card">
          <span>${escapeHtml(label)}</span>
          <strong>${formatNumber(value)}</strong>
        </article>
      `
    )
    .join("");
}

function buildProgressRows(rows = getRows()) {
  const grouped = new Map();

  for (const row of rows) {
    const program =
      String(row.programa || "").trim();

    const activity =
      String(row.actividad || "").trim();

    if (!program || !activity) {
      continue;
    }

    if (
      normalize(program) === "PROGRAMA" ||
      normalize(activity) === "ACTIVIDAD"
    ) {
      continue;
    }

    const key =
      `${normalize(program)}|||${normalize(activity)}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        program,
        activity,
        meta: 0,
        advance: 0
      });
    }

    const item = grouped.get(key);

    if (isHistorical(row)) {
      item.meta += numberValue(row.meta);
      item.advance += numberValue(row.avance);
    } else if (isNationalApproved(row)) {
      item.advance += numberValue(
        row.avance_realizado
      );
    }
  }

  return [...grouped.values()].map((item) => {
    const pending = Math.max(
      item.meta - item.advance,
      0
    );

    const percentage =
      item.meta > 0
        ? (item.advance / item.meta) * 100
        : 0;

    return {
      ...item,
      pending,
      percentage
    };
  });
}

function renderProgramSummaryFromLocal() {
  const grouped = {};

  for (const row of buildProgressRows()) {
    if (!grouped[row.program]) {
      grouped[row.program] = {
        meta: 0,
        advance: 0
      };
    }

    grouped[row.program].meta += row.meta;
    grouped[row.program].advance += row.advance;
  }

  const programs = Object.entries(grouped)
    .map(([program, data]) => {
      const pending = Math.max(
        data.meta - data.advance,
        0
      );

      const percentage =
        data.meta > 0
          ? (data.advance / data.meta) * 100
          : 0;

      return {
        programa: program,
        meta: data.meta,
        avance: data.advance,
        pendiente: pending,
        porcentaje: percentage
      };
    })
    .sort(
      (a, b) =>
        b.porcentaje - a.porcentaje
    );

  renderProgramSummaryFromDashboard(
    programs
  );
}

function renderProgramSummaryFromDashboard(programs) {
  $("program-summary").innerHTML =
    programs.length
      ? programs
          .map(
            (item) => `
              <div class="program-progress-row">
                <div
                  class="program-progress-name"
                  title="${escapeHtml(item.programa)}"
                >
                  ${escapeHtml(item.programa)}
                </div>

                <div class="program-progress-center">
                  <div class="program-progress-track">
                    <div
                      class="program-progress-fill"
                      style="width:${Math.min(
                        numberValue(item.porcentaje),
                        100
                      )}%"
                    ></div>
                  </div>

                  <div class="program-progress-detail">
                    Meta:
                    <strong>${formatNumber(item.meta)}</strong>
                    · Avance:
                    <strong>${formatNumber(item.avance)}</strong>
                    · Pendiente:
                    <strong>${formatNumber(item.pendiente)}</strong>
                  </div>
                </div>

                <div class="program-progress-percentage">
                  ${numberValue(item.porcentaje).toFixed(1)}%
                </div>
              </div>
            `
          )
          .join("")
      : `
          <p class="page-scope">
            No hay datos disponibles.
          </p>
        `;
}

function renderActivityBreakdownFromLocal() {
  const rows = buildProgressRows()
    .sort((a, b) => {
      const programComparison =
        a.program.localeCompare(
          b.program,
          "es"
        );

      if (programComparison !== 0) {
        return programComparison;
      }

      return a.activity.localeCompare(
        b.activity,
        "es"
      );
    })
    .map((row) => ({
      programa: row.program,
      actividad: row.activity,
      meta: row.meta,
      avance: row.advance,
      pendiente: row.pending,
      porcentaje: row.percentage
    }));

  renderActivityBreakdownTable(rows);
}

function renderActivityBreakdownTable(rows) {
  const container = $("activity-summary");

  if (!container) {
    return;
  }

  container.innerHTML = rows.length
    ? `
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Actividad</th>
                <th>Meta</th>
                <th>Avance</th>
                <th>Pendiente</th>
                <th>% avance</th>
              </tr>
            </thead>

            <tbody>
              ${rows
                .map(
                  (row) => `
                    <tr>
                      <td>
                        <strong>
                          ${escapeHtml(row.programa)}
                        </strong>
                      </td>

                      <td>
                        ${escapeHtml(row.actividad)}
                      </td>

                      <td>
                        ${formatNumber(row.meta)}
                      </td>

                      <td>
                        ${formatNumber(row.avance)}
                      </td>

                      <td>
                        ${formatNumber(row.pendiente)}
                      </td>

                      <td>
                        <strong>
                          ${numberValue(row.porcentaje).toFixed(1)}%
                        </strong>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
    : `
        <div class="module-empty">
          No hay actividades disponibles.
        </div>
      `;
}

function renderStatusSummaryFromLocal() {
  const grouped = {};

  for (const row of getRows()) {
    const status = workflowLabel(row);

    grouped[status] =
      (grouped[status] || 0) + 1;
  }

  renderStatusSummaryFromDashboard(grouped);
}

function renderStatusSummaryFromDashboard(statuses) {
  renderSimpleBars(
    "status-summary",
    Object.entries(statuses)
  );
}

function renderSimpleBars(id, values) {
  const container = $(id);

  if (!container) {
    return;
  }

  const max = Math.max(
    1,
    ...values.map(
      (item) =>
        numberValue(item[1])
    )
  );

  container.innerHTML = values.length
    ? values
        .map(
          ([label, value]) => `
            <div class="bar-row">
              <span class="bar-label">
                ${escapeHtml(label)}
              </span>

              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width:${
                    (
                      numberValue(value) /
                      max
                    ) * 100
                  }%"
                ></div>
              </div>

              <strong>
                ${formatNumber(value)}
              </strong>
            </div>
          `
        )
        .join("")
    : `
        <p class="page-scope">
          No hay datos disponibles.
        </p>
      `;
}

function renderDelegationOverview(delegations) {
  let panel = $("delegation-overview-panel");

  if (isDelegationRole()) {
    panel?.remove();
    return;
  }

  const mapPanel =
    $("dashboard-map")?.closest(".panel-card");

  if (!mapPanel) {
    return;
  }

  if (!panel) {
    panel = document.createElement("article");
    panel.id = "delegation-overview-panel";
    panel.className = "panel-card";

    mapPanel.insertAdjacentElement(
      "beforebegin",
      panel
    );
  }

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">
          Ámbito
        </span>

        <h3>
          ${
            isNationalCoordinatorRole()
              ? "Delegaciones del programa"
              : "Delegaciones de la región"
          }
        </h3>
      </div>
    </div>

    <div class="delegation-summary-grid">
      ${delegations
        .map(
          (item) => `
            <button
              type="button"
              class="delegation-summary-card"
              data-dashboard-delegation="${escapeHtml(
                item.delegacion
              )}"
            >
              <strong>
                ${escapeHtml(item.delegacion)}
              </strong>

              <span>
                Registros:
                ${formatNumber(item.registros)}
              </span>

              <span>
                Pendiente regional:
                ${formatNumber(item.pendientes_regional)}
              </span>

              <span>
                Pendiente nacional:
                ${formatNumber(item.pendientes_nacional)}
              </span>

              <span>
                Validados:
                ${formatNumber(item.validados)}
              </span>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  panel
    .querySelectorAll(
      "[data-dashboard-delegation]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          await loadDelegationBreakdown(
            button.dataset.dashboardDelegation
          );
        }
      );
    });
}

async function loadDelegationBreakdown(delegation) {
  try {
    const dashboard =
      await api.getDashboard(delegation);

    toggleBreakdownPanel(true);

    renderActivityBreakdownTable(
      dashboard.activity_breakdown || []
    );

    $("activity-breakdown-panel")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   REGISTRAR ACTIVIDAD
========================================================= */

function renderActivityForm(editingRow = null) {
  state.editingObjectId = editingRow
    ? getObjectId(editingRow)
    : null;

  state.selectedPoint = null;

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Delegación
          </span>

          <h2>
            ${
              editingRow
                ? "Editar actividad"
                : "Registrar actividad"
            }
          </h2>
        </div>
      </div>

      <form
        id="activity-form"
        class="module-form"
      >
        <div class="form-grid">
          <label>
            Programa
            <select
              id="activity-program"
              required
            ></select>
          </label>

          <label>
            Actividad
            <select
              id="activity-name"
              required
            ></select>
          </label>
        </div>

        <div
          id="activity-progress-card"
          class="progress-info-card"
        ></div>

        <div class="form-grid">
          <label>
            Fecha de actividad
            <input
              id="activity-date"
              type="date"
              required
            >
          </label>

          <label>
            Hora
            <input
              id="activity-time"
              type="time"
            >
          </label>

          <label>
            Avance realizado
            <input
              id="activity-advance"
              type="number"
              min="1"
              step="1"
              required
            >
          </label>

          <label>
            Responsable
            <input
              id="activity-responsible"
              type="text"
              required
            >
          </label>
        </div>

        <div class="form-section-title">
          Participantes
        </div>

        <div class="form-grid">
          <label>
            Hombres
            <input
              id="activity-men"
              type="number"
              min="0"
              value="0"
            >
          </label>

          <label>
            Mujeres
            <input
              id="activity-women"
              type="number"
              min="0"
              value="0"
            >
          </label>

          <label>
            Edad 10-18
            <input
              id="activity-age-10-18"
              type="number"
              min="0"
              value="0"
            >
          </label>

          <label>
            Edad 19-30
            <input
              id="activity-age-19-30"
              type="number"
              min="0"
              value="0"
            >
          </label>

          <label>
            Edad 31-45
            <input
              id="activity-age-31-45"
              type="number"
              min="0"
              value="0"
            >
          </label>

          <label>
            Edad 46 o más
            <input
              id="activity-age-46"
              type="number"
              min="0"
              value="0"
            >
          </label>
        </div>

        <div class="form-section-title">
          Ubicación
        </div>

        <div class="form-grid">
          <label>
            Provincia
            <select
              id="activity-province"
              required
            ></select>
          </label>

          <label>
            Cantón
            <select
              id="activity-canton"
              required
            ></select>
          </label>

          <label>
            Distrito
            <select
              id="activity-district"
              required
            ></select>
          </label>

          <label>
            Tipo de lugar
            <input
              id="activity-place-type"
              type="text"
            >
          </label>

          <label>
            Lugar
            <input
              id="activity-place"
              type="text"
            >
          </label>

          <label>
            Centro educativo
            <input
              id="activity-school"
              type="text"
            >
          </label>
        </div>

        <div class="map-toolbar">
          <button
            id="btn-use-gps"
            type="button"
            class="btn btn-secondary"
          >
            📍 Usar mi GPS
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="streets-navigation-vector"
          >
            Calles
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="satellite"
          >
            Satélite
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="topo-vector"
          >
            Topográfico
          </button>
        </div>

        <div
          id="activity-map"
          class="form-map"
        ></div>

        <div
          id="coordinates-info"
          class="coordinates-info"
        >
          Marque un punto en el mapa o utilice GPS.
        </div>

        <div class="form-grid">
          <label>
            Instituciones
            <input
              id="activity-institutions"
              type="text"
            >
          </label>

          <label>
            Número de referencia
            <input
              id="activity-reference"
              type="text"
            >
          </label>

          <label>
            Número de expediente
            <input
              id="activity-file"
              type="text"
            >
          </label>
        </div>

        <label>
          Observaciones
          <textarea
            id="activity-observations"
            rows="4"
          ></textarea>
        </label>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
          >
            ${
              editingRow
                ? "Guardar cambios"
                : "Enviar a revisión regional"
            }
          </button>
        </div>
      </form>
    </article>
  `;

  setupActivityForm(editingRow);
}

function setupActivityForm(editingRow) {
  const programSelect =
    $("activity-program");

  const activitySelect =
    $("activity-name");

  const programs = [
    ...new Set(
      state.activityOptions
        .map((item) => item.programa)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  fillSelect(
    programSelect,
    programs,
    false,
    "Seleccione un programa"
  );

  function updateActivities() {
    const program =
      programSelect.value;

    const options =
      state.activityOptions.filter(
        (item) =>
          normalize(item.programa) ===
          normalize(program)
      );

    fillSelect(
      activitySelect,
      options.map(
        (item) => item.actividad
      ),
      false,
      "Seleccione una actividad"
    );

    updateProgressCard();
  }

  function updateProgressCard() {
    const option =
      getSelectedActivityOption();

    const card =
      $("activity-progress-card");

    if (!option) {
      card.innerHTML = "";
      $("activity-advance")
        .removeAttribute("max");
      return;
    }

    card.innerHTML = `
      <div>
        <span>Meta</span>
        <strong>${formatNumber(option.meta)}</strong>
      </div>

      <div>
        <span>Avance validado</span>
        <strong>
          ${formatNumber(option.avance_validado)}
        </strong>
      </div>

      <div>
        <span>En revisión</span>
        <strong>
          ${formatNumber(option.avance_en_revision)}
        </strong>
      </div>

      <div>
        <span>Disponible</span>
        <strong>
          ${formatNumber(option.disponible_registro)}
        </strong>
      </div>
    `;

    $("activity-advance").max =
      option.disponible_registro;

    if (
      option.disponible_registro <= 0 &&
      !state.editingObjectId
    ) {
      $("activity-advance").value = "";
      $("activity-advance").disabled = true;
    } else {
      $("activity-advance").disabled = false;
    }
  }

  programSelect.addEventListener(
    "change",
    updateActivities
  );

  activitySelect.addEventListener(
    "change",
    updateProgressCard
  );

  setupLocationSelectors();
  setupFormMap();

  $("btn-use-gps").addEventListener(
    "click",
    useGps
  );

  document
    .querySelectorAll("[data-basemap]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          if (state.formMapView) {
            state.formMapView.map.basemap =
              button.dataset.basemap;
          }
        }
      );
    });

  if (editingRow) {
    fillActivityForm(editingRow);
  } else {
    updateActivities();
  }

  $("activity-form").addEventListener(
    "submit",
    submitActivity
  );
}

function getSelectedActivityOption() {
  return state.activityOptions.find(
    (item) =>
      normalize(item.programa) ===
        normalize(
          $("activity-program")?.value
        ) &&
      normalize(item.actividad) ===
        normalize(
          $("activity-name")?.value
        )
  );
}

function setupLocationSelectors() {
  const province =
    $("activity-province");

  const canton =
    $("activity-canton");

  const district =
    $("activity-district");

  fillSelect(
    province,
    getCatalogValues("PROVINCIA"),
    false,
    "Seleccione una provincia"
  );

  fillSelect(
    canton,
    getCatalogValues("CANTON"),
    false,
    "Seleccione un cantón"
  );

  fillSelect(
    district,
    getCatalogValues("DISTRITO"),
    false,
    "Seleccione un distrito"
  );
}

function fillActivityForm(row) {
  setSelectValue(
    $("activity-program"),
    row.programa
  );

  $("activity-program").dispatchEvent(
    new Event("change")
  );

  setSelectValue(
    $("activity-name"),
    row.actividad
  );

  $("activity-name").dispatchEvent(
    new Event("change")
  );

  $("activity-date").value =
    dateInputValue(row.fecha_actividad);

  $("activity-time").value =
    row.hora_actividad || "";

  $("activity-advance").disabled = false;
  $("activity-advance").value =
    row.avance_realizado || 0;

  $("activity-responsible").value =
    row.responsable || "";

  $("activity-men").value =
    row.cantidad_hombres || 0;

  $("activity-women").value =
    row.cantidad_mujeres || 0;

  $("activity-age-10-18").value =
    row.edad_10_18 || 0;

  $("activity-age-19-30").value =
    row.edad_19_30 || 0;

  $("activity-age-31-45").value =
    row.edad_31_45 || 0;

  $("activity-age-46").value =
    row.edad_46_mas || 0;

  setSelectValue(
    $("activity-province"),
    row.provincia
  );

  setSelectValue(
    $("activity-canton"),
    row.canton
  );

  setSelectValue(
    $("activity-district"),
    row.distrito
  );

  $("activity-place-type").value =
    row.tipo_lugar || "";

  $("activity-place").value =
    row.lugar || "";

  $("activity-school").value =
    row.centro_educativo || "";

  $("activity-institutions").value =
    row.instituciones || "";

  $("activity-reference").value =
    row.numero_referencia || "";

  $("activity-file").value =
    row.numero_expediente || "";

  $("activity-observations").value =
    row.observaciones || "";

  const latitude =
    numberOrNull(row.latitud);

  const longitude =
    numberOrNull(row.longitud);

  if (
    latitude !== null &&
    longitude !== null
  ) {
    setSelectedPoint(
      longitude,
      latitude
    );

    state.formMapView
      ?.goTo({
        center: [
          longitude,
          latitude
        ],
        zoom: 16
      })
      .catch(() => {});
  }
}

async function submitActivity(event) {
  event.preventDefault();

  try {
    const selectedOption =
      getSelectedActivityOption();

    if (!selectedOption) {
      throw new Error(
        "Debe seleccionar una actividad válida."
      );
    }

    const quantity =
      numberValue(
        $("activity-advance").value
      );

    if (quantity <= 0) {
      throw new Error(
        "El avance realizado debe ser mayor a cero."
      );
    }

    if (
      !state.editingObjectId &&
      quantity >
        selectedOption.disponible_registro
    ) {
      throw new Error(
        `Solo puede registrar ${selectedOption.disponible_registro} como máximo para esta actividad.`
      );
    }

    const men =
      numberValue(
        $("activity-men").value
      );

    const women =
      numberValue(
        $("activity-women").value
      );

    const attributes = {
      programa:
        $("activity-program").value,

      actividad:
        $("activity-name").value,

      fecha_actividad:
        new Date(
          `${$("activity-date").value}T12:00:00`
        ).getTime(),

      hora_actividad:
        $("activity-time").value,

      avance_realizado:
        quantity,

      responsable:
        $("activity-responsible").value,

      cantidad_hombres:
        men,

      cantidad_mujeres:
        women,

      cantidad_participantes:
        men + women,

      edad_10_18:
        numberValue(
          $("activity-age-10-18").value
        ),

      edad_19_30:
        numberValue(
          $("activity-age-19-30").value
        ),

      edad_31_45:
        numberValue(
          $("activity-age-31-45").value
        ),

      edad_46_mas:
        numberValue(
          $("activity-age-46").value
        ),

      provincia:
        $("activity-province").value,

      canton:
        $("activity-canton").value,

      distrito:
        $("activity-district").value,

      tipo_lugar:
        $("activity-place-type").value,

      lugar:
        $("activity-place").value,

      centro_educativo:
        $("activity-school").value,

      instituciones:
        $("activity-institutions").value,

      numero_referencia:
        $("activity-reference").value,

      numero_expediente:
        $("activity-file").value,

      observaciones:
        $("activity-observations").value,

      latitud:
        state.selectedPoint?.latitude ??
        null,

      longitud:
        state.selectedPoint?.longitude ??
        null
    };

    if (state.editingObjectId) {
      await api.updateActivity(
        state.editingObjectId,
        attributes
      );

      showToast(
        "Actividad actualizada."
      );
    } else {
      await api.createActivity(
        attributes,

        state.selectedPoint
          ? {
              x:
                state.selectedPoint.longitude,

              y:
                state.selectedPoint.latitude,

              spatialReference: {
                wkid: 4326
              }
            }
          : null
      );

      showToast(
        "Actividad enviada a revisión regional."
      );
    }

    state.editingObjectId = null;
    state.selectedPoint = null;

    await loadData();

    renderMyRecords();
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   MAPA FORMULARIO
========================================================= */

function setupFormMap() {
  if (state.formMapView) {
    state.formMapView.destroy();
    state.formMapView = null;
  }

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/layers/GraphicsLayer"
    ],
    (
      Map,
      MapView,
      Graphic,
      GraphicsLayer
    ) => {
      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      const graphics =
        new GraphicsLayer();

      map.add(graphics);

      const view = new MapView({
        container: "activity-map",
        map,
        center: [-84.1, 9.95],
        zoom: 8
      });

      state.formMapView = view;
      state.formMapGraphics = graphics;
      state.formMapGraphicClass = Graphic;

      view.on("click", (event) => {
        const longitude =
          numberOrNull(
            event.mapPoint?.longitude
          );

        const latitude =
          numberOrNull(
            event.mapPoint?.latitude
          );

        if (
          longitude === null ||
          latitude === null
        ) {
          return;
        }

        setSelectedPoint(
          longitude,
          latitude
        );
      });
    }
  );
}

function setSelectedPoint(
  longitude,
  latitude
) {
  const validLongitude =
    numberOrNull(longitude);

  const validLatitude =
    numberOrNull(latitude);

  if (
    validLongitude === null ||
    validLatitude === null
  ) {
    return;
  }

  state.selectedPoint = {
    longitude: validLongitude,
    latitude: validLatitude
  };

  const graphics =
    state.formMapGraphics;

  const Graphic =
    state.formMapGraphicClass;

  if (
    graphics &&
    Graphic
  ) {
    graphics.removeAll();

    graphics.add(
      new Graphic({
        geometry: {
          type: "point",
          longitude: validLongitude,
          latitude: validLatitude,
          spatialReference: {
            wkid: 4326
          }
        },

        symbol: {
          type: "simple-marker",
          style: "diamond",
          size: 18,
          color: [0, 43, 127],

          outline: {
            color: [255, 255, 255],
            width: 2
          }
        }
      })
    );
  }

  if ($("coordinates-info")) {
    $("coordinates-info").textContent =
      `Latitud: ${validLatitude.toFixed(6)} · Longitud: ${validLongitude.toFixed(6)}`;
  }
}

function useGps() {
  if (!navigator.geolocation) {
    showToast(
      "El dispositivo no permite GPS.",
      true
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const longitude =
        position.coords.longitude;

      const latitude =
        position.coords.latitude;

      setSelectedPoint(
        longitude,
        latitude
      );

      state.formMapView
        ?.goTo({
          center: [
            longitude,
            latitude
          ],
          zoom: 16
        })
        .catch(() => {});
    },

    (error) => {
      showToast(
        `No fue posible obtener GPS: ${error.message}`,
        true
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 15000
    }
  );
}

/* =========================================================
   MIS REGISTROS
========================================================= */

function renderMyRecords() {
  const username = normalize(
    state.user?.username
  );

  const rows = getRows().filter(
    (row) =>
      !isHistorical(row) &&
      normalize(row.usuario_registra) ===
        username
  );

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Delegación
          </span>

          <h2>
            Mis registros
          </h2>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Programa</th>
              <th>Actividad</th>
              <th>Avance</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>
                      ${formatDate(
                        row.fecha_actividad
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        row.programa
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        row.actividad
                      )}
                    </td>

                    <td>
                      ${formatNumber(
                        row.avance_realizado
                      )}
                    </td>

                    <td>
                      <span class="status-badge">
                        ${escapeHtml(
                          workflowLabel(row)
                        )}
                      </span>
                    </td>

                    <td>
                      <div class="table-actions">
                        <button
                          class="btn btn-secondary btn-small"
                          data-view-record="${getObjectId(row)}"
                        >
                          Ver
                        </button>

                        <button
                          class="btn btn-secondary btn-small"
                          data-edit-record="${getObjectId(row)}"
                        >
                          Editar
                        </button>

                        <button
                          class="btn btn-danger btn-small"
                          data-delete-record="${getObjectId(row)}"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;

  document
    .querySelectorAll("[data-view-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const objectId = Number(
            button.dataset.viewRecord
          );

          const row = rows.find(
            (item) =>
              getObjectId(item) === objectId
          );

          if (row) {
            openActivityDetail(row);
          }
        }
      );
    });

  document
    .querySelectorAll("[data-edit-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const objectId = Number(
            button.dataset.editRecord
          );

          const row = rows.find(
            (item) =>
              getObjectId(item) === objectId
          );

          if (row) {
            renderActivityForm(row);
          }
        }
      );
    });

  document
    .querySelectorAll("[data-delete-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const objectId = Number(
            button.dataset.deleteRecord
          );

          if (
            !window.confirm(
              "¿Desea eliminar este registro?"
            )
          ) {
            return;
          }

          try {
            await api.deleteActivity(
              objectId
            );

            await loadData();
            renderMyRecords();

            showToast(
              "Registro eliminado."
            );
          } catch (error) {
            showToast(
              error.message,
              true
            );
          }
        }
      );
    });
}

function openActivityDetail(row) {
  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Detalle del registro
          </span>

          <h2>
            ${escapeHtml(
              row.delegacion ||
              "Actividad"
            )}
          </h2>
        </div>

        <button
          id="btn-detail-back"
          class="btn btn-secondary"
          type="button"
        >
          ← Volver
        </button>
      </div>

      ${renderActivityDataSections(row)}
    </article>
  `;

  $("btn-detail-back").addEventListener(
    "click",
    renderMyRecords
  );
}

function renderActivityDataSections(row) {
  return `
    ${buildDetailSection(
      "Actividad",
      [
        ["Programa", row.programa],
        ["Actividad", row.actividad],
        [
          "Fecha",
          formatDate(
            row.fecha_actividad
          )
        ],
        ["Hora", row.hora_actividad],
        [
          "Avance realizado",
          formatNumber(
            row.avance_realizado
          )
        ],
        ["Responsable", row.responsable]
      ]
    )}

    ${buildDetailSection(
      "Participantes",
      [
        [
          "Total",
          formatNumber(
            row.cantidad_participantes
          )
        ],
        [
          "Hombres",
          formatNumber(
            row.cantidad_hombres
          )
        ],
        [
          "Mujeres",
          formatNumber(
            row.cantidad_mujeres
          )
        ],
        [
          "Edad 10-18",
          formatNumber(
            row.edad_10_18
          )
        ],
        [
          "Edad 19-30",
          formatNumber(
            row.edad_19_30
          )
        ],
        [
          "Edad 31-45",
          formatNumber(
            row.edad_31_45
          )
        ],
        [
          "Edad 46 o más",
          formatNumber(
            row.edad_46_mas
          )
        ]
      ]
    )}

    ${buildDetailSection(
      "Ubicación",
      [
        ["Provincia", row.provincia],
        ["Cantón", row.canton],
        ["Distrito", row.distrito],
        ["Tipo de lugar", row.tipo_lugar],
        ["Lugar", row.lugar],
        [
          "Centro educativo",
          row.centro_educativo
        ]
      ]
    )}

    ${buildDetailSection(
      "Información complementaria",
      [
        ["Instituciones", row.instituciones],
        [
          "Número de referencia",
          row.numero_referencia
        ],
        [
          "Número de expediente",
          row.numero_expediente
        ],
        ["Observaciones", row.observaciones]
      ]
    )}

    ${
      row.observacion_regional
        ? buildDetailSection(
            "Valoración Regional",
            [
              [
                "Coordinador Regional",
                row.coordinador_regional
              ],
              [
                "Fecha de revisión",
                formatDateTime(
                  row.fecha_revision_regional
                )
              ],
              [
                "Observación Regional",
                row.observacion_regional
              ]
            ]
          )
        : ""
    }

    ${
      row.observacion_nacional
        ? buildDetailSection(
            "Valoración Nacional",
            [
              [
                "Coordinador Nacional",
                row.coordinador_nacional
              ],
              [
                "Fecha de revisión",
                formatDateTime(
                  row.fecha_revision_nacional
                )
              ],
              [
                "Observación Nacional",
                row.observacion_nacional
              ]
            ]
          )
        : ""
    }
  `;
}

function buildDetailSection(
  title,
  fields
) {
  return `
    <section class="record-detail-section">
      <div class="form-section-title">
        ${escapeHtml(title)}
      </div>

      <div class="record-detail-grid">
        ${fields
          .map(
            ([label, value]) => `
              <div class="record-detail-item">
                <span>
                  ${escapeHtml(label)}
                </span>

                <strong>
                  ${escapeHtml(
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                      ? "Sin dato"
                      : value
                  )}
                </strong>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

/* =========================================================
   REVISIÓN REGIONAL / NACIONAL
========================================================= */

function renderReviewModule() {
  const role = getCurrentRole();

  if (
    role.includes("REGIONAL") ||
    role.includes("ADMIN")
  ) {
    state.currentReviewLevel = "REGIONAL";

    renderReviewQueue(
      state.regionalQueue,
      "Dirección Regional",
      "Revisión de actividades"
    );

    return;
  }

  if (
    role.includes("COORDIN") ||
    role === "NACIONAL"
  ) {
    state.currentReviewLevel = "NACIONAL";

    renderReviewQueue(
      state.nationalQueue,
      "Coordinación Nacional",
      "Validación de actividades"
    );

    return;
  }

  renderComing(
    "Revisión y validación"
  );
}

function renderReviewQueue(
  queue,
  kicker,
  title
) {
  const features =
    queue?.features || [];

  const rows = features.map(
    (feature) => ({
      ...(feature.attributes || {}),

      __geometry:
        feature.geometry || null,

      __workflow:
        feature.workflow_status ||
        workflowLabel(
          feature.attributes || {}
        )
    })
  );

  const delegations = [
    ...new Set(
      rows
        .map((row) => row.delegacion)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const programs = [
    ...new Set(
      rows
        .map((row) => row.programa)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const activities = [
    ...new Set(
      rows
        .map((row) => row.actividad)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            ${escapeHtml(kicker)}
          </span>

          <h2>
            ${escapeHtml(title)}
          </h2>

          ${
            queue?.program
              ? `
                  <p class="page-scope">
                    Programa:
                    ${escapeHtml(queue.program)}
                  </p>
                `
              : ""
          }
        </div>

        <div class="review-counter">
          <span>Pendientes</span>

          <strong>
            ${formatNumber(
              queue?.pending_count || 0
            )}
          </strong>
        </div>
      </div>

      <div class="filter-grid">
        <label>
          Delegación
          <select
            id="review-filter-delegation"
          ></select>
        </label>

        <label>
          Programa
          <select
            id="review-filter-program"
          ></select>
        </label>

        <label>
          Actividad
          <select
            id="review-filter-activity"
          ></select>
        </label>

        <label>
          Estado
          <select
            id="review-filter-status"
          >
            <option value="">
              Todos
            </option>

            ${[
              ...new Set(
                rows.map(
                  (row) =>
                    row.__workflow
                )
              )
            ]
              .sort()
              .map(
                (status) => `
                  <option
                    value="${escapeHtml(status)}"
                  >
                    ${escapeHtml(status)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>
      </div>

      <div id="review-records"></div>
    </article>
  `;

  fillSelect(
    $("review-filter-delegation"),
    delegations,
    true
  );

  fillSelect(
    $("review-filter-program"),
    programs,
    true
  );

  fillSelect(
    $("review-filter-activity"),
    activities,
    true
  );

  const render =
    () =>
      renderReviewRecords(rows);

  [
    "review-filter-delegation",
    "review-filter-program",
    "review-filter-activity",
    "review-filter-status"
  ].forEach((id) => {
    $(id)?.addEventListener(
      "change",
      render
    );
  });

  render();
}

function renderReviewRecords(sourceRows) {
  const delegation =
    $("review-filter-delegation")
      ?.value || "";

  const program =
    $("review-filter-program")
      ?.value || "";

  const activity =
    $("review-filter-activity")
      ?.value || "";

  const status =
    $("review-filter-status")
      ?.value || "";

  const rows = sourceRows.filter(
    (row) => {
      if (
        delegation &&
        row.delegacion !== delegation
      ) {
        return false;
      }

      if (
        program &&
        row.programa !== program
      ) {
        return false;
      }

      if (
        activity &&
        row.actividad !== activity
      ) {
        return false;
      }

      if (
        status &&
        row.__workflow !== status
      ) {
        return false;
      }

      return true;
    }
  );

  $("review-records").innerHTML =
    rows.length
      ? `
          <div class="review-list">
            ${rows
              .map(
                (row) => `
                  <article class="review-compact-card">
                    <div>
                      <span class="status-badge">
                        ${escapeHtml(
                          row.__workflow
                        )}
                      </span>

                      <h3>
                        ${escapeHtml(
                          row.delegacion
                        )}
                      </h3>

                      <p>
                        ${escapeHtml(
                          row.programa
                        )}
                      </p>

                      <strong>
                        ${escapeHtml(
                          row.actividad
                        )}
                      </strong>
                    </div>

                    <div class="review-compact-meta">
                      <span>
                        Fecha:
                        <strong>
                          ${formatDate(
                            row.fecha_actividad
                          )}
                        </strong>
                      </span>

                      <span>
                        Avance reportado:
                        <strong>
                          ${formatNumber(
                            row.avance_realizado
                          )}
                        </strong>
                      </span>

                      <button
                        class="btn btn-primary"
                        data-open-review="${getObjectId(row)}"
                      >
                        🔎 Revisar actividad
                      </button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
      : `
          <div class="module-empty">
            No hay registros para los filtros seleccionados.
          </div>
        `;

  document
    .querySelectorAll("[data-open-review]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          await openReviewDetail(
            Number(
              button.dataset.openReview
            )
          );
        }
      );
    });
}

async function openReviewDetail(objectId) {
  try {
    const result =
      await api.getActivityDetail(
        objectId
      );

    const feature =
      result.feature || {};

    const row =
      feature.attributes || {};

    const progress =
      feature.progress || {};

    $("coming-page").innerHTML = `
      <article class="review-detail-page">
        <div class="review-detail-topbar">
          <button
            id="btn-back-review"
            class="btn btn-secondary"
          >
            ← Volver a la bandeja
          </button>

          <span class="status-badge">
            ${escapeHtml(
              feature.workflow_status ||
              workflowLabel(row)
            )}
          </span>
        </div>

        <article class="panel-card">
          <div class="module-heading">
            <div>
              <span class="panel-kicker">
                ${
                  state.currentReviewLevel === "REGIONAL"
                    ? "Revisión Regional"
                    : "Validación Nacional"
                }
              </span>

              <h2>
                ${escapeHtml(
                  row.delegacion
                )}
              </h2>

              <p class="page-scope">
                ${escapeHtml(
                  row.direccion_regional
                )}
              </p>
            </div>

            <div class="review-counter">
              <span>Avance reportado</span>

              <strong>
                ${formatNumber(
                  row.avance_realizado
                )}
              </strong>
            </div>
          </div>

          <div class="progress-info-card">
            <div>
              <span>Meta</span>

              <strong>
                ${formatNumber(
                  progress.meta
                )}
              </strong>
            </div>

            <div>
              <span>Avance validado</span>

              <strong>
                ${formatNumber(
                  progress.avance_validado
                )}
              </strong>
            </div>

            <div>
              <span>En revisión</span>

              <strong>
                ${formatNumber(
                  progress.avance_en_revision
                )}
              </strong>
            </div>

            <div>
              <span>Pendiente</span>

              <strong>
                ${formatNumber(
                  progress.pendiente_real
                )}
              </strong>
            </div>
          </div>

          ${renderActivityDataSections(row)}

          <div class="form-section-title">
            Ubicación registrada
          </div>

          <div
            id="review-map"
            class="form-map"
          ></div>

          <div class="form-section-title">
            Valoración
          </div>

          <label class="review-observation-field">
            Observaciones de revisión

            <textarea
              id="review-observations"
              rows="5"
              placeholder="Digite observaciones, recomendaciones o motivos de devolución..."
            ></textarea>
          </label>

          <div class="review-actions review-actions-large">
            ${
              state.currentReviewLevel === "REGIONAL"
                ? `
                    <button
                      id="btn-review-approve"
                      class="btn btn-primary"
                    >
                      ✅ Revisar y enviar a Coordinación Nacional
                    </button>

                    <button
                      id="btn-review-return"
                      class="btn btn-warning"
                    >
                      ↩️ Devolver a Delegación
                    </button>

                    <button
                      id="btn-review-edit"
                      class="btn btn-secondary"
                    >
                      ✏️ Editar registro
                    </button>

                    <button
                      id="btn-review-delete"
                      class="btn btn-danger"
                    >
                      🗑️ Eliminar registro
                    </button>
                  `
                : `
                    <button
                      id="btn-review-approve"
                      class="btn btn-primary"
                    >
                      ✅ Validar nacionalmente
                    </button>

                    <button
                      id="btn-review-return"
                      class="btn btn-warning"
                    >
                      ↩️ Observar registro
                    </button>
                  `
            }
          </div>
        </article>
      </article>
    `;

    $("btn-back-review").addEventListener(
      "click",
      renderReviewModule
    );

    renderReviewMap(row);

    $("btn-review-approve").addEventListener(
      "click",
      async () => {
        const observations =
          $("review-observations")
            .value
            .trim();

        if (
          state.currentReviewLevel ===
          "REGIONAL"
        ) {
          await performRegionalReview(
            objectId,
            "Revisado regional",
            observations
          );
        } else {
          await performNationalReview(
            objectId,
            "Validado nacional",
            observations
          );
        }
      }
    );

    $("btn-review-return").addEventListener(
      "click",
      async () => {
        const observations =
          $("review-observations")
            .value
            .trim();

        if (!observations) {
          showToast(
            "Debe indicar una observación para devolver u observar el registro.",
            true
          );

          return;
        }

        if (
          state.currentReviewLevel ===
          "REGIONAL"
        ) {
          await performRegionalReview(
            objectId,
            "Devuelto regional",
            observations
          );
        } else {
          await performNationalReview(
            objectId,
            "Observado nacional",
            observations
          );
        }
      }
    );

    if ($("btn-review-edit")) {
      $("btn-review-edit").addEventListener(
        "click",
        () => {
          const localRow =
            getRows().find(
              (item) =>
                getObjectId(item) ===
                objectId
            );

          if (localRow) {
            renderActivityForm(localRow);
          }
        }
      );
    }

    if ($("btn-review-delete")) {
      $("btn-review-delete").addEventListener(
        "click",
        async () => {
          if (
            !window.confirm(
              "¿Eliminar definitivamente este registro?"
            )
          ) {
            return;
          }

          try {
            await api.deleteActivity(
              objectId
            );

            await loadData();
            renderReviewModule();

            showToast(
              "Registro eliminado."
            );
          } catch (error) {
            showToast(
              error.message,
              true
            );
          }
        }
      );
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

async function performRegionalReview(
  objectId,
  status,
  observations
) {
  try {
    await api.regionalReview(
      objectId,
      status,
      observations
    );

    await loadData();
    renderReviewModule();

    showToast(
      status === "Revisado regional"
        ? "Actividad enviada a validación nacional."
        : "Actividad devuelta a la delegación."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

async function performNationalReview(
  objectId,
  status,
  observations
) {
  try {
    await api.nationalReview(
      objectId,
      status,
      observations
    );

    await loadData();
    renderReviewModule();

    showToast(
      status === "Validado nacional"
        ? "Actividad validada nacionalmente."
        : "Actividad observada nacionalmente."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   NOTIFICACIONES
========================================================= */

function createDerivedNotifications() {
  const role = getCurrentRole();
  const notes = [];

  if (
    role.includes("REGIONAL") &&
    state.regionalQueue
  ) {
    const grouped = {};

    for (
      const feature
      of state.regionalQueue.features || []
    ) {
      const row =
        feature.attributes || {};

      const status =
        feature.workflow_status ||
        workflowLabel(row);

      if (
        status !== "Pendiente regional"
      ) {
        continue;
      }

      const delegation =
        row.delegacion ||
        "Delegación";

      grouped[delegation] =
        (grouped[delegation] || 0) + 1;
    }

    for (
      const [delegation, count]
      of Object.entries(grouped)
    ) {
      notes.push({
        message:
          `${delegation} tiene ${count} actividad(es) pendiente(s) de revisión regional.`,

        date:
          Date.now()
      });
    }
  }

  if (
    (
      role.includes("COORDIN") ||
      role === "NACIONAL"
    ) &&
    state.nationalQueue
  ) {
    const grouped = {};

    for (
      const feature
      of state.nationalQueue.features || []
    ) {
      const row =
        feature.attributes || {};

      const status =
        feature.workflow_status ||
        workflowLabel(row);

      if (
        status !== "Pendiente nacional"
      ) {
        continue;
      }

      const delegation =
        row.delegacion ||
        "Delegación";

      grouped[delegation] =
        (grouped[delegation] || 0) + 1;
    }

    for (
      const [delegation, count]
      of Object.entries(grouped)
    ) {
      notes.push({
        message:
          `${delegation} tiene ${count} actividad(es) pendiente(s) de validación nacional.`,

        date:
          Date.now()
      });
    }
  }

  if (role.includes("DELEG")) {
    getRows()
      .filter(
        (row) =>
          !isHistorical(row) &&
          normalize(
            row.usuario_registra
          ) ===
            normalize(
              state.user?.username
            ) &&
          (
            workflowLabel(row) ===
              "Devuelto regional" ||
            workflowLabel(row) ===
              "Pendiente nacional" ||
            workflowLabel(row) ===
              "Validado nacional" ||
            workflowLabel(row) ===
              "Observado nacional"
          )
      )
      .slice(0, 10)
      .forEach((row) => {
        notes.push({
          message:
            `${row.actividad}: ${workflowLabel(row)}.`,

          date:
            row.fecha_revision_regional ||
            row.fecha_revision_nacional ||
            Date.now()
        });
      });
  }

  return notes;
}

function renderNotifications() {
  const count =
    state.notificaciones.length;

  $("notification-count").textContent =
    count;

  $("notification-count")
    .classList.toggle(
      "hidden",
      count === 0
    );

  $("notifications-list").innerHTML =
    count
      ? state.notificaciones
          .map(
            (item) => `
              <article class="notification-item">
                <strong>
                  ${escapeHtml(
                    item.message
                  )}
                </strong>

                <small>
                  ${new Date(
                    item.date
                  ).toLocaleString(
                    "es-CR"
                  )}
                </small>
              </article>
            `
          )
          .join("")
      : `
          <p class="page-scope">
            No hay notificaciones pendientes.
          </p>
        `;
}

function openNotifications() {
  $("notifications-drawer")
    .classList.remove("hidden");

  $("drawer-backdrop")
    .classList.remove("hidden");
}

function closeNotifications() {
  $("notifications-drawer")
    .classList.add("hidden");

  $("drawer-backdrop")
    .classList.add("hidden");
}

/* =========================================================
   MAPAS
========================================================= */

function renderMap(features) {
  const container =
    $("dashboard-map");

  if (!container) {
    return;
  }

  if (state.mapView) {
    state.mapView.destroy();
    state.mapView = null;
  }

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/layers/GraphicsLayer"
    ],
    (
      Map,
      MapView,
      Graphic,
      GraphicsLayer
    ) => {
      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      const layer =
        new GraphicsLayer();

      map.add(layer);

      const delegationColors =
        buildDelegationColorMap(
          features
        );

      for (
        const feature
        of features
      ) {
        const attributes =
          feature.attributes || {};

        const latitude =
          numberOrNull(
            attributes.latitud
          );

        const longitude =
          numberOrNull(
            attributes.longitud
          );

        if (
          latitude === null ||
          longitude === null ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          continue;
        }

        const color =
          delegationColors.get(
            normalize(
              attributes.delegacion
            )
          ) || [0, 43, 127];

        layer.add(
          new Graphic({
            geometry: {
              type: "point",
              longitude,
              latitude,

              spatialReference: {
                wkid: 4326
              }
            },

            symbol: {
              type: "simple-marker",
              style: "diamond",
              size: 18,
              color,

              outline: {
                color: [
                  255,
                  255,
                  255
                ],

                width: 2
              }
            },

            attributes,

            popupTemplate: {
              title:
                "{delegacion}",

              content:
                "<b>Programa:</b> {programa}<br>" +
                "<b>Actividad:</b> {actividad}<br>" +
                "<b>Responsable:</b> {responsable}<br>" +
                "<b>Participantes:</b> {cantidad_participantes}<br>" +
                "<b>Estado regional:</b> {estado_regional}<br>" +
                "<b>Estado nacional:</b> {estado_nacional}<br>" +
                "<b>Lugar:</b> {lugar}"
            }
          })
        );
      }

      state.mapView =
        new MapView({
          container:
            "dashboard-map",

          map,

          center: [
            -84.1,
            9.95
          ],

          zoom:
            7
        });

      if (layer.graphics.length) {
        state.mapView
          .when(() =>
            state.mapView.goTo(
              layer.graphics,
              {
                padding:
                  60
              }
            )
          )
          .catch(() => {});
      }

      renderMapLegend(
        delegationColors
      );
    }
  );
}

function renderReviewMap(row) {
  if (state.reviewMapView) {
    state.reviewMapView.destroy();
    state.reviewMapView = null;
  }

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic"
    ],
    (
      Map,
      MapView,
      Graphic
    ) => {
      const latitude =
        numberOrNull(
          row.latitud
        );

      const longitude =
        numberOrNull(
          row.longitud
        );

      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      state.reviewMapView =
        new MapView({
          container:
            "review-map",

          map,

          center:
            latitude !== null &&
            longitude !== null
              ? [
                  longitude,
                  latitude
                ]
              : [
                  -84.1,
                  9.95
                ],

          zoom:
            latitude !== null &&
            longitude !== null
              ? 16
              : 7
        });

      if (
        latitude !== null &&
        longitude !== null
      ) {
        state.reviewMapView.graphics.add(
          new Graphic({
            geometry: {
              type: "point",
              longitude,
              latitude,

              spatialReference: {
                wkid: 4326
              }
            },

            symbol: {
              type: "simple-marker",
              style: "diamond",
              size: 22,
              color: [
                0,
                43,
                127
              ],

              outline: {
                color: [
                  255,
                  255,
                  255
                ],

                width: 2
              }
            }
          })
        );
      }
    }
  );
}

function buildDelegationColorMap(features) {
  const delegations = [
    ...new Set(
      features
        .map(
          (feature) =>
            feature.attributes?.delegacion
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const palette = [
    [0, 43, 127],
    [180, 35, 24],
    [24, 122, 74],
    [198, 150, 39],
    [105, 65, 198],
    [0, 126, 167],
    [199, 86, 0],
    [121, 85, 72],
    [194, 24, 91],
    [67, 91, 47],
    [76, 70, 152],
    [0, 111, 107],
    [139, 45, 90],
    [84, 110, 122],
    [145, 79, 0],
    [37, 80, 145]
  ];

  return new Map(
    delegations.map(
      (
        delegation,
        index
      ) => [
        normalize(delegation),

        palette[
          index %
          palette.length
        ]
      ]
    )
  );
}

function renderMapLegend(colorMap) {
  let legend =
    $("dashboard-map-legend");

  if (!legend) {
    legend =
      document.createElement(
        "div"
      );

    legend.id =
      "dashboard-map-legend";

    legend.className =
      "map-legend";

    $("dashboard-map")
      ?.insertAdjacentElement(
        "afterend",
        legend
      );
  }

  if (
    !legend ||
    isDelegationRole() ||
    colorMap.size <= 1
  ) {
    legend?.classList.add(
      "hidden"
    );

    return;
  }

  legend.classList.remove(
    "hidden"
  );

  legend.innerHTML = `
    <strong>
      Delegaciones
    </strong>

    <div class="map-legend-items">
      ${[
        ...colorMap.entries()
      ]
        .map(
          (
            [
              delegationKey,
              color
            ]
          ) => {
            const delegation =
              (
                state.dashboard
                  ?.delegations ||
                []
              ).find(
                (item) =>
                  normalize(
                    item.delegacion
                  ) ===
                  delegationKey
              )?.delegacion ||
              getRows().find(
                (row) =>
                  normalize(
                    row.delegacion
                  ) ===
                  delegationKey
              )?.delegacion ||
              delegationKey;

            return `
              <span class="map-legend-item">
                <i
                  style="
                    background:
                    rgb(${color.join(",")})
                  "
                ></i>

                ${escapeHtml(
                  delegation
                )}
              </span>
            `;
          }
        )
        .join("")}
    </div>
  `;
}

/* =========================================================
   UTILIDADES
========================================================= */

function isNationalApproved(row) {
  const status =
    normalize(
      row.estado_nacional
    );

  return (
    status.includes("VALIDAD") ||
    status.includes("APROB")
  );
}

function fillSelect(
  select,
  values,
  includeAll = false,
  placeholder = ""
) {
  if (!select) {
    return;
  }

  let html = "";

  if (includeAll) {
    html += `
      <option value="">
        Todos
      </option>
    `;
  } else if (placeholder) {
    html += `
      <option
        value=""
        selected
        disabled
      >
        ${escapeHtml(
          placeholder
        )}
      </option>
    `;
  }

  const uniqueValues = [
    ...new Set(
      values
        .map(
          (value) =>
            String(
              value || ""
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  for (
    const value
    of uniqueValues
  ) {
    html += `
      <option
        value="${escapeHtml(value)}"
      >
        ${escapeHtml(value)}
      </option>
    `;
  }

  select.innerHTML = html;
}

function setSelectValue(
  select,
  value
) {
  if (!select || !value) {
    return;
  }

  const target =
    String(value).trim();

  const exists = [
    ...select.options
  ].some(
    (option) =>
      normalize(option.value) ===
      normalize(target)
  );

  if (!exists) {
    select.insertAdjacentHTML(
      "beforeend",
      `
        <option
          value="${escapeHtml(target)}"
        >
          ${escapeHtml(target)}
        </option>
      `
    );
  }

  const option = [
    ...select.options
  ].find(
    (item) =>
      normalize(item.value) ===
      normalize(target)
  );

  if (option) {
    select.value = option.value;
  }
}

function normalize(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toUpperCase();
}

function numberValue(value) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = Number(
    String(value)
      .replace(",", ".")
      .trim()
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function sumBy(
  rows,
  field
) {
  return rows.reduce(
    (
      total,
      row
    ) =>
      total +
      numberValue(
        row[field]
      ),
    0
  );
}

function formatNumber(value) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  return Number(
    value || 0
  ).toLocaleString(
    "es-CR",
    {
      maximumFractionDigits:
        2
    }
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "es-CR"
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString(
    "es-CR"
  );
}

function dateInputValue(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  return date
    .toISOString()
    .slice(0, 10);
}

function escapeHtml(value) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );
}

function showToast(
  message,
  error = false
) {
  const toast =
    $("toast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.style.background =
    error
      ? "#b42318"
      : "#111827";

  toast
    .classList
    .remove("hidden");

  setTimeout(
    () =>
      toast
        .classList
        .add("hidden"),
    4000
  );
}
