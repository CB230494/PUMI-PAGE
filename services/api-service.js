import { APP_CONFIG } from "../config/config.js";

export class ApiService {
  constructor() {
    this.token = localStorage.getItem("pumi_jwt") || "";
  }

  setToken(token) {
    this.token = token || "";

    if (this.token) {
      localStorage.setItem("pumi_jwt", this.token);
    } else {
      localStorage.removeItem("pumi_jwt");
    }
  }

  async request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(
      `${APP_CONFIG.apiBaseUrl}${path}`,
      {
        ...options,
        headers
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Error ${response.status} al consultar la API.`
      );
    }

    return data;
  }

  login(username, password) {
    return this.request(APP_CONFIG.endpoints.login, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });
  }

  me() {
    return this.request(APP_CONFIG.endpoints.me);
  }

  getActivities() {
    return this.request(APP_CONFIG.endpoints.actividades);
  }

  getCatalogs() {
    return this.request(APP_CONFIG.endpoints.catalogos);
  }

  getDelegations() {
    return this.request(APP_CONFIG.endpoints.delegaciones);
  }

  getSummary() {
    return this.request(APP_CONFIG.endpoints.resumen);
  }

  getUsers() {
    return this.request(APP_CONFIG.endpoints.usuarios);
  }

  createActivity(attributes, geometry = null) {
    return this.request(APP_CONFIG.endpoints.actividades, {
      method: "POST",
      body: JSON.stringify({
        attributes,
        geometry
      })
    });
  }

  updateActivity(objectId, attributes) {
    return this.request(
      `${APP_CONFIG.endpoints.actividades}/${objectId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          attributes
        })
      }
    );
  }

  regionalReview(objectId, status, observations) {
    return this.request(
      `${APP_CONFIG.endpoints.actividades}/${objectId}/revision-regional`,
      {
        method: "POST",
        body: JSON.stringify({
          status,
          observations
        })
      }
    );
  }

  nationalReview(objectId, status, observations) {
    return this.request(
      `${APP_CONFIG.endpoints.actividades}/${objectId}/validacion-nacional`,
      {
        method: "POST",
        body: JSON.stringify({
          status,
          observations
        })
      }
    );
  }
}
