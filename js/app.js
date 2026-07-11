import { ApiService } from "../services/api-service.js";

const api = new ApiService();

const state = {
  user: null,
  actividades: [],
  resumen: [],
  catalogos: [],
  delegaciones: [],
  activityOptions: [],
  notificaciones: [],
  mapView: null,
  formMapView: null,
  formMapGraphics: null,
  formMapGraphicClass: null,
  selectedPoint: null,
  editingObjectId: null
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
  $("login-form").addEventListener("submit", login);
  $("btn-logout").addEventListener("click", logout);
  $("btn-refresh").addEventListener("click", loadData);
  $("btn-toggle-sidebar").addEventListener("click", toggleSidebar);

  $("btn-open-notifications").addEventListener(
    "click",
    openNotifications
  );

  $("btn-close-notifications").addEventListener(
    "click",
    closeNotifications
  );

  $("drawer-backdrop").addEventListener(
    "click",
    closeNotifications
  );
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
    const result = await api.login(
      username,
      password
    );

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
  $("login-view").classList.remove("hidden");
  $("main-view").classList.add("hidden");
}

function showMain() {
  $("login-view").classList.add("hidden");
  $("main-view").classList.remove("hidden");

  const name =
    state.user?.name ||
    state.user?.username ||
    "Usuario";

  const role =
    state.user?.role ||
    "Sin rol";

  $("sidebar-user-name").textContent = name;
  $("sidebar-user-role").textContent = role;

  $("sidebar-avatar").textContent =
    name.charAt(0).toUpperCase();

  $("welcome-title").textContent =
    `Bienvenido, ${name}`;

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
  document
    .querySelector(".sidebar")
    .classList.toggle("compact");

  document
    .querySelector(".page-shell")
    .classList.toggle("compact");
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
    role.includes("NACIONAL") ||
    role.includes("ADMIN")
  ) {
    items.push({
      id: "revision",
      label: "Revisión y validación",
      icon: "✅"
    });
  }

  if (
    role.includes("NACIONAL") ||
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

          <span class="nav-label">
            ${item.label}
          </span>
        </button>
      `
    )
    .join("");

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".nav-item")
          .forEach((item) =>
            item.classList.remove("active")
          );

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
  document
    .querySelectorAll(".page")
    .forEach((page) =>
      page.classList.remove("active")
    );

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
    renderRegionalModule();

    return;
  }

  renderComing(title);
}

function renderComing(title) {
  $("coming-page").innerHTML = `
    <article class="panel-card empty-state">
      <div class="empty-icon">🛠️</div>

      <h2>${escapeHtml(title)}</h2>

      <p>
        Este módulo será activado en la siguiente etapa.
      </p>
    </article>
  `;
}

/* =========================================================
   CARGA DE DATOS
========================================================= */

async function loadData() {
  try {
    const [
      activities,
      summary,
      catalogs,
      delegations,
      activityOptions
    ] = await Promise.all([
      api.getActivities(),
      api.getSummary(),
      api.getCatalogs(),
      api.getDelegations(),
      api.getActivityOptions()
    ]);

    state.actividades =
      activities.features || [];

    state.resumen =
      summary.features || [];

    state.catalogos =
      catalogs.features || [];

    state.delegaciones =
      delegations.features || [];

    state.activityOptions =
      activityOptions.options || [];

    state.notificaciones =
      createDerivedNotifications();

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
            normalize(row.tipo_catalogo) ===
              normalizedType &&
            isCatalogActive(row)
        )
        .map(
          (row) =>
            String(
              row.descripcion ||
              row.codigo ||
              ""
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function isCatalogActive(row) {
  const active = normalize(row.activo);

  return (
    !active ||
    active === "SI" ||
    active === "SÍ" ||
    active === "1" ||
    active === "ACTIVO" ||
    active === "ACTIVA"
  );
}

function isHistorical(row) {
  return String(
    row.archivo_origen || ""
  ).trim() !== "";
}

function getObjectId(row) {
  return Number(row.OBJECTID);
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  ensureActivityBreakdownPanel();
  renderKpis();
  renderProgramSummary();
  renderActivityBreakdown();
  renderStatusSummary();
  renderMap();
}

function buildProgressRows() {
  const grouped = new Map();

  for (const row of getRows()) {
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

function renderKpis() {
  const rows = getRows();
  const progress = buildProgressRows();

  const meta = sumBy(progress, "meta");

  const advance = sumBy(
    progress,
    "advance"
  );

  const pending = Math.max(
    meta - advance,
    0
  );

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

  const values = [
    ["Registros", rows.length],
    ["Meta", meta],
    ["Avance", advance],
    ["Pendiente", pending],
    ["% avance", `${percentage.toFixed(1)}%`],
    ["Participantes", participants]
  ];

  $("dashboard-kpis").innerHTML = values
    .map(
      ([label, value]) => `
        <article class="kpi-card">
          <span>${escapeHtml(label)}</span>

          <strong>
            ${formatNumber(value)}
          </strong>
        </article>
      `
    )
    .join("");
}

function renderProgramSummary() {
  const grouped = {};

  for (const row of buildProgressRows()) {
    if (!grouped[row.program]) {
      grouped[row.program] = {
        meta: 0,
        advance: 0
      };
    }

    grouped[row.program].meta += row.meta;

    grouped[row.program].advance +=
      row.advance;
  }

  const programs = Object.entries(grouped)
    .map(([program, data]) => {
      const pending = Math.max(
        data.meta - data.advance,
        0
      );

      const percentage =
        data.meta > 0
          ? (
              data.advance /
              data.meta
            ) * 100
          : 0;

      return {
        program,
        meta: data.meta,
        advance: data.advance,
        pending,
        percentage
      };
    })
    .sort(
      (a, b) =>
        b.percentage - a.percentage
    );

  $("program-summary").innerHTML =
    programs.length
      ? programs
          .map(
            (item) => `
              <div class="program-progress-row">

                <div
                  class="program-progress-name"
                  title="${escapeHtml(
                    item.program
                  )}"
                >
                  ${escapeHtml(item.program)}
                </div>

                <div class="program-progress-center">

                  <div class="program-progress-track">
                    <div
                      class="program-progress-fill"
                      style="
                        width:${Math.min(
                          item.percentage,
                          100
                        )}%
                      "
                    ></div>
                  </div>

                  <div class="program-progress-detail">
                    Meta:
                    <strong>
                      ${formatNumber(item.meta)}
                    </strong>

                    · Avance:
                    <strong>
                      ${formatNumber(item.advance)}
                    </strong>

                    · Pendiente:
                    <strong>
                      ${formatNumber(item.pending)}
                    </strong>
                  </div>

                </div>

                <div class="program-progress-percentage">
                  ${item.percentage.toFixed(1)}%
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

function ensureActivityBreakdownPanel() {
  if ($("activity-summary")) {
    return;
  }

  const grid = document.querySelector(
    "#dashboard-page .dashboard-grid"
  );

  if (!grid) {
    return;
  }

  const panel =
    document.createElement("article");

  panel.className = "panel-card";

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

  grid.insertAdjacentElement(
    "afterend",
    panel
  );
}

function renderActivityBreakdown() {
  const container = $("activity-summary");

  if (!container) {
    return;
  }

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
    });

  container.innerHTML = `
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
                      ${escapeHtml(row.program)}
                    </strong>
                  </td>

                  <td>
                    ${escapeHtml(row.activity)}
                  </td>

                  <td>
                    ${formatNumber(row.meta)}
                  </td>

                  <td>
                    ${formatNumber(row.advance)}
                  </td>

                  <td>
                    ${formatNumber(row.pending)}
                  </td>

                  <td>
                    <strong>
                      ${row.percentage.toFixed(1)}%
                    </strong>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function workflowLabel(row) {
  if (isHistorical(row)) {
    return "Revisado";
  }

  const regional = normalize(
    row.estado_regional
  );

  const national = normalize(
    row.estado_nacional
  );

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
    regional.includes("VERIFIC")
  ) {
    return "Pendiente nacional";
  }

  return "Pendiente regional";
}

function renderStatusSummary() {
  const grouped = {};

  for (const row of getRows()) {
    const status = workflowLabel(row);

    grouped[status] =
      (grouped[status] || 0) + 1;
  }

  renderSimpleBars(
    "status-summary",
    Object.entries(grouped)
  );
}

function renderSimpleBars(id, values) {
  const max = Math.max(
    1,
    ...values.map((item) => item[1])
  );

  $(id).innerHTML = values.length
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
                  style="
                    width:${
                      (value / max) * 100
                    }%
                  "
                ></div>
              </div>

              <strong>${value}</strong>
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
          item.programa === program
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

    if (!option) {
      $("activity-progress-card")
        .innerHTML = "";

      $("activity-advance")
        .removeAttribute("max");

      return;
    }

    $("activity-progress-card")
      .innerHTML = `
        <div>
          <span>Meta</span>

          <strong>
            ${formatNumber(option.meta)}
          </strong>
        </div>

        <div>
          <span>Avance validado</span>

          <strong>
            ${formatNumber(
              option.avance_validado
            )}
          </strong>
        </div>

        <div>
          <span>En revisión</span>

          <strong>
            ${formatNumber(
              option.avance_en_revision
            )}
          </strong>
        </div>

        <div>
          <span>Disponible</span>

          <strong>
            ${formatNumber(
              option.disponible_registro
            )}
          </strong>
        </div>
      `;

    $("activity-advance").max =
      option.disponible_registro;

    if (
      option.disponible_registro <= 0
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
      item.programa ===
        $("activity-program").value &&
      item.actividad ===
        $("activity-name").value
  );
}

function fillActivityForm(row) {
  $("activity-program").value =
    row.programa || "";

  $("activity-program").dispatchEvent(
    new Event("change")
  );

  $("activity-name").value =
    row.actividad || "";

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

    const quantity = numberValue(
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

    const men = numberValue(
      $("activity-men").value
    );

    const women = numberValue(
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

      avance_realizado: quantity,

      responsable:
        $("activity-responsible").value,

      cantidad_hombres: men,

      cantidad_mujeres: women,

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
   LOCALIDADES DESDE PUMI_CATALOGOS
========================================================= */

function setupLocationSelectors() {
  const province =
    $("activity-province");

  const canton =
    $("activity-canton");

  const district =
    $("activity-district");

  const provinces =
    getCatalogValues("PROVINCIA");

  const cantons =
    getCatalogValues("CANTON");

  const districts =
    getCatalogValues("DISTRITO");

  fillSelect(
    province,
    provinces,
    false,
    "Seleccione una provincia"
  );

  fillSelect(
    canton,
    cantons,
    false,
    "Seleccione un cantón"
  );

  fillSelect(
    district,
    districts,
    false,
    "Seleccione un distrito"
  );

  /*
   * PUMI_CATALOGOS actualmente tiene:
   * tipo_catalogo, codigo y descripcion.
   *
   * No tiene provincia_padre ni canton_padre.
   * Por eso el catálogo actual permite cargar correctamente
   * las tres listas, pero todavía no permite relacionar
   * técnicamente cada cantón con una provincia ni cada
   * distrito con un cantón.
   *
   * La selección queda funcional y sin listas vacías.
   */
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
          size: 13,
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
                          data-edit-record="${getObjectId(
                            row
                          )}"
                        >
                          Editar
                        </button>

                        <button
                          class="btn btn-danger btn-small"
                          data-delete-record="${getObjectId(
                            row
                          )}"
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
    .querySelectorAll(
      "[data-delete-record]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const objectId = Number(
            button.dataset.deleteRecord
          );

          const confirmed =
            window.confirm(
              "¿Desea eliminar este registro?"
            );

          if (!confirmed) {
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

/* =========================================================
   MÓDULO REGIONAL
========================================================= */

function renderRegionalModule() {
  const role = normalize(
    state.user?.role
  );

  if (
    !role.includes("REGIONAL") &&
    !role.includes("ADMIN")
  ) {
    renderComing(
      "Revisión y validación"
    );

    return;
  }

  const rows = getRows().filter(
    (row) => !isHistorical(row)
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

  $("coming-page").innerHTML = `
    <article class="panel-card">

      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Dirección Regional
          </span>

          <h2>
            Revisión de actividades
          </h2>
        </div>
      </div>

      <div class="filter-grid">

        <label>
          Delegación

          <select
            id="regional-filter-delegation"
          ></select>
        </label>

        <label>
          Programa

          <select
            id="regional-filter-program"
          ></select>
        </label>

        <label>
          Estado

          <select
            id="regional-filter-status"
          >
            <option value="">
              Todos
            </option>

            <option value="Pendiente regional">
              Pendiente regional
            </option>

            <option value="Pendiente nacional">
              Pendiente nacional
            </option>

            <option value="Devuelto regional">
              Devuelto regional
            </option>

            <option value="Validado nacional">
              Validado nacional
            </option>
          </select>
        </label>

      </div>

      <div id="regional-records"></div>

    </article>
  `;

  fillSelect(
    $("regional-filter-delegation"),
    delegations,
    true
  );

  fillSelect(
    $("regional-filter-program"),
    programs,
    true
  );

  const render = () =>
    renderRegionalRecords(rows);

  $("regional-filter-delegation")
    .addEventListener(
      "change",
      render
    );

  $("regional-filter-program")
    .addEventListener(
      "change",
      render
    );

  $("regional-filter-status")
    .addEventListener(
      "change",
      render
    );

  render();
}

function renderRegionalRecords(sourceRows) {
  const delegation =
    $("regional-filter-delegation").value;

  const program =
    $("regional-filter-program").value;

  const status =
    $("regional-filter-status").value;

  const rows = sourceRows.filter((row) => {
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
      status &&
      workflowLabel(row) !== status
    ) {
      return false;
    }

    return true;
  });

  $("regional-records").innerHTML =
    rows.length
      ? rows
          .map(
            (row) => `
              <article class="review-card">

                <div class="review-card-header">

                  <div>

                    <span class="status-badge">
                      ${escapeHtml(
                        workflowLabel(row)
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

                  </div>

                  <strong>
                    Avance:
                    ${formatNumber(
                      row.avance_realizado
                    )}
                  </strong>

                </div>

                <div class="review-detail">

                  <strong>Actividad</strong>

                  <p>
                    ${escapeHtml(
                      row.actividad
                    )}
                  </p>

                  <strong>Fecha</strong>

                  <p>
                    ${formatDate(
                      row.fecha_actividad
                    )}
                  </p>

                  <strong>Responsable</strong>

                  <p>
                    ${escapeHtml(
                      row.responsable
                    )}
                  </p>

                  <strong>Participantes</strong>

                  <p>
                    ${formatNumber(
                      row.cantidad_participantes
                    )}
                  </p>

                  <strong>Ubicación</strong>

                  <p>
                    ${escapeHtml(
                      [
                        row.provincia,
                        row.canton,
                        row.distrito,
                        row.lugar
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    )}
                  </p>

                  <strong>Observaciones</strong>

                  <p>
                    ${escapeHtml(
                      row.observaciones ||
                      "Sin observaciones"
                    )}
                  </p>

                </div>

                <div class="review-actions">

                  <button
                    class="btn btn-primary"
                    data-regional-approve="${getObjectId(
                      row
                    )}"
                  >
                    ✅ Revisar y enviar
                  </button>

                  <button
                    class="btn btn-warning"
                    data-regional-return="${getObjectId(
                      row
                    )}"
                  >
                    ↩️ Devolver
                  </button>

                  <button
                    class="btn btn-secondary"
                    data-regional-edit="${getObjectId(
                      row
                    )}"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    class="btn btn-danger"
                    data-regional-delete="${getObjectId(
                      row
                    )}"
                  >
                    🗑️ Eliminar
                  </button>

                </div>

              </article>
            `
          )
          .join("")
      : `
          <div class="module-empty">
            No hay registros para los filtros seleccionados.
          </div>
        `;

  bindRegionalActions(sourceRows);
}

function bindRegionalActions(sourceRows) {
  document
    .querySelectorAll(
      "[data-regional-approve]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const observations =
            window.prompt(
              "Observaciones regionales:",
              ""
            ) || "";

          await performRegionalReview(
            Number(
              button.dataset.regionalApprove
            ),
            "Revisado regional",
            observations
          );
        }
      );
    });

  document
    .querySelectorAll(
      "[data-regional-return]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const observations =
            window.prompt(
              "Indique la observación para devolver el registro:"
            );

          if (!observations) {
            return;
          }

          await performRegionalReview(
            Number(
              button.dataset.regionalReturn
            ),
            "Devuelto regional",
            observations
          );
        }
      );
    });

  document
    .querySelectorAll(
      "[data-regional-edit]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const objectId = Number(
            button.dataset.regionalEdit
          );

          const row = sourceRows.find(
            (item) =>
              getObjectId(item) === objectId
          );

          if (row) {
            regionalQuickEdit(row);
          }
        }
      );
    });

  document
    .querySelectorAll(
      "[data-regional-delete]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const objectId = Number(
            button.dataset.regionalDelete
          );

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

            renderRegionalModule();

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

    renderRegionalModule();

    showToast(
      status === "Revisado regional"
        ? "Actividad enviada a validación nacional."
        : "Actividad devuelta a la delegación."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

async function regionalQuickEdit(row) {
  const responsible =
    window.prompt(
      "Responsable:",
      row.responsable || ""
    );

  if (responsible === null) {
    return;
  }

  const participants =
    window.prompt(
      "Cantidad de participantes:",
      row.cantidad_participantes || 0
    );

  if (participants === null) {
    return;
  }

  const observations =
    window.prompt(
      "Observaciones:",
      row.observaciones || ""
    );

  if (observations === null) {
    return;
  }

  try {
    await api.updateActivity(
      getObjectId(row),
      {
        responsable: responsible,

        cantidad_participantes:
          numberValue(participants),

        observaciones: observations
      }
    );

    await loadData();

    renderRegionalModule();

    showToast(
      "Registro actualizado."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   NOTIFICACIONES
========================================================= */

function createDerivedNotifications() {
  const role = normalize(
    state.user?.role
  );

  const rows = getRows();

  const notes = [];

  if (role.includes("REGIONAL")) {
    const grouped = {};

    rows
      .filter(
        (row) =>
          !isHistorical(row) &&
          workflowLabel(row) ===
            "Pendiente regional"
      )
      .forEach((row) => {
        const delegation =
          row.delegacion || "Delegación";

        grouped[delegation] =
          (grouped[delegation] || 0) + 1;
      });

    for (
      const [delegation, count]
      of Object.entries(grouped)
    ) {
      notes.push({
        message:
          `${delegation} registró ${count} actividad(es) pendiente(s) de revisión.`,

        date: Date.now()
      });
    }
  }

  if (role.includes("DELEG")) {
    rows
      .filter(
        (row) =>
          !isHistorical(row) &&
          normalize(row.usuario_registra) ===
            normalize(
              state.user?.username
            ) &&
          (
            workflowLabel(row) ===
              "Devuelto regional" ||
            workflowLabel(row) ===
              "Pendiente nacional" ||
            workflowLabel(row) ===
              "Validado nacional"
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
   MAPA DASHBOARD CORREGIDO
========================================================= */

function renderMap() {
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

      for (
        const feature
        of state.actividades
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
          longitude === null
        ) {
          continue;
        }

        if (
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          continue;
        }

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
              size: 10,
              color: [0, 43, 127],

              outline: {
                color: [255, 255, 255],
                width: 1
              }
            },

            attributes,

            popupTemplate: {
              title: "{delegacion}",

              content:
                "<b>Programa:</b> {programa}<br>" +
                "<b>Actividad:</b> {actividad}<br>" +
                "<b>Avance realizado:</b> {avance_realizado}<br>" +
                "<b>Lugar:</b> {lugar}"
            }
          })
        );
      }

      state.mapView = new MapView({
        container: "dashboard-map",
        map,
        center: [-84.1, 9.95],
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
    }
  );
}

/* =========================================================
   UTILIDADES
========================================================= */

function isNationalApproved(row) {
  const status = normalize(
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
      <option value="" selected disabled>
        ${escapeHtml(placeholder)}
      </option>
    `;
  }

  const uniqueValues = [
    ...new Set(
      values
        .map(
          (value) =>
            String(value || "").trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  for (const value of uniqueValues) {
    html += `
      <option value="${escapeHtml(value)}">
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
        <option value="${escapeHtml(target)}">
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
  const parsed = Number(value);

  return Number.isFinite(parsed)
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

function sumBy(rows, field) {
  return rows.reduce(
    (total, row) =>
      total +
      numberValue(row[field]),
    0
  );
}

function formatNumber(value) {
  if (typeof value === "string") {
    return value;
  }

  return Number(
    value || 0
  ).toLocaleString(
    "es-CR",
    {
      maximumFractionDigits: 2
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

function dateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

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
  const toast = $("toast");

  toast.textContent = message;

  toast.style.background =
    error
      ? "#b42318"
      : "#111827";

  toast.classList.remove("hidden");

  setTimeout(
    () =>
      toast.classList.add("hidden"),
    4000
  );
}
