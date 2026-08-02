// PUMI modular: arranque controlado para GitHub Pages.
// Este archivo solo carga ApiService y los módulos existentes en /js.

const MODULE_VERSION = "20260728-main13-inicio-01";

// IMPORTANTE: estas rutas se insertan como <script> en el documento,
// por eso deben partir desde la raíz de PUMI-PAGE con ./js/.
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
    script.src = `${path}?v=${MODULE_VERSION}`;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No fue posible cargar ${path}`));
    document.head.appendChild(script);
  });
}

async function bootPumi() {
  try {
    // app.js está dentro de /js, por eso ../services es correcto aquí.
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
