/**
 * services/api/httpClient.js
 * -----------------------------------------------------------------------
 * Single shared fetch wrapper for talking to our own backend (server/).
 * Every external API call (Anthropic, Serper.dev Places) is proxied through
 * this backend, so this is the ONLY place in the client that makes
 * network requests — no component or feature file calls `fetch` on a
 * third-party host directly. Base URL defaults to "/api", which works
 * both with the Vite dev proxy and the production server serving the
 * client + API from one origin.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", body, params } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response, fall through to status check below
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request to ${path} failed with status ${res.status}`);
  }

  return data;
}

export const httpClient = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
};
