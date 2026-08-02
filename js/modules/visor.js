/* PUMI 2026 - módulo visor. Extraído sin cambiar lógica. */

function renderNationalViewerDashboard() {
  ensureNationalViewerState();
  toggleBreakdownPanel(false);
  removeDelegationOverviewPanel();
  configureNationalViewerLayout();
  renderNationalViewerControls();
  applyNationalViewerFilters();
}

function removeDelegationOverviewPanel() {
  $("delegation-overview-panel")
    ?.remove();
}

/* =========================================================
   VISOR NACIONAL - ESTADO Y REGLAS DE NEGOCIO
========================================================= */

function ensureNationalViewerState() {
  state.nationalViewerFilters = {
    activityType: "PLANIFICADA",
    region: "",
    delegation: "",
    program: "",
    activity: "",
    compliance: "",
    ...(state.nationalViewerFilters || {})
  };

  if (!["PLANIFICADA", "ADICIONAL_NO_PROGRAMADA"].includes(
    state.nationalViewerFilters.activityType
  )) {
    state.nationalViewerFilters.activityType = "PLANIFICADA";
  }
}

function getNationalViewerCurrentQuarter(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month <= 3) return "T1";
  if (month <= 6) return "T2";
  if (month <= 9) return "T3";
  return "T4";
}

function isNationalViewerAdditionalRow(row = {}) {
  const tracking = normalize(row.tipo_seguimiento || "");
  const observations = normalize(row.observaciones || "");
  return tracking.startsWith("ADICIONAL_NO_PROGRAMADA") ||
    observations.includes("ADICIONAL_NO_PROGRAMADA");
}

function isNationalViewerVifRow(row = {}) {
  const program = normalize(row.programa || "");
  return program === "VIF" || program === "VIFA";
}

function getNationalViewerFlow(row = {}) {
  return normalize(row.estado_flujo || row.estado_nacional || row.estado_regional || "");
}

function isNationalViewerValidated(row = {}) {
  const flow = getNationalViewerFlow(row);
  return flow === "VALIDADO_NACIONAL" || flow === "VALIDADO" || flow === "REVISADO";
}

function isNationalViewerInReview(row = {}) {
  const flow = getNationalViewerFlow(row);
  return [
    "PENDIENTE_REGIONAL",
    "PENDIENTE_NACIONAL",
    "EN_REVISION",
    "EN REVISIÓN",
    "EN REVISION"
  ].includes(flow);
}

function getNationalViewerExecutionAmount(row = {}) {
  return Math.max(
    numberValue(row.avance_realizado),
    numberValue(row.avance)
  );
}

function getNationalViewerParticipants(row = {}) {
  return Math.max(
    numberValue(row.cantidad_participantes),
    numberValue(row.cantidad_hombres) + numberValue(row.cantidad_mujeres)
  );
}

function getNationalViewerDelegationGeometry(delegation = "") {
  const match = (state.delegaciones || []).find((feature) => {
    const attributes = feature?.attributes || {};
    const catalogDelegation = getCatalogFieldValue(
      attributes,
      "delegacion", "Delegacion", "Delegación", "DELEGACION",
      "nombre_delegacion", "NOMBRE_DELEGACION", "nombre", "Nombre", "NOMBRE"
    );
    return sameDelegation(catalogDelegation, delegation);
  });

  if (match?.geometry) return match.geometry;

  const activityMatch = (state.actividades || []).find((feature) =>
    sameDelegation(feature?.attributes?.delegacion, delegation) && feature?.geometry
  );

  return activityMatch?.geometry || null;
}

function getNationalViewerVifPlanningKey(row = {}) {
  const code = normalize(
    row.codigo_actividad_vifa || row.codigo_actividad || row.codigo || ""
  );
  if (code) return code;

  const number = String(row.numero_actividad || "").trim();
  if (number) return `NUM-${number.padStart(2, "0")}`;

  return normalize(row.actividad || row.nombre_actividad || "");
}

function getNationalViewerVifPlanningRows() {
  const quarter = getNationalViewerCurrentQuarter();
  const executionRows = (state.actividades || [])
    .filter(isNationalViewerVisibleActivityFeature)
    .map((feature) => ({
      ...(feature.attributes || {}),
      __geometry: feature.geometry || null
    }))
    .filter((row) => isNationalViewerVifRow(row) && !isNationalViewerAdditionalRow(row));

  const optionByCode = new Map(
    (state.activityOptions || [])
      .filter((option) => isNationalViewerVifRow(option))
      .map((option) => [getNationalViewerVifPlanningKey(option), option])
      .filter(([key]) => Boolean(key))
  );

  const planningMap = new Map();

  for (const item of (state.vifaHistorico || [])) {
    const itemQuarter = normalize(
      item.trimestre || item.trimestre_programado || item.trimestre_programado_vifa || ""
    );

    if (itemQuarter && itemQuarter !== quarter) continue;

    const delegation = String(item.delegacion || "").trim();
    if (!delegation) continue;

    const activityKey = getNationalViewerVifPlanningKey(item);
    if (!activityKey) continue;

    const key = `${getDelegationCanonicalKey(delegation)}|||${activityKey}`;

    /* Dedupe estricto por delegación + actividad. Esto evita que variantes
       repetidas del catálogo eleven el total nacional por encima de 8 por delegación. */
    if (!planningMap.has(key)) {
      planningMap.set(key, item);
    }
  }

  return [...planningMap.values()].map((item, index) => {
    const delegation = String(item.delegacion || "").trim();
    const planningKey = getNationalViewerVifPlanningKey(item);
    const option = optionByCode.get(planningKey) || {};
    const activity = String(
      option.actividad || option.nombre_actividad || item.actividad || item.nombre_actividad ||
      `Actividad ${item.numero_actividad || planningKey}`
    ).trim();

    const metaRaw = numberValue(item.linea_base ?? option.linea_base ?? option.meta);
    const isControl = Boolean(
      item.control_trimestral || option.es_control_trimestral ||
      normalize(item.tipo_medicion || option.tipo_medicion || option.tipo_medicion_vifa) === "CONTROL_TRIMESTRAL"
    );

    const matches = executionRows.filter((row) => {
      if (!sameDelegation(row.delegacion, delegation)) return false;

      const rowQuarter = normalize(
        row.trimestre_ejecucion_vifa || row.trimestre_programado_vifa || ""
      );
      if (rowQuarter && rowQuarter !== quarter) return false;

      const rowKey = getNationalViewerVifPlanningKey(row);
      if (rowKey && planningKey) return rowKey === planningKey;

      return normalize(row.actividad) === normalize(activity);
    });

    let validatedAmount = 0;
    let reviewAmount = 0;

    for (const row of matches) {
      const amount = isControl ? 1 : getNationalViewerExecutionAmount(row);
      if (isNationalViewerValidated(row)) validatedAmount += amount;
      else if (isNationalViewerInReview(row)) reviewAmount += amount;
    }

    const meta = isControl ? 1 : metaRaw;
    const validatedForProgress = isControl
      ? (validatedAmount > 0 ? 1 : 0)
      : validatedAmount;
    const reviewForProgress = isControl
      ? (reviewAmount > 0 ? 1 : 0)
      : reviewAmount;

    const progressRatio = meta > 0
      ? Math.min(validatedForProgress / meta, 1)
      : 0;

    return {
      id_pumi: `VIF-PLAN-${index + 1}`,
      programa: "VIF",
      actividad,
      direccion_regional: item.direccion_regional || getRegionFromDelegationCatalog(delegation) || "",
      delegacion,
      meta,
      avance: validatedForProgress,
      avance_validado: validatedForProgress,
      avance_en_revision: reviewForProgress,
      pendiente: Math.max(meta - Math.min(validatedForProgress, meta), 0),
      porcentaje_cumplimiento: progressRatio * 100,
      estado_registro: "ACTIVO",
      estado_flujo: validatedAmount > 0
        ? "VALIDADO_NACIONAL"
        : reviewAmount > 0
          ? "PENDIENTE_NACIONAL"
          : "PLANIFICADO",
      codigo_actividad_vifa:
        item.codigo_actividad_vifa || item.codigo_actividad || option.codigo_actividad_vifa || option.codigo_actividad || "",
      trimestre_programado_vifa: quarter,
      tipo_medicion_vifa: isControl ? "CONTROL_TRIMESTRAL" : "LINEA_BASE",
      linea_base_vifa: metaRaw,
      __isVifPlanning: true,
      __vifControl: isControl,
      __vifCompleted: progressRatio >= 1,
      __vifHasAdvance: validatedAmount > 0 || reviewAmount > 0,
      __vifProgress: progressRatio,
      __geometry: getNationalViewerDelegationGeometry(delegation)
    };
  });
}

function getNationalViewerFeatureFromRow(row = {}) {
  const attributes = { ...row };
  delete attributes.__geometry;
  return {
    attributes,
    geometry: row.__geometry || null
  };
}

function getNationalViewerRowRegion(row = {}) {
  return getActivityRegion(row) || row.direccion_regional || "";
}

function getNationalViewerVisibleTerritory(features = []) {
  const regions = new Set();
  const delegations = new Set();

  for (const feature of features) {
    const row = feature?.attributes || {};
    const region = getNationalViewerRowRegion(row);
    const delegation = String(row.delegacion || "").trim();
    if (region) regions.add(normalize(region));
    if (delegation) delegations.add(getDelegationCanonicalKey(delegation));
  }

  return { regions: regions.size, delegations: delegations.size };
}

function getNationalViewerAdditionalStatus(row = {}) {
  if (isNationalViewerValidated(row)) return "VALIDADA";
  if (isNationalViewerInReview(row)) return "EN_REVISION";
  return "OTRA";
}


function configureNationalViewerLayout() {
  const programPanel =
    $("program-summary")
      ?.closest(".panel-card");

  const statusPanel =
    $("status-summary")
      ?.closest(".panel-card");

  programPanel?.classList.add(
    "hidden"
  );

  statusPanel?.classList.add(
    "hidden"
  );

  const mapPanel =
    $("dashboard-map")
      ?.closest(".panel-card");

  if (mapPanel) {
    const heading =
      mapPanel.querySelector("h3");

    if (heading) {
      heading.textContent =
        "Mapa nacional de cumplimiento";
    }
  }
}

function getNationalViewerControlsPanel() {
  let panel =
    $("national-viewer-controls");

  if (panel) {
    return panel;
  }

  const mapPanel =
    $("dashboard-map")
      ?.closest(".panel-card");

  if (!mapPanel) {
    return null;
  }

  panel =
    document.createElement(
      "article"
    );

  panel.id =
    "national-viewer-controls";

  panel.className =
    "panel-card";

  mapPanel.insertAdjacentElement(
    "beforebegin",
    panel
  );

  return panel;
}

function getNationalViewerTablePanel() {
  let panel = $("national-viewer-table-panel");
  if (panel) return panel;

  const mapPanel = $("dashboard-map")?.closest(".panel-card");
  if (!mapPanel) return null;

  panel = document.createElement("article");
  panel.id = "national-viewer-table-panel";
  panel.className = "panel-card";
  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">Consulta nacional</span>
        <h3 id="national-viewer-table-title">Resumen por delegación</h3>
      </div>
    </div>
    <div id="national-viewer-table"></div>
  `;
  mapPanel.insertAdjacentElement("afterend", panel);
  return panel;
}

function getNationalViewerBaseRows() {
  ensureNationalViewerState();
  const type = state.nationalViewerFilters.activityType;

  const arcgisRows = (state.actividades || [])
    .filter(isNationalViewerVisibleActivityFeature)
    .map((feature) => ({
      ...(feature.attributes || {}),
      programa: isNationalViewerVifRow(feature.attributes || {})
        ? "VIF"
        : feature.attributes?.programa,
      __geometry: feature.geometry || null
    }));

  if (type === "ADICIONAL_NO_PROGRAMADA") {
    return arcgisRows.filter(isNationalViewerAdditionalRow);
  }

  const annualRows = arcgisRows.filter((row) =>
    !isNationalViewerAdditionalRow(row) && !isNationalViewerVifRow(row)
  );

  /* VIF se construye desde la planificación T actual para que las 8 actividades
     de cada delegación existan en el Visor aun con avance 0. La ejecución real
     se cruza arriba contra PUMI_ACTIVIDADES. */
  const vifRows = getNationalViewerVifPlanningRows();

  return [...annualRows, ...vifRows];
}

/*
 * Resuelve la Dirección Regional real de cada actividad.
 * Los registros históricos pueden traerla como direccion_regional,
 * region, codigo_region (DR2, DR3, etc.) o únicamente mediante la
 * delegación. Se usa la capa PUMI_DELEGACIONES como catálogo maestro.
 */
function getActivityDelegation(row = {}) {
  return getCatalogFieldValue(
    row,
    "delegacion",
    "Delegacion",
    "Delegación",
    "DELEGACION",
    "nombre_delegacion",
    "NOMBRE_DELEGACION"
  );
}

function getDirectActivityRegion(row = {}) {
  return getCatalogFieldValue(
    row,
    "direccion_regional",
    "Direccion_Regional",
    "Dirección regional",
    "DIRECCION_REGIONAL",
    "direccionRegional",
    "region",
    "Region",
    "REGION",
    "nombre_region",
    "NOMBRE_REGION"
  );
}

function getActivityRegionCode(row = {}) {
  return getCatalogFieldValue(
    row,
    "codigo_region",
    "Código región",
    "Codigo region",
    "CODIGO_REGION",
    "codigo_regional",
    "CODIGO_REGIONAL",
    "cod_region",
    "COD_REGION"
  );
}

function getRegionFromDelegationCatalog(delegation = "") {
  const cleanDelegation = String(delegation || "").trim();

  if (!cleanDelegation) {
    return "";
  }

  const match = (state.delegaciones || [])
    .map((feature) => feature.attributes || {})
    .find((attributes) => {
      const catalogDelegation = getCatalogFieldValue(
        attributes,
        "delegacion",
        "Delegacion",
        "Delegación",
        "DELEGACION",
        "nombre_delegacion",
        "NOMBRE_DELEGACION",
        "nombre",
        "Nombre",
        "NOMBRE"
      );

      return sameDelegation(
        catalogDelegation,
        cleanDelegation
      );
    });

  if (!match) {
    return "";
  }

  return getCatalogFieldValue(
    match,
    "direccion_regional",
    "Direccion_Regional",
    "Dirección regional",
    "DIRECCION_REGIONAL",
    "direccionRegional",
    "region",
    "Region",
    "REGION",
    "nombre_region",
    "NOMBRE_REGION"
  );
}

function getRegionFromCode(regionCode = "") {
  const compactCode = normalize(regionCode)
    .replace(/[^A-Z0-9]/g, "");

  const specialRegionNames = {
    DR1C: "SAN JOSE CENTRAL",
    DR1N: "SAN JOSE NORTE",
    DR1S: "SAN JOSE SUR"
  };

  const specialName =
    specialRegionNames[compactCode];

  if (specialName) {
    const exactRegion = (state.delegaciones || [])
      .map((feature) => feature.attributes || {})
      .map((attributes) =>
        getCatalogFieldValue(
          attributes,
          "direccion_regional",
          "Direccion_Regional",
          "Dirección regional",
          "DIRECCION_REGIONAL",
          "direccionRegional",
          "region",
          "Region",
          "REGION",
          "nombre_region",
          "NOMBRE_REGION"
        )
      )
      .find((region) =>
        normalizeTerritory(region).includes(
          specialName
        )
      );

    return exactRegion ||
      `Dirección Regional 1 - ${specialName
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        )}`;
  }

  const number = getRegionNumber(regionCode);

  if (number === null) {
    return "";
  }

  const matches = [
    ...new Set(
      (state.delegaciones || [])
        .map((feature) => {
          const attributes = feature.attributes || {};

          return getCatalogFieldValue(
            attributes,
            "direccion_regional",
            "Direccion_Regional",
            "Dirección regional",
            "DIRECCION_REGIONAL",
            "direccionRegional",
            "region",
            "Region",
            "REGION",
            "nombre_region",
            "NOMBRE_REGION"
          );
        })
        .filter(Boolean)
        .filter(
          (region) =>
            getRegionNumber(region) === number
        )
    )
  ];

  return matches.length === 1
    ? matches[0]
    : "";
}

function getActivityRegion(row = {}) {
  const directRegion = getDirectActivityRegion(row);
  const delegation = getActivityDelegation(row);
  const catalogRegion = getRegionFromDelegationCatalog(delegation);
  const regionCode = getActivityRegionCode(row);

  if (directRegion) {
    const directName = getRegionName(directRegion);

    /* Un valor completo como "Dirección Regional 3 - Cartago"
       tiene prioridad. Un código genérico como DR3 se completa
       con el catálogo de delegaciones. */
    if (directName) {
      return directRegion;
    }
  }

  if (catalogRegion) {
    return catalogRegion;
  }

  if (directRegion) {
    return getRegionFromCode(directRegion) || directRegion;
  }

  if (regionCode) {
    return getRegionFromCode(regionCode) || regionCode;
  }

  return "";
}

function getNationalTerritoryCatalogRows() {
  const combined = new Map();

  const addRow = (
    delegation,
    region,
    catalogPriority = false
  ) => {
    const cleanDelegation =
      String(delegation || "").trim();

    const cleanRegion =
      String(region || "").trim();

    if (!cleanDelegation && !cleanRegion) {
      return;
    }

    const delegationKey =
      getDelegationCanonicalKey(
        cleanDelegation
      );

    const regionKey =
      normalize(cleanRegion);

    const key =
      `${regionKey}|||${delegationKey}`;

    const current =
      combined.get(key);

    const officialName =
      getOfficialDelegationName(
        cleanDelegation
      );

    if (
      !current ||
      catalogPriority ||
      officialName.length <
        current.delegation.length
    ) {
      combined.set(
        key,
        {
          delegation:
            officialName ||
            cleanDelegation,

          region:
            cleanRegion,

          delegationKey
        }
      );
    }
  };

  (state.delegaciones || [])
    .forEach((feature) => {
      const attributes =
        feature.attributes || {};

      addRow(
        getCatalogFieldValue(
          attributes,
          "delegacion",
          "Delegacion",
          "Delegación",
          "DELEGACION",
          "nombre_delegacion",
          "NOMBRE_DELEGACION",
          "nombre",
          "Nombre",
          "NOMBRE"
        ),
        getCatalogFieldValue(
          attributes,
          "direccion_regional",
          "Direccion_Regional",
          "Dirección regional",
          "DIRECCION_REGIONAL",
          "direccionRegional",
          "region",
          "Region",
          "REGION",
          "nombre_region",
          "NOMBRE_REGION"
        ),
        true
      );
    });

  (state.actividades || [])
    .forEach((feature) => {
      const attributes =
        feature.attributes || {};

      addRow(
        getActivityDelegation(
          attributes
        ),
        getActivityRegion(
          attributes
        ),
        false
      );
    });

  return [
    ...combined.values()
  ];
}

function getNationalRegionOptions() {
  const options =
    new Map();

  getNationalTerritoryCatalogRows()
    .map(
      (row) =>
        String(
          row.region || ""
        ).trim()
    )
    .filter(Boolean)
    .forEach((region) => {
      const number =
        getRegionNumber(region);

      const regionName =
        getRegionName(region);

      /*
       * Las tres Direcciones Regionales 1 comparten número,
       * pero son territorios distintos: Central, Norte y Sur.
       */
      const key =
        number === 1 && regionName
          ? `REGION-1-${regionName}`
          : number !== null
            ? `REGION-${number}`
            : regionName;

      const current =
        options.get(key);

      if (
        !current ||
        region.length >
          current.length
      ) {
        options.set(
          key,
          region
        );
      }
    });

  return [
    ...options.values()
  ].sort((a, b) => {
    const aNumber =
      getRegionNumber(a);

    const bNumber =
      getRegionNumber(b);

    if (
      aNumber !== null &&
      bNumber !== null
    ) {
      return (
        aNumber -
        bNumber
      );
    }

    return a.localeCompare(
      b,
      "es",
      {
        numeric: true,
        sensitivity: "base"
      }
    );
  });
}

function getNationalDelegationOptions(
  region = ""
) {
  const options = new Map();

  getNationalTerritoryCatalogRows()
    .filter(
      (row) =>
        !region ||
        sameRegion(
          row.region,
          region
        )
    )
    .forEach((row) => {
      const key =
        row.delegationKey ||
        getDelegationCanonicalKey(
          row.delegation
        );

      if (!key) {
        return;
      }

      if (!options.has(key)) {
        options.set(
          key,
          getOfficialDelegationName(
            row.delegation
          )
        );
      }
    });

  return [
    ...options.values()
  ].sort((a, b) =>
    a.localeCompare(
      b,
      "es",
      {
        numeric: true,
        sensitivity: "base"
      }
    )
  );
}

function renderNationalViewerControls() {
  ensureNationalViewerState();
  const panel = getNationalViewerControlsPanel();
  if (!panel) return;

  const regions = getNationalRegionOptions();
  const additional = state.nationalViewerFilters.activityType === "ADICIONAL_NO_PROGRAMADA";

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">Visor Nacional</span>
        <h3>Consulta integral PUMI</h3>
      </div>
      <button id="btn-national-viewer-clear" class="btn btn-secondary" type="button">Limpiar filtros</button>
    </div>

    <div class="national-viewer-filter-grid">
      <label>
        Tipo de actividad
        <select id="national-filter-activity-type">
          <option value="PLANIFICADA">Planificadas</option>
          <option value="ADICIONAL_NO_PROGRAMADA">Adicionales no programadas</option>
        </select>
      </label>

      <label>
        Dirección Regional
        <select id="national-filter-region"></select>
      </label>

      <label>
        Delegación
        <select id="national-filter-delegation"></select>
      </label>

      <label>
        Programa
        <select id="national-filter-program"></select>
      </label>

      <label>
        Actividad
        <select id="national-filter-activity"></select>
      </label>

      <label>
        ${additional ? "Estado" : "Cumplimiento"}
        <select id="national-filter-compliance">
          ${additional ? `
            <option value="">Todos</option>
            <option value="VALIDADA">Validada nacional</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="OTRA">Otros estados</option>
          ` : `
            <option value="">Todos</option>
            <option value="CUMPLE">Cumple: 50% o más</option>
            <option value="EN RIESGO">En riesgo: 25% a 49.99%</option>
            <option value="CRITICO">Crítico: menor al 25%</option>
          `}
        </select>
      </label>
    </div>
  `;

  $("national-filter-activity-type").value = state.nationalViewerFilters.activityType;
  fillSelect($("national-filter-region"), regions, true);

  setSelectValue($("national-filter-region"), state.nationalViewerFilters.region);
  refreshNationalViewerDependentFilters();

  setSelectValue($("national-filter-delegation"), state.nationalViewerFilters.delegation);
  setSelectValue($("national-filter-program"), state.nationalViewerFilters.program);
  setSelectValue($("national-filter-activity"), state.nationalViewerFilters.activity);

  if ($("national-filter-compliance")) {
    $("national-filter-compliance").value = state.nationalViewerFilters.compliance || "";
  }

  [
    "national-filter-activity-type",
    "national-filter-region",
    "national-filter-delegation",
    "national-filter-program",
    "national-filter-activity",
    "national-filter-compliance"
  ].forEach((id) => {
    $(id)?.addEventListener("change", () => {
      captureNationalViewerFilters();

      if (id === "national-filter-activity-type") {
        state.nationalViewerFilters.region = "";
        state.nationalViewerFilters.delegation = "";
        state.nationalViewerFilters.program = "";
        state.nationalViewerFilters.activity = "";
        state.nationalViewerFilters.compliance = "";
        renderNationalViewerControls();
        applyNationalViewerFilters();
        return;
      }

      if (id === "national-filter-region") {
        state.nationalViewerFilters.delegation = "";
        state.nationalViewerFilters.program = "";
        state.nationalViewerFilters.activity = "";
      } else if (id === "national-filter-delegation") {
        state.nationalViewerFilters.program = "";
        state.nationalViewerFilters.activity = "";
      } else if (id === "national-filter-program") {
        state.nationalViewerFilters.activity = "";
      }

      if (id !== "national-filter-compliance") {
        refreshNationalViewerDependentFilters();
      }

      applyNationalViewerFilters();
    });
  });

  $("btn-national-viewer-clear")?.addEventListener("click", () => {
    state.nationalViewerFilters = {
      activityType: "PLANIFICADA",
      region: "",
      delegation: "",
      program: "",
      activity: "",
      compliance: ""
    };
    renderNationalViewerControls();
    applyNationalViewerFilters();
  });
}

function captureNationalViewerFilters() {
  state.nationalViewerFilters = {
    activityType: $("national-filter-activity-type")?.value || "PLANIFICADA",
    region: $("national-filter-region")?.value || "",
    delegation: $("national-filter-delegation")?.value || "",
    program: $("national-filter-program")?.value || "",
    activity: $("national-filter-activity")?.value || "",
    compliance: $("national-filter-compliance")?.value || ""
  };
}

function refreshNationalViewerDependentFilters() {
  ensureNationalViewerState();
  const filters = state.nationalViewerFilters;
  const rows = getNationalViewerBaseRows();

  const filteredByRegion = rows.filter((row) =>
    !filters.region || sameRegion(getNationalViewerRowRegion(row), filters.region)
  );

  const delegationMap = new Map();
  filteredByRegion.forEach((row) => {
    const delegation = String(row.delegacion || "").trim();
    const key = getDelegationCanonicalKey(delegation);
    if (key && !delegationMap.has(key)) delegationMap.set(key, getOfficialDelegationName(delegation));
  });
  const delegations = [...delegationMap.values()].sort((a, b) =>
    a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
  );

  const filteredByDelegation = filteredByRegion.filter((row) =>
    !filters.delegation || sameDelegation(row.delegacion, filters.delegation)
  );

  const programMap = new Map();
  filteredByDelegation.forEach((row) => {
    const raw = String(row.programa || "").trim();
    if (!raw) return;
    const key = normalize(raw);
    programMap.set(key, key === "VIF" || key === "VIFA" ? "VIF" : raw);
  });
  const programs = [...programMap.values()].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  const filteredByProgram = filteredByDelegation.filter((row) =>
    !filters.program || normalize(row.programa) === normalize(filters.program)
  );

  const activities = [...new Set(
    filteredByProgram.map((row) => String(row.actividad || "").trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  fillSelect($("national-filter-delegation"), delegations, true);
  fillSelect($("national-filter-program"), programs, true);
  fillSelect($("national-filter-activity"), activities, true);

  setSelectValue($("national-filter-delegation"), filters.delegation);
  setSelectValue($("national-filter-program"), filters.program);
  setSelectValue($("national-filter-activity"), filters.activity);

  state.nationalViewerFilters.delegation = $("national-filter-delegation")?.value || "";
  state.nationalViewerFilters.program = $("national-filter-program")?.value || "";
  state.nationalViewerFilters.activity = $("national-filter-activity")?.value || "";
}

function getNationalViewerFilteredFeatures() {
  ensureNationalViewerState();
  const filters = state.nationalViewerFilters;

  return getNationalViewerBaseRows()
    .filter((row) => {
      if (filters.region && !sameRegion(getNationalViewerRowRegion(row), filters.region)) return false;
      if (filters.delegation && !sameDelegation(row.delegacion, filters.delegation)) return false;
      if (filters.program && normalize(row.programa) !== normalize(filters.program)) return false;
      if (filters.activity && normalize(row.actividad) !== normalize(filters.activity)) return false;
      return true;
    })
    .map(getNationalViewerFeatureFromRow);
}

function getComplianceStatus(
  meta,
  advance
) {
  const safeMeta =
    numberValue(meta);

  const percentage =
    safeMeta > 0
      ? numberValue(advance) /
        safeMeta
      : 0;

  if (percentage >= 0.5) {
    return "CUMPLE";
  }

  if (percentage >= 0.25) {
    return "EN RIESGO";
  }

  return "CRITICO";
}

function getComplianceLabel(status) {
  const labels = {
    CUMPLE: "Cumple",
    "EN RIESGO": "En riesgo",
    CRITICO: "Crítico"
  };

  return labels[
    normalize(status)
  ] || "Crítico";
}

function buildNationalViewerDelegationRows(features) {
  ensureNationalViewerState();
  const filters = state.nationalViewerFilters;
  const additional = filters.activityType === "ADICIONAL_NO_PROGRAMADA";
  const groups = new Map();

  for (const feature of features) {
    const row = feature?.attributes || {};
    const delegation = String(row.delegacion || "").trim();
    if (!delegation) continue;
    const key = getDelegationCanonicalKey(delegation);

    if (!groups.has(key)) {
      groups.set(key, {
        direccion_regional: getNationalViewerRowRegion(row),
        delegacion: getOfficialDelegationName(delegation),
        rows: []
      });
    }
    groups.get(key).rows.push(row);
  }

  return [...groups.values()].map((group) => {
    if (additional) {
      const registros = group.rows.length;
      const validadas = group.rows.filter(isNationalViewerValidated).length;
      const enRevision = group.rows.filter(isNationalViewerInReview).length;
      const avance = group.rows.reduce((t, row) => t + getNationalViewerExecutionAmount(row), 0);
      const participantes = group.rows.reduce((t, row) => t + getNationalViewerParticipants(row), 0);
      const status = validadas === registros && registros > 0
        ? "VALIDADA"
        : enRevision > 0
          ? "EN_REVISION"
          : "OTRA";

      return {
        ...group,
        registros,
        actividades: new Set(group.rows.map((r) => normalize(r.actividad)).filter(Boolean)).size,
        validadas,
        en_revision: enRevision,
        avance,
        participantes,
        estado_codigo: status
      };
    }

    const vifRows = group.rows.filter(isNationalViewerVifRow);
    const annualRows = group.rows.filter((row) => !isNationalViewerVifRow(row));

    const meta = annualRows.reduce((t, row) => t + numberValue(row.meta), 0);
    const advance = annualRows.reduce((t, row) => t + numberValue(row.avance), 0);
    const pending = Math.max(meta - advance, 0);
    const percentage = meta > 0 ? advance / meta : 0;

    const vifProgramadas = vifRows.length;
    const vifCumplidas = vifRows.filter((r) => Boolean(r.__vifCompleted)).length;
    const vifConAvance = vifRows.filter((r) => Boolean(r.__vifHasAdvance) && !r.__vifCompleted).length;
    const vifPending = Math.max(vifProgramadas - vifCumplidas, 0);
    const vifProgressSum = vifRows.reduce((t, r) => t + numberValue(r.__vifProgress), 0);
    const vifPercentage = vifProgramadas > 0 ? vifProgressSum / vifProgramadas : 0;

    let status;
    if (filters.program && normalize(filters.program) === "VIF") {
      status = getComplianceStatus(vifProgramadas || 1, vifProgressSum);
    } else {
      status = getComplianceStatus(meta, advance);
    }

    return {
      ...group,
      actividades: new Set(group.rows.map((r) => `${normalize(r.programa)}|||${normalize(r.actividad)}`)).size,
      meta,
      avance: advance,
      pendiente: pending,
      porcentaje: percentage,
      estado: getComplianceLabel(status),
      estado_codigo: status,
      vif_programadas: vifProgramadas,
      vif_cumplidas: vifCumplidas,
      vif_con_avance: vifConAvance,
      vif_pendientes: vifPending,
      vif_porcentaje: vifPercentage
    };
  }).filter((row) => {
    if (!filters.compliance) return true;
    return normalize(row.estado_codigo) === normalize(filters.compliance);
  }).sort((a, b) => {
    const r = String(a.direccion_regional || "").localeCompare(String(b.direccion_regional || ""), "es");
    return r !== 0 ? r : String(a.delegacion || "").localeCompare(String(b.delegacion || ""), "es", { numeric: true });
  });
}

function applyNationalViewerFilters() {
  ensureNationalViewerState();
  const baseFeatures = getNationalViewerFilteredFeatures();
  let delegationRows = buildNationalViewerDelegationRows(baseFeatures);

  if (state.nationalViewerFilters.activityType === "ADICIONAL_NO_PROGRAMADA" && state.nationalViewerFilters.compliance) {
    delegationRows = delegationRows.filter((row) =>
      normalize(row.estado_codigo) === normalize(state.nationalViewerFilters.compliance)
    );
  }

  const allowedDelegations = new Set(
    delegationRows.map((row) => getDelegationCanonicalKey(row.delegacion))
  );

  const visibleFeatures = baseFeatures.filter((feature) =>
    allowedDelegations.has(getDelegationCanonicalKey(feature.attributes?.delegacion))
  );

  renderNationalViewerKpis(delegationRows, visibleFeatures);

  renderMap(visibleFeatures, {
    colorByCompliance: state.nationalViewerFilters.activityType !== "ADICIONAL_NO_PROGRAMADA"
  });

  renderNationalViewerTable(delegationRows);

  const mapHeading = $("dashboard-map")?.closest(".panel-card")?.querySelector("h3");
  if (mapHeading) {
    mapHeading.textContent = state.nationalViewerFilters.activityType === "ADICIONAL_NO_PROGRAMADA"
      ? "Mapa nacional de actividades adicionales"
      : "Mapa nacional de cumplimiento";
  }
}

function getDelegationCatalogTerritory() {
  const filters =
    state.nationalViewerFilters || {};

  const rows =
    (state.delegaciones || [])
      .map((feature) => {
        const attributes =
          feature.attributes || {};

        const delegation =
          attributes.delegacion ??
          attributes.Delegacion ??
          attributes.DELEGACION ??
          attributes.nombre_delegacion ??
          attributes.NOMBRE_DELEGACION ??
          attributes.nombre ??
          attributes.Nombre ??
          attributes.NOMBRE ??
          "";

        const region =
          attributes.direccion_regional ??
          attributes.Direccion_Regional ??
          attributes.DIRECCION_REGIONAL ??
          attributes.direccionRegional ??
          attributes.region ??
          attributes.Region ??
          attributes.REGION ??
          attributes.nombre_region ??
          attributes.NOMBRE_REGION ??
          "";

        return {
          delegation:
            String(delegation || "").trim(),

          region:
            String(region || "").trim()
        };
      })
      .filter(
        (row) =>
          Boolean(row.delegation)
      );

  const filtered =
    rows.filter((row) => {
      if (
        filters.region &&
        !sameRegion(
          row.region,
          filters.region
        )
      ) {
        return false;
      }

      if (
        filters.delegation &&
        !sameDelegation(
          row.delegation,
          filters.delegation
        )
      ) {
        return false;
      }

      return true;
    });

  const delegationKeys =
    new Set(
      filtered
        .map(
          (row) =>
            getDelegationCanonicalKey(
              row.delegation
            )
        )
        .filter(Boolean)
    );

  const regionKeys =
    new Set(
      filtered
        .map(
          (row) =>
            normalize(row.region)
        )
        .filter(Boolean)
    );

  /*
   * Respaldo:
   * si la capa de delegaciones no trae el nombre de la región,
   * las regiones se cuentan desde todas las actividades cargadas,
   * sin excluir registros por meta 0.
   */
  if (regionKeys.size === 0) {
    (state.actividades || [])
      .forEach((feature) => {
        const attributes =
          feature.attributes || {};

        const region =
          getActivityRegion(attributes);

        const delegation =
          String(
            attributes.delegacion ||
            ""
          ).trim();

        if (
          filters.region &&
          !sameRegion(
            region,
            filters.region
          )
        ) {
          return;
        }

        if (
          filters.delegation &&
          !sameDelegation(
            delegation,
            filters.delegation
          )
        ) {
          return;
        }

        if (region) {
          regionKeys.add(
            normalize(region)
          );
        }
      });
  }

  return {
    regions:
      regionKeys.size,

    delegations:
      delegationKeys.size
  };
}

function renderNationalViewerKpis(delegationRows, visibleFeatures) {
  ensureNationalViewerState();
  const filters = state.nationalViewerFilters;
  const additional = filters.activityType === "ADICIONAL_NO_PROGRAMADA";
  const territory = getNationalViewerVisibleTerritory(visibleFeatures);

  const programs = new Set(
    visibleFeatures.map((feature) => normalize(feature.attributes?.programa)).filter(Boolean)
  ).size;

  const activities = new Set(
    visibleFeatures.map((feature) =>
      `${normalize(feature.attributes?.programa)}|||${normalize(feature.attributes?.actividad)}`
    ).filter(Boolean)
  ).size;

  if (additional) {
    const registros = delegationRows.reduce((t, row) => t + numberValue(row.registros), 0);
    const validadas = delegationRows.reduce((t, row) => t + numberValue(row.validadas), 0);
    const enRevision = delegationRows.reduce((t, row) => t + numberValue(row.en_revision), 0);
    const participantes = delegationRows.reduce((t, row) => t + numberValue(row.participantes), 0);
    const avance = delegationRows.reduce((t, row) => t + numberValue(row.avance), 0);

    renderKpiCards([
      ["Actividades adicionales", registros],
      ["Avance registrado", avance],
      ["Validadas", validadas],
      ["En revisión", enRevision],
      ["Participantes", participantes],
      ["Regiones", territory.regions],
      ["Delegaciones", territory.delegations],
      ["Programas", programs],
      ["Actividades", activities]
    ]);
    return;
  }

  const onlyVif = filters.program && normalize(filters.program) === "VIF";
  const vifProgramadas = delegationRows.reduce((t, row) => t + numberValue(row.vif_programadas), 0);
  const vifCumplidas = delegationRows.reduce((t, row) => t + numberValue(row.vif_cumplidas), 0);
  const vifConAvance = delegationRows.reduce((t, row) => t + numberValue(row.vif_con_avance), 0);
  const vifPendientes = Math.max(vifProgramadas - vifCumplidas, 0);
  const vifProgress = delegationRows.reduce(
    (t, row) => t + numberValue(row.vif_porcentaje) * numberValue(row.vif_programadas),
    0
  );
  const vifPercentage = vifProgramadas > 0 ? (vifProgress / vifProgramadas) * 100 : 0;

  if (onlyVif) {
    renderKpiCards([
      [`VIF ${getNationalViewerCurrentQuarter()}`, `${vifPercentage.toFixed(2)}%`],
      ["Actividades programadas", vifProgramadas],
      ["Cumplidas", vifCumplidas],
      ["Con avance", vifConAvance],
      ["Pendientes", vifPendientes],
      ["Regiones", territory.regions],
      ["Delegaciones", territory.delegations],
      ["Actividades", activities]
    ]);
    return;
  }

  /* Metas anuales excluyen VIF. VIF se presenta como indicador trimestral aparte. */
  const meta = delegationRows.reduce((t, row) => t + numberValue(row.meta), 0);
  const advance = delegationRows.reduce((t, row) => t + numberValue(row.avance), 0);
  const pending = Math.max(meta - advance, 0);
  const percentage = meta > 0 ? (advance / meta) * 100 : 0;

  const cards = [
    ["Meta nacional", meta],
    ["Avance", advance],
    ["Pendiente", pending],
    ["% cumplimiento", `${percentage.toFixed(1)}%`]
  ];

  if (!filters.program && vifProgramadas > 0) {
    cards.push([`VIF ${getNationalViewerCurrentQuarter()}`, `${vifPercentage.toFixed(2)}%`]);
  }

  cards.push(
    ["Regiones", territory.regions],
    ["Delegaciones", territory.delegations],
    ["Programas", programs],
    ["Actividades", activities]
  );

  renderKpiCards(cards);
}

function renderNationalViewerTable(rows) {
  getNationalViewerTablePanel();
  const container = $("national-viewer-table");
  const title = $("national-viewer-table-title");
  if (!container) return;

  const filters = state.nationalViewerFilters;
  const additional = filters.activityType === "ADICIONAL_NO_PROGRAMADA";
  const onlyVif = filters.program && normalize(filters.program) === "VIF";

  if (title) {
    title.textContent = additional
      ? "Resumen de actividades adicionales por delegación"
      : onlyVif
        ? `Resumen VIF ${getNationalViewerCurrentQuarter()} por delegación`
        : "Resumen por delegación";
  }

  if (!rows.length) {
    container.innerHTML = `<div class="module-empty">No hay información para los filtros seleccionados.</div>`;
    return;
  }

  if (additional) {
    container.innerHTML = `
      <div class="table-scroll"><table class="data-table">
        <thead><tr>
          <th>Dirección Regional</th><th>Delegación</th><th>Registros</th><th>Actividades</th>
          <th>Avance registrado</th><th>Validadas</th><th>En revisión</th><th>Participantes</th>
        </tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.direccion_regional)}</td>
            <td><strong>${escapeHtml(row.delegacion)}</strong></td>
            <td>${formatNumber(row.registros)}</td>
            <td>${formatNumber(row.actividades)}</td>
            <td>${formatNumber(row.avance)}</td>
            <td>${formatNumber(row.validadas)}</td>
            <td>${formatNumber(row.en_revision)}</td>
            <td>${formatNumber(row.participantes)}</td>
          </tr>`).join("")}</tbody>
      </table></div>`;
    return;
  }

  if (onlyVif) {
    container.innerHTML = `
      <div class="table-scroll"><table class="data-table">
        <thead><tr>
          <th>Dirección Regional</th><th>Delegación</th><th>Programadas</th><th>Cumplidas</th>
          <th>Con avance</th><th>Pendientes</th><th>% ${escapeHtml(getNationalViewerCurrentQuarter())}</th>
        </tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.direccion_regional)}</td>
            <td><strong>${escapeHtml(row.delegacion)}</strong></td>
            <td>${formatNumber(row.vif_programadas)}</td>
            <td>${formatNumber(row.vif_cumplidas)}</td>
            <td>${formatNumber(row.vif_con_avance)}</td>
            <td>${formatNumber(row.vif_pendientes)}</td>
            <td><strong>${(numberValue(row.vif_porcentaje) * 100).toFixed(2)}%</strong></td>
          </tr>`).join("")}</tbody>
      </table></div>`;
    return;
  }

  const includeVif = !filters.program && rows.some((row) => numberValue(row.vif_programadas) > 0);
  container.innerHTML = `
    <div class="table-scroll"><table class="data-table">
      <thead><tr>
        <th>Dirección Regional</th><th>Delegación</th><th>Actividades</th>
        <th>Meta</th><th>Avance</th><th>Pendiente</th><th>%</th>
        ${includeVif ? `<th>VIF ${escapeHtml(getNationalViewerCurrentQuarter())}</th>` : ""}
        <th>Estado</th>
      </tr></thead>
      <tbody>${rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.direccion_regional)}</td>
          <td><strong>${escapeHtml(row.delegacion)}</strong></td>
          <td>${formatNumber(row.actividades)}</td>
          <td>${formatNumber(row.meta)}</td>
          <td>${formatNumber(row.avance)}</td>
          <td>${formatNumber(row.pendiente)}</td>
          <td><strong>${(numberValue(row.porcentaje) * 100).toFixed(1)}%</strong></td>
          ${includeVif ? `<td><strong>${(numberValue(row.vif_porcentaje) * 100).toFixed(2)}%</strong></td>` : ""}
          <td><span class="national-compliance-badge national-compliance-${normalize(row.estado_codigo).toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(row.estado)}</span></td>
        </tr>`).join("")}</tbody>
    </table></div>`;
}
