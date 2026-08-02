/* PUMI 2026 - módulo mapas. Extraído sin cambiar lógica. */

function renderMap(features, options = {}) {
  const container =
    $("dashboard-map");

  if (!container) {
    return;
  }

  if (state.mapView) {
    state.mapView.destroy();
    state.mapView = null;
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

      const layer =
        new GraphicsLayer();

      map.add(layer);

      const delegationGroups =
        buildDelegationMapGroups(features);

      const regionColors =
        buildRegionColorMap(
          delegationGroups
        );

      const fallbackByDelegation =
        buildDelegationGeometryMap();

      delegationGroups.forEach(
        (group, index) => {
          const coordinates =
            resolveDelegationCoordinates(
              group,
              fallbackByDelegation,
              index
            );

          if (!coordinates) {
            return;
          }

          const delegationKey =
            getDelegationCanonicalKey(
              group.delegacion
            );

          const forcedComplianceStatus =
            options.complianceStatusByDelegation?.[delegationKey] || "";

          const forcedComplianceColor =
            normalize(forcedComplianceStatus) === "CUMPLE"
              ? "#16a34a"
              : normalize(forcedComplianceStatus) === "EN RIESGO"
                ? "#f59e0b"
                : normalize(forcedComplianceStatus) === "CRITICO"
                  ? "#dc2626"
                  : "";

          const color =
            options.colorByCompliance
              ? (
                  forcedComplianceColor ||
                  getComplianceMarkerColor(
                    group
                  )
                )
              : (
                  regionColors.get(
                    normalize(
                      group.direccion_regional
                    )
                  ) || "#0b3b8f"
                );

          layer.add(
            new Graphic({
              geometry: {
                type: "point",

                longitude:
                  coordinates.longitude,

                latitude:
                  coordinates.latitude,

                spatialReference: {
                  wkid: 4326
                }
              },

              symbol: {
                type: "picture-marker",

                url:
                  createMarkerSvg(color),

                width: "38px",
                height: "48px",
                yoffset: "14px"
              },

              attributes: {
                delegacion:
                  group.delegacion,

                direccion_regional:
                  group.direccion_regional,

                total_actividades:
                  group.activities.length,

                ubicacion_aproximada:
                  coordinates.approximate
                    ? "Sí"
                    : "No"
              },

              popupTemplate: {
                title:
                  "{delegacion}",

                content: [
                  {
                    type: "text",

                    text:
                      buildDelegationPopupHtml(
                        group,
                        coordinates
                      )
                  }
                ]
              }
            })
          );
        }
      );

      state.mapView =
        new MapView({
          container:
            "dashboard-map",

          map,

          center: [
            -84.1,
            9.95
          ],

          zoom: 7
        });

      if (layer.graphics.length) {
        state.mapView
          .when(() =>
            state.mapView.goTo(
              layer.graphics,
              {
                padding: 60
              }
            )
          )
          .catch(() => {});
      }

      renderMapLegend(
        regionColors,
        Boolean(
          options.colorByCompliance
        )
      );
    }
  );
}

function buildDelegationMapGroups(features) {
  const grouped = new Map();

  for (
    const feature
    of features || []
  ) {
    const row =
      feature.attributes || {};

    if (
      !isVisibleActivityRow(row) &&
      !(
        isNationalViewerRole() &&
        isNationalViewerVisibleActivityRow(row)
      )
    ) {
      continue;
    }

    const rawDelegation =
      String(
        row.delegacion ||
        "Sin delegación"
      ).trim();

    const delegationKey =
      getDelegationCanonicalKey(
        rawDelegation
      ) ||
      normalize(rawDelegation);

    const delegation =
      getOfficialDelegationName(
        rawDelegation
      );

    if (!grouped.has(delegationKey)) {
      grouped.set(
        delegationKey,
        {
          delegacion:
            delegation,

          direccion_regional:
            getActivityRegion(row) ||
            "Sin región",

          features: [],

          activities:
            new Map()
        }
      );
    }

    const group =
      grouped.get(delegationKey);

    group.features.push(feature);

    const program =
      String(
        row.programa ||
        "Sin programa"
      ).trim();

    const activity =
      String(
        row.actividad ||
        "Sin actividad"
      ).trim();

    if (
      normalize(activity) ===
      "ACTIVIDAD"
    ) {
      continue;
    }

    const key =
      `${normalize(program)}|||${normalize(activity)}`;

    if (
      !group.activities.has(key)
    ) {
      group.activities.set(
        key,
        {
          programa:
            program,

          actividad:
            activity,

          meta:
            0,

          avance:
            0
        }
      );
    }

    const item =
      group.activities.get(key);

    if (isHistorical(row)) {
      item.meta +=
        numberValue(row.meta);

      item.avance +=
        numberValue(row.avance);
    } else if (
      isNationalApproved(row)
    ) {
      item.avance +=
        numberValue(
          row.avance_realizado
        );
    }
  }

  return [
    ...grouped.values()
  ]
    .map((group) => ({
      ...group,

      activities: [
        ...group.activities.values()
      ]
        .filter(
          (item) =>
            numberValue(item.meta) > 0
        )
        .map((item) => ({
          ...item,

          pendiente:
            Math.max(
              item.meta -
              item.avance,
              0
            )
        }))
        .sort((a, b) => {
          const programComparison =
            a.programa.localeCompare(
              b.programa,
              "es"
            );

          if (
            programComparison !== 0
          ) {
            return programComparison;
          }

          return a.actividad.localeCompare(
            b.actividad,
            "es"
          );
        })
    }))
    .filter(
      (group) =>
        group.activities.length > 0
    )
    .sort((a, b) =>
      a.delegacion.localeCompare(
        b.delegacion,
        "es"
      )
    );
}

function buildDelegationPopupHtml(
  group,
  coordinates
) {
  const activities =
    (group.activities || []).filter(
      (item) =>
        numberValue(item.meta) > 0
    );

  const totalMeta =
    activities.reduce(
      (total, item) =>
        total +
        numberValue(item.meta),
      0
    );

  const totalAdvance =
    activities.reduce(
      (total, item) =>
        total +
        Math.min(
          numberValue(item.avance),
          numberValue(item.meta)
        ),
      0
    );

  const totalPending =
    Math.max(
      totalMeta - totalAdvance,
      0
    );

  const totalPercentage =
    totalMeta > 0
      ? (
          totalAdvance /
          totalMeta
        ) * 100
      : 0;

  return `
    <div class="pumi-map-popup">
      <div class="pumi-map-popup-head">
        <strong>
          ${escapeHtml(
            group.delegacion
          )}
        </strong>

        <span>
          ${activities.length}
          actividad(es)
        </span>
      </div>

      <div class="pumi-map-popup-region">
        ${escapeHtml(group.direccion_regional)}
      </div>

      <div class="pumi-map-popup-total">
        <div>
          <span>Meta total</span>
          <strong>
            ${formatNumber(totalMeta)}
          </strong>
        </div>

        <div>
          <span>Avance total</span>
          <strong>
            ${formatNumber(totalAdvance)}
          </strong>
        </div>

        <div>
          <span>Pendiente</span>
          <strong>
            ${formatNumber(totalPending)}
          </strong>
        </div>

        <div>
          <span>Cumplimiento</span>
          <strong>
            ${totalPercentage.toFixed(1)}%
          </strong>
        </div>
      </div>

      <div class="pumi-map-popup-list">
        ${
          activities.length
            ? activities.map(
                (item) => `
              <div class="pumi-map-popup-activity">
                <div class="pumi-map-popup-program">
                  ${escapeHtml(
                    item.programa
                  )}
                </div>

                <div class="pumi-map-popup-title">
                  ${escapeHtml(
                    item.actividad
                  )}
                </div>

                <div class="pumi-map-popup-metrics">
                  <span>
                    Meta
                    <strong>
                      ${formatNumber(
                        item.meta
                      )}
                    </strong>
                  </span>

                  <span>
                    Avance
                    <strong>
                      ${formatNumber(
                        item.avance
                      )}
                    </strong>
                  </span>

                  <span>
                    Pendiente
                    <strong>
                      ${formatNumber(
                        item.pendiente
                      )}
                    </strong>
                  </span>
                </div>
              </div>
                `
              )
              .join("")
            : `
                <div class="module-empty">
                  No hay actividades con meta asignada.
                </div>
              `
        }
      </div>

      ${
        coordinates.approximate
          ? `
              <div class="pumi-map-popup-note">
                Ubicación aproximada de referencia para la delegación.
              </div>
            `
          : ""
      }
    </div>
  `;
}

function buildDelegationGeometryMap() {
  const map = new Map();

  for (
    const feature
    of state.delegaciones
  ) {
    const attributes =
      feature.attributes || {};

    const name =
      attributes.delegacion ||
      attributes.Delegacion ||
      attributes.DELEGACION ||
      attributes.nombre ||
      attributes.Nombre ||
      "";

    const geometry =
      feature.geometry || {};

    const longitude =
      numberOrNull(
        geometry.longitude ??
        geometry.x ??
        attributes.longitud ??
        attributes.Longitud
      );

    const latitude =
      numberOrNull(
        geometry.latitude ??
        geometry.y ??
        attributes.latitud ??
        attributes.Latitud
      );

    if (
      !name ||
      !isValidCoordinate(
        longitude,
        latitude
      )
    ) {
      continue;
    }

    map.set(
      normalize(name),
      {
        longitude,
        latitude
      }
    );
  }

  return map;
}

function getDelegationReferenceName(delegation) {
  return normalize(delegation)
    .replace(/^D\d+[A-Z]?\s+/, "")
    .replace(/^DELEGACION\s+POLICIAL\s+/, "")
    .replace(/^DELEGACION\s+/, "")
    .trim();
}

function getReferenceCoordinates(delegation) {
  const delegationName =
    getDelegationReferenceName(delegation);

  const direct =
    COORDENADAS_REFERENCIA[delegationName];

  if (direct) {
    return {
      latitude: direct[0],
      longitude: direct[1]
    };
  }

  const aliases = [
    ["SAN CARLOS ESTE", "SAN CARLOS"],
    ["SAN CARLOS OESTE", "SAN CARLOS"],
    ["ALAJUELA SUR", "ALAJUELA"],
    ["ALAJUELA NORTE", "ALAJUELA"],
    ["DESAMPARADOS NORTE", "DESAMPARADOS"],
    ["DESAMPARADOS SUR", "DESAMPARADOS"],
    ["POCOCI NORTE", "POCOCI"],
    ["POCOCI SUR", "POCOCI"],
    ["PUERTO JIMENEZ", "GOLFITO"],
    ["PAQUERA", "PUNTARENAS"],
    ["PEREZ ZELEDON", "PEREZ ZELEDON"],
    ["VAZQUEZ DE CORONADO", "VASQUEZ DE CORONADO"]
  ];

  const alias =
    aliases.find(
      ([source]) =>
        delegationName === source
    );

  if (alias) {
    const value =
      COORDENADAS_REFERENCIA[
        alias[1]
      ];

    if (value) {
      const offset =
        buildDelegationReferenceOffset(
          delegation
        );

      return {
        latitude:
          value[0] +
          offset.latitude,

        longitude:
          value[1] +
          offset.longitude
      };
    }
  }

  for (
    const [
      referenceName,
      value
    ]
    of Object.entries(
      COORDENADAS_REFERENCIA
    )
  ) {
    if (
      delegationName.includes(
        referenceName
      ) ||
      referenceName.includes(
        delegationName
      )
    ) {
      const offset =
        buildDelegationReferenceOffset(
          delegation
        );

      return {
        latitude:
          value[0] +
          offset.latitude,

        longitude:
          value[1] +
          offset.longitude
      };
    }
  }

  return null;
}

function buildDelegationReferenceOffset(
  delegation
) {
  const seed =
    normalize(delegation);

  let hash = 0;

  for (
    let index = 0;
    index < seed.length;
    index += 1
  ) {
    hash =
      (
        (
          hash << 5
        ) -
        hash +
        seed.charCodeAt(index)
      ) | 0;
  }

  const angle =
    (
      Math.abs(hash) %
      360
    ) *
    Math.PI /
    180;

  const radius =
    0.0035 +
    (
      Math.abs(hash) %
      4
    ) *
    0.0015;

  return {
    latitude:
      Math.sin(angle) *
      radius,

    longitude:
      Math.cos(angle) *
      radius
  };
}

function getRegionReferenceCoordinates(
  region
) {
  const match =
    String(region || "")
      .match(/REGIONAL\s+(\d+)/i);

  if (!match) {
    return null;
  }

  const value =
    REGION_CENTRO[
      match[1]
    ];

  if (!value) {
    return null;
  }

  return {
    latitude:
      value[0],

    longitude:
      value[1]
  };
}

function resolveDelegationCoordinates(
  group,
  fallbackByDelegation,
  index
) {
  /*
   * Para Regional, Coordinador Nacional y Nacional:
   * un marcador estable por delegación.
   * La ubicación se aproxima con el nombre de la delegación.
   */
  if (!isDelegationRole()) {
    const reference =
      getReferenceCoordinates(
        group.delegacion
      );

    if (reference) {
      return {
        longitude:
          reference.longitude,

        latitude:
          reference.latitude,

        approximate:
          true,

        source:
          "delegacion-referencia"
      };
    }

    const delegationLayerReference =
      fallbackByDelegation.get(
        normalize(
          group.delegacion
        )
      );

    if (delegationLayerReference) {
      const offset =
        buildDelegationReferenceOffset(
          group.delegacion
        );

      return {
        longitude:
          delegationLayerReference.longitude +
          offset.longitude,

        latitude:
          delegationLayerReference.latitude +
          offset.latitude,

        approximate:
          true,

        source:
          "capa-delegaciones"
      };
    }

    const regionReference =
      getRegionReferenceCoordinates(
        group.direccion_regional
      );

    if (regionReference) {
      const offset =
        buildDelegationReferenceOffset(
          group.delegacion
        );

      return {
        longitude:
          regionReference.longitude +
          offset.longitude,

        latitude:
          regionReference.latitude +
          offset.latitude,

        approximate:
          true,

        source:
          "centro-regional"
      };
    }
  }

  const realCoordinates =
    group.features
      .map((feature) => {
        const row =
          feature.attributes || {};

        const geometry =
          feature.geometry || {};

        const longitude =
          numberOrNull(
            row.longitud ??
            geometry.longitude ??
            geometry.x
          );

        const latitude =
          numberOrNull(
            row.latitud ??
            geometry.latitude ??
            geometry.y
          );

        if (
          !isValidCoordinate(
            longitude,
            latitude
          )
        ) {
          return null;
        }

        return {
          longitude,
          latitude
        };
      })
      .filter(Boolean);

  if (
    realCoordinates.length
  ) {
    return {
      longitude:
        realCoordinates.reduce(
          (
            total,
            item
          ) =>
            total +
            item.longitude,
          0
        ) /
        realCoordinates.length,

      latitude:
        realCoordinates.reduce(
          (
            total,
            item
          ) =>
            total +
            item.latitude,
          0
        ) /
        realCoordinates.length,

      approximate:
        false,

      source:
        "actividad"
    };
  }

  const fallback =
    fallbackByDelegation.get(
      normalize(
        group.delegacion
      )
    );

  if (!fallback) {
    return null;
  }

  return {
    longitude:
      fallback.longitude,

    latitude:
      fallback.latitude,

    approximate:
      true,

    source:
      "capa-delegaciones"
  };
}

function resolveFeatureCoordinates(
  feature,
  fallbackByDelegation,
  index
) {
  const attributes =
    feature.attributes || {};

  const geometry =
    feature.geometry || {};

  const longitude =
    numberOrNull(
      attributes.longitud ??
      geometry.longitude ??
      geometry.x
    );

  const latitude =
    numberOrNull(
      attributes.latitud ??
      geometry.latitude ??
      geometry.y
    );

  if (
    isValidCoordinate(
      longitude,
      latitude
    )
  ) {
    return {
      longitude,
      latitude,
      approximate: false
    };
  }

  const fallback =
    fallbackByDelegation.get(
      normalize(
        attributes.delegacion
      )
    );

  if (!fallback) {
    return null;
  }

  return {
    longitude:
      fallback.longitude,

    latitude:
      fallback.latitude,

    approximate:
      true
  };
}

function isValidCoordinate(
  longitude,
  latitude
) {
  return (
    longitude !== null &&
    latitude !== null &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90 &&
    !(
      longitude === 0 &&
      latitude === 0
    )
  );
}

function renderReviewMap(row) {
  if (state.reviewMapView) {
    state.reviewMapView.destroy();
    state.reviewMapView = null;
  }

  require(
    [
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic"
    ],
    (
      Map,
      MapView,
      Graphic
    ) => {
      const fallbackByDelegation =
        buildDelegationGeometryMap();

      const coordinates =
        resolveFeatureCoordinates(
          {
            attributes: row,
            geometry:
              row.__geometry || null
          },
          fallbackByDelegation,
          getObjectId(row)
        );

      const map = new Map({
        basemap:
          "streets-navigation-vector"
      });

      state.reviewMapView =
        new MapView({
          container:
            "review-map",

          map,

          center:
            coordinates
              ? [
                  coordinates.longitude,
                  coordinates.latitude
                ]
              : [
                  -84.1,
                  9.95
                ],

          zoom:
            coordinates
              ? 16
              : 7
        });

      if (coordinates) {
        state.reviewMapView.graphics.add(
          new Graphic({
            geometry: {
              type: "point",

              longitude:
                coordinates.longitude,

              latitude:
                coordinates.latitude,

              spatialReference: {
                wkid: 4326
              }
            },

            symbol: {
              type: "picture-marker",
              url: createMarkerSvg(
                "#0b3b8f"
              ),
              width: "40px",
              height: "50px",
              yoffset: "15px"
            },

            attributes: {
              delegacion:
                row.delegacion ||
                "Actividad",

              aproximada:
                coordinates.approximate
                  ? "Sí"
                  : "No"
            },

            popupTemplate: {
              title: "{delegacion}",
              content:
                "<b>Ubicación aproximada:</b> {aproximada}"
            }
          })
        );
      }
    }
  );
}

function getComplianceMarkerColor(group) {
  const meta =
    (group.activities || [])
      .reduce(
        (total, item) =>
          total +
          numberValue(item.meta),
        0
      );

  const advance =
    (group.activities || [])
      .reduce(
        (total, item) =>
          total +
          Math.min(
            numberValue(item.avance),
            numberValue(item.meta)
          ),
        0
      );

  const status =
    getComplianceStatus(
      meta,
      advance
    );

  if (status === "CUMPLE") {
    return "#16a34a";
  }

  if (status === "EN RIESGO") {
    return "#f59e0b";
  }

  return "#dc2626";
}

function buildRegionColorMap(groups) {
  const regions = [
    ...new Set(
      (groups || [])
        .map(
          (group) =>
            String(
              group.direccion_regional ||
              "Sin región"
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const palette = [
    "#0b3b8f",
    "#16a34a",
    "#7c3aed",
    "#db2777",
    "#f97316",
    "#14b8a6",
    "#eab308",
    "#2563eb",
    "#be123c",
    "#0891b2",
    "#65a30d",
    "#c026d3",
    "#ea580c",
    "#0f766e",
    "#9333ea"
  ];

  return new Map(
    regions.map(
      (region, index) => [
        normalize(region),
        palette[
          index %
          palette.length
        ]
      ]
    )
  );
}

function createMarkerSvg(color) {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="80"
      viewBox="0 0 64 80"
    >
      <defs>
        <filter
          id="shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2.5"
            flood-color="#000000"
            flood-opacity="0.30"
          />
        </filter>

        <linearGradient
          id="shine"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#ffffff"
            stop-opacity="0.42"
          />

          <stop
            offset="50%"
            stop-color="#ffffff"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <path
        filter="url(#shadow)"
        d="M32 3C16.1 3 4 15.1 4 31c0 22.3 28 46 28 46s28-23.7 28-46C60 15.1 47.9 3 32 3z"
        fill="${color}"
        stroke="#ffffff"
        stroke-width="3"
      />

      <path
        d="M32 7C19 7 9 17 9 30c0 5.2 1.8 10.7 4.6 16C11 31 17.8 13.6 36 8.2A24 24 0 0 0 32 7z"
        fill="url(#shine)"
      />

      <circle
        cx="32"
        cy="30"
        r="11"
        fill="#ffffff"
        fill-opacity="0.96"
      />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderMapLegend(colorMap, complianceMode = false) {
  let legend =
    $("dashboard-map-legend");

  if (!legend) {
    legend =
      document.createElement(
        "div"
      );

    legend.id =
      "dashboard-map-legend";

    legend.className =
      "map-legend";

    $("dashboard-map")
      ?.insertAdjacentElement(
        "afterend",
        legend
      );
  }

  if (
    !legend ||
    complianceMode ||
    isDelegationRole() ||
    colorMap.size <= 1
  ) {
    legend?.classList.add(
      "hidden"
    );

    return;
  }

  legend.classList.remove(
    "hidden"
  );

  const regionNames = new Map();

  for (const row of getRows()) {
    const region =
      getActivityRegion(row);

    if (region) {
      regionNames.set(
        normalize(region),
        region
      );
    }
  }

  legend.innerHTML = `
    <details class="pumi-map-legend-details">
      <summary>
        Colores por Dirección Regional
      </summary>

      <div class="map-legend-items">
        ${[
          ...colorMap.entries()
        ]
          .map(
            (
              [
                regionKey,
                color
              ]
            ) => `
              <span class="map-legend-item">
                <i
                  style="
                    background:
                    ${color}
                  "
                ></i>

                ${escapeHtml(
                  regionNames.get(regionKey) ||
                  regionKey
                )}
              </span>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

/* =========================================================
   ESTILOS VISUALES INYECTADOS
   Permite aplicar el ajuste sin tocar app.css todavía.
========================================================= */

