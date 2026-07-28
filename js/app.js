// PUMI 2026 - arranque modular estable para GitHub Pages.
// Todas las rutas se resuelven respecto a este archivo (js/app.js),
// no respecto a la URL de la página.

const MODULE_VERSION = "20260728-modular-estable-01";

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

function versionedUrl(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  url.searchParams.set("v", MODULE_VERSION);
  return url.href;
}

function loadClassicScript(relativePath) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = versionedUrl(relativePath);
    script.async = false;
    script.dataset.pumiModule = relativePath;
    script.onload = () => resolve();
    script.onerror = () => reject(
      new Error(`No fue posible cargar ${relativePath}`)
    );
    document.head.appendChild(script);
  });
}

async function bootPumi() {
  try {
    const apiModuleUrl = versionedUrl("../services/api-service.js");
    const apiModule = await import(apiModuleUrl);

    if (!apiModule?.ApiService) {
      throw new Error("ApiService no fue exportado correctamente.");
    }

    window.ApiService = apiModule.ApiService;

    for (const modulePath of MODULES) {
      await loadClassicScript(modulePath);
    }

    if (typeof window.initialize !== "function") {
      throw new Error(
        "La función initialize no quedó disponible después de cargar los módulos."
      );
    }

    const start = () => Promise.resolve(window.initialize());

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        start().catch((error) => {
          console.error("Error al inicializar PUMI:", error);
        });
      }, { once: true });
    } else {
      await start();
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
