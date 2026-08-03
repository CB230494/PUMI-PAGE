/* PUMI 2026 - Seguimiento Nacional
   Exclusivo del perfil Visor Nacional.
   Consulta PUMI_BITACORA a través de /api/seguimiento-nacional.
*/

(function () {
  "use strict";

  function trackingRows() {
    return (typeof getRows === "function" ? getRows() : [])
      .filter((row) => normalize(row?.estado_registro) !== "ELIMINADO");
  }

  function uniqueSorted(values) {
    return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es", { numeric: true, sensitivity: "base" }));
  }

  function setTrackingOptions(id, values, allLabel, selected = "") {
    const select = $(id);
    if (!select) return;

    const desired = String(selected || select.value || "");
    select.innerHTML = `<option value="">${escapeHtml(allLabel)}</option>` +
      values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

    const matching = [...select.options].find((option) => normalize(option.value) === normalize(desired));
    select.value = matching ? matching.value : "";
  }

  function getTrackingFilterValues() {
    return {
      region: $("tracking-region")?.value || "",
      delegacion: $("tracking-delegation")?.value || "",
      programa: $("tracking-program")?.value || "",
      actividad: $("tracking-activity")?.value || "",
      accion: $("tracking-action")?.value || "",
      desde: $("tracking-from")?.value || "",
      hasta: $("tracking-to")?.value || ""
    };
  }

  function hasTrackingFilters() {
    return Object.values(getTrackingFilterValues()).some((value) => String(value || "").trim());
  }

  function populateTrackingFilters(changedField = "") {
    const current = getTrackingFilterValues();
    const rows = trackingRows();

    const regions = typeof getNationalRegionOptions === "function"
      ? getNationalRegionOptions()
      : uniqueSorted(rows.map((row) => row.direccion_regional));

    setTrackingOptions("tracking-region", regions, "Todas las regiones", current.region);

    const regionRows = current.region
      ? rows.filter((row) => sameRegion(getActivityRegion(row), current.region))
      : rows;

    const delegations = typeof getNationalDelegationOptions === "function"
      ? getNationalDelegationOptions(current.region)
      : uniqueSorted(regionRows.map((row) => row.delegacion));

    setTrackingOptions(
      "tracking-delegation",
      delegations,
      "Todas las delegaciones",
      changedField === "region" ? "" : current.delegacion
    );

    const selectedDelegation = $("tracking-delegation")?.value || "";
    const territoryRows = regionRows.filter((row) =>
      !selectedDelegation || sameDelegation(row.delegacion, selectedDelegation)
    );

    const programs = uniqueSorted(
      territoryRows.map((row) => normalize(row.programa) === "VIFA" ? "VIF" : row.programa)
    );

    setTrackingOptions(
      "tracking-program",
      programs,
      "Todos los programas",
      changedField === "region" || changedField === "delegation" ? "" : current.programa
    );

    const selectedProgram = $("tracking-program")?.value || "";
    const programRows = territoryRows.filter((row) => {
      if (!selectedProgram) return true;
      const rowProgram = normalize(row.programa);
      const filterProgram = normalize(selectedProgram);
      return rowProgram === filterProgram || (filterProgram === "VIF" && rowProgram === "VIFA");
    });

    const activities = uniqueSorted(programRows.map((row) => row.actividad));
    setTrackingOptions(
      "tracking-activity",
      activities,
      "Todas las actividades",
      ["region", "delegation", "program"].includes(changedField) ? "" : current.actividad
    );
  }

  function renderTrackingPrompt(message = "Aplique al menos un filtro y pulse Consultar movimientos.") {
    const target = $("tracking-results");
    if (!target) return;

    target.innerHTML = `
      <article class="panel-card empty-state tracking-prompt">
        <div class="empty-icon">🧭</div>
        <h3>Consulta de movimientos</h3>
        <p>${escapeHtml(message)}</p>
      </article>
    `;
  }

  function trackingActionLabel(action) {
    const labels = {
      CREACION: "Creación",
      CONFIRMACION_ENVIO: "Envío a Dirección Regional",
      REVISION_REGIONAL: "Revisión regional",
      VALIDACION_NACIONAL: "Resolución nacional",
      ACTUALIZACION: "Actualización",
      ELIMINACION_LOGICA: "Eliminación de registro"
    };
    return labels[normalize(action)] || action || "Movimiento";
  }

  function movementTitle(row = {}) {
    if (String(row.movimiento || "").trim()) {
      return row.movimiento;
    }

    const action = normalize(row.accion);
    const delegation = row.delegacion || "Delegación";
    const region = row.direccion_regional || "Dirección Regional";
    const program = normalize(row.programa) === "VIFA" ? "VIF" : (row.programa || "programa");

    if (action === "CREACION") return `${delegation} creó un registro de ${program}`;
    if (action === "CONFIRMACION_ENVIO") return `${delegation} envió una actividad a ${region}`;
    if (action === "REVISION_REGIONAL") return `${region} revisó una actividad de ${delegation}`;
    if (action === "VALIDACION_NACIONAL") return `Coordinación Nacional de ${program} resolvió una actividad de ${delegation}`;
    if (action === "ELIMINACION_LOGICA") return `${delegation} eliminó un registro`;
    if (action === "ACTUALIZACION") return `${delegation} actualizó un registro`;

    return trackingActionLabel(row.accion);
  }

  function movementDestination(row = {}) {
    if (row.destino) return row.destino;
    const action = normalize(row.accion);
    if (action === "CONFIRMACION_ENVIO") return "Dirección Regional";
    if (action === "REVISION_REGIONAL") return "Coordinación Nacional";
    if (action === "VALIDACION_NACIONAL") return "Finalizado";
    if (action === "CREACION") return "Delegación";
    return row.estado_actual || "Seguimiento";
  }

  function movementStatus(row = {}) {
    return row.estado_actual || row.estado_flujo || movementDestination(row);
  }

  function renderNationalTrackingResults(result = {}) {
    const target = $("tracking-results");
    if (!target) return;

    if (result.configured === false) {
      target.innerHTML = `
        <article class="panel-card empty-state">
          <h3>Bitácora no configurada</h3>
          <p>La API no tiene disponible la capa de bitácora para consultar movimientos.</p>
        </article>
      `;
      return;
    }

    const movements = Array.isArray(result.movements)
      ? result.movements
      : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

    if (!movements.length) {
      target.innerHTML = `
        <article class="panel-card empty-state">
          <h3>Sin movimientos</h3>
          <p>No se encontraron movimientos con los filtros seleccionados.</p>
        </article>
      `;
      return;
    }

    const counts = movements.reduce((acc, row) => {
      const key = normalize(row.accion);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    target.innerHTML = `
      <div class="tracking-metrics">
        <article><span>Total</span><strong>${formatNumber(movements.length)}</strong></article>
        <article><span>Envíos a Región</span><strong>${formatNumber(counts.CONFIRMACION_ENVIO || 0)}</strong></article>
        <article><span>Revisiones regionales</span><strong>${formatNumber(counts.REVISION_REGIONAL || 0)}</strong></article>
        <article><span>Resoluciones nacionales</span><strong>${formatNumber(counts.VALIDACION_NACIONAL || 0)}</strong></article>
      </div>

      <article class="panel-card tracking-list-card">
        <div class="tracking-list-head">
          <div>
            <span class="panel-kicker">TRAZABILIDAD</span>
            <h3>Movimientos registrados</h3>
          </div>
          <span>${formatNumber(movements.length)} resultado(s)</span>
        </div>

        <div class="tracking-list">
          ${movements.map((row) => `
            <details class="tracking-item">
              <summary>
                <span class="tracking-dot ${normalize(row.accion).toLowerCase()}"></span>
                <span class="tracking-time">${escapeHtml(formatDateTime(row.fecha))}</span>
                <span class="tracking-main">
                  <strong>${escapeHtml(movementTitle(row))}</strong>
                  <small>${escapeHtml([row.direccion_regional, row.delegacion, normalize(row.programa) === "VIFA" ? "VIF" : row.programa].filter(Boolean).join(" · "))}</small>
                </span>
                <span class="tracking-status">${escapeHtml(movementStatus(row))}</span>
              </summary>

              <div class="tracking-detail">
                <div><b>ID PUMI:</b> ${escapeHtml(row.id_pumi || "Sin dato")}</div>
                <div><b>Actividad:</b> ${escapeHtml(row.actividad || "Sin detalle")}</div>
                <div><b>Usuario:</b> ${escapeHtml(row.usuario || row.usuario_registra || "No registrado")}</div>
                <div><b>Destino:</b> ${escapeHtml(movementDestination(row))}</div>
                <div class="tracking-detail-wide"><b>Tipo:</b> ${escapeHtml(trackingActionLabel(row.accion))}</div>
                <div class="tracking-detail-wide"><b>Detalle:</b> ${escapeHtml(row.detalle || "Sin observación")}</div>
                ${row.observacion_regional ? `<div class="tracking-detail-wide"><b>Observación regional:</b> ${escapeHtml(row.observacion_regional)}</div>` : ""}
                ${row.observacion_nacional ? `<div class="tracking-detail-wide"><b>Observación nacional:</b> ${escapeHtml(row.observacion_nacional)}</div>` : ""}
              </div>
            </details>
          `).join("")}
        </div>
      </article>
    `;
  }

  async function loadNationalTracking() {
    const target = $("tracking-results");
    if (!target) return;

    if (!hasTrackingFilters()) {
      renderTrackingPrompt("Debe seleccionar al menos un filtro para evitar mostrar una lista nacional demasiado extensa.");
      return;
    }

    target.innerHTML = `
      <article class="panel-card empty-state">
        <p>Cargando movimientos...</p>
      </article>
    `;

    try {
      if (!api || typeof api.getNationalTracking !== "function") {
        throw new Error("La conexión de seguimiento nacional no está disponible en ApiService.");
      }

      const result = await api.getNationalTracking({
        ...getTrackingFilterValues(),
        limite: 1000
      });

      state.nationalTracking = result;
      renderNationalTrackingResults(result);
    } catch (error) {
      console.error("Seguimiento Nacional:", error);
      target.innerHTML = `
        <article class="panel-card empty-state">
          <h3>No fue posible consultar el seguimiento</h3>
          <p>${escapeHtml(error.message)}</p>
        </article>
      `;
    }
  }

  async function renderNationalTrackingModule() {
    if (!isNationalViewerRole()) {
      if (typeof renderComing === "function") renderComing("Seguimiento Nacional");
      return;
    }

    $("coming-page").innerHTML = `
      <section class="tracking-shell">
        <article class="panel-card tracking-hero">
          <div>
            <span class="panel-kicker">VISOR NACIONAL</span>
            <h2>Seguimiento nacional de movimientos</h2>
            <p>Consulte la trazabilidad de las actividades desde la Delegación, su revisión regional y la resolución de la Coordinación Nacional.</p>
          </div>
          <div class="tracking-hero-icon">🧭</div>
        </article>

        <article class="panel-card tracking-panel">
          <div class="tracking-filters">
            <label>Dirección Regional<select id="tracking-region"><option value="">Todas las regiones</option></select></label>
            <label>Delegación<select id="tracking-delegation"><option value="">Todas las delegaciones</option></select></label>
            <label>Programa<select id="tracking-program"><option value="">Todos los programas</option></select></label>
            <label>Actividad<select id="tracking-activity"><option value="">Todas las actividades</option></select></label>
            <label>Movimiento<select id="tracking-action">
              <option value="">Todos los movimientos</option>
              <option value="CREACION">Creación</option>
              <option value="CONFIRMACION_ENVIO">Envío a Dirección Regional</option>
              <option value="REVISION_REGIONAL">Revisión regional</option>
              <option value="VALIDACION_NACIONAL">Resolución nacional</option>
              <option value="ACTUALIZACION">Actualización</option>
              <option value="ELIMINACION_LOGICA">Eliminación de registro</option>
            </select></label>
            <label>Desde<input id="tracking-from" type="date"></label>
            <label>Hasta<input id="tracking-to" type="date"></label>
          </div>

          <div class="tracking-actions">
            <button id="tracking-clear" class="btn btn-secondary" type="button">Limpiar filtros</button>
            <button id="tracking-search" class="btn btn-primary" type="button">Consultar movimientos</button>
          </div>
        </article>

        <section id="tracking-results"></section>
      </section>
    `;

    populateTrackingFilters();
    renderTrackingPrompt();

    $("tracking-search")?.addEventListener("click", loadNationalTracking);
    $("tracking-clear")?.addEventListener("click", () => {
      ["tracking-region", "tracking-delegation", "tracking-program", "tracking-activity", "tracking-action", "tracking-from", "tracking-to"]
        .forEach((id) => { if ($(id)) $(id).value = ""; });
      populateTrackingFilters();
      renderTrackingPrompt();
    });

    $("tracking-region")?.addEventListener("change", () => populateTrackingFilters("region"));
    $("tracking-delegation")?.addEventListener("change", () => populateTrackingFilters("delegation"));
    $("tracking-program")?.addEventListener("change", () => populateTrackingFilters("program"));
  }

  window.renderNationalTrackingModule = renderNationalTrackingModule;
})();
