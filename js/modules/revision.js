/* PUMI 2026 - módulo revision. Extraído sin cambiar lógica. */

function renderReviewModule() {
  const role = getCurrentRole();

  if (
    role.includes("REGIONAL") ||
    role.includes("ADMIN")
  ) {
    state.currentReviewLevel = "REGIONAL";

    renderReviewQueue(
      state.regionalQueue,
      "Dirección Regional",
      "Revisión de actividades"
    );

    return;
  }

  if (
    role.includes("COORDIN") ||
    role === "NACIONAL"
  ) {
    state.currentReviewLevel = "NACIONAL";

    renderReviewQueue(
      state.nationalQueue,
      "Coordinación Nacional",
      "Validación de actividades"
    );

    return;
  }

  renderComing(
    "Revisión y validación"
  );
}

function renderReviewQueue(
  queue,
  kicker,
  title
) {
  const features =
    filterVisibleActivityFeatures(
      queue?.features || []
    );

  const rows = features.map(
    (feature) => ({
      ...(feature.attributes || {}),

      __geometry:
        feature.geometry || null,

      __workflow:
        feature.workflow_status ||
        workflowLabel(
          feature.attributes || {}
        )
    })
  );

  const delegations = [
    ...new Set(
      rows
        .map((row) => row.delegacion)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const programs = [
    ...new Set(
      rows
        .map((row) => row.programa)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const activities = [
    ...new Set(
      rows
        .map((row) => row.actividad)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            ${escapeHtml(kicker)}
          </span>

          <h2>${escapeHtml(title)}</h2>

          ${
            queue?.program
              ? `
                  <p class="page-scope">
                    Programa:
                    ${escapeHtml(queue.program)}
                  </p>
                `
              : ""
          }
        </div>

        <div class="review-counter">
          <span>Pendientes</span>

          <strong>
            ${formatNumber(
              queue?.pending_count || 0
            )}
          </strong>
        </div>
      </div>

      <div class="filter-grid pumi-review-filters">
        <label>
          Delegación
          <select id="review-filter-delegation"></select>
        </label>

        <label>
          Programa
          <select id="review-filter-program"></select>
        </label>

        <label>
          Actividad
          <select id="review-filter-activity"></select>
        </label>

        <label>
          Estado
          <select id="review-filter-status">
            <option value="">Todos</option>

            ${[
              ...new Set(
                rows.map(
                  (row) =>
                    row.__workflow
                )
              )
            ]
              .sort()
              .map(
                (status) => `
                  <option
                    value="${escapeHtml(status)}"
                  >
                    ${escapeHtml(status)}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>
      </div>

      <div id="review-records"></div>
    </article>
  `;

  fillSelect(
    $("review-filter-delegation"),
    delegations,
    true
  );

  fillSelect(
    $("review-filter-program"),
    programs,
    true
  );

  fillSelect(
    $("review-filter-activity"),
    activities,
    true
  );

  const render =
    () =>
      renderReviewRecords(rows);

  [
    "review-filter-delegation",
    "review-filter-program",
    "review-filter-activity",
    "review-filter-status"
  ].forEach((id) => {
    $(id)?.addEventListener(
      "change",
      render
    );
  });

  render();
}

function renderReviewRecords(sourceRows) {
  const delegation =
    $("review-filter-delegation")
      ?.value || "";

  const program =
    $("review-filter-program")
      ?.value || "";

  const activity =
    $("review-filter-activity")
      ?.value || "";

  const status =
    $("review-filter-status")
      ?.value || "";

  const rows = sourceRows.filter(
    (row) => {
      if (
        delegation &&
        row.delegacion !== delegation
      ) {
        return false;
      }

      if (
        program &&
        row.programa !== program
      ) {
        return false;
      }

      if (
        activity &&
        row.actividad !== activity
      ) {
        return false;
      }

      if (
        status &&
        row.__workflow !== status
      ) {
        return false;
      }

      return true;
    }
  );

  $("review-records").innerHTML =
    rows.length
      ? `
          <div class="review-list">
            ${rows
              .map(
                (row) => `
                  <article class="review-compact-card">
                    <div>
                      <span class="status-badge">
                        ${escapeHtml(
                          row.__workflow
                        )}
                      </span>

                      <h3>
                        ${escapeHtml(
                          row.delegacion
                        )}
                      </h3>

                      <p>
                        ${escapeHtml(
                          row.programa
                        )}
                      </p>

                      <strong>
                        ${escapeHtml(
                          row.actividad
                        )}
                      </strong>
                    </div>

                    <div class="review-compact-meta">
                      <span>
                        Fecha:
                        <strong>
                          ${formatDate(
                            row.fecha_actividad
                          )}
                        </strong>
                      </span>

                      <span>
                        Avance reportado:
                        <strong>
                          ${formatNumber(
                            row.avance_realizado
                          )}
                        </strong>
                      </span>

                      <button
                        class="btn btn-primary"
                        data-open-review="${getObjectId(row)}"
                      >
                        🔎 Revisar actividad
                      </button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
      : `
          <div class="module-empty">
            No hay registros para los filtros seleccionados.
          </div>
        `;

  document
    .querySelectorAll("[data-open-review]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          await openReviewDetail(
            Number(
              button.dataset.openReview
            )
          );
        }
      );
    });
}

async function openReviewDetail(objectId) {
  try {
    const result =
      await api.getActivityDetail(
        objectId
      );

    const feature =
      result.feature || {};

    const row =
      feature.attributes || {};

    const progress =
      feature.progress || {};

    $("coming-page").innerHTML = `
      <article class="review-detail-page">
        <div class="review-detail-topbar">
          <button
            id="btn-back-review"
            class="btn btn-secondary"
          >
            ← Volver a la bandeja
          </button>

          <span class="status-badge">
            ${escapeHtml(
              feature.workflow_status ||
              workflowLabel(row)
            )}
          </span>
        </div>

        <article class="panel-card">
          <div class="module-heading">
            <div>
              <span class="panel-kicker">
                ${
                  state.currentReviewLevel === "REGIONAL"
                    ? "Revisión Regional"
                    : "Validación Nacional"
                }
              </span>

              <h2>
                ${escapeHtml(row.delegacion)}
              </h2>

              <p class="page-scope">
                ${escapeHtml(row.direccion_regional)}
              </p>
            </div>

            <div class="review-counter">
              <span>Avance reportado</span>

              <strong>
                ${formatNumber(
                  row.avance_realizado
                )}
              </strong>
            </div>
          </div>

          ${
            isAdditionalActivity(row)
              ? `
                <div class="progress-info-card progress-info-card-additional">
                  <div>
                    <span>Avance validado</span>
                    <strong>${formatNumber(progress.avance_validado)}</strong>
                  </div>
                  <div>
                    <span>En revisión</span>
                    <strong>${formatNumber(progress.avance_en_revision)}</strong>
                  </div>
                </div>
              `
              : `
                <div class="progress-info-card">
                  <div>
                    <span>Meta</span>
                    <strong>${formatNumber(progress.meta)}</strong>
                  </div>
                  <div>
                    <span>Avance validado</span>
                    <strong>${formatNumber(progress.avance_validado)}</strong>
                  </div>
                  <div>
                    <span>En revisión</span>
                    <strong>${formatNumber(progress.avance_en_revision)}</strong>
                  </div>
                  <div>
                    <span>Pendiente</span>
                    <strong>${formatNumber(progress.pendiente_real)}</strong>
                  </div>
                </div>
              `
          }

          ${renderActivityDataSections(row)}

          <div class="form-section-title">
            Ubicación registrada
          </div>

          <div
            id="review-map"
            class="form-map"
          ></div>

          <section class="pumi-valuation-card">
            <div class="form-section-title">
              Valoración
            </div>

            <div class="pumi-valuation-layout">
              <label class="review-observation-field">
                <span>
                  Observaciones de revisión
                </span>

                <textarea
                  id="review-observations"
                  rows="6"
                  placeholder="Digite observaciones, recomendaciones o motivos de devolución..."
                ></textarea>
              </label>

              <div class="review-actions review-actions-large">
                ${
                  state.currentReviewLevel === "REGIONAL"
                    ? `
                        <button
                          id="btn-review-approve"
                          class="btn btn-primary"
                        >
                          ✅ Revisar y enviar a Coordinación Nacional
                        </button>

                        <button
                          id="btn-review-return"
                          class="btn btn-warning"
                        >
                          ↩️ Devolver a Delegación
                        </button>

                        <button
                          id="btn-review-edit"
                          class="btn btn-secondary"
                        >
                          ✏️ Editar registro
                        </button>

                        <button
                          id="btn-review-delete"
                          class="btn btn-danger"
                        >
                          🗑️ Eliminar registro
                        </button>
                      `
                    : `
                        <button
                          id="btn-review-approve"
                          class="btn btn-primary"
                        >
                          ✅ Validar nacionalmente
                        </button>

                        <button
                          id="btn-review-return"
                          class="btn btn-warning"
                        >
                          ↩️ Observar registro
                        </button>
                      `
                }
              </div>
            </div>
          </section>
        </article>
      </article>
    `;

    $("btn-back-review").addEventListener(
      "click",
      renderReviewModule
    );

    renderReviewMap(row);

    $("btn-review-approve").addEventListener(
      "click",
      async () => {
        const observations =
          $("review-observations")
            .value
            .trim();

        if (
          state.currentReviewLevel ===
          "REGIONAL"
        ) {
          await performRegionalReview(
            objectId,
            "Revisado regional",
            observations
          );
        } else {
          await performNationalReview(
            objectId,
            "Validado nacional",
            observations
          );
        }
      }
    );

    $("btn-review-return").addEventListener(
      "click",
      async () => {
        const observations =
          $("review-observations")
            .value
            .trim();

        if (!observations) {
          showToast(
            "Debe indicar una observación para devolver u observar el registro.",
            true
          );
          return;
        }

        if (
          state.currentReviewLevel ===
          "REGIONAL"
        ) {
          await performRegionalReview(
            objectId,
            "Devuelto regional",
            observations
          );
        } else {
          await performNationalReview(
            objectId,
            "Observado nacional",
            observations
          );
        }
      }
    );

    if ($("btn-review-edit")) {
      $("btn-review-edit").addEventListener(
        "click",
        () => {
          const localRow =
            getRows().find(
              (item) =>
                getObjectId(item) ===
                objectId
            );

          if (localRow) {
            renderActivityForm(localRow);
          }
        }
      );
    }

    if ($("btn-review-delete")) {
      $("btn-review-delete").addEventListener(
        "click",
        async () => {
          if (
            !window.confirm(
              "¿Eliminar definitivamente este registro?"
            )
          ) {
            return;
          }

          try {
            await api.deleteActivity(objectId);

            await loadData();
            renderReviewModule();

            showToast(
              "Registro eliminado."
            );
          } catch (error) {
            showToast(error.message, true);
          }
        }
      );
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

async function performRegionalReview(
  objectId,
  status,
  observations
) {
  try {
    await api.regionalReview(
      objectId,
      status,
      observations
    );

    await loadData();
    renderReviewModule();

    showToast(
      status === "Revisado regional"
        ? "Actividad enviada a validación nacional."
        : "Actividad devuelta a la delegación."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

async function performNationalReview(
  objectId,
  status,
  observations
) {
  try {
    await api.nationalReview(
      objectId,
      status,
      observations
    );

    await loadData();
    renderReviewModule();

    showToast(
      status === "Validado nacional"
        ? "Actividad validada nacionalmente."
        : "Actividad observada nacionalmente."
    );
  } catch (error) {
    showToast(error.message, true);
  }
}

/* =========================================================
   NOTIFICACIONES
========================================================= */

function getNotificationDate(row) {
  const candidates = [
    row?.fecha_revision_nacional,
    row?.fecha_revision_regional,
    row?.fecha_confirmacion_envio,
    row?.fecha_migracion,
    row?.fecha_actividad
  ];

  for (const candidate of candidates) {
    const value = Number(candidate);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return null;
}

function formatNotificationDate(value) {
  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0
  ) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      timeZone:
        "America/Costa_Rica",

      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        true
    }
  ).format(
    new Date(numericValue)
  );
}

function createDerivedNotifications() {
  const role = getCurrentRole();
  const notes = [];

  if (
    role.includes("REGIONAL") &&
    state.regionalQueue
  ) {
    const grouped = new Map();

    for (
      const feature
      of state.regionalQueue.features || []
    ) {
      const row =
        feature.attributes || {};

      const status =
        feature.workflow_status ||
        workflowLabel(row);

      if (
        status !== "Pendiente regional"
      ) {
        continue;
      }

      const delegation =
        row.delegacion ||
        "Delegación";

      const key =
        normalize(delegation);

      if (!grouped.has(key)) {
        grouped.set(
          key,
          {
            delegation,
            count: 0,
            latestDate: null
          }
        );
      }

      const item =
        grouped.get(key);

      item.count += 1;

      const rowDate =
        getNotificationDate(row);

      if (
        rowDate &&
        (
          !item.latestDate ||
          rowDate > item.latestDate
        )
      ) {
        item.latestDate =
          rowDate;
      }
    }

    for (
      const item
      of grouped.values()
    ) {
      notes.push({
        message:
          `${item.delegation} tiene ${item.count} actividad(es) pendiente(s) de revisión regional.`,

        date:
          item.latestDate
      });
    }
  }

  if (
    (
      role.includes("COORDIN") ||
      role === "NACIONAL"
    ) &&
    state.nationalQueue
  ) {
    const grouped = new Map();

    for (
      const feature
      of state.nationalQueue.features || []
    ) {
      const row =
        feature.attributes || {};

      const status =
        feature.workflow_status ||
        workflowLabel(row);

      if (
        status !== "Pendiente nacional"
      ) {
        continue;
      }

      const delegation =
        row.delegacion ||
        "Delegación";

      const key =
        normalize(delegation);

      if (!grouped.has(key)) {
        grouped.set(
          key,
          {
            delegation,
            count: 0,
            latestDate: null
          }
        );
      }

      const item =
        grouped.get(key);

      item.count += 1;

      const rowDate =
        getNotificationDate(row);

      if (
        rowDate &&
        (
          !item.latestDate ||
          rowDate > item.latestDate
        )
      ) {
        item.latestDate =
          rowDate;
      }
    }

    for (
      const item
      of grouped.values()
    ) {
      notes.push({
        message:
          `${item.delegation} tiene ${item.count} actividad(es) pendiente(s) de validación nacional.`,

        date:
          item.latestDate
      });
    }
  }

  if (role.includes("DELEG")) {
    getRows()
      .filter(
        (row) =>
          !isHistorical(row) &&
          normalize(
            row.usuario_registra
          ) ===
            normalize(
              state.user?.username
            ) &&
          (
            workflowLabel(row) ===
              "Devuelto regional" ||
            workflowLabel(row) ===
              "Pendiente nacional" ||
            workflowLabel(row) ===
              "Validado nacional" ||
            workflowLabel(row) ===
              "No validado nacional"
          )
      )
      .sort(
        (a, b) =>
          (
            getNotificationDate(b) || 0
          ) -
          (
            getNotificationDate(a) || 0
          )
      )
      .slice(0, 10)
      .forEach((row) => {
        notes.push({
          message:
            `${row.actividad}: ${workflowLabel(row)}.`,

          date:
            getNotificationDate(row)
        });
      });
  }

  return notes.sort(
    (a, b) =>
      (
        Number(b.date) || 0
      ) -
      (
        Number(a.date) || 0
      )
  );
}

function renderNotifications() {
  const count =
    state.notificaciones.length;

  $("notification-count").textContent =
    count;

  $("notification-count")
    .classList.toggle(
      "hidden",
      count === 0
    );

  $("notifications-list").innerHTML =
    count
      ? state.notificaciones
          .map(
            (item) => `
              <article class="notification-item">
                <strong>
                  ${escapeHtml(item.message)}
                </strong>

                <small>
                  ${formatNotificationDate(item.date)}
                </small>
              </article>
            `
          )
          .join("")
      : `
          <p class="page-scope">
            No hay notificaciones pendientes.
          </p>
        `;
}

function openNotifications() {
  $("notifications-drawer")
    .classList.remove("hidden");

  $("drawer-backdrop")
    .classList.remove("hidden");
}

function closeNotifications() {
  $("notifications-drawer")
    .classList.add("hidden");

  $("drawer-backdrop")
    .classList.add("hidden");
}

/* =========================================================
   MAPAS - PIN TIPO VIÑETA + UBICACIÓN APROXIMADA HISTÓRICA
========================================================= */

