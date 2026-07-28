import { ApiService } from "../services/api-service.js?v=20260726-regional-extra1";

// El runtime actual conserva sus funciones exactamente como estaban,
// pero ahora se carga por módulos independientes y en un orden controlado.
window.ApiService = ApiService;

const MODULES = [
  "./core/core.js",
  "./modules/dashboard-shell.js",
  "./modules/visor.js",
  "./modules/dashboard-common.js",
  "./modules/delegacion.js",
  "./modules/revision.js",
  "./modules/mapas.js",
  "./modules/ui.js",
  "./modules/informes.js",
  "./modules/utils.js"
];

function loadClassicScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${path}?v=20260728-modular-etapa1`;
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
