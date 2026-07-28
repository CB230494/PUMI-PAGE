import { ApiService } from "../services/api-service.js?v=20260726-regional-extra1";

// El runtime actual conserva sus funciones exactamente como estaban,
// pero ahora se carga por módulos independientes y en un orden controlado.
window.ApiService = ApiService;

const MODULES = [
  "./js/core/core.js",
  "./js/modules/dashboard-shell.js",
  "./js/modules/visor.js",
  "./js/modules/dashboard-common.js",
  "./js/modules/delegacion.js",
  "./js/modules/revision.js",
  "./js/modules/mapas.js",
  "./js/modules/ui.js",
  "./js/modules/informes.js",
  "./js/modules/utils.js"
];

function loadClassicScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${path}?v=20260728-modular-rutas2`;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No fue posible cargar ${path}`));
    document.head.appendChild(script);
  });
}

async function bootPumi() {
  try {
    for (const modulePath of MODULES) {
      await loadClassicScript(modulePath);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      await initialize();
    }
  } catch (error) {
    console.error("Error al iniciar PUMI modular:", error);
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "No fue posible iniciar PUMI. Revise la consola.";
      toast.classList.remove("hidden");
    }
  }
}

bootPumi();
