import { APP_CONFIG } from "../config/config.js";

export class ArcGISService {
  constructor() {
    this.token = sessionStorage.getItem("pumi_token") || "";
  }

  setToken(token) {
    this.token = token || "";

    if (this.token) {
      sessionStorage.setItem("pumi_token", this.token);
    } else {
      sessionStorage.removeItem("pumi_token");
    }
  }

  async request(url, params = {}, method = "GET") {
    const payload = {
      f: "json",
      ...params
    };

    if (this.token) {
      payload.token = this.token;
    }

    let response;

    if (method === "POST") {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(payload)
      });
    } else {
      const query = new URLSearchParams(payload);
      response = await fetch(`${url}?${query.toString()}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Error al consultar ArcGIS.");
    }

    return data;
  }

  async queryLayer(layerUrl, options = {}) {
    const data = await this.request(`${layerUrl}/query`, {
      where: options.where || "1=1",
      outFields: options.outFields || "*",
      returnGeometry: options.returnGeometry ?? true,
      resultRecordCount: options.resultRecordCount || 2000,
      outSR: 4326
    });

    return data.features || [];
  }

  async getPortalUser() {
    return this.request(
      `${APP_CONFIG.portalUrl}/sharing/rest/community/self`
    );
  }

  async getPumiUser(username) {
    const safeUsername = String(username).replaceAll("'", "''");

    const rows = await this.queryLayer(APP_CONFIG.layers.usuarios, {
      where: `usuario='${safeUsername}'`,
      returnGeometry: false
    });

    return rows[0]?.attributes || null;
  }
}

export function launchOAuth() {
  const url = `${APP_CONFIG.portalUrl}/sharing/rest/oauth2/authorize`;

  const params = new URLSearchParams({
    client_id: APP_CONFIG.oauthClientId,
    response_type: "token",
    expiration: "120",
    redirect_uri: APP_CONFIG.redirectUri
  });

  window.location.assign(`${url}?${params.toString()}`);
}

export function readOAuthTokenFromHash() {
  if (!window.location.hash.includes("access_token")) {
    return "";
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("access_token") || "";

  history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );

  return token;
}

