/* PUMI 2026 - módulo utils. Extraído sin cambiar lógica. */

function normalize(value) {
  const normalized = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toUpperCase();

  return normalized === "VIFA" ? "VIF" : normalized;
}

function normalizeTerritory(value) {
  return normalize(value)
    .replace(
      /[^A-Z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getRegionNumber(value) {
  const text =
    normalizeTerritory(value);

  const match = text.match(
    /(?:DIRECCION\s+REGIONAL|REGION|DR)?\s*0*(1[0-4]|[1-9])(?:[A-Z])?(?:\s|$)/
  );

  return match
    ? Number(match[1])
    : null;
}

function getRegionName(value) {
  const compactCode = normalize(value)
    .replace(/[^A-Z0-9]/g, "");

  const specialNames = {
    DR1C: "SAN JOSE CENTRAL",
    DR1N: "SAN JOSE NORTE",
    DR1S: "SAN JOSE SUR"
  };

  if (specialNames[compactCode]) {
    return specialNames[compactCode];
  }

  return normalizeTerritory(value)
    .replace(
      /DIRECCION\s+REGIONAL/g,
      " "
    )
    .replace(
      /\bREGION\b/g,
      " "
    )
    .replace(
      /\bDR\s*0*(1[0-4]|[1-9])[A-Z]?\b/g,
      " "
    )
    .replace(
      /\b0*(1[0-4]|[1-9])\b/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function sameRegion(left, right) {
  const leftTerritory =
    normalizeTerritory(left);

  const rightTerritory =
    normalizeTerritory(right);

  if (
    leftTerritory &&
    rightTerritory &&
    leftTerritory === rightTerritory
  ) {
    return true;
  }

  const leftName =
    getRegionName(left);

  const rightName =
    getRegionName(right);

  /* Primero se compara el nombre. Esto mantiene separadas
     San José Central, San José Norte y San José Sur, aunque
     las tres utilicen el número regional 1. */
  if (leftName && rightName) {
    return leftName === rightName;
  }

  const leftNumber =
    getRegionNumber(left);

  const rightNumber =
    getRegionNumber(right);

  return (
    leftNumber !== null &&
    rightNumber !== null &&
    leftNumber === rightNumber
  );
}

function getDelegationCanonicalKey(value = "") {
  const text = normalizeTerritory(value);

  if (!text) {
    return "";
  }

  if (text.includes("SAN CARLOS ESTE")) {
    return "D82E";
  }

  if (text.includes("SAN CARLOS OESTE")) {
    return "D82O";
  }

  if (text.includes("RIO CUARTO")) {
    return "D87";
  }

  if (text.includes("TARRAZU")) {
    return "D45";
  }

  if (text.includes("SAN RAFAEL")) {
    const match = text.match(/\bD\s*0*(\d{1,3})\b/);

    if (match && Number(match[1]) === 53) {
      return "D53";
    }
  }

  const separated = text.match(
    /^D\s*0*(\d{1,3})(?:\s+([A-Z]))?(?:\s|$)/
  );

  if (separated) {
    return `D${Number(separated[1])}${separated[2] || ""}`;
  }

  const compact = normalize(value)
    .replace(/[^A-Z0-9]/g, "");

  const numeric = compact.match(
    /^D0*(\d{1,3})/
  );

  return numeric
    ? `D${Number(numeric[1])}`
    : text;
}

function sameDelegation(left, right) {
  const leftKey =
    getDelegationCanonicalKey(left);

  const rightKey =
    getDelegationCanonicalKey(right);

  return Boolean(
    leftKey &&
    rightKey &&
    leftKey === rightKey
  );
}

function getOfficialDelegationName(value = "") {
  const key =
    getDelegationCanonicalKey(value);

  if (!key) {
    return String(value || "").trim();
  }

  const matches =
    (state.delegaciones || [])
      .map((feature) => {
        const attributes =
          feature.attributes || {};

        return getCatalogFieldValue(
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
      })
      .filter(Boolean)
      .filter(
        (delegation) =>
          getDelegationCanonicalKey(
            delegation
          ) === key
      );

  if (matches.length) {
    return matches.sort((a, b) => {
      const aHasSpace =
        /\d\s+\D/.test(a) ? 1 : 0;

      const bHasSpace =
        /\d\s+\D/.test(b) ? 1 : 0;

      if (aHasSpace !== bHasSpace) {
        return bHasSpace - aHasSpace;
      }

      return a.length - b.length;
    })[0];
  }

  const fallbacks = {
    D82E: "D82E San Carlos Este",
    D82O: "D82O San Carlos Oeste",
    D87: "D87 Río Cuarto",
    D45: "D45 Tarrazú",
    D53: "D53 San Rafael"
  };

  return fallbacks[key] ||
    String(value || "").trim();
}

function sameTerritory(left, right) {
  return (
    normalizeTerritory(left) ===
    normalizeTerritory(right)
  );
}

function numberValue(value) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const parsed = Number(
    String(value)
      .replace(",", ".")
      .trim()
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function sumBy(
  rows,
  field
) {
  return rows.reduce(
    (
      total,
      row
    ) =>
      total +
      numberValue(
        row[field]
      ),
    0
  );
}

function formatNumber(value) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  return Number(
    value || 0
  ).toLocaleString(
    "es-CR",
    {
      maximumFractionDigits:
        2
    }
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "es-CR"
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString(
    "es-CR"
  );
}

function dateInputValue(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  return date
    .toISOString()
    .slice(0, 10);
}

function escapeHtml(value) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );
}

function showToast(
  message,
  error = false
) {
  const toast =
    $("toast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.style.background =
    error
      ? "#b42318"
      : "#111827";

  toast
    .classList
    .remove("hidden");

  setTimeout(
    () =>
      toast
        .classList
        .add("hidden"),
    4000
  );
}
