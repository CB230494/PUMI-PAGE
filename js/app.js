import { APP_CONFIG } from "../config/config.js";
import {
  ArcGISService,
  launchOAuth,
  readOAuthTokenFromHash
} from "../services/arcgis-service.js";

const service = new ArcGISService();

const state = {
  demo: false,
  portalUser: null,
  user: null,
  actividades: [],
  resumen: [],
  notificaciones: [],
  mapView: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  bindEvents();

  const token = readOAuthTokenFromHash();

  if (token) {
    service.setToken(token);
  }

  if (service.token) {
    try {
      await authenticateWithArcGIS();
      return;
    } catch (error) {
      service.setToken("");
      showToast(error.message, true);
    }
  }

  showLogin();
}

function bindEvents() {
  $("btn-login-arcgis").addEventListener("click", () => {
    if (APP_CONFIG.oauthClientId.includes("COLOQUE")) {
      showToast(
        "Primero debe colocar el Client ID en config/config.js.",
        true
      );
      return;
    }

    launchOAuth();
  });

  $("btn-login-demo").addEventListener("click", openDemo);
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

async function authenticateWithArcGIS() {
  state.portalUser = await service.getPortalUser();
  state.user = await service.getPumiUser(
    state.portalUser.username
  );

  if (!state.user) {
    throw new Error(
      "El usuario ArcGIS no se encuentra autorizado en PUMI_USUARIOS."
    );
  }

  showMain();
  await loadData();
}

function openDemo() {
  state.demo = true;

  state.portalUser = {
    username: "nacional_demo",
    fullName: "Usuario Nacional Demo"
  };

  state.user = {
    usuario: "nacional_demo",
    nombre: "Usuario Nacional Demo",
    rol: "Administrador",
    direccion_regional: "",
    delegacion: "",
    programa: "",
    activo: 1
  };

  seedDemoData();
  showMain();
  renderAll();
}

function showLogin() {
  $("login-view").classList.remove("hidden");
  $("main-view").classList.add("hidden");
}

function showMain() {
  $("login-view").classList.add("hidden");
  $("main-view").classList.remove("hidden");

  const name =
    state.user?.nombre ||
    state.portalUser?.fullName ||
    "Usuario";

  const role = state.user?.rol || "Sin rol";

  $("sidebar-user-name").textContent = name;
  $("sidebar-user-role").textContent = role;
  $("sidebar-avatar").textContent = name.charAt(0).toUpperCase();

  $("welcome-title").textContent = `Bienvenido, ${name}`;

  const scope = [
    state.user?.direccion_regional,
    state.user?.delegacion,
    state.user?.programa
  ]
    .filter(Boolean)
    .join(" · ");

  $("page-scope").textContent = scope;

  buildNavigation();
}

function logout() {
  service.setToken("");
  sessionStorage.clear();
  window.location.reload();
}

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("compact");
  document.querySelector(".page-shell").classList.toggle("compact");
}

function buildNavigation() {
  const role = normalize(state.user?.rol);

  const items = [
    {
      id: "dashboard",
      label: "Panel principal",
      icon: "📊"
    }
  ];

  if (role.includes("deleg")) {
    items.push({
      id: "delegacion",
      label: "Registrar actividad",
      icon: "➕"
    });

    items.push({
      id: "mis-registros",
      label: "Mis registros",
      icon: "📋"
    });
  }

  if (
    role.includes("regional") ||
    role.includes("coordin") ||
    role.includes("nacional") ||
    role.includes("admin")
  ) {
    items.push({
      id: "revision",
      label: "Revisión y validación",
      icon: "✅"
    });
  }

  if (
    role.includes("nacional") ||
    role.includes("admin")
  ) {
    items.push({
      id: "nacional",
      label: "Vista nacional",
      icon: "🗺️"
    });
  }

  if (role.includes("admin")) {
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
      document
        .querySelectorAll(".nav-item")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");
      navigate(button.dataset.page, button.textContent.trim());
    });
  });
}

function navigate(pageId, title) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  if (pageId === "dashboard") {
    $("dashboard-page").classList.add("active");
    $("page-title").textContent = "Panel principal";
    return;
  }

  $("coming-page").classList.add("active");
  $("page-title").textContent = title;
  $("coming-title").textContent = title;
  $("coming-description").textContent =
    "Este módulo se conectará en la siguiente entrega sin alterar la estructura ya creada.";
}

async function loadData() {
  if (state.demo) {
    renderAll();
    showToast("Datos de demostración actualizados.");
    return;
  }

  try {
    const [actividades, resumen] = await Promise.all([
      service.queryLayer(APP_CONFIG.layers.actividades),
      service.queryLayer(APP_CONFIG.layers.resumen)
    ]);

    state.actividades = actividades;
    state.resumen = resumen;
    state.notificaciones = createDerivedNotifications();

    renderAll();
    showToast("Datos actualizados correctamente.");
  } catch (error) {
    showToast(error.message, true);
  }
}

function renderAll() {
  renderKpis();
  renderProgramSummary();
  renderStatusSummary();
  renderNotifications();
  renderMap();
}

function scopedActivities() {
  const role = normalize(state.user?.rol);
  const region = normalize(state.user?.direccion_regional);
  const delegation = normalize(state.user?.delegacion);
  const program = normalize(state.user?.programa);

  return state.actividades.filter((feature) => {
    const row = feature.attributes || {};

    if (role.includes("deleg")) {
      return normalize(row.delegacion) === delegation;
    }

    if (role.includes("regional")) {
      return normalize(row.direccion_regional) === region;
    }

    if (role.includes("coordin")) {
      return normalize(row.programa).includes(program);
    }

    return true;
  });
}

function renderKpis() {
  const rows = scopedActivities().map(
    (feature) => feature.attributes || {}
  );

  const total = rows.length;

  const pending = rows.filter((row) =>
    normalize(
      row.estado_validacion ||
      row.estado_verificacion_regional
    ).includes("pendiente")
  ).length;

  const approved = rows.filter((row) =>
    normalize(row.estado_validacion).includes("aprob")
  ).length;

  const participants = rows.reduce(
    (sum, row) =>
      sum + Number(row.cantidad_participantes || 0),
    0
  );

  const advance = rows.reduce(
    (sum, row) => sum + Number(row.avance || 0),
    0
  );

  const data = [
    ["Registros", total],
    ["Pendientes", pending],
    ["Aprobados", approved],
    ["Participantes", participants],
    ["Avance", advance]
  ];

  $("dashboard-kpis").innerHTML = data
    .map(
      ([label, value]) => `
        <article class="kpi-card">
          <span>${label}</span>
          <strong>${Number(value).toLocaleString("es-CR")}</strong>
        </article>
      `
    )
    .join("");
}

function renderProgramSummary() {
  const rows = scopedActivities().map(
    (feature) => feature.attributes || {}
  );

  const grouped = groupCount(rows, "programa");
  renderBarList("program-summary", grouped);
}

function renderStatusSummary() {
  const rows = scopedActivities().map(
    (feature) => feature.attributes || {}
  );

  const grouped = {};

  rows.forEach((row) => {
    const status =
      row.estado_validacion ||
      row.estado_verificacion_regional ||
      "Sin estado";

    grouped[status] = (grouped[status] || 0) + 1;
  });

  renderBarList(
    "status-summary",
    Object.entries(grouped).sort((a, b) => b[1] - a[1])
  );
}

function groupCount(rows, field) {
  const grouped = {};

  rows.forEach((row) => {
    const label = row[field] || "Sin dato";
    grouped[label] = (grouped[label] || 0) + 1;
  });

  return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
}

function renderBarList(containerId, values) {
  const max = Math.max(
    1,
    ...values.map((item) => item[1])
  );

  $(containerId).innerHTML = values.length
    ? values
        .map(
          ([label, value]) => `
            <div class="bar-row">
              <span class="bar-label" title="${escapeHtml(label)}">
                ${escapeHtml(label)}
              </span>

              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width:${(value / max) * 100}%"
                ></div>
              </div>

              <strong>${value}</strong>
            </div>
          `
        )
        .join("")
    : `<p class="page-scope">No hay datos disponibles.</p>`;
}

function renderMap() {
  const features = scopedActivities();

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/layers/GraphicsLayer"
    ],
    (Map, MapView, Graphic, GraphicsLayer) => {
      if (state.mapView) {
        state.mapView.destroy();
        state.mapView = null;
      }

      const map = new Map({
        basemap: "streets-navigation-vector"
      });

      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);

      features.forEach((feature) => {
        if (!feature.geometry) {
          return;
        }

        const attributes = feature.attributes || {};

        graphicsLayer.add(
          new Graphic({
            geometry: {
              type: "point",
              longitude: feature.geometry.x,
              latitude: feature.geometry.y,
              spatialReference: {
                wkid: 4326
              }
            },
            symbol: {
              type: "simple-marker",
              color: [0, 43, 127],
              size: 10,
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
                "<b>Estado:</b> {estado_validacion}"
            }
          })
        );
      });

      const view = new MapView({
        container: "dashboard-map",
        map,
        center: [-84.1, 9.95],
        zoom: 7
      });

      state.mapView = view;

      if (graphicsLayer.graphics.length > 0) {
        view.goTo(graphicsLayer.graphics).catch(() => {});
      }
    }
  );
}

function createDerivedNotifications() {
  const role = normalize(state.user?.rol);
  const rows = scopedActivities().map(
    (feature) => feature.attributes || {}
  );

  const notifications = [];

  if (role.includes("regional")) {
    const count = rows.filter((row) =>
      normalize(
        row.estado_verificacion_regional ||
        "Pendiente de verificación"
      ).includes("pendiente")
    ).length;

    if (count > 0) {
      notifications.push({
        message:
          `${count} actividad(es) pendiente(s) de revisión regional.`,
        date: Date.now()
      });
    }
  }

  if (role.includes("coordin")) {
    const count = rows.filter(
      (row) =>
        normalize(row.estado_verificacion_regional).includes(
          "verificada"
        ) &&
        normalize(row.estado_validacion).includes("pendiente")
    ).length;

    if (count > 0) {
      notifications.push({
        message:
          `${count} actividad(es) pendiente(s) de validación nacional.`,
        date: Date.now()
      });
    }
  }

  return notifications;
}

function renderNotifications() {
  const count = state.notificaciones.length;

  $("notification-count").textContent = count;
  $("notification-count").classList.toggle("hidden", count === 0);

  $("notifications-list").innerHTML = count
    ? state.notificaciones
        .map(
          (item) => `
            <article class="notification-item">
              <strong>${escapeHtml(item.message)}</strong>
              <small>${new Date(item.date).toLocaleString("es-CR")}</small>
            </article>
          `
        )
        .join("")
    : `<p class="page-scope">No hay notificaciones pendientes.</p>`;
}

function openNotifications() {
  $("notifications-drawer").classList.remove("hidden");
  $("drawer-backdrop").classList.remove("hidden");
}

function closeNotifications() {
  $("notifications-drawer").classList.add("hidden");
  $("drawer-backdrop").classList.add("hidden");
}

function seedDemoData() {
  state.actividades = [
    {
      attributes: {
        OBJECTID: 1,
        direccion_regional:
          "Dirección Regional 1 - San José Central",
        delegacion: "D01 Carmen",
        programa: "DARE",
        actividad: "Charla preventiva",
        cantidad_participantes: 42,
        avance: 1,
        estado_verificacion_regional:
          "Pendiente de verificación",
        estado_validacion: "Pendiente"
      },
      geometry: {
        x: -84.078,
        y: 9.936
      }
    },
    {
      attributes: {
        OBJECTID: 2,
        direccion_regional:
          "Dirección Regional 1 - San José Central",
        delegacion: "D02 Merced",
        programa: "GREAT",
        actividad: "Sesión educativa",
        cantidad_participantes: 31,
        avance: 1,
        estado_verificacion_regional:
          "Verificada para envío",
        estado_validacion: "Aprobada"
      },
      geometry: {
        x: -84.084,
        y: 9.943
      }
    },
    {
      attributes: {
        OBJECTID: 3,
        direccion_regional:
          "Dirección Regional 2 - Alajuela",
        delegacion: "Delegación Alajuela",
        programa: "PSCC",
        actividad: "Reunión comunitaria",
        cantidad_participantes: 28,
        avance: 1,
        estado_verificacion_regional:
          "Verificada para envío",
        estado_validacion: "Pendiente"
      },
      geometry: {
        x: -84.2116,
        y: 10.0162
      }
    }
  ];

  state.resumen = [];

  state.notificaciones = [
    {
      message:
        "2 actividades pendientes de revisión o validación.",
      date: Date.now()
    }
  ];
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value || "").replace(
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

function showToast(message, error = false) {
  const toast = $("toast");

  toast.textContent = message;
  toast.style.background = error ? "#b42318" : "#111827";
  toast.classList.remove("hidden");

  window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 3400);
}

