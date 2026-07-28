/* PUMI 2026 - módulo dashboard_common. Extraído sin cambiar lógica. */

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
  const quarter = getCurrentVifaQuarter();
  const vifSummary = buildVifaQuarterSummary().find((item) => item.trimestre === quarter);
  const cards = [
    ["Registros", numberValue(kpis.registros)],
    [`Meta anual (${ANNUAL_PROGRAMS_LABEL})`, numberValue(kpis.meta)],
    [`Avance anual (${ANNUAL_PROGRAMS_LABEL})`, numberValue(kpis.avance)],
    [`Pendiente anual (${ANNUAL_PROGRAMS_LABEL})`, numberValue(kpis.pendiente)],
    [`% anual (${ANNUAL_PROGRAMS_LABEL})`, `${numberValue(kpis.porcentaje_avance).toFixed(1)}%`],
    ["Participantes", numberValue(kpis.participantes)]
  ];
  if (vifSummary && numberValue(vifSummary.programadas) > 0) {
    cards.push([`VIF ${quarter}`, `${numberValue(vifSummary.porcentaje).toFixed(1)}%`]);
  }
  renderKpiCards(cards);
}

function renderKpisFromLocal() {
  const rows = getRows();
  const progress = buildProgressRows()
    .filter((row) => normalize(row.program) !== "VIF");

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

  const quarter = getCurrentVifaQuarter();
  const vifaSummary = buildVifaQuarterSummary()
    .find((item) => item.trimestre === quarter);

  const cards = [
    ["Registros", rows.length],
    [`Meta anual (${ANNUAL_PROGRAMS_LABEL})`, meta],
    [`Avance anual (${ANNUAL_PROGRAMS_LABEL})`, advance],
    [`Pendiente anual (${ANNUAL_PROGRAMS_LABEL})`, pending],
    [`% anual (${ANNUAL_PROGRAMS_LABEL})`, `${percentage.toFixed(1)}%`],
    ["Participantes", participants]
  ];

  if (vifaSummary) {
    cards.push([
      `VIF ${quarter}`,
      `${numberValue(vifaSummary.porcentaje).toFixed(1)}%`
    ]);
  }

  renderKpiCards(cards);
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

function getLocalVifaHistoricalAdvance(option = {}) {
  if (normalize(option.programa) !== "VIF") {
    return 0;
  }

  const delegation =
    state.user?.delegation || "";

  const code =
    normalize(option.codigo_actividad);

  return (state.vifaHistorico || [])
    .filter(
      (row) =>
        sameDelegation(
          row.delegacion,
          delegation
        ) &&
        normalize(row.codigo_actividad) === code &&
        row.control_trimestral !== true
    )
    .reduce(
      (total, row) =>
        total + numberValue(row.avance),
      0
    );
}

function buildProgressRows(rows = getRows()) {
  const grouped = new Map();

  for (const row of rows) {
    if (isAdditionalActivityRow(row)) continue;
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

  for (const option of state.activityOptions || []) {
    if (
      normalize(option.programa) !== "VIF" ||
      option.es_control_trimestral === true ||
      numberValue(option.meta) <= 0
    ) {
      continue;
    }

    const key =
      `${normalize(option.programa)}|||${normalize(option.actividad)}`;

    grouped.set(key, {
      program: option.programa,
      activity: option.actividad,
      meta: numberValue(option.meta),
      advance:
        numberValue(option.avance_validado) +
        getLocalVifaHistoricalAdvance(option)
    });
  }

  return [...grouped.values()]
    .filter(
      (item) =>
        numberValue(item.meta) > 0
    )
    .map((item) => {
      const actualAdvance = numberValue(item.advance);
      const pending = Math.max(item.meta - actualAdvance, 0);
      const percentage = item.meta > 0
        ? Math.min((actualAdvance / item.meta) * 100, 100)
        : 0;

      return {
        ...item,
        advance: actualAdvance,
        pending,
        percentage
      };
    });
}

function getCurrentVifaQuarter(date = new Date()) {
  const month = date.getMonth() + 1;

  if (month <= 3) return "T1";
  if (month <= 6) return "T2";
  if (month <= 9) return "T3";
  return "T4";
}

function getVifaQuarterOrder(quarter = "") {
  return ({ T1: 1, T2: 2, T3: 3, T4: 4 })[
    normalize(quarter)
  ] || 99;
}

function getVifaOptionQuarter(option = {}) {
  const quarter = normalize(
    option.trimestre_programado ||
    option.trimestre_programado_vifa
  );

  return ["T1", "T2", "T3", "T4"].includes(quarter)
    ? quarter
    : "";
}

function isVifaQuarterlyOption(option = {}) {
  return (
    option.es_control_trimestral === true ||
    normalize(option.control_trimestral) === "SI" ||
    [16, 17, 18].includes(numberValue(option.numero_actividad))
  );
}

function isVifaRecordInCurrentScope(row = {}) {
  if (isDelegationRole()) {
    return sameDelegation(
      row.delegacion,
      state.user?.delegation
    );
  }

  if (isRegionalRole() && !isNationalViewerRole()) {
    return !state.user?.region || sameRegion(
      row.direccion_regional,
      state.user.region
    );
  }

  if (isNationalViewerRole()) {
    const filters = state.nationalViewerFilters || {};

    if (
      filters.region &&
      !sameRegion(row.direccion_regional, filters.region)
    ) {
      return false;
    }

    if (
      filters.delegation &&
      !sameDelegation(row.delegacion, filters.delegation)
    ) {
      return false;
    }
  }

  return true;
}

function getVifaPlanningOptions() {
  const planningByKey = new Map();

  for (const row of state.vifPlanificacion || []) {
    const option = {
      ...row,
      programa: "VIF",
      meta: numberValue(row.linea_base),
      es_control_trimestral: row.control_trimestral === true,
      trimestre_programado_vifa: row.trimestre_programado || "",
      codigo_actividad_vifa: row.codigo_actividad || ""
    };

    if (!isVifaRecordInCurrentScope(option)) continue;

    const key = [
      getDelegationCanonicalKey(option.delegacion),
      normalize(option.codigo_actividad)
    ].join("|||");

    planningByKey.set(key, option);
  }

  // Las opciones entregadas por la API prevalecen porque incluyen
  // avance validado, registros en revisión y disponibilidad actual.
  for (const option of state.activityOptions || []) {
    if (
      normalize(option.programa) !== "VIF" ||
      !isVifaRecordInCurrentScope(option)
    ) {
      continue;
    }

    const key = [
      getDelegationCanonicalKey(option.delegacion || state.user?.delegation),
      normalize(option.codigo_actividad || option.codigo_actividad_vifa)
    ].join("|||");

    planningByKey.set(key, option);
  }

  return [...planningByKey.values()];
}

function getVifaHistoricalRows() {
  return (state.vifaHistorico || []).filter(
    (row) => isVifaRecordInCurrentScope(row)
  );
}

function getVifaValidatedRows() {
  return getRows().filter(
    (row) =>
      normalize(row.programa) === "VIF" &&
      !isHistorical(row) &&
      isNationalApproved(row) &&
      isVifaRecordInCurrentScope(row)
  );
}

function getVifaObligationKey(delegation, code, quarter) {
  return [
    getDelegationCanonicalKey(delegation),
    normalize(code),
    normalize(quarter)
  ].join("|||");
}

function buildVifaQuarterDetails() {
  const obligations = new Map();
  const options = getVifaPlanningOptions();

  for (const option of options) {
    const delegation =
      option.delegacion || state.user?.delegation || "";
    const code =
      option.codigo_actividad || option.codigo_actividad_vifa || "";
    const number = numberValue(option.numero_actividad);
    const quarterly = isVifaQuarterlyOption(option);
    const quarters = quarterly
      ? ["T1", "T2", "T3", "T4"]
      : [getVifaOptionQuarter(option)].filter(Boolean);

    for (const quarter of quarters) {
      const key = getVifaObligationKey(
        delegation,
        code,
        quarter
      );

      obligations.set(key, {
        key,
        delegacion: delegation,
        direccion_regional: option.direccion_regional || "",
        codigo: code,
        numero_actividad: number,
        actividad: option.actividad || code,
        trimestre: quarter,
        control_trimestral: quarterly,
        linea_base: quarterly ? 1 : numberValue(option.linea_base || option.meta),
        avance: 0,
        porcentaje: 0,
        estado: "Pendiente"
      });
    }
  }

  for (const row of getVifaHistoricalRows()) {
    const quarter = normalize(row.trimestre);
    const code = row.codigo_actividad || "";

    if (!["T1", "T2", "T3", "T4"].includes(quarter)) {
      continue;
    }

    const key = getVifaObligationKey(
      row.delegacion,
      code,
      quarter
    );

    if (!obligations.has(key)) {
      obligations.set(key, {
        key,
        delegacion: row.delegacion || "",
        direccion_regional: row.direccion_regional || "",
        codigo: code,
        numero_actividad: numberValue(row.numero_actividad),
        actividad: code,
        trimestre: quarter,
        control_trimestral: row.control_trimestral === true,
        linea_base: row.control_trimestral === true
          ? 1
          : numberValue(row.linea_base),
        avance: 0,
        porcentaje: 0,
        estado: "Pendiente"
      });
    }

    // El archivo local VIF define la planificación histórica y trimestral.
    // No representa ejecución validada. El avance se incorpora únicamente
    // desde PUMI_ACTIVIDADES cuando el registro fue validado nacionalmente.
    // Por eso aquí no se suma row.avance al cumplimiento.
  }

  for (const row of getVifaValidatedRows()) {
    const quarter = normalize(
      row.trimestre_ejecucion_vifa ||
      row.trimestre_programado_vifa
    );
    const code =
      row.codigo_actividad_vifa || "";

    if (!["T1", "T2", "T3", "T4"].includes(quarter)) {
      continue;
    }

    const key = getVifaObligationKey(
      row.delegacion,
      code,
      quarter
    );

    if (!obligations.has(key)) {
      obligations.set(key, {
        key,
        delegacion: row.delegacion || "",
        direccion_regional: row.direccion_regional || "",
        codigo: code,
        numero_actividad: Number(
          normalize(code).replace(/[^0-9]/g, "")
        ) || 0,
        actividad: row.actividad || code,
        trimestre: quarter,
        control_trimestral:
          normalize(row.tipo_medicion_vifa) === "TRIMESTRAL",
        linea_base:
          normalize(row.tipo_medicion_vifa) === "TRIMESTRAL"
            ? 1
            : numberValue(row.linea_base_vifa),
        avance: 0,
        porcentaje: 0,
        estado: "Pendiente"
      });
    }

    const item = obligations.get(key);
    item.avance += item.control_trimestral
      ? 1
      : numberValue(row.avance_realizado);
  }

  return [...obligations.values()]
    .map((item) => {
      const percentage = item.control_trimestral
        ? (item.avance > 0 ? 100 : 0)
        : (
            item.linea_base > 0
              ? Math.min(
                  (item.avance / item.linea_base) * 100,
                  100
                )
              : 0
          );

      const status = percentage >= 100
        ? "Cumplida"
        : percentage > 0
          ? "En proceso"
          : "Pendiente";

      return {
        ...item,
        avance_computable: item.control_trimestral
          ? (item.avance > 0 ? 1 : 0)
          : Math.min(item.avance, item.linea_base),
        porcentaje: percentage,
        estado: status
      };
    })
    .sort((a, b) => {
      const quarter =
        getVifaQuarterOrder(a.trimestre) -
        getVifaQuarterOrder(b.trimestre);

      if (quarter !== 0) return quarter;

      const delegation = String(a.delegacion || "")
        .localeCompare(String(b.delegacion || ""), "es");

      if (delegation !== 0) return delegation;

      return numberValue(a.numero_actividad) -
        numberValue(b.numero_actividad);
    });
}

function buildVifaQuarterSummary() {
  const details = buildVifaQuarterDetails();

  return ["T1", "T2", "T3", "T4"].map(
    (quarter) => {
      const rows = details.filter(
        (row) => row.trimestre === quarter
      );
      const programmed = rows.length;
      const fulfilled = rows.filter(
        (row) => row.porcentaje >= 100
      ).length;
      const inProgress = rows.filter(
        (row) => row.porcentaje > 0 && row.porcentaje < 100
      ).length;
      const pending = rows.filter(
        (row) => row.porcentaje <= 0
      ).length;
      const percentage = programmed > 0
        ? rows.reduce(
            (total, row) => total + row.porcentaje,
            0
          ) / programmed
        : 0;

      return {
        trimestre: quarter,
        programadas: programmed,
        cumplidas: fulfilled,
        en_proceso: inProgress,
        pendientes: pending,
        porcentaje: percentage,
        estado_periodo:
          getVifaQuarterOrder(quarter) < getVifaQuarterOrder(getCurrentVifaQuarter())
            ? "Cerrado"
            : getVifaQuarterOrder(quarter) === getVifaQuarterOrder(getCurrentVifaQuarter())
              ? "En curso"
              : "No iniciado"
      };
    }
  );
}

function renderVifaProgramSummaryCard() {
  const currentQuarter = getCurrentVifaQuarter();
  const current = buildVifaQuarterSummary().find(
    (item) => item.trimestre === currentQuarter
  );

  if (!current || numberValue(current.programadas) <= 0) {
    return "";
  }

  return `
    <div class="program-progress-row vifa-quarter-program-row">
      <div class="program-progress-name" title="VIF ${escapeHtml(currentQuarter)}">
        VIF ${escapeHtml(currentQuarter)}
      </div>

      <div class="program-progress-center">
        <div class="program-progress-track">
          <div
            class="program-progress-fill"
            style="width:${Math.min(numberValue(current.porcentaje), 100)}%"
          ></div>
        </div>

        <div class="program-progress-detail">
          Actividades programadas:
          <strong>${numberValue(current.programadas)}</strong>
          · Cumplidas:
          <strong>${numberValue(current.cumplidas)}</strong>
          · Con avance:
          <strong>${numberValue(current.en_proceso)}</strong>
          · Pendientes:
          <strong>${numberValue(current.pendientes)}</strong>
        </div>
      </div>

      <div class="program-progress-percentage">
        ${numberValue(current.porcentaje).toFixed(1)}%
      </div>
    </div>
  `;
}

function renderProgramSummaryFromLocal() {
  const grouped = {};

  for (const row of buildProgressRows()) {
    if (normalize(row.program) === "VIF") {
      continue;
    }

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
  const visiblePrograms =
    (programs || []).filter(
      (item) =>
        normalize(item.programa) !== "VIF" &&
        numberValue(item.meta) > 0
    );

  const regularHtml = visiblePrograms
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
              Meta anual:
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
    .join("");

  const vifaHtml = renderVifaProgramSummaryCard();

  $("program-summary").innerHTML =
    regularHtml || vifaHtml
      ? `${regularHtml}${vifaHtml}`
      : `
          <p class="page-scope">
            No hay datos disponibles.
          </p>
        `;
}

function renderActivityBreakdownFromLocal() {
  const rows = buildProgressRows()
    .filter((row) => normalize(row.program) !== "VIF")
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

function renderVifaQuarterBreakdown() {
  const currentQuarter = getCurrentVifaQuarter();
  const current = buildVifaQuarterSummary().find(
    (item) => item.trimestre === currentQuarter
  );
  const details = buildVifaQuarterDetails().filter(
    (row) => row.trimestre === currentQuarter
  );

  if (!current || numberValue(current.programadas) <= 0) {
    return "";
  }

  return `
    <section style="margin-bottom:24px;">
      <div class="panel-header" style="margin-bottom:12px;">
        <div>
          <span class="panel-kicker">VIF ${escapeHtml(currentQuarter)}</span>
          <h3>Avance del trimestre en curso</h3>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Trimestre</th>
              <th>Programadas</th>
              <th>Completas</th>
              <th>Con avance</th>
              <th>Incompletas</th>
              <th>% cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${escapeHtml(currentQuarter)}</strong></td>
              <td>${formatNumber(current.programadas)}</td>
              <td>${formatNumber(current.cumplidas)}</td>
              <td>${formatNumber(current.en_proceso)}</td>
              <td>${formatNumber(current.pendientes)}</td>
              <td><strong>${numberValue(current.porcentaje).toFixed(1)}%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel-header" style="margin:22px 0 12px;">
        <div>
          <span class="panel-kicker">Detalle VIF ${escapeHtml(currentQuarter)}</span>
          <h3>Actividades programadas para el trimestre</h3>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Línea base / control</th>
              <th>Avance</th>
              <th>% cumplimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${details.map((row) => `
              <tr>
                <td>${escapeHtml(row.actividad || row.codigo)}</td>
                <td>${row.control_trimestral ? "Control trimestral" : formatNumber(row.linea_base)}</td>
                <td>${row.control_trimestral ? (row.avance > 0 ? "Cumplido" : "Sin registro") : formatNumber(row.avance_computable)}</td>
                <td><strong>${numberValue(row.porcentaje).toFixed(1)}%</strong></td>
                <td>${escapeHtml(row.estado)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderActivityBreakdownTable(rows) {
  const container = $("activity-summary");

  if (!container) {
    return;
  }

  const visibleRows =
    (rows || []).filter(
      (row) =>
        normalize(row.programa) !== "VIF" &&
        numberValue(row.meta) > 0
    );

  const regularHtml = visibleRows.length
    ? `
        <div class="panel-header" style="margin-bottom:12px;">
          <div>
            <span class="panel-kicker">Programas anuales</span>
            <h3>Metas y avances acumulados</h3>
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Actividad</th>
                <th>Meta anual</th>
                <th>Avance</th>
                <th>Pendiente</th>
                <th>% avance</th>
              </tr>
            </thead>

            <tbody>
              ${visibleRows
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
    : "";

  const vifaHtml = renderVifaQuarterBreakdown();

  container.innerHTML = regularHtml || vifaHtml
    ? `${vifaHtml}${regularHtml}`
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

    if (!isVisibleActivityRow(row)) {
      return false;
    }

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

