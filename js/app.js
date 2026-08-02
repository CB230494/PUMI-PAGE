// PUMI modular: arranque controlado y compatible con GitHub Pages.
// ApiService se carga dinámicamente antes de inicializar los módulos.

const MODULE_VERSION = "20260802-visor-nacional-cachefix-01";

const MODULES = [
  "./core/core-v2.js",
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
    script.src = `${path}?v=${MODULE_VERSION}`;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No fue posible cargar ${path}`));
    document.head.appendChild(script);
  });
}

async function bootPumi() {
  try {
    const apiModule = await import(`../services/api-service.js?v=${MODULE_VERSION}`);
    if (!apiModule?.ApiService) {
      throw new Error("ApiService no fue exportado correctamente.");
    }
    window.ApiService = apiModule.ApiService;

    for (const modulePath of MODULES) {
      await loadClassicScript(modulePath);
    }

    if (typeof window.initialize !== "function") {
      throw new Error("La función initialize no quedó disponible después de cargar los módulos.");
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => window.initialize(), { once: true });
    } else {
      await window.initialize();
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
