/* PUMI 2026 - módulo ui. Extraído sin cambiar lógica. */

function injectVisualEnhancements() {
  if (
    document.getElementById(
      "pumi-app-js-visual-fixes"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "pumi-app-js-visual-fixes";

  style.textContent = `
    .pumi-delegation-selector {
      display: grid;
      gap: 14px;
    }

    .participant-summary-card {
      display: grid;
      grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
      gap: 18px;
      align-items: center;
      margin: 0 0 20px;
      padding: 18px 20px;
      border: 1px solid #dce5f1;
      border-radius: 18px;
      background: linear-gradient(135deg, #f8fbff, #eef4ff);
    }

    .participant-summary-card div {
      display: grid;
      gap: 5px;
    }

    .participant-summary-card span {
      color: #66758b;
      font-weight: 800;
    }

    .participant-summary-card strong {
      color: #003b8f;
      font-size: 2rem;
    }

    .participant-summary-card p {
      margin: 0;
      color: #536176;
      line-height: 1.5;
    }

    .form-grid-full {
      grid-column: 1 / -1;
    }

    .institution-picker {
      display: grid;
      gap: 14px;
    }

    .institution-picker-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: stretch;
    }

    .institution-picker-row .btn {
      min-width: 150px;
    }

    .selected-institutions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      min-height: 56px;
      padding: 14px;
      border: 1px dashed #c8d5e6;
      border-radius: 16px;
      background: #f8fbff;
    }

    .institution-empty {
      color: #708096;
      font-size: 0.9rem;
      align-self: center;
    }

    .institution-chip {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      max-width: 100%;
      padding: 10px 12px;
      border: 1px solid #bfd0e8;
      border-radius: 999px;
      background: #ffffff;
      color: #12366f;
      font-weight: 800;
      line-height: 1.25;
      box-shadow: 0 5px 14px rgba(18, 54, 111, 0.08);
    }

    .institution-chip-remove {
      width: 25px;
      height: 25px;
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      border: 0;
      border-radius: 50%;
      background: #e8eef8;
      color: #8f1d14;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 900;
    }

    .institution-chip-remove:hover {
      background: #ffdcd8;
    }

    .field-help {
      display: block;
      margin-top: 7px;
      color: #66758b;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .form-error-summary {
      margin-top: 20px;
      padding: 18px 20px;
      border: 1px solid #efb0aa;
      border-radius: 16px;
      background: #fff2f0;
      color: #8f1d14;
    }

    .form-error-summary strong {
      display: block;
      margin-bottom: 8px;
    }

    .form-error-summary ul {
      margin: 0;
      padding-left: 22px;
    }

    .form-error-summary li + li {
      margin-top: 5px;
    }

    .pumi-dashboard-filter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .pumi-dashboard-filter-grid label {
      display: grid;
      gap: 8px;
      color: #102a56;
      font-weight: 800;
    }

    .pumi-dashboard-filter-grid select {
      width: 100%;
      min-height: 58px;
      padding: 0 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      background: #fff;
      color: #12233f;
      font: inherit;
      font-weight: 700;
      outline: none;
      box-shadow: 0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-dashboard-filter-grid select:focus {
      border-color: #174ea6;
      box-shadow:
        0 0 0 4px rgba(23, 78, 166, 0.10),
        0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-map-popup {
      min-width: 320px;
      max-width: 520px;
      color: #162844;
    }

    .pumi-map-popup-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #dce5f1;
    }

    .pumi-map-popup-head strong {
      color: #003b8f;
      font-size: 1rem;
    }

    .pumi-map-popup-head span {
      color: #66758b;
      font-size: 0.78rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .pumi-map-popup-region {
      margin: -4px 0 12px;
      color: #66758b;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .pumi-map-popup-total {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 10px 0 12px;
      padding: 10px;
      border: 1px solid #dbe5f2;
      border-radius: 12px;
      background: #f5f8fd;
    }

    .pumi-map-popup-total div {
      display: grid;
      gap: 3px;
      min-width: 0;
    }

    .pumi-map-popup-total span {
      color: #61708a;
      font-size: 0.76rem;
      font-weight: 800;
    }

    .pumi-map-popup-total strong {
      color: #073b8c;
      font-size: 1rem;
      font-weight: 900;
    }

    .pumi-map-popup-list {
      display: grid;
      gap: 10px;
      max-height: 390px;
      overflow: auto;
      padding-right: 4px;
    }

    .pumi-map-popup-activity {
      padding: 12px;
      border: 1px solid #dce5f1;
      border-radius: 12px;
      background: #f8fbff;
    }

    .pumi-map-popup-program {
      color: #b27a08;
      font-size: 0.72rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pumi-map-popup-title {
      margin-top: 5px;
      color: #162844;
      font-weight: 800;
      line-height: 1.35;
    }

    .pumi-map-popup-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    .pumi-map-popup-metrics span {
      display: grid;
      gap: 3px;
      padding: 8px;
      border-radius: 9px;
      background: #ffffff;
      color: #66758b;
      font-size: 0.72rem;
    }

    .pumi-map-popup-metrics strong {
      color: #003b8f;
      font-size: 1rem;
    }

    .pumi-map-popup-note {
      margin-top: 10px;
      color: #66758b;
      font-size: 0.74rem;
      font-style: italic;
    }

    .pumi-delegation-selector > label,
    .pumi-review-filters label,
    .pumi-valuation-card label {
      color: #102a56;
      font-weight: 800;
    }

    .pumi-select-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: end;
    }

    .pumi-select-row select,
    .pumi-review-filters select {
      width: 100%;
      min-height: 58px;
      padding: 0 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      background: #fff;
      color: #12233f;
      font: inherit;
      font-weight: 700;
      outline: none;
      box-shadow: 0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-select-row select:focus,
    .pumi-review-filters select:focus {
      border-color: #174ea6;
      box-shadow:
        0 0 0 4px rgba(23, 78, 166, 0.10),
        0 8px 24px rgba(18, 48, 89, 0.06);
    }

    .pumi-delegation-preview {
      min-height: 92px;
    }

    .pumi-mini-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .pumi-mini-kpi {
      display: grid;
      gap: 8px;
      padding: 18px;
      border: 1px solid #dce5f1;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff, #f8fbff);
      box-shadow: 0 10px 28px rgba(18, 48, 89, 0.06);
    }

    .pumi-mini-kpi span {
      color: #66758b;
      font-weight: 700;
    }

    .pumi-mini-kpi strong {
      color: #003b8f;
      font-size: 1.7rem;
    }

    .pumi-review-filters {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin: 22px 0 28px;
    }

    .pumi-review-filters label {
      display: grid;
      gap: 8px;
    }

    .review-compact-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 24px;
      align-items: center;
      padding: 24px;
      margin-bottom: 16px;
      border: 1px solid #dce5f1;
      border-radius: 22px;
      background: #fff;
      box-shadow: 0 12px 30px rgba(18, 48, 89, 0.06);
    }

    .review-compact-card h3 {
      margin: 10px 0 6px;
      color: #003b8f;
      font-size: 1.45rem;
    }

    .review-compact-card p {
      color: #6a7688;
      margin: 0 0 10px;
    }

    .review-compact-meta {
      display: grid;
      gap: 10px;
      min-width: 260px;
    }

    .pumi-valuation-card {
      margin-top: 26px;
      padding: 24px;
      border: 1px solid #dce5f1;
      border-radius: 22px;
      background: linear-gradient(180deg, #ffffff, #fbfdff);
    }

    .pumi-valuation-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: 24px;
      align-items: start;
    }

    .review-observation-field {
      display: grid;
      gap: 10px;
    }

    .review-observation-field textarea {
      width: 100%;
      min-height: 180px;
      padding: 16px 18px;
      border: 1px solid #d6e0ee;
      border-radius: 16px;
      resize: vertical;
      font: inherit;
      color: #162844;
      background: #fff;
      box-sizing: border-box;
    }

    .review-observation-field textarea:focus {
      outline: none;
      border-color: #174ea6;
      box-shadow: 0 0 0 4px rgba(23, 78, 166, 0.10);
    }

    .review-actions-large {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: stretch;
    }

    .review-actions-large .btn {
      width: 100%;
      min-height: 62px;
      white-space: normal;
      text-align: center;
      justify-content: center;
    }

    .map-legend {
      margin-top: 14px;
    }

    .pumi-map-legend-details {
      border: 1px solid #dce5f1;
      border-radius: 16px;
      background: #fff;
      overflow: hidden;
    }

    .pumi-map-legend-details summary {
      cursor: pointer;
      padding: 15px 18px;
      color: #102a56;
      font-weight: 800;
      user-select: none;
    }

    .map-legend-items {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px 14px;
      padding: 0 18px 18px;
    }

    .map-legend-item {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
      color: #34435a;
      font-size: 0.92rem;
    }

    .map-legend-item i {
      width: 14px;
      height: 18px;
      border-radius: 10px 10px 10px 2px;
      transform: rotate(-45deg);
      flex: 0 0 auto;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
    }


    .vifa-planning-details {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 0 0 20px;
      padding: 18px;
      border: 1px solid #d6e2f2;
      border-radius: 18px;
      background: #f7faff;
    }

    .vifa-planning-details div { display: grid; gap: 5px; }
    .vifa-planning-details span { color: #66758b; font-size: .8rem; font-weight: 800; }
    .vifa-planning-details strong { color: #073b8c; line-height: 1.35; }

    .national-viewer-filter-grid {
      display: grid;
      grid-template-columns:
        repeat(5, minmax(0, 1fr));
      gap: 14px;
    }

    .national-viewer-filter-grid label {
      display: grid;
      gap: 8px;
      color: #102a56;
      font-weight: 800;
    }

    .national-viewer-filter-grid select {
      width: 100%;
      min-height: 56px;
      padding: 0 15px;
      border: 1px solid #d6e0ee;
      border-radius: 15px;
      background: #ffffff;
      color: #12233f;
      font: inherit;
      font-weight: 700;
      outline: none;
    }

    .national-viewer-filter-grid select:focus {
      border-color: #174ea6;
      box-shadow:
        0 0 0 4px
        rgba(23, 78, 166, 0.10);
    }

    .national-compliance-badge {
      display: inline-flex;
      justify-content: center;
      min-width: 92px;
      padding: 7px 11px;
      border-radius: 999px;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 900;
    }

    .national-compliance-cumple {
      background: #16a34a;
    }

    .national-compliance-en-riesgo {
      background: #f59e0b;
    }

    .national-compliance-critico {
      background: #dc2626;
    }

    @media (max-width: 1100px) {
      .participant-summary-card {
        grid-template-columns: 1fr;
      }

      .institution-picker-row {
        grid-template-columns: 1fr;
      }

      .institution-picker-row .btn {
        width: 100%;
      }

      .pumi-mini-kpi-grid,
      .pumi-review-filters,
      .pumi-dashboard-filter-grid,
      .national-viewer-filter-grid,
      .vifa-planning-details {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .pumi-valuation-layout {
        grid-template-columns: 1fr;
      }

      .map-legend-items {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .pumi-select-row,
      .review-compact-card {
        grid-template-columns: 1fr;
      }

      .pumi-mini-kpi-grid,
      .pumi-review-filters,
      .pumi-dashboard-filter-grid,
      .national-viewer-filter-grid,
      .review-actions-large,
      .map-legend-items {
        grid-template-columns: 1fr;
      }

      .review-compact-meta {
        min-width: 0;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================================================
   UTILIDADES
========================================================= */

