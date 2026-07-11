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
const $ = id => document.getElementById(id);

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

  const name = state.user?.name || state.user?.username || "Usuario";
  const role = state.user?.role || "Sin rol";

  $("sidebar-user-name").textContent = name;
  $("sidebar-user-role").textContent = role;
  $("sidebar-avatar").textContent = name.charAt(0).toUpperCase();
  $("welcome-title").textContent = `Bienvenido, ${name}`;

  $("page-scope").textContent = [
    state.user?.region,
    state.user?.delegation,
    state.user?.program
  ].filter(Boolean).join(" · ");

  buildNavigation();
}

function logout() {
  api.setToken("");
  window.location.reload();
}

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("compact");
  document.querySelector(".page-shell").classList.toggle("compact");
}

function buildNavigation() {
  const role = normalize(state.user?.role);
  const items = [{ id:"dashboard", label:"Panel principal", icon:"📊" }];

  if (role.includes("DELEG")) {
    items.push(
      { id:"delegacion", label:"Registrar actividad", icon:"➕" },
      { id:"mis-registros", label:"Mis registros", icon:"📋" }
    );
  }

  if (role.includes("REGIONAL") || role.includes("COORDIN") || role.includes("NACIONAL") || role.includes("ADMIN")) {
    items.push({ id:"revision", label:"Revisión y validación", icon:"✅" });
  }

  if (role.includes("NACIONAL") || role.includes("ADMIN")) {
    items.push({ id:"nacional", label:"Vista nacional", icon:"🗺️" });
  }

  if (role.includes("ADMIN")) {
    items.push({ id:"usuarios", label:"Usuarios", icon:"👥" });
  }

  $("sidebar-nav").innerHTML = items.map((item, i) => `
    <button class="nav-item ${i===0 ? "active":""}" data-page="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </button>`).join("");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
      button.classList.add("active");
      navigate(button.dataset.page, button.textContent.trim());
    });
  });
}

function navigate(pageId, title) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

  if (pageId === "dashboard") {
    $("dashboard-page").classList.add("active");
    $("page-title").textContent = "Panel principal";
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
    const [activities, summary, catalogs, delegations] = await Promise.all([
      api.getActivities(),
      api.getSummary(),
      api.getCatalogs(),
      api.getDelegations()
    ]);

    state.actividades = activities.features || [];
    state.resumen = summary.features || [];
    state.catalogos = catalogs.features || [];
    state.delegaciones = delegations.features || [];
    state.notificaciones = createDerivedNotifications();

    renderAll();
    showToast("Información real actualizada desde ArcGIS.");
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

function renderKpis() {
  const rows = state.actividades.map(f => f.attributes || {});
  const total = rows.length;
  const pending = rows.filter(r => normalize(r.estado_validacion || r.estado_verificacion_regional).includes("PENDIENTE")).length;
  const approved = rows.filter(r => normalize(r.estado_validacion).includes("APROB")).length;
  const participants = rows.reduce((s,r) => s + Number(r.cantidad_participantes ?? r.participantes ?? 0), 0);
  const advance = rows.reduce((s,r) => s + Number(r.avance ?? r.avance_realizado ?? 0), 0);

  $("dashboard-kpis").innerHTML = [
    ["Registros", total],
    ["Pendientes", pending],
    ["Aprobados", approved],
    ["Participantes", participants],
    ["Avance", advance]
  ].map(([label,value]) => `
    <article class="kpi-card">
      <span>${label}</span>
      <strong>${Number(value).toLocaleString("es-CR")}</strong>
    </article>`).join("");
}

function renderProgramSummary() {
  const rows = state.actividades.map(f => f.attributes || {});
  renderBarList("program-summary", groupCount(rows, "programa"));
}

function renderStatusSummary() {
  const grouped = {};

  state.actividades.forEach(feature => {
    const row = feature.attributes || {};
    const status = row.estado_validacion || row.estado_verificacion_regional || "Sin estado";
    grouped[status] = (grouped[status] || 0) + 1;
  });

  renderBarList("status-summary", Object.entries(grouped).sort((a,b) => b[1]-a[1]));
}

function groupCount(rows, field) {
  const grouped = {};
  rows.forEach(row => {
    const label = row[field] || "Sin dato";
    grouped[label] = (grouped[label] || 0) + 1;
  });
  return Object.entries(grouped).sort((a,b) => b[1]-a[1]);
}

function renderBarList(id, values) {
  const max = Math.max(1, ...values.map(x => x[1]));
  $(id).innerHTML = values.length
    ? values.map(([label,value]) => `
      <div class="bar-row">
        <span class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(value/max)*100}%"></div></div>
        <strong>${value}</strong>
      </div>`).join("")
    : `<p class="page-scope">No hay datos disponibles.</p>`;
}

function renderMap() {
  require(
    ["esri/Map","esri/views/MapView","esri/Graphic","esri/layers/GraphicsLayer"],
    (Map, MapView, Graphic, GraphicsLayer) => {
      if (state.mapView) {
        state.mapView.destroy();
        state.mapView = null;
      }

      const map = new Map({ basemap:"streets-navigation-vector" });
      const layer = new GraphicsLayer();
      map.add(layer);

      state.actividades.forEach(feature => {
        if (!feature.geometry) return;
        const attributes = feature.attributes || {};

        layer.add(new Graphic({
          geometry:{
            type:"point",
            longitude:feature.geometry.x,
            latitude:feature.geometry.y,
            spatialReference:{wkid:4326}
          },
          symbol:{
            type:"simple-marker",
            color:[0,43,127],
            size:10,
            outline:{color:[255,255,255],width:1}
          },
          attributes,
          popupTemplate:{
            title:"{delegacion}",
            content:"<b>Programa:</b> {programa}<br><b>Actividad:</b> {actividad}<br><b>Estado:</b> {estado_validacion}"
          }
        }));
      });

      const view = new MapView({
        container:"dashboard-map",
        map,
        center:[-84.1,9.95],
        zoom:7
      });

      state.mapView = view;
      if (layer.graphics.length) view.goTo(layer.graphics).catch(()=>{});
    }
  );
}

function createDerivedNotifications() {
  const role = normalize(state.user?.role);
  const rows = state.actividades.map(f => f.attributes || {});
  const notes = [];

  if (role.includes("REGIONAL")) {
    const count = rows.filter(r =>
      normalize(r.estado_verificacion_regional || "Pendiente de verificación").includes("PENDIENTE")
    ).length;
    if (count) notes.push({message:`${count} actividad(es) pendiente(s) de revisión regional.`, date:Date.now()});
  }

  if (role.includes("COORDIN")) {
    const count = rows.filter(r =>
      normalize(r.estado_verificacion_regional).includes("VERIFICADA") &&
      normalize(r.estado_validacion).includes("PENDIENTE")
    ).length;
    if (count) notes.push({message:`${count} actividad(es) pendiente(s) de validación nacional.`, date:Date.now()});
  }

  return notes;
}

function renderNotifications() {
  const count = state.notificaciones.length;
  $("notification-count").textContent = count;
  $("notification-count").classList.toggle("hidden", count === 0);

  $("notifications-list").innerHTML = count
    ? state.notificaciones.map(item => `
      <article class="notification-item">
        <strong>${escapeHtml(item.message)}</strong>
        <small>${new Date(item.date).toLocaleString("es-CR")}</small>
      </article>`).join("")
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

function normalize(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);
}

function showToast(message, error=false) {
  const toast = $("toast");
  toast.textContent = message;
  toast.style.background = error ? "#b42318" : "#111827";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3600);
}
