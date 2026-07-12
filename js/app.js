import { ApiService } from "../services/api-service.js";

const api = new ApiService();

/* =========================================================
   COORDENADAS DE REFERENCIA POR DELEGACIÓN
   SOLO PARA VISUALIZACIÓN APROXIMADA EN MAPA
========================================================= */

const COORDENADAS_REFERENCIA = {
  "CARMEN": [9.9365, -84.0750],
  "MERCED": [9.9386, -84.0828],
  "HOSPITAL": [9.9274, -84.0918],
  "CATEDRAL": [9.9289, -84.0740],
  "ZAPOTE": [9.9198, -84.0553],
  "SAN FRANCISCO": [9.9136, -84.0724],
  "URUCA": [9.9567, -84.1060],
  "MATA REDONDA": [9.9352, -84.1047],
  "PAVAS": [9.9488, -84.1342],
  "HATILLO": [9.9160, -84.1010],
  "SAN SEBASTIAN": [9.9121, -84.0909],
  "ESCAZU": [9.9180, -84.1399],
  "SANTA ANA": [9.9326, -84.1825],
  "ALAJUELITA": [9.9016, -84.1000],
  "VASQUEZ DE CORONADO": [9.9760, -84.0070],
  "CORONADO": [9.9760, -84.0070],
  "ACOSTA": [9.8003, -84.1604],
  "TIBAS": [9.9580, -84.0790],
  "MORAVIA": [9.9610, -84.0480],
  "MONTES DE OCA": [9.9369, -84.0500],
  "CURRIDABAT": [9.9136, -84.0405],
  "GOICOECHEA": [9.9480, -84.0430],
  "DESAMPARADOS": [9.8982, -84.0626],
  "ASERRI": [9.8587, -84.0917],
  "MORA": [9.9182, -84.2411],
  "PURISCAL": [9.8469, -84.3149],
  "TARRAZU": [9.6596, -84.0206],
  "DOTA": [9.6500, -83.9600],
  "LEON CORTES": [9.6830, -84.0500],
  "TURRUBARES": [9.9050, -84.4520],
  "ALAJUELA": [10.0162, -84.2116],
  "SAN RAMON": [10.0887, -84.4702],
  "GRECIA": [10.0739, -84.3112],
  "SAN MATEO": [9.9365, -84.5247],
  "ATENAS": [9.9787, -84.3801],
  "NARANJO": [10.0987, -84.3782],
  "PALMARES": [10.0567, -84.4370],
  "POAS": [10.0800, -84.2450],
  "OROTINA": [9.9111, -84.5230],
  "SAN CARLOS": [10.3290, -84.4310],
  "ZARCERO": [10.1852, -84.3900],
  "SARCHI": [10.0883, -84.3473],
  "UPALA": [10.8986, -85.0155],
  "LOS CHILES": [11.0350, -84.7130],
  "GUATUSO": [10.6667, -84.8167],
  "RIO CUARTO": [10.3410, -84.2140],
  "CARTAGO": [9.8644, -83.9194],
  "PARAISO": [9.8383, -83.8656],
  "LA UNION": [9.9084, -83.9886],
  "JIMENEZ": [9.9048, -83.6834],
  "TURRIALBA": [9.9050, -83.6830],
  "ALVARADO": [9.9333, -83.8000],
  "OREAMUNO": [9.9100, -83.9000],
  "EL GUARCO": [9.8472, -83.9460],
  "HEREDIA": [10.0024, -84.1165],
  "BARVA": [10.0208, -84.1233],
  "SANTO DOMINGO": [10.0639, -84.1547],
  "SANTA BARBARA": [10.0400, -84.1600],
  "SAN RAFAEL": [10.0138, -84.1002],
  "SAN ISIDRO": [10.0186, -84.0569],
  "BELEN": [9.9852, -84.1810],
  "FLORES": [10.0000, -84.1600],
  "SAN PABLO": [9.9953, -84.0966],
  "SARAPIQUI": [10.4522, -84.0166],
  "LIBERIA": [10.6350, -85.4377],
  "NICOYA": [10.1483, -85.4520],
  "SANTA CRUZ": [10.2600, -85.5850],
  "BAGACES": [10.5250, -85.2550],
  "CARRILLO": [10.4750, -85.5850],
  "CANAS": [10.4310, -85.0980],
  "ABANGARES": [10.2820, -84.9590],
  "TILARAN": [10.4670, -84.9670],
  "NANDAYURE": [9.9990, -85.2060],
  "LA CRUZ": [11.0730, -85.6320],
  "HOJANCHA": [10.0550, -85.4200],
  "PUNTARENAS": [9.9763, -84.8384],
  "CHOMES": [10.0950, -84.9250],
  "JUDAS": [10.0510, -84.8870],
  "ESPARZA": [9.9940, -84.6640],
  "BUENOS AIRES": [9.1667, -83.3333],
  "MONTES DE ORO": [10.0870, -84.7300],
  "OSA": [8.9590, -83.5230],
  "QUEPOS": [9.4319, -84.1617],
  "GOLFITO": [8.6390, -83.1660],
  "COTO BRUS": [8.8830, -82.9660],
  "PARRITA": [9.5200, -84.3200],
  "CORREDORES": [8.6420, -82.9460],
  "GARABITO": [9.6150, -84.6300],
  "LIMON": [9.9917, -83.0360],
  "POCOCI": [10.2150, -83.7870],
  "SIQUIRRES": [10.0970, -83.5060],
  "TALAMANCA": [9.6240, -82.8440],
  "MATINA": [10.0760, -83.2890],
  "GUACIMO": [10.2100, -83.6900],
  "PEREZ ZELEDON": [9.3540, -83.6340],
  "LOS SANTOS": [9.6550, -84.0300]
};

const REGION_CENTRO = {
  "1": [9.93, -84.08],
  "2": [10.05, -84.32],
  "3": [9.87, -83.93],
  "4": [10.02, -84.12],
  "5": [10.45, -85.30],
  "6": [9.75, -84.70],
  "7": [10.10, -83.55],
  "8": [9.75, -84.20],
  "9": [9.40, -84.00],
  "10": [9.30, -83.40],
  "11": [10.80, -85.00],
  "12": [10.15, -83.50]
};

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
  currentReviewLevel: null,
  currentPage: "dashboard",
  dashboardDelegationFilter: "",
  dashboardActivityFilter: ""
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", initialize);

/* =========================================================
   INICIO
========================================================= */

async function initialize() {
  injectVisualEnhancements();
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
  state.currentPage = pageId;

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

    if (state.currentPage === "dashboard") {
      renderDashboard();
    } else if (state.currentPage === "revision") {
      renderReviewModule();
    }

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
    national.includes("RECHAZ") ||
    national.includes("DEVUEL")
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

  renderDashboardMapFromFilters();
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
        <span class="panel-kicker">Cumplimiento</span>
        <h3>Desglose por actividad</h3>
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

  renderProgramSummaryFromDashboard(programs);
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

                      <td>${formatNumber(row.meta)}</td>
                      <td>${formatNumber(row.avance)}</td>
                      <td>${formatNumber(row.pendiente)}</td>

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
      (item) => numberValue(item[1])
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

/* =========================================================
   DELEGACIONES EN PANEL - DESPLEGABLE LIMPIO
========================================================= */

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

  const title =
    isNationalCoordinatorRole()
      ? "Delegaciones del programa"
      : "Delegaciones de la región";

  const activities = getDashboardActivityNames();

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">Ámbito</span>
        <h3>${title}</h3>
      </div>
    </div>

    <div class="pumi-delegation-selector">
      <div class="pumi-dashboard-filter-grid">
        <label>
          Delegación
          <select id="dashboard-delegation-select">
            <option value="">Todas las delegaciones</option>

            ${delegations
              .map(
                (item) => `
                  <option value="${escapeHtml(item.delegacion)}">
                    ${escapeHtml(item.delegacion)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>

        <label>
          Actividad
          <select id="dashboard-activity-select">
            <option value="">Todas las actividades</option>

            ${activities
              .map(
                (activity) => `
                  <option value="${escapeHtml(activity)}">
                    ${escapeHtml(activity)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>
      </div>

      <div
        id="dashboard-delegation-preview"
        class="pumi-delegation-preview"
      >
        <div class="module-empty">
          Use los filtros para consultar el mapa y los indicadores.
        </div>
      </div>
    </div>
  `;

  const delegationSelect =
    $("dashboard-delegation-select");

  const activitySelect =
    $("dashboard-activity-select");

  const preview =
    $("dashboard-delegation-preview");

  setSelectValue(
    delegationSelect,
    state.dashboardDelegationFilter
  );

  setSelectValue(
    activitySelect,
    state.dashboardActivityFilter
  );

  function applyDashboardFilters() {
    state.dashboardDelegationFilter =
      delegationSelect?.value || "";

    state.dashboardActivityFilter =
      activitySelect?.value || "";

    renderDashboardMapFromFilters();

    const selectedDelegation =
      state.dashboardDelegationFilter;

    if (!selectedDelegation) {
      preview.innerHTML = `
        <div class="module-empty">
          El mapa muestra ${
            isNationalCoordinatorRole()
              ? "las delegaciones con información del programa asignado."
              : "las delegaciones que pertenecen a la región."
          }
        </div>
      `;

      toggleBreakdownPanel(false);
      return;
    }

    const item =
      delegations.find(
        (row) =>
          row.delegacion === selectedDelegation
      );

    preview.innerHTML = `
      <div class="pumi-mini-kpi-grid">
        <div class="pumi-mini-kpi">
          <span>Registros</span>
          <strong>
            ${formatNumber(item?.registros)}
          </strong>
        </div>

        <div class="pumi-mini-kpi">
          <span>Pendiente regional</span>
          <strong>
            ${formatNumber(item?.pendientes_regional)}
          </strong>
        </div>

        <div class="pumi-mini-kpi">
          <span>Pendiente nacional</span>
          <strong>
            ${formatNumber(item?.pendientes_nacional)}
          </strong>
        </div>

        <div class="pumi-mini-kpi">
          <span>Validados</span>
          <strong>
            ${formatNumber(item?.validados)}
          </strong>
        </div>
      </div>
    `;

    loadDelegationBreakdown(
      selectedDelegation
    );
  }

  delegationSelect?.addEventListener(
    "change",
    applyDashboardFilters
  );

  activitySelect?.addEventListener(
    "change",
    applyDashboardFilters
  );

  applyDashboardFilters();
}

function getDashboardActivityNames() {
  return [
    ...new Set(
      getRows()
        .map((row) =>
          String(row.actividad || "").trim()
        )
        .filter(Boolean)
        .filter(
          (activity) =>
            normalize(activity) !== "ACTIVIDAD"
        )
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function getDashboardMapFeatures() {
  const source =
    state.dashboard?.map_features ||
    state.actividades ||
    [];

  return source.filter((feature) => {
    const row =
      feature.attributes || {};

    if (
      state.dashboardDelegationFilter &&
      normalize(row.delegacion) !==
        normalize(
          state.dashboardDelegationFilter
        )
    ) {
      return false;
    }

    if (
      state.dashboardActivityFilter &&
      normalize(row.actividad) !==
        normalize(
          state.dashboardActivityFilter
        )
    ) {
      return false;
    }

    return true;
  });
}

function renderDashboardMapFromFilters() {
  renderMap(
    getDashboardMapFeatures()
  );
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
          <span class="panel-kicker">Delegación</span>

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
  fillSelect(
    $("activity-province"),
    getCatalogValues("PROVINCIA"),
    false,
    "Seleccione una provincia"
  );

  fillSelect(
    $("activity-canton"),
    getCatalogValues("CANTON"),
    false,
    "Seleccione un cantón"
  );

  fillSelect(
    $("activity-district"),
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
          type: "picture-marker",
          url: createMarkerSvg("#0b3b8f"),
          width: "36px",
          height: "46px",
          yoffset: "14px"
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

          <h2>Mis registros</h2>
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
                      ${formatDate(row.fecha_actividad)}
                    </td>

                    <td>
                      ${escapeHtml(row.programa)}
                    </td>

                    <td>
                      ${escapeHtml(row.actividad)}
                    </td>

                    <td>
                      ${formatNumber(row.avance_realizado)}
                    </td>

                    <td>
                      <span class="status-badge">
                        ${escapeHtml(workflowLabel(row))}
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
        ["Fecha", formatDate(row.fecha_actividad)],
        ["Hora", row.hora_actividad],
        ["Avance realizado", formatNumber(row.avance_realizado)],
        ["Responsable", row.responsable]
      ]
    )}

    ${buildDetailSection(
      "Participantes",
      [
        ["Total", formatNumber(row.cantidad_participantes)],
        ["Hombres", formatNumber(row.cantidad_hombres)],
        ["Mujeres", formatNumber(row.cantidad_mujeres)],
        ["Edad 10-18", formatNumber(row.edad_10_18)],
        ["Edad 19-30", formatNumber(row.edad_19_30)],
        ["Edad 31-45", formatNumber(row.edad_31_45)],
        ["Edad 46 o más", formatNumber(row.edad_46_mas)]
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
        ["Centro educativo", row.centro_educativo]
      ]
    )}

    ${buildDetailSection(
      "Información complementaria",
      [
        ["Instituciones", row.instituciones],
        ["Número de referencia", row.numero_referencia],
        ["Número de expediente", row.numero_expediente],
        ["Observaciones", row.observaciones]
      ]
    )}

    ${
      row.observacion_regional
        ? buildDetailSection(
            "Valoración Regional",
            [
              ["Coordinador Regional", row.coordinador_regional],
              ["Fecha de revisión", formatDateTime(row.fecha_revision_regional)],
              ["Observación Regional", row.observacion_regional]
            ]
          )
        : ""
    }

    ${
      row.observacion_nacional
        ? buildDetailSection(
            "Valoración Nacional",
            [
              ["Coordinador Nacional", row.coordinador_nacional],
              ["Fecha de revisión", formatDateTime(row.fecha_revision_nacional)],
              ["Observación Nacional", row.observacion_nacional]
            ]
          )
        : ""
    }
  `;
}

function buildDetailSection(title, fields) {
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
                <span>${escapeHtml(label)}</span>

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

          <h2>${escapeHtml(title)}</h2>

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

      <div class="filter-grid pumi-review-filters">
        <label>
          Delegación
          <select id="review-filter-delegation"></select>
        </label>

        <label>
          Programa
          <select id="review-filter-program"></select>
        </label>

        <label>
          Actividad
          <select id="review-filter-activity"></select>
        </label>

        <label>
          Estado
          <select id="review-filter-status">
            <option value="">Todos</option>

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
                ${escapeHtml(row.delegacion)}
              </h2>

              <p class="page-scope">
                ${escapeHtml(row.direccion_regional)}
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
              <strong>${formatNumber(progress.meta)}</strong>
            </div>

            <div>
              <span>Avance validado</span>
              <strong>
                ${formatNumber(progress.avance_validado)}
              </strong>
            </div>

            <div>
              <span>En revisión</span>
              <strong>
                ${formatNumber(progress.avance_en_revision)}
              </strong>
            </div>

            <div>
              <span>Pendiente</span>
              <strong>
                ${formatNumber(progress.pendiente_real)}
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

          <section class="pumi-valuation-card">
            <div class="form-section-title">
              Valoración
            </div>

            <div class="pumi-valuation-layout">
              <label class="review-observation-field">
                <span>
                  Observaciones de revisión
                </span>

                <textarea
                  id="review-observations"
                  rows="6"
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
            </div>
          </section>
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
            await api.deleteActivity(objectId);

            await loadData();
            renderReviewModule();

            showToast(
              "Registro eliminado."
            );
          } catch (error) {
            showToast(error.message, true);
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
                  ${escapeHtml(item.message)}
                </strong>

                <small>
                  ${new Date(item.date).toLocaleString("es-CR")}
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
   MAPAS - PIN TIPO VIÑETA + UBICACIÓN APROXIMADA HISTÓRICA
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

      const delegationGroups =
        buildDelegationMapGroups(features);

      const regionColors =
        buildRegionColorMap(
          delegationGroups
        );

      const fallbackByDelegation =
        buildDelegationGeometryMap();

      delegationGroups.forEach(
        (group, index) => {
          const coordinates =
            resolveDelegationCoordinates(
              group,
              fallbackByDelegation,
              index
            );

          if (!coordinates) {
            return;
          }

          const color =
            regionColors.get(
              normalize(
                group.direccion_regional
              )
            ) || "#0b3b8f";

          layer.add(
            new Graphic({
              geometry: {
                type: "point",

                longitude:
                  coordinates.longitude,

                latitude:
                  coordinates.latitude,

                spatialReference: {
                  wkid: 4326
                }
              },

              symbol: {
                type: "picture-marker",

                url:
                  createMarkerSvg(color),

                width: "38px",
                height: "48px",
                yoffset: "14px"
              },

              attributes: {
                delegacion:
                  group.delegacion,

                direccion_regional:
                  group.direccion_regional,

                total_actividades:
                  group.activities.length,

                ubicacion_aproximada:
                  coordinates.approximate
                    ? "Sí"
                    : "No"
              },

              popupTemplate: {
                title:
                  "{delegacion}",

                content: [
                  {
                    type: "text",

                    text:
                      buildDelegationPopupHtml(
                        group,
                        coordinates
                      )
                  }
                ]
              }
            })
          );
        }
      );

      state.mapView =
        new MapView({
          container:
            "dashboard-map",

          map,

          center: [
            -84.1,
            9.95
          ],

          zoom: 7
        });

      if (layer.graphics.length) {
        state.mapView
          .when(() =>
            state.mapView.goTo(
              layer.graphics,
              {
                padding: 60
              }
            )
          )
          .catch(() => {});
      }

      renderMapLegend(
        regionColors
      );
    }
  );
}

function buildDelegationMapGroups(features) {
  const grouped = new Map();

  for (
    const feature
    of features || []
  ) {
    const row =
      feature.attributes || {};

    const delegation =
      String(
        row.delegacion ||
        "Sin delegación"
      ).trim();

    const delegationKey =
      normalize(delegation);

    if (!grouped.has(delegationKey)) {
      grouped.set(
        delegationKey,
        {
          delegacion:
            delegation,

          direccion_regional:
            String(
              row.direccion_regional ||
              row.region ||
              "Sin región"
            ).trim(),

          features: [],

          activities:
            new Map()
        }
      );
    }

    const group =
      grouped.get(delegationKey);

    group.features.push(feature);

    const program =
      String(
        row.programa ||
        "Sin programa"
      ).trim();

    const activity =
      String(
        row.actividad ||
        "Sin actividad"
      ).trim();

    if (
      normalize(activity) ===
      "ACTIVIDAD"
    ) {
      continue;
    }

    const key =
      `${normalize(program)}|||${normalize(activity)}`;

    if (
      !group.activities.has(key)
    ) {
      group.activities.set(
        key,
        {
          programa:
            program,

          actividad:
            activity,

          meta:
            0,

          avance:
            0
        }
      );
    }

    const item =
      group.activities.get(key);

    if (isHistorical(row)) {
      item.meta +=
        numberValue(row.meta);

      item.avance +=
        numberValue(row.avance);
    } else if (
      isNationalApproved(row)
    ) {
      item.avance +=
        numberValue(
          row.avance_realizado
        );
    }
  }

  return [
    ...grouped.values()
  ]
    .map((group) => ({
      ...group,

      activities: [
        ...group.activities.values()
      ]
        .map((item) => ({
          ...item,

          pendiente:
            Math.max(
              item.meta -
              item.avance,
              0
            )
        }))
        .sort((a, b) => {
          const programComparison =
            a.programa.localeCompare(
              b.programa,
              "es"
            );

          if (
            programComparison !== 0
          ) {
            return programComparison;
          }

          return a.actividad.localeCompare(
            b.actividad,
            "es"
          );
        })
    }))
    .sort((a, b) =>
      a.delegacion.localeCompare(
        b.delegacion,
        "es"
      )
    );
}

function buildDelegationPopupHtml(
  group,
  coordinates
) {
  const activities =
    group.activities.length
      ? group.activities
      : [
          {
            programa:
              "Sin programa",

            actividad:
              "Sin actividad",

            meta:
              0,

            avance:
              0,

            pendiente:
              0
          }
        ];

  return `
    <div class="pumi-map-popup">
      <div class="pumi-map-popup-head">
        <strong>
          ${escapeHtml(
            group.delegacion
          )}
        </strong>

        <span>
          ${activities.length}
          actividad(es)
        </span>
      </div>

      <div class="pumi-map-popup-region">
        ${escapeHtml(group.direccion_regional)}
      </div>

      <div class="pumi-map-popup-list">
        ${activities
          .map(
            (item) => `
              <div class="pumi-map-popup-activity">
                <div class="pumi-map-popup-program">
                  ${escapeHtml(
                    item.programa
                  )}
                </div>

                <div class="pumi-map-popup-title">
                  ${escapeHtml(
                    item.actividad
                  )}
                </div>

                <div class="pumi-map-popup-metrics">
                  <span>
                    Meta
                    <strong>
                      ${formatNumber(
                        item.meta
                      )}
                    </strong>
                  </span>

                  <span>
                    Avance
                    <strong>
                      ${formatNumber(
                        item.avance
                      )}
                    </strong>
                  </span>

                  <span>
                    Pendiente
                    <strong>
                      ${formatNumber(
                        item.pendiente
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            `
          )
          .join("")}
      </div>

      ${
        coordinates.approximate
          ? `
              <div class="pumi-map-popup-note">
                Ubicación aproximada de referencia para la delegación.
              </div>
            `
          : ""
      }
    </div>
  `;
}

function buildDelegationGeometryMap() {
  const map = new Map();

  for (
    const feature
    of state.delegaciones
  ) {
    const attributes =
      feature.attributes || {};

    const name =
      attributes.delegacion ||
      attributes.Delegacion ||
      attributes.DELEGACION ||
      attributes.nombre ||
      attributes.Nombre ||
      "";

    const geometry =
      feature.geometry || {};

    const longitude =
      numberOrNull(
        geometry.longitude ??
        geometry.x ??
        attributes.longitud ??
        attributes.Longitud
      );

    const latitude =
      numberOrNull(
        geometry.latitude ??
        geometry.y ??
        attributes.latitud ??
        attributes.Latitud
      );

    if (
      !name ||
      !isValidCoordinate(
        longitude,
        latitude
      )
    ) {
      continue;
    }

    map.set(
      normalize(name),
      {
        longitude,
        latitude
      }
    );
  }

  return map;
}

function getDelegationReferenceName(delegation) {
  return normalize(delegation)
    .replace(/^D\d+[A-Z]?\s+/, "")
    .replace(/^DELEGACION\s+POLICIAL\s+/, "")
    .replace(/^DELEGACION\s+/, "")
    .trim();
}

function getReferenceCoordinates(delegation) {
  const delegationName =
    getDelegationReferenceName(delegation);

  const direct =
    COORDENADAS_REFERENCIA[delegationName];

  if (direct) {
    return {
      latitude: direct[0],
      longitude: direct[1]
    };
  }

  const aliases = [
    ["SAN CARLOS ESTE", "SAN CARLOS"],
    ["SAN CARLOS OESTE", "SAN CARLOS"],
    ["ALAJUELA SUR", "ALAJUELA"],
    ["ALAJUELA NORTE", "ALAJUELA"],
    ["DESAMPARADOS NORTE", "DESAMPARADOS"],
    ["DESAMPARADOS SUR", "DESAMPARADOS"],
    ["POCOCI NORTE", "POCOCI"],
    ["POCOCI SUR", "POCOCI"],
    ["PUERTO JIMENEZ", "GOLFITO"],
    ["PAQUERA", "PUNTARENAS"],
    ["PEREZ ZELEDON", "PEREZ ZELEDON"],
    ["VAZQUEZ DE CORONADO", "VASQUEZ DE CORONADO"]
  ];

  const alias =
    aliases.find(
      ([source]) =>
        delegationName === source
    );

  if (alias) {
    const value =
      COORDENADAS_REFERENCIA[
        alias[1]
      ];

    if (value) {
      const offset =
        buildDelegationReferenceOffset(
          delegation
        );

      return {
        latitude:
          value[0] +
          offset.latitude,

        longitude:
          value[1] +
          offset.longitude
      };
    }
  }

  for (
    const [
      referenceName,
      value
    ]
    of Object.entries(
      COORDENADAS_REFERENCIA
    )
  ) {
    if (
      delegationName.includes(
        referenceName
      ) ||
      referenceName.includes(
        delegationName
      )
    ) {
      const offset =
        buildDelegationReferenceOffset(
          delegation
        );

      return {
        latitude:
          value[0] +
          offset.latitude,

        longitude:
          value[1] +
          offset.longitude
      };
    }
  }

  return null;
}

function buildDelegationReferenceOffset(
  delegation
) {
  const seed =
    normalize(delegation);

  let hash = 0;

  for (
    let index = 0;
    index < seed.length;
    index += 1
  ) {
    hash =
      (
        (
          hash << 5
        ) -
        hash +
        seed.charCodeAt(index)
      ) | 0;
  }

  const angle =
    (
      Math.abs(hash) %
      360
    ) *
    Math.PI /
    180;

  const radius =
    0.0035 +
    (
      Math.abs(hash) %
      4
    ) *
    0.0015;

  return {
    latitude:
      Math.sin(angle) *
      radius,

    longitude:
      Math.cos(angle) *
      radius
  };
}

function getRegionReferenceCoordinates(
  region
) {
  const match =
    String(region || "")
      .match(/REGIONAL\s+(\d+)/i);

  if (!match) {
    return null;
  }

  const value =
    REGION_CENTRO[
      match[1]
    ];

  if (!value) {
    return null;
  }

  return {
    latitude:
      value[0],

    longitude:
      value[1]
  };
}

function resolveDelegationCoordinates(
  group,
  fallbackByDelegation,
  index
) {
  /*
   * Para Regional, Coordinador Nacional y Nacional:
   * un marcador estable por delegación.
   * La ubicación se aproxima con el nombre de la delegación.
   */
  if (!isDelegationRole()) {
    const reference =
      getReferenceCoordinates(
        group.delegacion
      );

    if (reference) {
      return {
        longitude:
          reference.longitude,

        latitude:
          reference.latitude,

        approximate:
          true,

        source:
          "delegacion-referencia"
      };
    }

    const delegationLayerReference =
      fallbackByDelegation.get(
        normalize(
          group.delegacion
        )
      );

    if (delegationLayerReference) {
      const offset =
        buildDelegationReferenceOffset(
          group.delegacion
        );

      return {
        longitude:
          delegationLayerReference.longitude +
          offset.longitude,

        latitude:
          delegationLayerReference.latitude +
          offset.latitude,

        approximate:
          true,

        source:
          "capa-delegaciones"
      };
    }

    const regionReference =
      getRegionReferenceCoordinates(
        group.direccion_regional
      );

    if (regionReference) {
      const offset =
        buildDelegationReferenceOffset(
          group.delegacion
        );

      return {
        longitude:
          regionReference.longitude +
          offset.longitude,

        latitude:
          regionReference.latitude +
          offset.latitude,

        approximate:
          true,

        source:
          "centro-regional"
      };
    }
  }

  const realCoordinates =
    group.features
      .map((feature) => {
        const row =
          feature.attributes || {};

        const geometry =
          feature.geometry || {};

        const longitude =
          numberOrNull(
            row.longitud ??
            geometry.longitude ??
            geometry.x
          );

        const latitude =
          numberOrNull(
            row.latitud ??
            geometry.latitude ??
            geometry.y
          );

        if (
          !isValidCoordinate(
            longitude,
            latitude
          )
        ) {
          return null;
        }

        return {
          longitude,
          latitude
        };
      })
      .filter(Boolean);

  if (
    realCoordinates.length
  ) {
    return {
      longitude:
        realCoordinates.reduce(
          (
            total,
            item
          ) =>
            total +
            item.longitude,
          0
        ) /
        realCoordinates.length,

      latitude:
        realCoordinates.reduce(
          (
            total,
            item
          ) =>
            total +
            item.latitude,
          0
        ) /
        realCoordinates.length,

      approximate:
        false,

      source:
        "actividad"
    };
  }

  const fallback =
    fallbackByDelegation.get(
      normalize(
        group.delegacion
      )
    );

  if (!fallback) {
    return null;
  }

  return {
    longitude:
      fallback.longitude,

    latitude:
      fallback.latitude,

    approximate:
      true,

    source:
      "capa-delegaciones"
  };
}

function resolveFeatureCoordinates(
  feature,
  fallbackByDelegation,
  index
) {
  const attributes =
    feature.attributes || {};

  const geometry =
    feature.geometry || {};

  const longitude =
    numberOrNull(
      attributes.longitud ??
      geometry.longitude ??
      geometry.x
    );

  const latitude =
    numberOrNull(
      attributes.latitud ??
      geometry.latitude ??
      geometry.y
    );

  if (
    isValidCoordinate(
      longitude,
      latitude
    )
  ) {
    return {
      longitude,
      latitude,
      approximate: false
    };
  }

  const fallback =
    fallbackByDelegation.get(
      normalize(
        attributes.delegacion
      )
    );

  if (!fallback) {
    return null;
  }

  return {
    longitude:
      fallback.longitude,

    latitude:
      fallback.latitude,

    approximate:
      true
  };
}

function isValidCoordinate(
  longitude,
  latitude
) {
  return (
    longitude !== null &&
    latitude !== null &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90 &&
    !(
      longitude === 0 &&
      latitude === 0
    )
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
      const fallbackByDelegation =
        buildDelegationGeometryMap();

      const coordinates =
        resolveFeatureCoordinates(
          {
            attributes: row,
            geometry:
              row.__geometry || null
          },
          fallbackByDelegation,
          getObjectId(row)
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
            coordinates
              ? [
                  coordinates.longitude,
                  coordinates.latitude
                ]
              : [
                  -84.1,
                  9.95
                ],

          zoom:
            coordinates
              ? 16
              : 7
        });

      if (coordinates) {
        state.reviewMapView.graphics.add(
          new Graphic({
            geometry: {
              type: "point",

              longitude:
                coordinates.longitude,

              latitude:
                coordinates.latitude,

              spatialReference: {
                wkid: 4326
              }
            },

            symbol: {
              type: "picture-marker",
              url: createMarkerSvg(
                "#0b3b8f"
              ),
              width: "40px",
              height: "50px",
              yoffset: "15px"
            },

            attributes: {
              delegacion:
                row.delegacion ||
                "Actividad",

              aproximada:
                coordinates.approximate
                  ? "Sí"
                  : "No"
            },

            popupTemplate: {
              title: "{delegacion}",
              content:
                "<b>Ubicación aproximada:</b> {aproximada}"
            }
          })
        );
      }
    }
  );
}

function buildRegionColorMap(groups) {
  const regions = [
    ...new Set(
      (groups || [])
        .map(
          (group) =>
            String(
              group.direccion_regional ||
              "Sin región"
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const palette = [
    "#0b3b8f",
    "#16a34a",
    "#7c3aed",
    "#db2777",
    "#f97316",
    "#14b8a6",
    "#eab308",
    "#2563eb",
    "#be123c",
    "#0891b2",
    "#65a30d",
    "#c026d3",
    "#ea580c",
    "#0f766e",
    "#9333ea"
  ];

  return new Map(
    regions.map(
      (region, index) => [
        normalize(region),
        palette[
          index %
          palette.length
        ]
      ]
    )
  );
}

function createMarkerSvg(color) {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="80"
      viewBox="0 0 64 80"
    >
      <defs>
        <filter
          id="shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2.5"
            flood-color="#000000"
            flood-opacity="0.30"
          />
        </filter>

        <linearGradient
          id="shine"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#ffffff"
            stop-opacity="0.42"
          />

          <stop
            offset="50%"
            stop-color="#ffffff"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <path
        filter="url(#shadow)"
        d="M32 3C16.1 3 4 15.1 4 31c0 22.3 28 46 28 46s28-23.7 28-46C60 15.1 47.9 3 32 3z"
        fill="${color}"
        stroke="#ffffff"
        stroke-width="3"
      />

      <path
        d="M32 7C19 7 9 17 9 30c0 5.2 1.8 10.7 4.6 16C11 31 17.8 13.6 36 8.2A24 24 0 0 0 32 7z"
        fill="url(#shine)"
      />

      <circle
        cx="32"
        cy="30"
        r="11"
        fill="#ffffff"
        fill-opacity="0.96"
      />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

  const regionNames = new Map();

  for (const row of getRows()) {
    const region =
      String(
        row.direccion_regional ||
        row.region ||
        ""
      ).trim();

    if (region) {
      regionNames.set(
        normalize(region),
        region
      );
    }
  }

  legend.innerHTML = `
    <details class="pumi-map-legend-details">
      <summary>
        Colores por Dirección Regional
      </summary>

      <div class="map-legend-items">
        ${[
          ...colorMap.entries()
        ]
          .map(
            (
              [
                regionKey,
                color
              ]
            ) => `
              <span class="map-legend-item">
                <i
                  style="
                    background:
                    ${color}
                  "
                ></i>

                ${escapeHtml(
                  regionNames.get(regionKey) ||
                  regionKey
                )}
              </span>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

/* =========================================================
   ESTILOS VISUALES INYECTADOS
   Permite aplicar el ajuste sin tocar app.css todavía.
========================================================= */

function injectVisualEnhancements() {
  if (
    document.getElementById(
      "pumi-app-js-visual-fixes"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "pumi-app-js-visual-fixes";

  style.textContent = `
    .pumi-delegation-selector {
      display: grid;
      gap: 14px;
    }

    .pumi-dashboard-filter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .pumi-dashboard-filter-grid label {
      display: grid;
      gap: 8px;
      color: #102a56;
      font-weight: 800;
    }

    .pumi-dashboard-filter-grid select {
      width: 100%;
      min-height: 58px;
      padding: 0 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      background: #fff;
      color: #12233f;
      font: inherit;
      font-weight: 700;
      outline: none;
      box-shadow: 0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-dashboard-filter-grid select:focus {
      border-color: #174ea6;
      box-shadow:
        0 0 0 4px rgba(23, 78, 166, 0.10),
        0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-map-popup {
      min-width: 320px;
      max-width: 520px;
      color: #162844;
    }

    .pumi-map-popup-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #dce5f1;
    }

    .pumi-map-popup-head strong {
      color: #003b8f;
      font-size: 1rem;
    }

    .pumi-map-popup-head span {
      color: #66758b;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .pumi-map-popup-region {
      margin: -4px 0 12px;
      color: #66758b;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .pumi-map-popup-list {
      display: grid;
      gap: 10px;
      max-height: 390px;
      overflow: auto;
      padding-right: 4px;
    }

    .pumi-map-popup-activity {
      padding: 12px;
      border: 1px solid #dce5f1;
      border-radius: 12px;
      background: #f8fbff;
    }

    .pumi-map-popup-program {
      color: #b27a08;
      font-size: 0.72rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pumi-map-popup-title {
      margin-top: 5px;
      color: #162844;
      font-weight: 800;
      line-height: 1.35;
    }

    .pumi-map-popup-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    .pumi-map-popup-metrics span {
      display: grid;
      gap: 3px;
      padding: 8px;
      border-radius: 9px;
      background: #ffffff;
      color: #66758b;
      font-size: 0.72rem;
    }

    .pumi-map-popup-metrics strong {
      color: #003b8f;
      font-size: 1rem;
    }

    .pumi-map-popup-note {
      margin-top: 10px;
      color: #66758b;
      font-size: 0.74rem;
      font-style: italic;
    }

    .pumi-delegation-selector > label,
    .pumi-review-filters label,
    .pumi-valuation-card label {
      color: #102a56;
      font-weight: 800;
    }

    .pumi-select-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: end;
    }

    .pumi-select-row select,
    .pumi-review-filters select {
      width: 100%;
      min-height: 58px;
      padding: 0 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      background: #fff;
      color: #12233f;
      font: inherit;
      font-weight: 700;
      outline: none;
      box-shadow: 0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-select-row select:focus,
    .pumi-review-filters select:focus {
      border-color: #174ea6;
      box-shadow:
        0 0 0 4px rgba(23, 78, 166, 0.10),
        0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-delegation-preview {
      min-height: 92px;
    }

    .pumi-mini-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .pumi-mini-kpi {
      display: grid;
      gap: 8px;
      padding: 18px;
      border: 1px solid #dce5f1;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff, #f8fbff);
      box-shadow: 0 10px 28px rgba(18, 48, 89, 0.06);
    }

    .pumi-mini-kpi span {
      color: #66758b;
      font-weight: 700;
    }

    .pumi-mini-kpi strong {
      color: #003b8f;
      font-size: 1.7rem;
    }

    .pumi-review-filters {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin: 22px 0 28px;
    }

    .pumi-review-filters label {
      display: grid;
      gap: 8px;
    }

    .review-compact-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 24px;
      align-items: center;
      padding: 24px;
      margin-bottom: 16px;
      border: 1px solid #dce5f1;
      border-radius: 22px;
      background: #fff;
      box-shadow: 0 12px 30px rgba(18, 48, 89, 0.06);
    }

    .review-compact-card h3 {
      margin: 10px 0 6px;
      color: #003b8f;
      font-size: 1.45rem;
    }

    .review-compact-card p {
      color: #6a7688;
      margin: 0 0 10px;
    }

    .review-compact-meta {
      display: grid;
      gap: 10px;
      min-width: 260px;
    }

    .pumi-valuation-card {
      margin-top: 26px;
      padding: 24px;
      border: 1px solid #dce5f1;
      border-radius: 22px;
      background: linear-gradient(180deg, #ffffff, #fbfdff);
    }

    .pumi-valuation-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: 24px;
      align-items: start;
    }

    .review-observation-field {
      display: grid;
      gap: 10px;
    }

    .review-observation-field textarea {
      width: 100%;
      min-height: 180px;
      padding: 16px 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      resize: vertical;
      font: inherit;
      color: #162844;
      background: #fff;
      box-sizing: border-box;
    }

    .review-observation-field textarea:focus {
      outline: none;
      border-color: #174ea6;
      box-shadow: 0 0 0 4px rgba(23, 78, 166, 0.10);
    }

    .review-actions-large {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: stretch;
    }

    .review-actions-large .btn {
      width: 100%;
      min-height: 62px;
      white-space: normal;
      text-align: center;
      justify-content: center;
    }

    .map-legend {
      margin-top: 14px;
    }

    .pumi-map-legend-details {
      border: 1px solid #dce5f1;
      border-radius: 16px;
      background: #fff;
      overflow: hidden;
    }

    .pumi-map-legend-details summary {
      cursor: pointer;
      padding: 15px 18px;
      color: #102a56;
      font-weight: 800;
      user-select: none;
    }

    .map-legend-items {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px 14px;
      padding: 0 18px 18px;
    }

    .map-legend-item {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
      color: #34435a;
      font-size: 0.92rem;
    }

    .map-legend-item i {
      width: 14px;
      height: 18px;
      border-radius: 10px 10px 10px 2px;
      transform: rotate(-45deg);
      flex: 0 0 auto;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
    }

    @media (max-width: 1100px) {
      .pumi-mini-kpi-grid,
      .pumi-review-filters,
      .pumi-dashboard-filter-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .pumi-valuation-layout {
        grid-template-columns: 1fr;
      }

      .map-legend-items {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .pumi-select-row,
      .review-compact-card {
        grid-template-columns: 1fr;
      }

      .pumi-mini-kpi-grid,
      .pumi-review-filters,
      .pumi-dashboard-filter-grid,
      .review-actions-large,
      .map-legend-items {
        grid-template-columns: 1fr;
      }

      .review-compact-meta {
        min-width: 0;
      }
    }
  `;

  document.head.appendChild(style);
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
