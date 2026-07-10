export const APP_CONFIG = {
  appName: "PUMI 2026",

  portalUrl: "https://msp-cr.maps.arcgis.com",

  /*
   * Cuando cree las credenciales OAuth, pegue aquí el Client ID.
   * No coloque Client Secret dentro de GitHub Pages.
   */
  oauthClientId: "COLOQUE_AQUI_EL_CLIENT_ID",

  /*
   * Se calcula automáticamente con la URL exacta del repositorio publicado.
   * Para el repo PUMI-PAGE normalmente será:
   * https://cb230494.github.io/PUMI-PAGE/
   */
  redirectUri: `${window.location.origin}${window.location.pathname}`,

  layers: {
    actividades:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_ACTIVIDADES/FeatureServer/0",

    delegaciones:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/Capa_1/FeatureServer/0",

    usuarios:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_USUARIOS/FeatureServer/0",

    catalogos:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_CATALOGOS/FeatureServer/0",

    resumen:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_RESUMEN/FeatureServer/0",

    validaciones:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_VALIDACIONES/FeatureServer/0",

    bitacora:
      "https://services5.arcgis.com/O0HjrwhVoKXT72lM/arcgis/rest/services/PUMI_BITACORA/FeatureServer/0"
  }
};

