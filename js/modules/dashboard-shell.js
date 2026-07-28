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
    [`VIF ${quarter}`, `${numberValue(summary.porcentaje).toFixed(1)}%`],
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

  renderStatusSummaryFromLocal();
  renderMap(getVifaValidatedRows());
  renderDelegationOverview([]);
}

