/* PUMI 2026 - módulo core. Extraído sin cambiar lógica. */

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

const ANNUAL_PROGRAMS_LABEL = "DARE, MPAS, GREAT, PSCC y PPL";

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
  dashboardActivityFilter: "",
  nationalViewerFilters: {
    region: "",
    delegation: "",
    program: "",
    activity: "",
    compliance: ""
  },
  selectedInstitutions: [],
  vifaHistorico: [],
  vifPlanificacion: [],
  centrosEducativos: []
};

const $ = (id) => document.getElementById(id);


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

  const items =
    isNationalViewerRole()
      ? [
          {
            id: "dashboard",
            label: "Panel Nacional",
            icon: "🗺️"
          }
        ]
      : [
          {
            id: "dashboard",
            label: "Panel principal",
            icon: "📊"
          }
        ];

  if (!isNationalViewerRole() && role.includes("DELEG")) {
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
    !isNationalViewerRole() &&
    (
      role.includes("REGIONAL") ||
      role.includes("COORDIN") ||
      role === "NACIONAL" ||
      role.includes("ADMIN")
    )
  ) {
    items.push({
      id: "revision",
      label: "Revisión y validación",
      icon: "✅"
    });
  }

  if (
    !isNationalViewerRole() &&
    (
      role === "NACIONAL" ||
      role.includes("ADMIN")
    )
  ) {
    items.push({
      id: "nacional",
      label: "Vista nacional",
      icon: "🗺️"
    });
  }

  if (isRegionalRole() || isNationalCoordinatorRole() || isNationalViewerRole()) {
    items.push({
      id: "informes",
      label: "Informes PDF",
      icon: "📄"
    });
  }

  if (
    !isNationalViewerRole() &&
    role.includes("ADMIN")
  ) {
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

  if (isNationalViewerRole()) {
    state.currentPage = "dashboard";
    $("page-title").textContent =
      "Panel Nacional";
  }
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

  if (pageId === "informes") {
    renderReportsModule();
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

async function loadStaticJson(path, fallback = {}) {
  try {
    const response = await fetch(
      `${path}?v=20260724-2`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch {
    return fallback;
  }
}

async function loadData() {
  try {
    const role = normalize(state.user?.role);

    const [
      activities,
      summary,
      catalogs,
      delegations,
      activityOptions,
      dashboard,
      vifaHistorico,
      vifPlanificacion,
      centrosEducativos
    ] = await Promise.all([
      api.getActivities(),
      api.getSummary(),
      api.getCatalogs(),
      api.getDelegations(),
      api.getActivityOptions(),
      api.getDashboard(),
      loadStaticJson("./data/vif-historico.json", { registros: [] }),
      loadStaticJson("./data/vif-planificacion.json", { registros: [] }),
      loadStaticJson("./data/centros-educativos.json", { centros: [] })
    ]);

    state.activityOptions =
      (activityOptions.options || [])
        .filter(isSelectableActivityOption);

    state.actividades =
      filterActivityFeaturesForCurrentRole(
        activities.features || []
      );

    state.resumen = summary.features || [];
    state.catalogos = catalogs.features || [];
    state.delegaciones = delegations.features || [];
    state.vifaHistorico = vifaHistorico.registros || [];
    state.vifPlanificacion = vifPlanificacion.registros || [];
    state.centrosEducativos = centrosEducativos.centros || [];

    state.dashboard =
      buildVisibleDashboard(
        dashboard || {}
      );

    state.regionalQueue = null;
    state.nationalQueue = null;

    if (
      role.includes("REGIONAL") ||
      role.includes("ADMIN")
    ) {
      state.regionalQueue =
        await api.getRegionalReviewQueue();

      state.regionalQueue.features =
        filterVisibleActivityFeatures(
          state.regionalQueue.features || []
        );

      state.regionalQueue.total =
        state.regionalQueue.features.length;

      state.regionalQueue.pending_count =
        state.regionalQueue.features.length;
    }

    if (
      role.includes("COORDIN") ||
      role === "NACIONAL" ||
      role.includes("ADMIN")
    ) {
      state.nationalQueue =
        await api.getNationalReviewQueue();

      state.nationalQueue.features =
        filterVisibleActivityFeatures(
          state.nationalQueue.features || []
        );

      state.nationalQueue.total =
        state.nationalQueue.features.length;

      state.nationalQueue.pending_count =
        state.nationalQueue.features.length;
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
  return state.actividades
    .filter(isVisibleActivityFeature)
    .map((feature) => ({
      ...(feature.attributes || {}),
      __geometry: feature.geometry || null
    }));
}

function isSelectableActivityOption(item = {}) {
  const isVifa = normalize(item.programa) === "VIF";
  const isVifaQuarterly =
    isVifa &&
    (
      item.es_control_trimestral === true ||
      normalize(item.control_trimestral) === "SI" ||
      [16, 17, 18].includes(
        numberValue(item.numero_actividad)
      )
    );

  return (
    numberValue(item.meta) > 0 ||
    isVifaQuarterly
  );
}

function isRegistrableActivityOption(item = {}) {
  if (!isSelectableActivityOption(item)) {
    return false;
  }

  if (normalize(item.programa) !== "VIF") {
    return true;
  }

  if (item.es_control_trimestral === true) {
    return true;
  }

  return item.registro_habilitado !== false;
}

function hasPositiveMetaForActivity(program, activity) {
  const normalizedProgram =
    normalize(program);

  const normalizedActivity =
    normalize(activity);

  if (
    !normalizedProgram ||
    !normalizedActivity ||
    normalizedProgram === "PROGRAMA" ||
    normalizedActivity === "ACTIVIDAD"
  ) {
    return false;
  }

  return state.activityOptions.some(
    (item) =>
      normalize(item.programa) ===
        normalizedProgram &&
      normalize(item.actividad) ===
        normalizedActivity &&
      numberValue(item.meta) > 0
  );
}

function isVisibleActivityRow(row = {}) {
  return (
    normalize(row.estado_registro) !==
      "ELIMINADO" &&
    hasPositiveMetaForActivity(
      row.programa,
      row.actividad
    )
  );
}

function isVisibleActivityFeature(feature = {}) {
  return isVisibleActivityRow(
    feature.attributes || {}
  );
}

function filterVisibleActivityFeatures(features = []) {
  return (features || []).filter(
    isVisibleActivityFeature
  );
}

/*
 * El Visor Nacional debe conservar los registros históricos importados
 * aunque su texto de programa/actividad no coincida exactamente con el
 * catálogo actual. Los demás roles mantienen la validación original.
 */
function isNationalViewerVisibleActivityRow(row = {}) {
  if (normalize(row.estado_registro) === "ELIMINADO") {
    return false;
  }

  const program = String(row.programa || "").trim();
  const activity = String(row.actividad || "").trim();

  if (
    !program ||
    !activity ||
    normalize(program) === "PROGRAMA" ||
    normalize(activity) === "ACTIVIDAD"
  ) {
    return false;
  }

  if (isHistorical(row)) {
    return numberValue(row.meta) > 0;
  }

  return isVisibleActivityRow(row);
}

function isNationalViewerVisibleActivityFeature(feature = {}) {
  return isNationalViewerVisibleActivityRow(
    feature.attributes || {}
  );
}

function filterActivityFeaturesForCurrentRole(features = []) {
  return (features || []).filter(
    isNationalViewerRole()
      ? isNationalViewerVisibleActivityFeature
      : isVisibleActivityFeature
  );
}

function buildVisibleDashboard(sourceDashboard = {}) {
  const rows = getRows();
  const progress = buildProgressRows(rows);

  const meta =
    sumBy(progress, "meta");

  const advance =
    sumBy(progress, "advance");

  const pending =
    Math.max(meta - advance, 0);

  const participants =
    rows.reduce(
      (total, row) =>
        total +
        numberValue(
          row.cantidad_participantes
        ),
      0
    );

  const statuses = {};

  for (const row of rows) {
    const status =
      workflowLabel(row);

    statuses[status] =
      (statuses[status] || 0) + 1;
  }

  const delegationMap =
    new Map();

  for (const row of rows) {
    const delegation =
      String(
        row.delegacion || ""
      ).trim();

    if (!delegation) {
      continue;
    }

    const key =
      normalize(delegation);

    if (!delegationMap.has(key)) {
      delegationMap.set(
        key,
        {
          delegacion:
            delegation,

          direccion_regional:
            String(
              row.direccion_regional ||
              ""
            ).trim(),

          registros:
            0,

          pendientes_regional:
            0,

          pendientes_nacional:
            0,

          validados:
            0
        }
      );
    }

    const item =
      delegationMap.get(key);

    item.registros += 1;

    const status =
      workflowLabel(row);

    if (
      status ===
      "Pendiente regional"
    ) {
      item.pendientes_regional += 1;
    }

    if (
      status ===
      "Pendiente nacional"
    ) {
      item.pendientes_nacional += 1;
    }

    if (
      status ===
      "Validado nacional"
    ) {
      item.validados += 1;
    }
  }

  const programs =
    (sourceDashboard.programs || [])
      .filter(
        (item) =>
          numberValue(item.meta) > 0
      );

  return {
    ...sourceDashboard,

    kpis: {
      registros:
        rows.length,

      meta,

      avance:
        advance,

      pendiente:
        pending,

      porcentaje_avance:
        meta > 0
          ? (advance / meta) * 100
          : 0,

      participantes:
        participants
    },

    statuses,

    delegations: [
      ...delegationMap.values()
    ].sort(
      (a, b) =>
        a.delegacion.localeCompare(
          b.delegacion,
          "es"
        )
    ),

    programs,

    activity_breakdown:
      (
        sourceDashboard.activity_breakdown ||
        []
      ).filter(
        (item) =>
          numberValue(item.meta) > 0
      ),

    map_features:
      filterVisibleActivityFeatures(
        sourceDashboard.map_features ||
        state.actividades
      )
  };
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


function getCatalogFieldValue(row, ...names) {
  for (const name of names) {
    const direct = row?.[name];

    if (
      direct !== null &&
      direct !== undefined &&
      String(direct).trim() !== ""
    ) {
      return String(direct).trim();
    }

    const normalizedName = normalize(name);

    const matchedKey = Object.keys(row || {}).find(
      (key) =>
        normalize(key) === normalizedName
    );

    if (matchedKey) {
      const value = row[matchedKey];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return String(value).trim();
      }
    }
  }

  return "";
}

function getLocationCatalogRows() {
  return getCatalogRows()
    .map((row) => ({
      provincia:
        getCatalogFieldValue(
          row,
          "provincia",
          "Provincia"
        ),

      canton:
        getCatalogFieldValue(
          row,
          "canton",
          "Cantón",
          "Canton"
        ),

      distrito:
        getCatalogFieldValue(
          row,
          "distrito",
          "Distrito"
        )
    }))
    .filter(
      (row) =>
        row.provincia &&
        row.canton &&
        row.distrito
    );
}

function getPlaceTypeOptions() {
  return [
    ...new Set(
      getCatalogRows()
        .map((row) =>
          getCatalogFieldValue(
            row,
            "tipo_lugar",
            "Tipo lugar",
            "Tipo de lugar"
          )
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function getInstitutionOptions() {
  return [
    ...new Set(
      getCatalogRows()
        .map((row) =>
          getCatalogFieldValue(
            row,
            "instituciones",
            "Instituciones",
            "institucion",
            "Institución"
          )
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function getEducationalCenterOptions(
  provincia = "",
  canton = "",
  distrito = ""
) {
  const provinceKey = normalize(provincia);
  const cantonKey = normalize(canton);
  const districtKey = normalize(distrito);

  return [
    ...new Set(
      (state.centrosEducativos || [])
        .filter((row) => {
          if (
            provinceKey &&
            normalize(row.provincia) !== provinceKey
          ) {
            return false;
          }

          if (
            cantonKey &&
            normalize(row.canton) !== cantonKey
          ) {
            return false;
          }

          if (
            districtKey &&
            normalize(row.distrito) !== districtKey
          ) {
            return false;
          }

          return Boolean(row.nombre);
        })
        .map((row) =>
          String(row.nombre || "").trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function isVifaOption(option) {
  return normalize(option?.programa) === "VIF";
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
  const role = getCurrentRole();
  return role.includes("COORDIN") && !role.includes("REGIONAL");
}

function isAdditionalActivityValue(value = "") {
  return normalize(value).startsWith("ADICIONAL_NO_PROGRAMADA");
}

function isAdditionalActivityRow(row = {}) {
  return isAdditionalActivityValue(row.tipo_seguimiento);
}

function getStoredFollowUpType(value = "") {
  const raw = String(value || "").trim();
  if (!isAdditionalActivityValue(raw)) return raw;
  return raw.split("|").slice(1).join("|").trim();
}

function isNationalViewerRole() {
  const role =
    getCurrentRole();

  return (
    role.includes("VISOR") &&
    role.includes("NACIONAL")
  );
}

function getAssignedProgramNormalized() {
  return normalize(
    state.user?.program ||
    state.user?.programa ||
    state.user?.assignedProgram ||
    ""
  );
}

function isVifNationalCoordinator() {
  const program = getAssignedProgramNormalized();

  return (
    isNationalCoordinatorRole() &&
    (program === "VIF" || program === "VIFA")
  );
}

function workflowLabel(row) {
  if (isHistorical(row)) {
    return "Revisado";
  }

  const flow =
    normalize(row.estado_flujo);

  const labels = {
    BORRADOR: "Borrador",
    PENDIENTE_REGIONAL: "Pendiente regional",
    DEVUELTO_REGIONAL: "Devuelto regional",
    PENDIENTE_NACIONAL: "Pendiente nacional",
    VALIDADO_NACIONAL: "Validado nacional",
    NO_VALIDADO_NACIONAL: "No validado nacional",
    ELIMINADO: "Eliminado"
  };

  if (labels[flow]) {
    return labels[flow];
  }

  const regional =
    normalize(row.estado_regional);

  const national =
    normalize(row.estado_nacional);

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


