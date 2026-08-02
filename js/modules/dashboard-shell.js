/* PUMI 2026 - módulo dashboard_shell. Extraído sin cambiar lógica. */

function renderDashboard() {
  if (isNationalViewerRole()) {
    renderNationalViewerDashboard();
    return;
  }

  if (isDelegationRole()) {
    renderDelegationDashboard();
    return;
  }

  if (isVifNationalCoordinator()) {
    renderVifCoordinatorDashboard();
    return;
  }

  renderConsolidatedDashboard();
}

function renderVifCoordinatorDashboard() {
  toggleBreakdownPanel(true);

  const quarter = getCurrentVifaQuarter();
  const summary = buildVifaQuarterSummary().find(
    (item) => item.trimestre === quarter
  ) || {
    programadas: 0,
    cumplidas: 0,
    en_proceso: 0,
    pendientes: 0,
    porcentaje: 0
  };

  renderKpiCards([
    [`VIF ${quarter}`, formatVifaPercentage(summary.porcentaje)],
    ["Actividades programadas", numberValue(summary.programadas)],
    ["Cumplidas", numberValue(summary.cumplidas)],
    ["Con avance", numberValue(summary.en_proceso)],
    ["Pendientes", numberValue(summary.pendientes)]
  ]);

  const programHtml = renderVifaProgramSummaryCard();
  $("program-summary").innerHTML = programHtml || `
    <div class="module-empty">
      No hay actividades VIF programadas para ${escapeHtml(quarter)}.
    </div>
  `;

  const breakdownHtml = renderVifaQuarterBreakdown();
  const activityContainer = $("activity-summary");
  if (activityContainer) {
    activityContainer.innerHTML = breakdownHtml || `
      <div class="module-empty">
        No hay planificación VIF disponible para ${escapeHtml(quarter)}.
      </div>
    `;
  }

  const vifRows = getRows().filter((row) =>
    normalize(row.programa) === "VIF" &&
    !isHistorical(row) &&
    (
      !state.dashboardRegionFilter ||
      sameRegion(row.direccion_regional, state.dashboardRegionFilter)
    )
  );
  const statuses = {};
  for (const row of vifRows) {
    const label = workflowLabel(row);
    statuses[label] = (statuses[label] || 0) + 1;
  }
  renderStatusSummaryFromDashboard(statuses);

  // El mismo panel/mismo mapa que los demás coordinadores, pero construido
  // con las 8 obligaciones VIF del trimestre por cada delegación.
  renderDelegationOverview(buildVifCoordinatorDelegationRows());
  renderDashboardMapFromFilters();
}

