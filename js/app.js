import { ApiService } from "../services/api-service.js";

const api = new ApiService();

const state = {
  user: null,
  actividades: [],
  resumen: [],
  catalogos: [],
  delegaciones: [],
  notificaciones: [],
  mapView: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", initialize);

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
  $("btn-open-notifications").addEventListener("click", openNotifications);
  $("btn-close-notifications").addEventListener("click", closeNotifications);
  $("drawer-backdrop").addEventListener("click", closeNotifications);
}

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
          <span class="nav-label">${item.label}</span>
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

function navigate(pageId, title) {
  document
    .querySelectorAll(".page")
    .forEach((page) =>
      page.classList.remove("active")
    );

  if (pageId === "dashboard") {
    $("dashboard-page").classList.add("active");

    $("page-title").textContent =
      "Panel principal";

    return;
  }

  $("coming-page").classList.add("active");

  $("page-title").textContent = title;
  $("coming-title").textContent = title;

  $("coming-description").textContent =
    "El acceso ya está conectado al backend. Este módulo se incorporará en la siguiente entrega.";
}

async function loadData() {
  try {
    const [
      activities,
      summary,
      catalogs,
      delegations
    ] = await Promise.all([
      api.getActivities(),
      api.getSummary(),
      api.getCatalogs(),
      api.getDelegations()
    ]);

    state.actividades =
      activities.features || [];

    state.resumen =
      summary.features || [];

    state.catalogos =
      catalogs.features || [];

    state.delegaciones =
      delegations.features || [];

    state.notificaciones =
      createDerivedNotifications();

    renderAll();

    showToast(
      "Información real actualizada desde ArcGIS."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

function renderAll() {
  ensureActivityBreakdownPanel();

  renderKpis();
  renderProgramSummary();
  renderActivityBreakdown();
  renderStatusSummary();
  renderNotifications();
  renderMap();
}

/* =====================================================
   DATOS
===================================================== */

function getSummaryRows() {
  return state.resumen.map(
    (feature) => feature.attributes || {}
  );
}

function getActivityRows() {
  return state.actividades.map(
    (feature) => feature.attributes || {}
  );
}

function firstValue(
  row,
  fields,
  fallback = ""
) {
  for (const field of fields) {
    const value = row?.[field];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

function numericValue(row, fields) {
  const value = firstValue(
    row,
    fields,
    0
  );

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getProgram(row) {
  return String(
    firstValue(
      row,
      [
        "programa",
        "Programa",
        "PROGRAMA"
      ],
      ""
    )
  ).trim();
}

function getActivity(row) {
  return String(
    firstValue(
      row,
      [
        "actividad",
        "actividad_realizada",
        "Actividad",
        "ACTIVIDAD"
      ],
      ""
    )
  ).trim();
}

function getMeta(row) {
  return numericValue(
    row,
    [
      "meta",
      "meta_2026",
      "meta_oficial",
      "Meta",
      "META"
    ]
  );
}

function getBaseAdvance(row) {
  return numericValue(
    row,
    [
      "avance",
      "avance_base",
      "avance_acumulado",
      "Avance",
      "AVANCE"
    ]
  );
}

function getActivityAdvance(row) {
  return numericValue(
    row,
    [
      "avance",
      "avance_realizado",
      "Avance Realizado",
      "AVANCE"
    ]
  );
}

function getParticipants(row) {
  return numericValue(
    row,
    [
      "cantidad_participantes",
      "participantes",
      "Cantidad Participantes",
      "PARTICIPANTES"
    ]
  );
}

function getRegionalStatus(row) {
  return normalize(
    firstValue(
      row,
      [
        "estado_verificacion_regional",
        "estado_regional"
      ],
      ""
    )
  );
}

function getNationalStatus(row) {
  return normalize(
    firstValue(
      row,
      [
        "estado_validacion",
        "estado_nacional"
      ],
      ""
    )
  );
}

/* =====================================================
   FLUJO HISTÓRICO Y NUEVO
===================================================== */

function isHistoricalValidated(row) {
  return (
    !getRegionalStatus(row) &&
    !getNationalStatus(row)
  );
}

function isNationalApproved(row) {
  const status = getNationalStatus(row);

  return (
    status.includes("APROB") ||
    status.includes("VALIDAD")
  );
}

function validatedNewActivities() {
  return getActivityRows().filter(
    (row) =>
      !isHistoricalValidated(row) &&
      isNationalApproved(row)
  );
}

/* =====================================================
   META - AVANCE - PENDIENTE - PORCENTAJE
===================================================== */

function buildProgressRows() {
  const grouped = new Map();

  for (const row of getSummaryRows()) {
    const program = getProgram(row);
    const activity = getActivity(row);

    if (!program || !activity) {
      continue;
    }

    const key =
      `${normalize(program)}|||${normalize(activity)}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        program,
        activity,
        meta: 0,
        baseAdvance: 0,
        newApprovedAdvance: 0
      });
    }

    const item = grouped.get(key);

    item.meta += getMeta(row);

    item.baseAdvance +=
      getBaseAdvance(row);
  }

  for (
    const row of validatedNewActivities()
  ) {
    const program = getProgram(row);
    const activity = getActivity(row);

    if (!program || !activity) {
      continue;
    }

    const key =
      `${normalize(program)}|||${normalize(activity)}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        program,
        activity,
        meta: 0,
        baseAdvance: 0,
        newApprovedAdvance: 0
      });
    }

    grouped.get(key).newApprovedAdvance +=
      getActivityAdvance(row);
  }

  return [...grouped.values()].map(
    (item) => {
      const advance =
        item.baseAdvance +
        item.newApprovedAdvance;

      const pending =
        Math.max(
          item.meta - advance,
          0
        );

      const percentage =
        item.meta > 0
          ? (advance / item.meta) * 100
          : 0;

      return {
        ...item,
        advance,
        pending,
        percentage
      };
    }
  );
}

/* =====================================================
   KPIS
===================================================== */

function renderKpis() {
  const activityRows =
    getActivityRows();

  const progressRows =
    buildProgressRows();

  const records =
    activityRows.length;

  const meta =
    progressRows.reduce(
      (sum, row) =>
        sum + row.meta,
      0
    );

  const advance =
    progressRows.reduce(
      (sum, row) =>
        sum + row.advance,
      0
    );

  const pending =
    Math.max(
      meta - advance,
      0
    );

  const percentage =
    meta > 0
      ? (advance / meta) * 100
      : 0;

  const participants =
    activityRows.reduce(
      (sum, row) =>
        sum + getParticipants(row),
      0
    );

  const values = [
    [
      "Registros",
      formatNumber(records)
    ],
    [
      "Meta",
      formatNumber(meta)
    ],
    [
      "Avance",
      formatNumber(advance)
    ],
    [
      "Pendiente",
      formatNumber(pending)
    ],
    [
      "% avance",
      `${percentage.toFixed(1)}%`
    ],
    [
      "Participantes",
      formatNumber(participants)
    ]
  ];

  $("dashboard-kpis").innerHTML =
    values
      .map(
        ([label, value]) => `
          <article class="kpi-card">
            <span>
              ${escapeHtml(label)}
            </span>

            <strong>
              ${escapeHtml(value)}
            </strong>
          </article>
        `
      )
      .join("");
}

/* =====================================================
   PROGRAMAS
===================================================== */

function renderProgramSummary() {
  const grouped = {};

  for (
    const row of buildProgressRows()
  ) {
    const program = row.program;

    if (!grouped[program]) {
      grouped[program] = {
        meta: 0,
        advance: 0,
        pending: 0
      };
    }

    grouped[program].meta +=
      row.meta;

    grouped[program].advance +=
      row.advance;

    grouped[program].pending +=
      row.pending;
  }

  const values =
    Object.entries(grouped)
      .map(
        ([program, data]) => {
          const percentage =
            data.meta > 0
              ? (
                  data.advance /
                  data.meta
                ) * 100
              : 0;

          return [
            program,
            data.advance,
            `${formatNumber(data.advance)} / ${formatNumber(data.meta)} · ${percentage.toFixed(1)}%`
          ];
        }
      )
      .sort(
        (a, b) =>
          b[1] - a[1]
      );

  renderBarList(
    "program-summary",
    values
  );
}

/* =====================================================
   DESGLOSE POR ACTIVIDAD
===================================================== */

function ensureActivityBreakdownPanel() {
  if ($("activity-summary")) {
    return;
  }

  const dashboardGrid =
    document.querySelector(
      "#dashboard-page .dashboard-grid"
    );

  if (!dashboardGrid) {
    return;
  }

  const panel =
    document.createElement("article");

  panel.className = "panel-card";

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">
          CUMPLIMIENTO
        </span>

        <h3>
          Desglose por actividad
        </h3>
      </div>
    </div>

    <div
      id="activity-summary"
      class="activity-progress-list"
    ></div>
  `;

  dashboardGrid.insertAdjacentElement(
    "afterend",
    panel
  );
}

function renderActivityBreakdown() {
  const container =
    $("activity-summary");

  if (!container) {
    return;
  }

  const rows =
    buildProgressRows()
      .sort((a, b) => {
        const programCompare =
          a.program.localeCompare(
            b.program,
            "es"
          );

        if (programCompare !== 0) {
          return programCompare;
        }

        return a.activity.localeCompare(
          b.activity,
          "es"
        );
      });

  if (!rows.length) {
    container.innerHTML = `
      <p class="page-scope">
        No hay metas ni actividades disponibles.
      </p>
    `;

    return;
  }

  container.innerHTML = `
    <div style="overflow:auto;">
      <table
        style="
          width:100%;
          border-collapse:collapse;
        "
      >
        <thead>
          <tr>
            <th style="text-align:left;padding:12px;">
              Programa
            </th>

            <th style="text-align:left;padding:12px;">
              Actividad
            </th>

            <th style="text-align:right;padding:12px;">
              Meta
            </th>

            <th style="text-align:right;padding:12px;">
              Avance
            </th>

            <th style="text-align:right;padding:12px;">
              Pendiente
            </th>

            <th style="text-align:right;padding:12px;">
              % avance
            </th>
          </tr>
        </thead>

        <tbody>
          ${rows
            .map(
              (row) => `
                <tr
                  style="
                    border-top:
                    1px solid #dce3ed;
                  "
                >
                  <td
                    style="
                      padding:12px;
                      font-weight:800;
                    "
                  >
                    ${escapeHtml(row.program)}
                  </td>

                  <td style="padding:12px;">
                    ${escapeHtml(row.activity)}
                  </td>

                  <td
                    style="
                      padding:12px;
                      text-align:right;
                    "
                  >
                    ${formatNumber(row.meta)}
                  </td>

                  <td
                    style="
                      padding:12px;
                      text-align:right;
                    "
                  >
                    ${formatNumber(row.advance)}
                  </td>

                  <td
                    style="
                      padding:12px;
                      text-align:right;
                    "
                  >
                    ${formatNumber(row.pending)}
                  </td>

                  <td
                    style="
                      padding:12px;
                      text-align:right;
                      font-weight:900;
                    "
                  >
                    ${row.percentage.toFixed(1)}%
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

/* =====================================================
   ESTADOS DE REVISIÓN
===================================================== */

function workflowLabel(row) {
  if (isHistoricalValidated(row)) {
    return "Histórico validado";
  }

  const national =
    getNationalStatus(row);

  const regional =
    getRegionalStatus(row);

  if (
    national.includes("APROB") ||
    national.includes("VALIDAD")
  ) {
    return "Aprobada";
  }

  if (
    national.includes("RECHAZ") ||
    national.includes("OBSERV")
  ) {
    return "Observada nacional";
  }

  if (
    regional.includes("DEVUEL") ||
    regional.includes("OBSERV")
  ) {
    return "Devuelta / observada regional";
  }

  if (
    regional.includes("VERIFIC") &&
    national.includes("PENDIENTE")
  ) {
    return "Pendiente de validación nacional";
  }

  if (
    regional.includes("PENDIENTE")
  ) {
    return "Pendiente de revisión regional";
  }

  return "En proceso";
}

function renderStatusSummary() {
  const grouped = {};

  for (
    const row of getActivityRows()
  ) {
    const status =
      workflowLabel(row);

    grouped[status] =
      (grouped[status] || 0) + 1;
  }

  const values =
    Object.entries(grouped)
      .map(
        ([label, value]) => [
          label,
          value,
          formatNumber(value)
        ]
      )
      .sort(
        (a, b) =>
          b[1] - a[1]
      );

  renderBarList(
    "status-summary",
    values
  );
}

/* =====================================================
   BARRAS
===================================================== */

function renderBarList(id, values) {
  const max = Math.max(
    1,
    ...values.map(
      (item) =>
        Number(item[1]) || 0
    )
  );

  $(id).innerHTML =
    values.length
      ? values
          .map(
            ([
              label,
              value,
              displayValue
            ]) => `
              <div class="bar-row">
                <span
                  class="bar-label"
                  title="${escapeHtml(label)}"
                >
                  ${escapeHtml(label)}
                </span>

                <div class="bar-track">
                  <div
                    class="bar-fill"
                    style="
                      width:
                      ${(Number(value) / max) * 100}%
                    "
                  ></div>
                </div>

                <strong
                  title="${escapeHtml(
                    displayValue ?? value
                  )}"
                >
                  ${escapeHtml(
                    displayValue ??
                    formatNumber(value)
                  )}
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

/* =====================================================
   MAPA
===================================================== */

function renderMap() {
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
      if (state.mapView) {
        state.mapView.destroy();
        state.mapView = null;
      }

      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      const layer =
        new GraphicsLayer();

      map.add(layer);

      state.actividades.forEach(
        (feature) => {
          if (!feature.geometry) {
            return;
          }

          const attributes =
            feature.attributes || {};

          layer.add(
            new Graphic({
              geometry: {
                type: "point",
                longitude:
                  feature.geometry.x,
                latitude:
                  feature.geometry.y,
                spatialReference: {
                  wkid: 4326
                }
              },

              symbol: {
                type: "simple-marker",
                color: [0, 43, 127],
                size: 10,
                outline: {
                  color: [
                    255,
                    255,
                    255
                  ],
                  width: 1
                }
              },

              attributes,

              popupTemplate: {
                title: "{delegacion}",

                content:
                  "<b>Programa:</b> {programa}<br>" +
                  "<b>Actividad:</b> {actividad}<br>" +
                  "<b>Estado:</b> {estado_validacion}"
              }
            })
          );
        }
      );

      const view = new MapView({
        container: "dashboard-map",
        map,
        center: [-84.1, 9.95],
        zoom: 7
      });

      state.mapView = view;

      if (layer.graphics.length) {
        view
          .goTo(layer.graphics)
          .catch(() => {});
      }
    }
  );
}

/* =====================================================
   NOTIFICACIONES
===================================================== */

function createDerivedNotifications() {
  const role =
    normalize(state.user?.role);

  const rows =
    getActivityRows();

  const notes = [];

  if (role.includes("REGIONAL")) {
    const count =
      rows.filter(
        (row) =>
          getRegionalStatus(row)
            .includes("PENDIENTE")
      ).length;

    if (count) {
      notes.push({
        message:
          `${count} actividad(es) pendiente(s) de revisión regional.`,
        date: Date.now()
      });
    }
  }

  if (role.includes("COORDIN")) {
    const count =
      rows.filter(
        (row) =>
          getRegionalStatus(row)
            .includes("VERIFIC") &&
          getNationalStatus(row)
            .includes("PENDIENTE")
      ).length;

    if (count) {
      notes.push({
        message:
          `${count} actividad(es) pendiente(s) de validación nacional.`,
        date: Date.now()
      });
    }
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
                  ${new Date(
                    item.date
                  ).toLocaleString("es-CR")}
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

/* =====================================================
   UTILIDADES
===================================================== */

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

function formatNumber(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "es-CR",
    {
      maximumFractionDigits: 2
    }
  );
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

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3600);
}
