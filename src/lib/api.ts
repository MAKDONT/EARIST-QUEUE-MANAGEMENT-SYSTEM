const rawApiBaseUrl = (import.meta.env.VITE_API_URL || "").trim();
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
};

export const apiFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string") {
    return fetch(buildApiUrl(input), init);
  }

  if (input instanceof URL) {
    return fetch(buildApiUrl(input.toString()), init);
  }

  return fetch(input, init);
};

export const getWebSocketUrl = (): string => {
  if (API_BASE_URL) {
    const url = new URL(API_BASE_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};
