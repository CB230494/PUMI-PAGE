import { APP_CONFIG } from "../config/config.js";

export class ApiService {
  constructor() {
    this.token =
      localStorage.getItem("pumi_jwt") || "";
  }

  /* =========================================================
     TOKEN
  ========================================================= */

  setToken(token) {
    this.token = token || "";

    if (this.token) {
      localStorage.setItem(
        "pumi_jwt",
        this.token
      );
    } else {
      localStorage.removeItem(
        "pumi_jwt"
      );
    }
  }

  /* =========================================================
     PETICIÓN GENERAL
  ========================================================= */

  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (this.token) {
      headers.Authorization =
        `Bearer ${this.token}`;
    }

    const response = await fetch(
      `${APP_CONFIG.apiBaseUrl}${path}`,
      {
        ...options,
        headers
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Error ${response.status} al consultar la API.`
      );
    }

    return data;
  }

  /* =========================================================
     AUTENTICACIÓN
  ========================================================= */

  login(username, password) {
    return this.request(
      APP_CONFIG.endpoints.login,
      {
        method: "POST",

        body: JSON.stringify({
          username,
          password
        })
      }
    );
  }

  me() {
    return this.request(
      APP_CONFIG.endpoints.me
    );
  }

  /* =========================================================
     PANEL CONSOLIDADO
  ========================================================= */

  getDashboard(delegacion = "") {
    const params =
      new URLSearchParams();

    if (delegacion) {
      params.set(
        "delegacion",
        delegacion
      );
    }

    const query =
      params.toString();

    return this.request(
      `/api/dashboard${query ? `?${query}` : ""}`
    );
  }

  /* =========================================================
     ACTIVIDADES
  ========================================================= */

  getActivities(where = "") {
    const params =
      new URLSearchParams();

    if (where) {
      params.set(
        "where",
        where
      );
    }

    const query =
      params.toString();

    return this.request(
      `${APP_CONFIG.endpoints.actividades}${query ? `?${query}` : ""}`
    );
  }

  getActivityDetail(objectId) {
    return this.request(
      `/api/actividades/${objectId}`
    );
  }

  getActivityOptions() {
    return this.request(
      "/api/actividades/opciones"
    );
  }

  createActivity(
    attributes,
    geometry = null
  ) {
    return this.request(
      APP_CONFIG.endpoints.actividades,
      {
        method: "POST",

        body: JSON.stringify({
          attributes,
          geometry
        })
      }
    );
  }

  updateActivity(
    objectId,
    attributes
  ) {
    return this.request(
      `/api/actividades/${objectId}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          attributes
        })
      }
    );
  }

  deleteActivity(objectId) {
    return this.request(
      `/api/actividades/${objectId}`,
      {
        method: "DELETE"
      }
    );
  }

  /* =========================================================
     BANDEJA REGIONAL
  ========================================================= */

  getRegionalReviewQueue() {
    return this.request(
      "/api/revision-regional"
    );
  }

  regionalReview(
    objectId,
    status,
    observations = ""
  ) {
    return this.request(
      `/api/actividades/${objectId}/revision-regional`,
      {
        method: "POST",

        body: JSON.stringify({
          status,
          observations
        })
      }
    );
  }

  /* =========================================================
     BANDEJA COORDINADOR NACIONAL
  ========================================================= */

  getNationalReviewQueue() {
    return this.request(
      "/api/validacion-nacional"
    );
  }

  nationalReview(
    objectId,
    status,
    observations = ""
  ) {
    return this.request(
      `/api/actividades/${objectId}/validacion-nacional`,
      {
        method: "POST",

        body: JSON.stringify({
          status,
          observations
        })
      }
    );
  }

  /* =========================================================
     CATÁLOGOS
  ========================================================= */

  getCatalogs() {
    return this.request(
      APP_CONFIG.endpoints.catalogos
    );
  }

  /* =========================================================
     DELEGACIONES
  ========================================================= */

  getDelegations() {
    return this.request(
      APP_CONFIG.endpoints.delegaciones
    );
  }

  /* =========================================================
     RESUMEN
  ========================================================= */

  getSummary() {
    return this.request(
      APP_CONFIG.endpoints.resumen
    );
  }

  /* =========================================================
     USUARIOS
  ========================================================= */

  getUsers() {
    return this.request(
      APP_CONFIG.endpoints.usuarios
    );
  }

  createUser(attributes) {
    return this.request(
      APP_CONFIG.endpoints.usuarios,
      {
        method: "POST",

        body: JSON.stringify({
          attributes
        })
      }
    );
  }

  /* =========================================================
     SCHEMA TEMPORAL
  ========================================================= */

  getSchema() {
    return this.request(
      "/api/schema"
    );
  }
}
