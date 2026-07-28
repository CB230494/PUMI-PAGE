/* PUMI 2026 - módulo visor. Extraído sin cambiar lógica. */

function renderNationalViewerDashboard() {
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
  let panel =
    $("national-viewer-table-panel");

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
    "national-viewer-table-panel";

  panel.className =
    "panel-card";

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">
          Consulta nacional
        </span>

        <h3>
          Resumen por delegación
        </h3>
      </div>
    </div>

    <div id="national-viewer-table"></div>
  `;

  mapPanel.insertAdjacentElement(
    "afterend",
    panel
  );

  return panel;
}

function getNationalViewerBaseRows() {
  const arcgisRows = (state.actividades || [])
    .filter(isNationalViewerVisibleActivityFeature)
    .map((feature) => ({
      ...(feature.attributes || {}),
      programa:
        normalize(feature.attributes?.programa) === "VIF"
          ? "VIF"
          : feature.attributes?.programa,
      __geometry: feature.geometry || null
    }));

  /*
   * El histórico de VIF se consulta desde PAGE y no desde PUMI_ACTIVIDADES.
   * Por eso se incorpora aquí como filas de consulta para que VIF aparezca
   * en el Visor Nacional aun cuando todavía no existan registros nuevos VIF
   * almacenados en ArcGIS.
   */
  const optionByCode = new Map(
    (state.activityOptions || [])
      .filter((option) => normalize(option?.programa) === "VIF")
      .map((option) => [
        normalize(
          option.codigo_actividad_vifa ||
          option.codigo_actividad ||
          option.codigo ||
          ""
        ),
        option
      ])
  );

  const historicalRows = (state.vifaHistorico || []).map((item, index) => {
    const code =
      item.codigo_actividad_vifa ||
      item.codigo_actividad ||
      `VIF-${String(item.numero_actividad || "").padStart(2, "0")}`;

    const option = optionByCode.get(normalize(code)) || {};
    const meta = numberValue(item.linea_base);
    const advance = numberValue(item.avance);
    const cappedAdvance = meta > 0 ? Math.min(advance, meta) : advance;
    const pending = meta > 0 ? Math.max(meta - cappedAdvance, 0) : 0;
    const percentage = meta > 0
      ? Math.min((advance / meta) * 100, 100)
      : (advance > 0 ? 100 : 0);

    return {
      id_pumi: `VIF-HIST-${index + 1}`,
      programa: "VIF",
      actividad:
        option.actividad ||
        option.nombre_actividad ||
        `Actividad ${item.numero_actividad || code}`,
      direccion_regional: item.direccion_regional || "",
      delegacion: item.delegacion || "",
      meta,
      avance: advance,
      pendiente: pending,
      porcentaje_cumplimiento: percentage,
      estado_registro: "ACTIVO",
      estado_flujo: "VALIDADO_NACIONAL",
      estado_regional: "Revisado regional",
      estado_nacional: "Validado nacional",
      archivo_origen: "Histórico local VIF 2026",
      codigo_actividad_vifa: code,
      trimestre_programado_vifa: item.trimestre || "",
      trimestre_ejecucion_vifa: item.trimestre || "",
      tipo_medicion_vifa: item.control_trimestral
        ? "CONTROL_TRIMESTRAL"
        : "LINEA_BASE",
      linea_base_vifa: meta,
      __isLocalVifHistorical: true,
      __geometry: null
    };
  });

  return [...arcgisRows, ...historicalRows];
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
  const panel =
    getNationalViewerControlsPanel();

  if (!panel) {
    return;
  }

  const regions =
    getNationalRegionOptions();

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">
          Visor Nacional
        </span>

        <h3>
          Consulta integral PUMI
        </h3>
      </div>

      <button
        id="btn-national-viewer-clear"
        class="btn btn-secondary"
        type="button"
      >
        Limpiar filtros
      </button>
    </div>

    <div class="national-viewer-filter-grid">
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
        Cumplimiento
        <select id="national-filter-compliance">
          <option value="">Todos</option>
          <option value="CUMPLE">Cumple: 50% o más</option>
          <option value="EN RIESGO">En riesgo: 25% a 49.99%</option>
          <option value="CRITICO">Crítico: menor al 25%</option>
        </select>
      </label>
    </div>
  `;

  fillSelect(
    $("national-filter-region"),
    regions,
    true
  );

  refreshNationalViewerDependentFilters();

  setSelectValue(
    $("national-filter-region"),
    state.nationalViewerFilters.region
  );

  setSelectValue(
    $("national-filter-delegation"),
    state.nationalViewerFilters.delegation
  );

  setSelectValue(
    $("national-filter-program"),
    state.nationalViewerFilters.program
  );

  setSelectValue(
    $("national-filter-activity"),
    state.nationalViewerFilters.activity
  );

  if ($("national-filter-compliance")) {
    $("national-filter-compliance").value =
      state.nationalViewerFilters.compliance ||
      "";
  }

  [
    "national-filter-region",
    "national-filter-delegation",
    "national-filter-program",
    "national-filter-activity",
    "national-filter-compliance"
  ].forEach((id) => {
    $(id)?.addEventListener(
      "change",
      () => {
        captureNationalViewerFilters();

        if (
          id ===
          "national-filter-region"
        ) {
          state.nationalViewerFilters.delegation = "";
          state.nationalViewerFilters.program = "";
          state.nationalViewerFilters.activity = "";
        }

        if (
          id ===
          "national-filter-delegation"
        ) {
          state.nationalViewerFilters.program = "";
          state.nationalViewerFilters.activity = "";
        }

        if (
          id ===
          "national-filter-program"
        ) {
          state.nationalViewerFilters.activity = "";
        }

        if (
          id !==
          "national-filter-compliance"
        ) {
          refreshNationalViewerDependentFilters();
        }

        applyNationalViewerFilters();
      }
    );
  });

  $("btn-national-viewer-clear")
    ?.addEventListener(
      "click",
      () => {
        state.nationalViewerFilters = {
          region: "",
          delegation: "",
          program: "",
          activity: "",
          compliance: ""
        };

        renderNationalViewerControls();
        applyNationalViewerFilters();
      }
    );
}

function captureNationalViewerFilters() {
  state.nationalViewerFilters = {
    region:
      $("national-filter-region")
        ?.value || "",

    delegation:
      $("national-filter-delegation")
        ?.value || "",

    program:
      $("national-filter-program")
        ?.value || "",

    activity:
      $("national-filter-activity")
        ?.value || "",

    compliance:
      $("national-filter-compliance")
        ?.value || ""
  };
}

function refreshNationalViewerDependentFilters() {
  const filters =
    state.nationalViewerFilters;

  const rows =
    getNationalViewerBaseRows();

  const delegations =
    getNationalDelegationOptions(
      filters.region
    );

  const filteredByRegion =
    rows.filter(
      (row) =>
        !filters.region ||
        sameRegion(
          getActivityRegion(row),
          filters.region
        )
    );

  const filteredByDelegation =
    filteredByRegion.filter(
      (row) =>
        !filters.delegation ||
        sameDelegation(
          row.delegacion,
          filters.delegation
        )
    );

  const programMap = new Map();

  filteredByDelegation.forEach((row) => {
    const rawProgram = String(row.programa || "").trim();
    if (!rawProgram) return;

    const normalizedProgram = normalize(rawProgram);
    programMap.set(
      normalizedProgram,
      normalizedProgram === "VIF" ? "VIF" : rawProgram
    );
  });

  /* VIF debe estar disponible porque su histórico vive en PAGE. */
  if (
    (state.vifaHistorico || []).length > 0 ||
    (state.activityOptions || []).some(
      (option) => normalize(option?.programa) === "VIF"
    )
  ) {
    programMap.set("VIF", "VIF");
  }

  const programs = [...programMap.values()].sort((a, b) =>
    a.localeCompare(
      b,
      "es",
      {
        sensitivity: "base"
      }
    )
  );

  const filteredByProgram =
    filteredByDelegation.filter(
      (row) =>
        !filters.program ||
        normalize(row.programa) ===
          normalize(
            filters.program
          )
    );

  const activities = [
    ...new Set(
      filteredByProgram
        .map(
          (row) =>
            String(
              row.actividad || ""
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(
      b,
      "es",
      {
        sensitivity: "base"
      }
    )
  );

  fillSelect(
    $("national-filter-delegation"),
    delegations,
    true
  );

  fillSelect(
    $("national-filter-program"),
    programs,
    true
  );

  fillSelect(
    $("national-filter-activity"),
    activities,
    true
  );

  setSelectValue(
    $("national-filter-delegation"),
    filters.delegation
  );

  setSelectValue(
    $("national-filter-program"),
    filters.program
  );

  setSelectValue(
    $("national-filter-activity"),
    filters.activity
  );

  state.nationalViewerFilters.delegation =
    $("national-filter-delegation")
      ?.value || "";

  state.nationalViewerFilters.program =
    $("national-filter-program")
      ?.value || "";

  state.nationalViewerFilters.activity =
    $("national-filter-activity")
      ?.value || "";
}

function getNationalViewerFilteredFeatures() {
  const filters =
    state.nationalViewerFilters;

  return (state.actividades || [])
    .filter(
      isNationalViewerVisibleActivityFeature
    )
    .filter(
    (feature) => {
      const row =
        feature.attributes || {};

      if (
        filters.region &&
        !sameRegion(
          getActivityRegion(row),
          filters.region
        )
      ) {
        return false;
      }

      if (
        filters.delegation &&
        !sameDelegation(
          row.delegacion,
          filters.delegation
        )
      ) {
        return false;
      }

      if (
        filters.program &&
        normalize(row.programa) !==
          normalize(filters.program)
      ) {
        return false;
      }

      if (
        filters.activity &&
        normalize(row.actividad) !==
          normalize(filters.activity)
      ) {
        return false;
      }

      return true;
    }
  );
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

function buildNationalViewerDelegationRows(
  features
) {
  return buildDelegationMapGroups(
    features
  )
    .map((group) => {
      const meta =
        group.activities.reduce(
          (total, item) =>
            total +
            numberValue(item.meta),
          0
        );

      const advance =
        group.activities.reduce(
          (total, item) =>
            total +
            numberValue(item.avance),
          0
        );

      const pending =
        Math.max(
          meta - advance,
          0
        );

      const percentage =
        meta > 0
          ? advance / meta
          : 0;

      const status =
        getComplianceStatus(
          meta,
          advance
        );

      return {
        direccion_regional:
          group.direccion_regional,

        delegacion:
          group.delegacion,

        actividades:
          group.activities.length,

        meta,

        avance:
          advance,

        pendiente:
          pending,

        porcentaje:
          percentage,

        estado:
          getComplianceLabel(
            status
          ),

        estado_codigo:
          status
      };
    })
    .filter(
      (row) =>
        !state.nationalViewerFilters
          .compliance ||
        normalize(
          row.estado_codigo
        ) ===
          normalize(
            state.nationalViewerFilters
              .compliance
          )
    )
    .sort(
      (a, b) => {
        const regionComparison =
          a.direccion_regional
            .localeCompare(
              b.direccion_regional,
              "es"
            );

        if (regionComparison !== 0) {
          return regionComparison;
        }

        return a.delegacion
          .localeCompare(
            b.delegacion,
            "es"
          );
      }
    );
}

function applyNationalViewerFilters() {
  const baseFeatures =
    getNationalViewerFilteredFeatures();

  const delegationRows =
    buildNationalViewerDelegationRows(
      baseFeatures
    );

  const allowedDelegations =
    new Set(
      delegationRows.map(
        (row) =>
          getDelegationCanonicalKey(
            row.delegacion
          )
      )
    );

  const visibleFeatures =
    baseFeatures.filter(
      (feature) =>
        allowedDelegations.has(
          getDelegationCanonicalKey(
            feature.attributes
              ?.delegacion
          )
        )
    );

  renderNationalViewerKpis(
    delegationRows,
    visibleFeatures
  );

  renderMap(
    visibleFeatures,
    {
      colorByCompliance: true
    }
  );

  renderNationalViewerTable(
    delegationRows
  );
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

function renderNationalViewerKpis(
  delegationRows,
  visibleFeatures
) {
  const meta =
    sumBy(
      delegationRows,
      "meta"
    );

  const advance =
    sumBy(
      delegationRows,
      "avance"
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

  const territory =
    getDelegationCatalogTerritory();

  const programs =
    new Set(
      visibleFeatures
        .map(
          (feature) =>
            normalize(
              feature.attributes
                ?.programa
            )
        )
        .filter(Boolean)
    ).size;

  const activities =
    new Set(
      visibleFeatures
        .map(
          (feature) =>
            `${normalize(
              feature.attributes
                ?.programa
            )}|||${normalize(
              feature.attributes
                ?.actividad
            )}`
        )
        .filter(Boolean)
    ).size;

  renderKpiCards([
    ["Meta nacional", meta],
    ["Avance", advance],
    ["Pendiente", pending],
    [
      "% cumplimiento",
      `${percentage.toFixed(1)}%`
    ],
    [
      "Regiones",
      territory.regions
    ],
    [
      "Delegaciones",
      territory.delegations
    ],
    ["Programas", programs],
    ["Actividades", activities]
  ]);
}

function renderNationalViewerTable(rows) {
  getNationalViewerTablePanel();

  const container =
    $("national-viewer-table");

  if (!container) {
    return;
  }

  container.innerHTML =
    rows.length
      ? `
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>
                    Dirección Regional
                  </th>

                  <th>
                    Delegación
                  </th>

                  <th>
                    Actividades
                  </th>

                  <th>Meta</th>
                  <th>Avance</th>
                  <th>Pendiente</th>
                  <th>%</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        <td>
                          ${escapeHtml(
                            row.direccion_regional
                          )}
                        </td>

                        <td>
                          <strong>
                            ${escapeHtml(
                              row.delegacion
                            )}
                          </strong>
                        </td>

                        <td>
                          ${formatNumber(
                            row.actividades
                          )}
                        </td>

                        <td>
                          ${formatNumber(
                            row.meta
                          )}
                        </td>

                        <td>
                          ${formatNumber(
                            row.avance
                          )}
                        </td>

                        <td>
                          ${formatNumber(
                            row.pendiente
                          )}
                        </td>

                        <td>
                          <strong>
                            ${(
                              numberValue(
                                row.porcentaje
                              ) * 100
                            ).toFixed(1)}%
                          </strong>
                        </td>

                        <td>
                          <span class="national-compliance-badge national-compliance-${normalize(
                            row.estado_codigo
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}">
                            ${escapeHtml(
                              row.estado
                            )}
                          </span>
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
            No hay información para los filtros seleccionados.
          </div>
        `;
}

