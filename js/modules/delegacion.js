/* PUMI 2026 - módulo delegacion. Extraído sin cambiar lógica. */

function renderActivityForm(editingRow = null) {
  state.editingObjectId = editingRow
    ? getObjectId(editingRow)
    : null;

  state.selectedPoint = null;

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">Delegación</span>

          <h2>
            ${
              editingRow
                ? "Editar actividad"
                : "Registrar actividad"
            }
          </h2>
        </div>
      </div>

      <form
        id="activity-form"
        class="module-form"
        novalidate
      >
        <div class="form-grid">
          <label class="form-grid-full">
            Tipo de registro
            <select id="activity-record-type">
              <option value="PLANIFICADA">Actividad planificada</option>
              <option value="ADICIONAL_NO_PROGRAMADA">Actividad adicional no programada</option>
            </select>
            <small>La actividad adicional se contabiliza por separado y no modifica la meta ni el avance planificado.</small>
          </label>

          <label>
            Programa
            <select
              id="activity-program"
              required
            ></select>
          </label>

          <label>
            Actividad
            <select
              id="activity-name"
              required
            ></select>
          </label>
        </div>

        <div
          id="activity-progress-card"
          class="progress-info-card"
        ></div>

        <section id="vifa-planning-details" class="vifa-planning-details hidden"></section>

        <div class="form-grid">
          <label>
            Fecha de actividad
            <input
              id="activity-date"
              type="date"
              required
            >
          </label>

          <label>
            Hora
            <input
              id="activity-time"
              type="time"
            >
          </label>

          <label>
            Avance realizado
            <input
              id="activity-advance"
              type="number"
              min="1"
              step="1"
              required
            >
          </label>

          <label>
            Responsable
            <input
              id="activity-responsible"
              type="text"
              required
            >
          </label>

          <label id="vifa-form-name-wrap" class="hidden">
            Formulario
            <input id="activity-vifa-form-name" type="text">
          </label>

          <label id="vifa-form-date-wrap" class="hidden">
            Fecha del formulario
            <input id="activity-vifa-form-date" type="date">
          </label>

          <label id="vifa-form-number-wrap" class="hidden">
            Número consecutivo del formulario
            <input id="activity-vifa-form-number" type="text">
          </label>

          <label id="vifa-quarter-wrap" class="hidden">
            Trimestre de ejecución
            <select id="activity-vifa-quarter">
              <option value="">Seleccione un trimestre</option>
              <option value="T3">T3</option>
              <option value="T4">T4</option>
            </select>
          </label>
        </div>

        <div class="form-section-title">
          Participantes
        </div>

        <div class="participant-summary-card">
          <div>
            <span>Participantes totales</span>
            <strong id="activity-total-participants">0</strong>
          </div>

          <p>
            El total se calcula automáticamente con hombres y mujeres.
            Los rangos de edad deben sumar el mismo total.
          </p>
        </div>

        <div class="form-grid">
          <label>
            Hombres
            <input
              id="activity-men"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Mujeres
            <input
              id="activity-women"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Personas menores de 10 años
            <input
              id="activity-age-under-10"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Edad 10-18
            <input
              id="activity-age-10-18"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Edad 19-30
            <input
              id="activity-age-19-30"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Edad 31-45
            <input
              id="activity-age-31-45"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Edad 46 o más
            <input
              id="activity-age-46"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Personas con discapacidad
            <input
              id="activity-disability"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>

          <label>
            Personas indígenas participantes
            <input
              id="activity-indigenous"
              type="number"
              min="0"
              step="1"
              value="0"
              required
            >
          </label>
        </div>

        <div class="form-section-title">
          Ubicación
        </div>

        <div class="form-grid">
          <label>
            Provincia
            <select
              id="activity-province"
              required
            ></select>
          </label>

          <label>
            Cantón
            <select
              id="activity-canton"
              required
              disabled
            ></select>
          </label>

          <label>
            Distrito
            <select
              id="activity-district"
              required
              disabled
            ></select>
          </label>

          <label>
            Tipo de lugar
            <select
              id="activity-place-type"
              required
            ></select>
          </label>

          <label
            id="activity-other-place-wrap"
            class="hidden"
          >
            Especifique otro tipo de lugar
            <input
              id="activity-other-place"
              type="text"
            >
          </label>

          <label id="activity-school-wrap">
            Centro educativo
            <select id="activity-school" disabled></select>
          </label>
        </div>

        <div class="map-toolbar">
          <button
            id="btn-use-gps"
            type="button"
            class="btn btn-secondary"
          >
            📍 Usar mi GPS
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="streets-navigation-vector"
          >
            Calles
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="satellite"
          >
            Satélite
          </button>

          <button
            type="button"
            class="btn btn-map"
            data-basemap="topo-vector"
          >
            Topográfico
          </button>
        </div>

        <div
          id="activity-map"
          class="form-map"
        ></div>

        <div
          id="coordinates-info"
          class="coordinates-info"
        >
          Marque un punto en el mapa o utilice GPS.
        </div>

        <div class="form-section-title">
          Información complementaria
        </div>

        <div class="form-grid">
          <div class="form-grid-full institution-picker">
            <label>
              Institución participante
              <div class="institution-picker-row">
                <select
                  id="activity-institution-select"
                ></select>

                <button
                  id="btn-add-institution"
                  type="button"
                  class="btn btn-secondary"
                >
                  Agregar
                </button>
              </div>
            </label>

            <div
              id="selected-institutions"
              class="selected-institutions"
            ></div>
          </div>

          <label
            id="activity-other-institution-wrap"
            class="hidden form-grid-full"
          >
            Especifique otra institución
            <div class="institution-picker-row">
              <input
                id="activity-other-institution"
                type="text"
              >

              <button
                id="btn-add-other-institution"
                type="button"
                class="btn btn-secondary"
              >
                Agregar otra institución
              </button>
            </div>
          </label>

          <label>
            Tipo de documento de respaldo
            <select id="activity-follow-up-type" required>
              <option value="">Seleccione una opción</option>
              <option value="ACCIÓN OPERATIVA">Acción operativa</option>
              <option value="ORDEN DE OPERACIÓN">Orden de operación</option>
              <option value="ACTA DE FINALIZACIÓN">Acta de finalización</option>
              <option value="OFICIO DE DELEGACIÓN">Oficio de delegación</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <label id="activity-follow-up-other-wrap" class="hidden">
            Especifique otro documento
            <input id="activity-follow-up-other" type="text">
          </label>

          <label>
            Número o referencia del documento
            <input id="activity-follow-up-number" type="text" required>
          </label>
        </div>

        <label>
          Observaciones
          <textarea
            id="activity-observations"
            rows="4"
          ></textarea>
        </label>

        <div
          id="activity-form-errors"
          class="form-error-summary hidden"
          role="alert"
        ></div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
          >
            ${
              editingRow
                ? "Guardar cambios"
                : "Guardar borrador"
            }
          </button>
        </div>
      </form>
    </article>
  `;

  setupActivityForm(editingRow);
}


function getRegistrationVifQuarter(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month <= 3) return "T1";
  if (month <= 6) return "T2";
  if (month <= 9) return "T3";
  return "T4";
}

function getOptionReviewBreakdown(option) {
  const result = {
    additionalReview: 0,
    additionalValidated: 0,
    plannedReview: numberValue(option?.avance_en_revision),
    plannedValidated: numberValue(option?.avance_validado),
    available: numberValue(option?.disponible_registro)
  };

  if (!option) return result;

  const sameRows = (state.actividades || [])
    .map((feature) => feature?.attributes || feature || {})
    .filter((row) =>
      normalize(row.programa) === normalize(option.programa) &&
      normalize(row.actividad) === normalize(option.actividad)
    );

  for (const row of sameRows) {
    if (!isAdditionalActivityRow(row)) continue;

    const flow = normalize(row.estado_flujo);
    const amount = Math.max(
      numberValue(row.avance_realizado),
      numberValue(row.avance)
    );

    if (flow === "PENDIENTE_REGIONAL" || flow === "PENDIENTE_NACIONAL") {
      result.additionalReview += amount;
    }

    if (flow === "VALIDADO_NACIONAL") {
      result.additionalValidated += amount;
    }
  }

  // La API histórica puede traer el avance adicional mezclado dentro de los
  // totales de planificación. En el formulario lo separamos para que una
  // actividad adicional nunca reduzca el disponible de la actividad planificada.
  result.plannedReview = Math.max(
    numberValue(option.avance_en_revision) - result.additionalReview,
    0
  );

  result.plannedValidated = Math.max(
    numberValue(option.avance_validado) - result.additionalValidated,
    0
  );

  result.available = Math.max(
    numberValue(option.meta) - result.plannedValidated - result.plannedReview,
    0
  );

  return result;
}

function setupActivityForm(editingRow) {
  const programSelect =
    $("activity-program");

  const activitySelect =
    $("activity-name");

  const followUpTypeSelect = $("activity-follow-up-type");
  const followUpOtherWrap = $("activity-follow-up-other-wrap");
  const followUpOtherInput = $("activity-follow-up-other");

  function updateFollowUpOtherField() {
    const isOther = normalize(followUpTypeSelect?.value) === "OTRO";
    followUpOtherWrap?.classList.toggle("hidden", !isOther);
    if (followUpOtherInput) {
      followUpOtherInput.required = isOther;
      if (!isOther) followUpOtherInput.value = "";
    }
  }

  followUpTypeSelect?.addEventListener("change", updateFollowUpOtherField);

  const recordTypeSelect = $("activity-record-type");
  const isAdditionalMode = () => recordTypeSelect?.value === "ADICIONAL_NO_PROGRAMADA";

  const validOptions = state.activityOptions.filter((item) =>
    isRegistrableActivityOption(item) || isSelectableActivityOption(item)
  );

  const programs = [
    ...new Set(
      validOptions
        .map((item) => item.programa)
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  fillSelect(
    programSelect,
    programs,
    false,
    "Seleccione un programa"
  );

  function updateActivities() {
    const program =
      programSelect.value;

    const currentVifQuarter = getRegistrationVifQuarter();

    const options = validOptions.filter((item) => {
      if (normalize(item.programa) !== normalize(program)) {
        return false;
      }

      if (!isAdditionalMode() && !isSelectableActivityOption(item)) {
        return false;
      }

      // VIF se registra únicamente contra las actividades programadas para
      // el trimestre en curso. Esto mantiene el formulario alineado con el
      // panel principal de la Delegación.
      if (normalize(program) === "VIF") {
        const optionQuarter = normalize(
          item.trimestre_programado || item.trimestre_programado_vifa || ""
        );
        return optionQuarter === currentVifQuarter;
      }

      return true;
    });

    fillSelect(
      activitySelect,
      options.map(
        (item) => item.actividad
      ),
      false,
      "Seleccione una actividad"
    );

    updateProgressCard();
  }

  function updateProgressCard() {
    const option = getSelectedActivityOption();
    const card = $("activity-progress-card");
    const planning = $("vifa-planning-details");
    const isVifa = isVifaOption(option);
    const additional = isAdditionalMode();
    const quarterly = Boolean(option?.es_control_trimestral) && !additional;

    [
      "vifa-form-name-wrap",
      "vifa-form-date-wrap",
      "vifa-form-number-wrap"
    ].forEach((id) => $(id)?.classList.toggle("hidden", !(isVifa || additional)));

    $("vifa-quarter-wrap")?.classList.toggle("hidden", !quarterly);

    [
      "activity-vifa-form-name",
      "activity-vifa-form-date",
      "activity-vifa-form-number"
    ].forEach((id) => {
      if ($(id)) $(id).required = false;
    });

    if ($("activity-vifa-quarter")) {
      $("activity-vifa-quarter").required = false;
    }

    if (!option) {
      card.innerHTML = "";
      planning?.classList.add("hidden");
      if (planning) planning.innerHTML = "";
      $("activity-advance").removeAttribute("max");
      $("activity-advance").disabled = false;
      return;
    }

    if (additional) {
      card.innerHTML = `
        <div><span>Tipo</span><strong>Adicional no programada</strong></div>
        <div><span>Planificación</span><strong>No afecta metas</strong></div>
        <div><span>Validación</span><strong>Regional y nacional</strong></div>
      `;
      $("activity-advance").removeAttribute("max");
      $("activity-advance").disabled = false;
      if (!$("activity-advance").value) $("activity-advance").value = 1;
    } else if (quarterly) {
      const quarterCards = [1, 2, 3, 4].map((number) => {
        const fulfilled = numberValue(option[`cumplimiento_t${number}`]) > 0;
        const reviewing = numberValue(option[`en_revision_t${number}`]) > 0;
        const label = fulfilled ? "Cumplido" : reviewing ? "En revisión" : "Pendiente";
        return `<div><span>T${number}</span><strong>${label}</strong></div>`;
      }).join("");
      card.innerHTML = quarterCards;
      $("activity-advance").value = 1;
      $("activity-advance").disabled = true;
    } else {
      const breakdown = getOptionReviewBreakdown(option);

      card.innerHTML = `
        <div><span>${isVifa ? "Línea base" : "Meta"}</span><strong>${formatNumber(option.meta)}</strong></div>
        <div><span>Avance validado</span><strong>${formatNumber(breakdown.plannedValidated)}</strong></div>
        <div><span>En revisión planificada</span><strong>${formatNumber(breakdown.plannedReview)}</strong></div>
        <div><span>En revisión adicional</span><strong>${formatNumber(breakdown.additionalReview)}</strong></div>
        <div><span>Disponible</span><strong>${formatNumber(breakdown.available)}</strong></div>
      `;
      $("activity-advance").max = breakdown.available;
      if (breakdown.available <= 0 && !state.editingObjectId) {
        $("activity-advance").value = "";
        $("activity-advance").disabled = true;
      } else {
        $("activity-advance").disabled = false;
      }
    }

    if (isVifa && planning) {
      planning.classList.remove("hidden");
      planning.innerHTML = `
        <div><span>Código</span><strong>${escapeHtml(option.codigo_actividad || "")}</strong></div>
        <div><span>Mes programado</span><strong>${escapeHtml(option.mes_programado || "Trimestral")}</strong></div>
        <div><span>Trimestre</span><strong>${escapeHtml(option.trimestre_programado || "")}</strong></div>
        <div><span>Eje</span><strong>${escapeHtml(option.eje || "")}</strong></div>
        <div><span>Población objetivo</span><strong>${escapeHtml(option.poblacion_objetivo || "")}</strong></div>
        <div><span>Unidad de medida</span><strong>${escapeHtml(option.unidad_medida || "")}</strong></div>
        ${option.periodo_cerrado ? `
          <div class="vifa-period-closed">
            <span>Estado del periodo</span>
            <strong>Solo consulta</strong>
          </div>
        ` : ""}
      `;
    } else {
      planning?.classList.add("hidden");
      if (planning) planning.innerHTML = "";
    }
  }

  recordTypeSelect?.addEventListener("change", () => {
    updateActivities();
    updateProgressCard();
  });

  programSelect.addEventListener(
    "change",
    updateActivities
  );

  activitySelect.addEventListener(
    "change",
    updateProgressCard
  );

  updateFollowUpOtherField();

  setupParticipantValidation();
  setupLocationSelectors();
  setupPlaceTypeSelector();
  setupInstitutionSelector();
  setupFormMap();

  $("btn-use-gps").addEventListener(
    "click",
    useGps
  );

  document
    .querySelectorAll("[data-basemap]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          if (state.formMapView) {
            state.formMapView.map.basemap =
              button.dataset.basemap;
          }
        }
      );
    });

  if (editingRow) {
    fillActivityForm(editingRow);
  } else {
    updateActivities();
  }

  $("activity-form").addEventListener(
    "submit",
    submitActivity
  );
}

function getSelectedActivityOption() {
  return state.activityOptions.find(
    (item) =>
      normalize(item.programa) ===
        normalize(
          $("activity-program")?.value
        ) &&
      normalize(item.actividad) ===
        normalize(
          $("activity-name")?.value
        )
  );
}

function setupParticipantValidation() {
  const ids = [
    "activity-men",
    "activity-women",
    "activity-age-under-10",
    "activity-age-10-18",
    "activity-age-19-30",
    "activity-age-31-45",
    "activity-age-46",
    "activity-disability",
    "activity-indigenous"
  ];

  ids.forEach((id) => {
    $(id)?.addEventListener(
      "input",
      updateParticipantTotal
    );
  });

  updateParticipantTotal();
}

function updateParticipantTotal() {
  const total =
    numberValue(
      $("activity-men")?.value
    ) +
    numberValue(
      $("activity-women")?.value
    );

  if ($("activity-total-participants")) {
    $("activity-total-participants").textContent =
      formatNumber(total);
  }
}

function setupLocationSelectors() {
  const rows =
    getLocationCatalogRows();

  const provinceSelect =
    $("activity-province");

  const cantonSelect =
    $("activity-canton");

  const districtSelect =
    $("activity-district");

  const provinces = [
    ...new Set(
      rows.map(
        (row) => row.provincia
      )
    )
  ];

  fillSelect(
    provinceSelect,
    provinces,
    false,
    "Seleccione una provincia"
  );

  fillSelect(
    cantonSelect,
    [],
    false,
    "Seleccione un cantón"
  );

  fillSelect(
    districtSelect,
    [],
    false,
    "Seleccione un distrito"
  );

  cantonSelect.disabled = true;
  districtSelect.disabled = true;

  provinceSelect.addEventListener(
    "change",
    () => {
      const province =
        provinceSelect.value;

      const cantons = [
        ...new Set(
          rows
            .filter(
              (row) =>
                normalize(row.provincia) ===
                normalize(province)
            )
            .map(
              (row) => row.canton
            )
        )
      ];

      fillSelect(
        cantonSelect,
        cantons,
        false,
        "Seleccione un cantón"
      );

      fillSelect(
        districtSelect,
        [],
        false,
        "Seleccione un distrito"
      );

      cantonSelect.disabled =
        cantons.length === 0;

      districtSelect.disabled = true;
    }
  );

  cantonSelect.addEventListener(
    "change",
    () => {
      const province =
        provinceSelect.value;

      const canton =
        cantonSelect.value;

      const districts = [
        ...new Set(
          rows
            .filter(
              (row) =>
                normalize(row.provincia) ===
                  normalize(province) &&
                normalize(row.canton) ===
                  normalize(canton)
            )
            .map(
              (row) => row.distrito
            )
        )
      ];

      fillSelect(
        districtSelect,
        districts,
        false,
        "Seleccione un distrito"
      );

      districtSelect.disabled =
        districts.length === 0;

      fillSelect(
        $("activity-school"),
        [],
        false,
        "Seleccione primero un distrito"
      );

      $("activity-school").disabled = true;
    }
  );

  districtSelect.addEventListener(
    "change",
    () => {
      const centers = getEducationalCenterOptions(
        provinceSelect.value,
        cantonSelect.value,
        districtSelect.value
      );

      fillSelect(
        $("activity-school"),
        centers,
        false,
        centers.length
          ? "Seleccione un centro educativo"
          : "No hay centros registrados"
      );

      $("activity-school").disabled =
        centers.length === 0;
    }
  );
}

function setupPlaceTypeSelector() {
  const select =
    $("activity-place-type");

  fillSelect(
    $("activity-school"),
    [],
    false,
    "Seleccione primero un distrito"
  );

  $("activity-school").disabled = true;

  fillSelect(
    select,
    getPlaceTypeOptions(),
    false,
    "Seleccione un tipo de lugar"
  );

  select.addEventListener(
    "change",
    () => {
      updateOtherPlaceVisibility();
      updateSchoolFieldVisibility();
    }
  );

  updateOtherPlaceVisibility();
  updateSchoolFieldVisibility();
}

function updateOtherPlaceVisibility() {
  const isOther =
    normalize(
      $("activity-place-type")?.value
    ) === "OTRO";

  $("activity-other-place-wrap")
    ?.classList.toggle(
      "hidden",
      !isOther
    );

  if ($("activity-other-place")) {
    $("activity-other-place").required =
      isOther;

    if (!isOther) {
      $("activity-other-place").value = "";
    }
  }
}


function updateSchoolFieldVisibility() {
  const placeType = normalize($("activity-place-type")?.value);
  const educationalPlaceTypes = [
    "CENTRO EDUCATIVO", "ESCUELA", "COLEGIO", "UNIVERSIDAD", "INSTITUCION EDUCATIVA"
  ];
  const enabled = educationalPlaceTypes.some((type) => placeType.includes(normalize(type)));
  const school = $("activity-school");
  if (!school) return;
  school.disabled = !enabled;
  school.required = enabled;
  if (!enabled) school.value = "";
}

function setupInstitutionSelector() {
  const select =
    $("activity-institution-select");

  state.selectedInstitutions = [];

  fillSelect(
    select,
    getInstitutionOptions(),
    false,
    "Seleccione una institución"
  );

  $("btn-add-institution")?.addEventListener(
    "click",
    () => {
      const value =
        select?.value || "";

      if (!value) {
        showToast(
          "Seleccione una institución antes de agregarla.",
          true
        );
        return;
      }

      const normalizedValue =
        normalize(value);

      const isOther =
        ["OTRA", "OTRO"].includes(
          normalizedValue
        );

      if (isOther) {
        $("activity-other-institution-wrap")
          ?.classList.remove("hidden");

        $("activity-other-institution")
          ?.focus();

        return;
      }

      addSelectedInstitution(value);
      select.value = "";
    }
  );

  $("btn-add-other-institution")
    ?.addEventListener(
      "click",
      () => {
        const input =
          $("activity-other-institution");

        const value =
          input?.value?.trim() || "";

        if (!value) {
          showToast(
            "Digite el nombre de la otra institución.",
            true
          );
          return;
        }

        addSelectedInstitution(value, true);

        input.value = "";

        $("activity-other-institution-wrap")
          ?.classList.add("hidden");

        if (select) {
          select.value = "";
        }
      }
    );

  renderSelectedInstitutions();
}

function addSelectedInstitution(
  value,
  isCustom = false
) {
  const cleanValue =
    String(value || "").trim();

  if (!cleanValue) {
    return;
  }

  const alreadyExists =
    state.selectedInstitutions.some(
      (item) =>
        normalize(item.value) ===
        normalize(cleanValue)
    );

  if (alreadyExists) {
    showToast(
      "Esa institución ya fue agregada.",
      true
    );
    return;
  }

  state.selectedInstitutions.push({
    value: cleanValue,
    isCustom
  });

  renderSelectedInstitutions();
}

function removeSelectedInstitution(index) {
  state.selectedInstitutions.splice(
    index,
    1
  );

  renderSelectedInstitutions();
}

function renderSelectedInstitutions() {
  const container =
    $("selected-institutions");

  if (!container) {
    return;
  }

  if (
    !state.selectedInstitutions.length
  ) {
    container.innerHTML = `
      <div class="institution-empty">
        No se han agregado instituciones.
      </div>
    `;
    return;
  }

  container.innerHTML =
    state.selectedInstitutions
      .map(
        (item, index) => `
          <span class="institution-chip">
            ${escapeHtml(item.value)}

            <button
              type="button"
              class="institution-chip-remove"
              data-remove-institution="${index}"
              aria-label="Eliminar ${escapeHtml(item.value)}"
            >
              ✕
            </button>
          </span>
        `
      )
      .join("");

  container
    .querySelectorAll(
      "[data-remove-institution]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          removeSelectedInstitution(
            Number(
              button.dataset.removeInstitution
            )
          );
        }
      );
    });
}

function getSelectedInstitutions() {
  return state.selectedInstitutions.map(
    (item) => item.value
  );
}

function getOtherInstitutionsText() {
  return state.selectedInstitutions
    .filter(
      (item) => item.isCustom
    )
    .map(
      (item) => item.value
    )
    .join("; ");
}

function fillActivityForm(row) {
  setSelectValue(
    $("activity-program"),
    row.programa
  );

  $("activity-program").dispatchEvent(
    new Event("change")
  );

  setSelectValue(
    $("activity-name"),
    row.actividad
  );

  $("activity-name").dispatchEvent(
    new Event("change")
  );

  $("activity-date").value =
    dateInputValue(row.fecha_actividad);

  $("activity-time").value =
    row.hora_actividad || "";

  $("activity-advance").disabled = false;
  $("activity-advance").value =
    row.avance_realizado || 0;

  $("activity-responsible").value =
    row.responsable || "";

  $("activity-men").value =
    row.cantidad_hombres || 0;

  $("activity-women").value =
    row.cantidad_mujeres || 0;

  $("activity-age-under-10").value =
    row.cantidad_menores_10 || 0;

  $("activity-age-10-18").value =
    row.edad_10_18 || 0;

  $("activity-age-19-30").value =
    row.edad_19_30 || 0;

  $("activity-age-31-45").value =
    row.edad_31_45 || 0;

  $("activity-age-46").value =
    row.edad_46_mas || 0;

  $("activity-disability").value =
    row.cantidad_discapacidad || 0;

  $("activity-indigenous").value =
    row.cantidad_indigenas || 0;

  updateParticipantTotal();

  setSelectValue(
    $("activity-province"),
    row.provincia
  );

  $("activity-province").dispatchEvent(
    new Event("change")
  );

  setSelectValue(
    $("activity-canton"),
    row.canton
  );

  $("activity-canton").dispatchEvent(
    new Event("change")
  );

  setSelectValue(
    $("activity-district"),
    row.distrito
  );

  setSelectValue(
    $("activity-place-type"),
    row.tipo_lugar
  );

  $("activity-place-type").dispatchEvent(
    new Event("change")
  );

  updateSchoolFieldVisibility();

  $("activity-other-place").value =
    row.otro_tipo_lugar || "";

  $("activity-school").value =
    row.centro_educativo || "";

  const institutions =
    String(
      row.instituciones || ""
    )
      .split(/[;,|]/)
      .map(
        (item) => item.trim()
      )
      .filter(Boolean);

  const otherInstitutions =
    String(
      row.otras_instituciones || ""
    )
      .split(/[;,|]/)
      .map(
        (item) => item.trim()
      )
      .filter(Boolean);

  const catalogInstitutions =
    getInstitutionOptions();

  state.selectedInstitutions = [];

  for (const value of institutions) {
    const isCustom =
      !catalogInstitutions.some(
        (catalogValue) =>
          normalize(catalogValue) ===
          normalize(value)
      );

    addSelectedInstitution(
      value,
      isCustom
    );
  }

  for (const value of otherInstitutions) {
    const alreadyExists =
      state.selectedInstitutions.some(
        (item) =>
          normalize(item.value) ===
          normalize(value)
      );

    if (!alreadyExists) {
      addSelectedInstitution(
        value,
        true
      );
    }
  }

  $("activity-other-institution").value =
    "";

  if ($("activity-record-type")) {
    $("activity-record-type").value = isAdditionalActivityRow(row)
      ? "ADICIONAL_NO_PROGRAMADA"
      : "PLANIFICADA";
  }

  const storedFollowUpType = getStoredFollowUpType(
    row.tipo_seguimiento || ""
  );
  const standardFollowUpTypes = [
    "ACCIÓN OPERATIVA",
    "ORDEN DE OPERACIÓN",
    "ACTA DE FINALIZACIÓN",
    "OFICIO DE DELEGACIÓN"
  ];

  if (
    storedFollowUpType &&
    !standardFollowUpTypes.some(
      (value) => normalize(value) === normalize(storedFollowUpType)
    )
  ) {
    setSelectValue($("activity-follow-up-type"), "OTRO");
    $("activity-follow-up-other").value = storedFollowUpType;
  } else {
    setSelectValue($("activity-follow-up-type"), storedFollowUpType);
    $("activity-follow-up-other").value = "";
  }

  $("activity-follow-up-type").dispatchEvent(new Event("change"));

  $("activity-follow-up-number").value =
    row.numero_consecutivo ||
    row.numero_seguimiento ||
    row.numero_referencia ||
    row.numero_expediente ||
    "";

  $("activity-vifa-form-name").value = row.formulario_vifa || "";
  $("activity-vifa-form-date").value = dateInputValue(row.fecha_formulario_vifa);
  $("activity-vifa-form-number").value = row.numero_formulario_vifa || "";
  setSelectValue($("activity-vifa-quarter"), row.trimestre_ejecucion_vifa || "");

  $("activity-observations").value =
    row.observaciones || "";

  const latitude =
    numberOrNull(row.latitud);

  const longitude =
    numberOrNull(row.longitud);

  if (
    latitude !== null &&
    longitude !== null
  ) {
    setSelectedPoint(
      longitude,
      latitude
    );

    state.formMapView
      ?.goTo({
        center: [
          longitude,
          latitude
        ],
        zoom: 16
      })
      .catch(() => {});
  }
}

async function submitActivity(event) {
  event.preventDefault();

  const errors = [];

  try {
    clearActivityFormErrors();

    const selectedOption =
      getSelectedActivityOption();

    if (!selectedOption) {
      errors.push(
        "Debe seleccionar una actividad válida."
      );
    }

    const quantity =
      numberValue(
        $("activity-advance").value
      );

    const isAdditional = $("activity-record-type")?.value === "ADICIONAL_NO_PROGRAMADA";
    const isQuarterlyVifa = Boolean(selectedOption?.es_control_trimestral) && !isAdditional;

    if (!isAdditional && !isQuarterlyVifa && quantity <= 0) {
      errors.push("El avance realizado debe ser mayor a cero.");
    }

    const plannedAvailability = selectedOption
      ? getOptionReviewBreakdown(selectedOption).available
      : 0;

    if (
      selectedOption &&
      !isAdditional &&
      !isQuarterlyVifa &&
      !state.editingObjectId &&
      quantity > plannedAvailability
    ) {
      errors.push(
        `Solo puede registrar ${plannedAvailability} como máximo para esta actividad.`
      );
    }

    const men =
      numberValue(
        $("activity-men").value
      );

    const women =
      numberValue(
        $("activity-women").value
      );

    const participants =
      men + women;

    const ageUnder10 =
      numberValue(
        $("activity-age-under-10").value
      );

    const age10To18 =
      numberValue(
        $("activity-age-10-18").value
      );

    const age19To30 =
      numberValue(
        $("activity-age-19-30").value
      );

    const age31To45 =
      numberValue(
        $("activity-age-31-45").value
      );

    const age46Plus =
      numberValue(
        $("activity-age-46").value
      );

    const totalAges =
      ageUnder10 +
      age10To18 +
      age19To30 +
      age31To45 +
      age46Plus;

    const disability =
      numberValue(
        $("activity-disability").value
      );

    const indigenous =
      numberValue(
        $("activity-indigenous").value
      );

    const hasParticipantData = participants > 0 || totalAges > 0 || disability > 0 || indigenous > 0;
    if (hasParticipantData && totalAges !== participants) {
      errors.push(`Los rangos de edad suman ${totalAges}, pero hombres y mujeres suman ${participants}.`);
    }
    if (disability > participants && participants > 0) {
      errors.push("Las personas con discapacidad no pueden superar el total de participantes.");
    }
    if (indigenous > participants && participants > 0) {
      errors.push("Las personas indígenas participantes no pueden superar el total de participantes.");
    }

    const province = $("activity-province").value;
    const canton = $("activity-canton").value;
    const district = $("activity-district").value;
    const placeType = $("activity-place-type").value;
    const otherPlace = $("activity-other-place").value.trim();
    const institutions = getSelectedInstitutions();
    const otherInstitution = getOtherInstitutionsText();
    const selectedFollowUpType = $("activity-follow-up-type").value;
    const customFollowUpType = $("activity-follow-up-other").value.trim();
    const followUpType = normalize(selectedFollowUpType) === "OTRO"
      ? customFollowUpType
      : selectedFollowUpType;
    const followUpNumber = $("activity-follow-up-number").value.trim();

    if (normalize(selectedFollowUpType) === "OTRO" && !customFollowUpType) {
      errors.push("Debe especificar el otro tipo de documento de respaldo.");
    }

    const isVifa = isVifaOption(selectedOption);
    const vifaFormName = $("activity-vifa-form-name").value.trim();
    const vifaFormDate = $("activity-vifa-form-date").value;
    const vifaFormNumber = $("activity-vifa-form-number").value.trim();
    const vifaQuarter = $("activity-vifa-quarter").value;

    if (isVifa && isQuarterlyVifa && !vifaQuarter) {
      errors.push("Debe seleccionar el trimestre de ejecución VIF.");
    }

    if (errors.length) {
      showActivityFormErrors(errors);
      throw new Error(
        "Revise los datos indicados antes de continuar."
      );
    }

    const attributes = {
      programa:
        $("activity-program").value,

      actividad:
        $("activity-name").value,

      fecha_actividad: $("activity-date").value
        ? new Date(`${$("activity-date").value}T12:00:00`).getTime()
        : null,

      hora_actividad:
        $("activity-time").value,

      avance_realizado:
        isQuarterlyVifa ? 1 : (isAdditional ? Math.max(quantity, 1) : quantity),

      responsable:
        $("activity-responsible")
          .value
          .trim(),

      cantidad_hombres:
        men,

      cantidad_mujeres:
        women,

      cantidad_participantes:
        participants,

      cantidad_menores_10:
        ageUnder10,

      edad_10_18:
        age10To18,

      edad_19_30:
        age19To30,

      edad_31_45:
        age31To45,

      edad_46_mas:
        age46Plus,

      cantidad_discapacidad:
        disability,

      cantidad_indigenas:
        indigenous,

      provincia:
        province,

      canton:
        canton,

      distrito:
        district,

      tipo_lugar:
        placeType,

      otro_tipo_lugar:
        normalize(placeType) ===
        "OTRO"
          ? otherPlace
          : "",

      centro_educativo:
        $("activity-school")
          .value
          .trim(),

      instituciones:
        institutions.join("; "),

      otras_instituciones:
        otherInstitution,

      tipo_seguimiento: isAdditional
        ? `ADICIONAL_NO_PROGRAMADA|${followUpType || ""}`
        : followUpType,

      numero_consecutivo:
        followUpNumber,

      numero_seguimiento:
        `${followUpType}: ${followUpNumber}`,

      id_planificacion_vifa:
        isVifa ? selectedOption.id_planificacion : "",

      codigo_actividad_vifa:
        isVifa ? selectedOption.codigo_actividad : "",

      eje_vifa:
        isVifa ? selectedOption.eje : "",

      plan_asociado_vifa:
        isVifa ? selectedOption.plan_asociado : "",

      poblacion_objetivo_vifa:
        isVifa ? selectedOption.poblacion_objetivo : "",

      mes_programado_vifa:
        isVifa ? selectedOption.mes_programado : "",

      trimestre_programado_vifa:
        isVifa ? selectedOption.trimestre_programado : "",

      tipo_medicion_vifa:
        isVifa ? selectedOption.tipo_medicion : "",

      linea_base_vifa:
        isVifa ? numberValue(selectedOption.linea_base) : 0,

      trimestre_ejecucion_vifa:
        isQuarterlyVifa ? vifaQuarter : "",

      formulario_vifa:
        (isVifa || isAdditional) ? vifaFormName : "",

      fecha_formulario_vifa:
        (isVifa || isAdditional) && vifaFormDate ? new Date(`${vifaFormDate}T12:00:00`).getTime() : null,

      numero_formulario_vifa:
        (isVifa || isAdditional) ? vifaFormNumber : "",

      observaciones:
        $("activity-observations")
          .value
          .trim(),

      latitud: state.selectedPoint?.latitude ?? null,

      longitud: state.selectedPoint?.longitude ?? null
    };

    if (state.editingObjectId) {
      await api.updateActivity(
        state.editingObjectId,
        attributes
      );

      showToast(
        "Actividad actualizada."
      );
    } else {
      await api.createActivity(
        attributes,
        state.selectedPoint
          ? {
              x: state.selectedPoint.longitude,
              y: state.selectedPoint.latitude,
              spatialReference: { wkid: 4326 }
            }
          : null
      );

      showToast(
        "Actividad guardada como borrador."
      );
    }

    state.editingObjectId = null;
    state.selectedPoint = null;

    await loadData();
    renderMyRecords();
  } catch (error) {
    showToast(error.message, true);
  }
}

function clearActivityFormErrors() {
  const container =
    $("activity-form-errors");

  if (!container) {
    return;
  }

  container.innerHTML = "";
  container.classList.add(
    "hidden"
  );
}

function showActivityFormErrors(errors) {
  const container =
    $("activity-form-errors");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <strong>
      Corrija lo siguiente:
    </strong>

    <ul>
      ${errors
        .map(
          (error) => `
            <li>
              ${escapeHtml(error)}
            </li>
          `
        )
        .join("")}
    </ul>
  `;

  container.classList.remove(
    "hidden"
  );

  container.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

/* =========================================================
   MAPA FORMULARIO
========================================================= */

function setupFormMap() {
  if (state.formMapView) {
    state.formMapView.destroy();
    state.formMapView = null;
  }

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/layers/GraphicsLayer"
    ],
    (
      Map,
      MapView,
      Graphic,
      GraphicsLayer
    ) => {
      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      const graphics =
        new GraphicsLayer();

      map.add(graphics);

      const view = new MapView({
        container: "activity-map",
        map,
        center: [-84.1, 9.95],
        zoom: 8
      });

      state.formMapView = view;
      state.formMapGraphics = graphics;
      state.formMapGraphicClass = Graphic;

      view.on("click", (event) => {
        const longitude =
          numberOrNull(
            event.mapPoint?.longitude
          );

        const latitude =
          numberOrNull(
            event.mapPoint?.latitude
          );

        if (
          longitude === null ||
          latitude === null
        ) {
          return;
        }

        setSelectedPoint(
          longitude,
          latitude
        );
      });
    }
  );
}

function setSelectedPoint(
  longitude,
  latitude
) {
  const validLongitude =
    numberOrNull(longitude);

  const validLatitude =
    numberOrNull(latitude);

  if (
    validLongitude === null ||
    validLatitude === null
  ) {
    return;
  }

  state.selectedPoint = {
    longitude: validLongitude,
    latitude: validLatitude
  };

  const graphics =
    state.formMapGraphics;

  const Graphic =
    state.formMapGraphicClass;

  if (
    graphics &&
    Graphic
  ) {
    graphics.removeAll();

    graphics.add(
      new Graphic({
        geometry: {
          type: "point",
          longitude: validLongitude,
          latitude: validLatitude,
          spatialReference: {
            wkid: 4326
          }
        },

        symbol: {
          type: "picture-marker",
          url: createMarkerSvg("#0b3b8f"),
          width: "36px",
          height: "46px",
          yoffset: "14px"
        }
      })
    );
  }

  if ($("coordinates-info")) {
    $("coordinates-info").textContent =
      `Latitud: ${validLatitude.toFixed(6)} · Longitud: ${validLongitude.toFixed(6)}`;
  }
}

function useGps() {
  if (!navigator.geolocation) {
    showToast(
      "El dispositivo no permite GPS.",
      true
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const longitude =
        position.coords.longitude;

      const latitude =
        position.coords.latitude;

      setSelectedPoint(
        longitude,
        latitude
      );

      state.formMapView
        ?.goTo({
          center: [
            longitude,
            latitude
          ],
          zoom: 16
        })
        .catch(() => {});
    },

    (error) => {
      showToast(
        `No fue posible obtener GPS: ${error.message}`,
        true
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 15000
    }
  );
}

/* =========================================================
   MIS REGISTROS
========================================================= */

function renderMyRecords() {
  const rows = getRows().filter(
    (row) =>
      !isHistorical(row) &&
      normalize(row.estado_registro) !== "ELIMINADO" &&
      (
        !isDelegationRole() ||
        sameDelegation(row.delegacion, state.user?.delegation)
      )
  );

  function getRecordPermissions(row) {
    const flow = normalize(
      row.estado_flujo
    );

    return {
      canEdit: [
        "BORRADOR",
        "DEVUELTO_REGIONAL"
      ].includes(flow),

      canDelete: [
        "BORRADOR",
        "DEVUELTO_REGIONAL",
        "NO_VALIDADO_NACIONAL"
      ].includes(flow),

      canConfirm: [
        "BORRADOR",
        "DEVUELTO_REGIONAL"
      ].includes(flow)
    };
  }

  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Delegación
          </span>

          <h2>Mis registros</h2>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Programa</th>
              <th>Actividad</th>
              <th>Avance</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            ${rows.length
              ? rows
                  .map((row) => {
                    const permissions =
                      getRecordPermissions(row);

                    return `
                      <tr>
                        <td>
                          ${formatDate(row.fecha_actividad)}
                        </td>

                        <td>
                          ${escapeHtml(row.programa)}
                        </td>

                        <td>
                          ${escapeHtml(row.actividad)}
                        </td>

                        <td>
                          ${formatNumber(row.avance_realizado)}
                        </td>

                        <td>
                          <span class="status-badge status-${normalize(row.estado_flujo).toLowerCase()}">
                            ${escapeHtml(workflowLabel(row))}
                          </span>
                        </td>

                        <td>
                          <div class="table-actions">
                            <button
                              class="btn btn-secondary btn-small"
                              data-view-record="${getObjectId(row)}"
                            >
                              Ver
                            </button>

                            ${permissions.canEdit
                              ? `
                                  <button
                                    class="btn btn-secondary btn-small"
                                    data-edit-record="${getObjectId(row)}"
                                  >
                                    Editar
                                  </button>
                                `
                              : ""}

                            ${permissions.canDelete
                              ? `
                                  <button
                                    class="btn btn-danger btn-small"
                                    data-delete-record="${getObjectId(row)}"
                                  >
                                    Eliminar
                                  </button>
                                `
                              : ""}

                            ${permissions.canConfirm
                              ? `
                                  <button
                                    class="btn btn-confirm btn-small"
                                    data-confirm-record="${getObjectId(row)}"
                                  >
                                    📤 Confirmar envío
                                  </button>
                                `
                              : ""}
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")
              : `
                  <tr>
                    <td colspan="6">
                      <div class="module-empty">
                        No hay registros disponibles.
                      </div>
                    </td>
                  </tr>
                `}
          </tbody>
        </table>
      </div>
    </article>
  `;

  document
    .querySelectorAll("[data-view-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const objectId = Number(
            button.dataset.viewRecord
          );

          const row = rows.find(
            (item) =>
              getObjectId(item) === objectId
          );

          if (row) {
            openActivityDetail(row);
          }
        }
      );
    });

  document
    .querySelectorAll("[data-edit-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const objectId = Number(
            button.dataset.editRecord
          );

          const row = rows.find(
            (item) =>
              getObjectId(item) === objectId
          );

          if (row) {
            renderActivityForm(row);
          }
        }
      );
    });

  document
    .querySelectorAll("[data-confirm-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const objectId = Number(
            button.dataset.confirmRecord
          );

          const confirmed =
            window.confirm(
              "¿Confirma el envío de esta actividad?\n\nUna vez enviada, ya no podrá editarla ni eliminarla mientras se encuentre en revisión regional."
            );

          if (!confirmed) {
            return;
          }

          button.disabled = true;

          try {
            await api.confirmActivitySubmission(
              objectId
            );

            await loadData();
            renderMyRecords();

            showToast(
              "Actividad enviada a revisión regional."
            );
          } catch (error) {
            button.disabled = false;
            showToast(
              error.message,
              true
            );
          }
        }
      );
    });

  document
    .querySelectorAll("[data-delete-record]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const objectId = Number(
            button.dataset.deleteRecord
          );

          if (
            !window.confirm(
              "¿Desea eliminar este registro?"
            )
          ) {
            return;
          }

          try {
            await api.deleteActivity(
              objectId
            );

            await loadData();
            renderMyRecords();

            showToast(
              "Registro eliminado."
            );
          } catch (error) {
            showToast(
              error.message,
              true
            );
          }
        }
      );
    });
}

function openActivityDetail(row) {
  $("coming-page").innerHTML = `
    <article class="panel-card">
      <div class="module-heading">
        <div>
          <span class="panel-kicker">
            Detalle del registro
          </span>

          <h2>
            ${escapeHtml(
              row.delegacion ||
              "Actividad"
            )}
          </h2>
        </div>

        <button
          id="btn-detail-back"
          class="btn btn-secondary"
          type="button"
        >
          ← Volver
        </button>
      </div>

      ${renderActivityDataSections(row)}
    </article>
  `;

  $("btn-detail-back").addEventListener(
    "click",
    renderMyRecords
  );
}

function isAdditionalActivity(row = {}) {
  const trackingType = normalize(row.tipo_seguimiento || "");
  const observations = normalize(row.observaciones || "");
  return trackingType.startsWith("ADICIONAL_NO_PROGRAMADA") || observations.includes("ADICIONAL_NO_PROGRAMADA");
}

function activityTypeLabel(row = {}) {
  return isAdditionalActivity(row)
    ? "Actividad adicional no programada"
    : "Actividad planificada";
}

function cleanActivityObservations(value) {
  const cleaned = String(value || "")
    .replace(/\[?ADICIONAL_NO_PROGRAMADA\]?\s*[|:-]?\s*/gi, "")
    .trim();
  return cleaned || "";
}

function renderActivityDataSections(row) {
  const cleanedObservations = cleanActivityObservations(row.observaciones);
  return `
    ${buildDetailSection(
      "Actividad",
      [
        ["Tipo de actividad", activityTypeLabel(row)],
        ["Programa", row.programa],
        ["Actividad", row.actividad],
        ["Fecha", formatDate(row.fecha_actividad)],
        ["Hora", row.hora_actividad],
        ["Avance realizado", formatNumber(row.avance_realizado)],
        ["Responsable", row.responsable]
      ]
    )}

    ${buildDetailSection(
      "Participantes",
      [
        ["Total", formatNumber(row.cantidad_participantes)],
        ["Hombres", formatNumber(row.cantidad_hombres)],
        ["Mujeres", formatNumber(row.cantidad_mujeres)],
        ["Menores de 10 años", formatNumber(row.cantidad_menores_10)],
        ["Edad 10-18", formatNumber(row.edad_10_18)],
        ["Edad 19-30", formatNumber(row.edad_19_30)],
        ["Edad 31-45", formatNumber(row.edad_31_45)],
        ["Edad 46 o más", formatNumber(row.edad_46_mas)],
        ["Personas con discapacidad", formatNumber(row.cantidad_discapacidad)],
        ["Personas indígenas participantes", formatNumber(row.cantidad_indigenas)]
      ]
    )}

    ${buildDetailSection(
      "Ubicación",
      [
        ["Provincia", row.provincia],
        ["Cantón", row.canton],
        ["Distrito", row.distrito],
        ["Tipo de lugar", row.tipo_lugar],
        ["Otro tipo de lugar", row.otro_tipo_lugar],
        ["Centro educativo", row.centro_educativo]
      ]
    )}

    ${buildDetailSection(
      "Información complementaria",
      [
        ["Instituciones", row.instituciones],
        ["Otras instituciones", row.otras_instituciones],
        ["Tipo de seguimiento", row.tipo_seguimiento],
        ["Número consecutivo", row.numero_consecutivo || row.numero_seguimiento],
        ["Formulario VIF", row.formulario_vifa],
        ["Fecha formulario VIF", formatDate(row.fecha_formulario_vifa)],
        ["Número formulario VIF", row.numero_formulario_vifa],
        ["Trimestre ejecución VIF", row.trimestre_ejecucion_vifa],
        ["Observaciones", cleanedObservations]
      ]
    )}

    ${
      row.observacion_regional
        ? buildDetailSection(
            "Valoración Regional",
            [
              ["Coordinador Regional", row.coordinador_regional],
              ["Fecha de revisión", formatDateTime(row.fecha_revision_regional)],
              ["Observación Regional", row.observacion_regional]
            ]
          )
        : ""
    }

    ${
      row.observacion_nacional
        ? buildDetailSection(
            "Valoración Nacional",
            [
              ["Coordinador Nacional", row.coordinador_nacional],
              ["Fecha de revisión", formatDateTime(row.fecha_revision_nacional)],
              ["Observación Nacional", row.observacion_nacional]
            ]
          )
        : ""
    }
  `;
}

function buildDetailSection(title, fields) {
  return `
    <section class="record-detail-section">
      <div class="form-section-title">
        ${escapeHtml(title)}
      </div>

      <div class="record-detail-grid">
        ${fields
          .map(
            ([label, value]) => `
              <div class="record-detail-item">
                <span>${escapeHtml(label)}</span>

                <strong>
                  ${escapeHtml(
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                      ? "Sin dato"
                      : value
                  )}
                </strong>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

/* =========================================================
   REVISIÓN REGIONAL / NACIONAL
========================================================= */

