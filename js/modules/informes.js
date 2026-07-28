/* PUMI 2026 - módulo informes. Extraído sin cambiar lógica. */

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
  if (!select) {
    return;
  }

  const target =
    String(value || "").trim();

  if (!target) {
    select.value = "";
    return;
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
    return;
  }

  select.value = "";
}


/* =========================================================
   INFORMES PDF
========================================================= */
function renderReportsModule() {
  const coordinator = isNationalCoordinatorRole();
  const regional = isRegionalRole() && !coordinator && !isNationalViewerRole();
  const assignedProgramRaw = state.user?.program || state.user?.programa || state.user?.assignedProgram || "";
  const assignedProgram = normalize(assignedProgramRaw) === "VIF" ? "VIF" : String(assignedProgramRaw || "").trim();
  const userRegion = String(state.user?.region || "").trim();

  const scopedRows = getRows();
  const programSources = [
    ...scopedRows.map((row) => row.programa),
    ...(state.activityOptions || []).map((item) => item.programa)
  ];
  const programs = [...new Set(programSources.map((value) => normalize(value)).filter(Boolean))]
    .map((program) => program === "VIFA" ? "VIF" : program)
    .sort((a, b) => a.localeCompare(b, "es"));
  const regions = [...new Set(scopedRows.map(r => String(r.direccion_regional || "").trim()).filter(Boolean))]
    .sort((a,b)=>a.localeCompare(b,"es"));

  const delegationsForRegion = (region) => [...new Set(scopedRows
    .filter((row) => !region || sameRegion(row.direccion_regional, region))
    .map((row) => String(row.delegacion || "").trim())
    .filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));

  const programField = coordinator
    ? `<div class="report-readonly-field"><span>Programa asignado</span><strong>${escapeHtml(assignedProgram || "No configurado")}</strong><small>El Coordinador Nacional solo puede generar informes de su programa.</small><input id="report-program" type="hidden" value="${escapeHtml(assignedProgram)}"></div>`
    : `<label>Programa<select id="report-program"><option value="">Todos los programas</option>${programs.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}</select></label>`;

  const regionField = regional
    ? `<div class="report-readonly-field"><span>Dirección Regional</span><strong>${escapeHtml(userRegion || "Región no configurada")}</strong><small>El informe se limita a las delegaciones de esta Dirección Regional.</small><input id="report-region" type="hidden" value="${escapeHtml(userRegion)}"></div>`
    : `<label>Región<select id="report-region"><option value="">Todas las regiones</option>${regions.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}</select></label>`;

  const initialDelegations = delegationsForRegion(regional ? userRegion : "");
  $("coming-page").innerHTML = `
    <article class="panel-card report-panel">
      <div class="report-hero"><div><span class="panel-kicker">Reporte institucional</span><h2>Generar informe PDF</h2><p>${coordinator
        ? `El informe está limitado al programa <strong>${escapeHtml(assignedProgram || "asignado")}</strong>.`
        : regional
          ? "Puede generar informes de todos los programas de las delegaciones que pertenecen a su Dirección Regional."
          : "El Visor Nacional puede generar un informe nacional completo o aplicar filtros."}</p></div><div class="report-hero-icon">📊</div></div>
      <section class="report-filter-section">
        <div class="report-section-heading">
          <span>1</span>
          <div><strong>Alcance del informe</strong><small>Seleccione programa, región, delegación y actividad.</small></div>
        </div>
        <div class="report-filter-grid report-filter-grid-scope">
          ${programField}
          ${regionField}
          <label>Delegación<select id="report-delegation"><option value="">Todas las delegaciones</option>${initialDelegations.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}</select></label>
          <label>Actividad<select id="report-activity"><option value="">Todas las actividades</option></select></label>
        </div>
      </section>

      <section class="report-filter-section">
        <div class="report-section-heading">
          <span>2</span>
          <div><strong>Criterios de análisis</strong><small>Defina cumplimiento, revisión, trimestre y estado del flujo.</small></div>
        </div>
        <div class="report-filter-grid report-filter-grid-analysis">
          <label>Cumplimiento<select id="report-compliance"><option value="">Completa, con avance e incompleta</option><option value="COMPLETA">Completa</option><option value="CON_AVANCE">Con avance</option><option value="INCOMPLETA">Incompleta</option><option value="SIN_META">Sin meta programada</option></select></label>
          <label>Revisión<select id="report-review"><option value="">Revisadas y no revisadas</option><option value="REVISADA">Revisadas</option><option value="NO_REVISADA">No revisadas</option></select></label>
          <label>Trimestre<select id="report-quarter"><option value="">Trimestre actual para VIF</option><option>T1</option><option>T2</option><option>T3</option><option>T4</option></select></label>
          <label>Estado del flujo<select id="report-status"><option value="">Todos los estados</option><option value="BORRADOR">Borrador</option><option value="PENDIENTE_REGIONAL">Pendiente regional</option><option value="DEVUELTO_REGIONAL">Devuelto regional</option><option value="PENDIENTE_NACIONAL">Pendiente nacional</option><option value="VALIDADO_NACIONAL">Validado nacional</option><option value="NO_VALIDADO_NACIONAL">No validado nacional</option></select></label>
        </div>
      </section>

      <section class="report-filter-section">
        <div class="report-section-heading">
          <span>3</span>
          <div><strong>Periodo</strong><small>Las fechas son opcionales.</small></div>
        </div>
        <div class="report-filter-grid report-filter-grid-period">
          <label>Fecha inicial<input id="report-from" type="date"></label>
          <label>Fecha final<input id="report-to" type="date"></label>
        </div>
      </section>

      <div class="report-note"><strong>El informe incluirá:</strong> portada, resumen ejecutivo, indicadores, VIF por trimestre, actividades adicionales no programadas, distribución territorial, estados de validación y detalle.</div>
      <div class="form-actions report-actions"><button id="download-report-pdf" class="btn btn-primary">📄 Generar y descargar informe PDF</button></div>
    </article>`;

  const refreshDelegations = () => {
    const region = regional ? userRegion : $("report-region")?.value;
    const values = delegationsForRegion(region);
    const select = $("report-delegation");
    if (select) select.innerHTML = `<option value="">Todas las delegaciones</option>${values.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}`;
  };
  const refreshActivities = () => {
    const program = $("report-program")?.value;
    const region = regional ? userRegion : $("report-region")?.value;
    const delegation = $("report-delegation")?.value;
    const values = [...new Set(scopedRows.filter((row) =>
      (!program || normalize(row.programa) === normalize(program)) &&
      (!region || sameRegion(row.direccion_regional, region)) &&
      (!delegation || sameDelegation(row.delegacion, delegation))
    ).map((row) => String(row.actividad || "").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
    const select = $("report-activity");
    if (select) select.innerHTML = `<option value="">Todas las actividades</option>${values.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}`;
  };
  $("report-region")?.addEventListener("change", () => { refreshDelegations(); refreshActivities(); });
  $("report-delegation")?.addEventListener("change", refreshActivities);
  $("report-program")?.addEventListener("change", refreshActivities);
  refreshActivities();

  $("download-report-pdf")?.addEventListener("click", async () => {
    try {
      if (coordinator && !assignedProgram) throw new Error("El usuario coordinador no tiene un programa asignado.");
      const params = {
        programa: coordinator ? assignedProgram : $("report-program")?.value,
        region: regional ? userRegion : $("report-region")?.value,
        delegacion: $("report-delegation")?.value,
        actividad: $("report-activity")?.value,
        cumplimiento: $("report-compliance")?.value,
        revision: $("report-review")?.value,
        trimestre: $("report-quarter")?.value,
        estado: $("report-status")?.value,
        desde: $("report-from")?.value,
        hasta: $("report-to")?.value
      };
      await api.downloadPdfReport(params);
      showToast("Informe PDF generado correctamente.");
    } catch (error) { showToast(error.message || "No fue posible generar el informe.", true); }
  });
}

