// import axios from 'axios';
// import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
//   withCredentials: true,
// });

// export const apiPublic = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
//   withCredentials: false,
// });

// // ---- token manager
// const ACCESS_TOKEN_KEY = 'at';
// let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY) || null;

// export function setAccessToken(token: string | null) {
//   accessToken = token;
//   if (token) {
//     localStorage.setItem(ACCESS_TOKEN_KEY, token);
//     api.defaults.headers.common.Authorization = `Bearer ${token}`;
//   } else {
//     localStorage.removeItem(ACCESS_TOKEN_KEY);
//     delete api.defaults.headers.common.Authorization;
//   }
// }
// export function getAccessToken() { return accessToken; }
// export function handleLogoutClientOnly() { setAccessToken(null); }
// export async function handleLoginSuccessToken(token: string) { setAccessToken(token); }

// export async function ensureAuth() {
//   // if we don't have a token in memory yet, try to refresh once
//   if (!getAccessToken()) {
//     await refreshAccessToken();
//   }
//   // still no token? caller should handle redirect, but at least we won't call without a header
//   return Boolean(getAccessToken());
// }

// // request: attach token
// declare module 'axios' { interface InternalAxiosRequestConfig { _retry?: boolean } }
// api.interceptors.request.use((cfg) => {
//   cfg.headers = cfg.headers || {};
//   if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
//   cfg.withCredentials = true;
//   return cfg;
// });

// // refresh flow (single-flight)
// let isRefreshing = false;
// let waiters: { resolve: () => void; reject: (e?: unknown) => void }[] = [];

// export async function refreshAccessToken(): Promise<string | null> {
//   try {
//     const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
//     const newAT: string | undefined = data?.accessToken || data?.token || data?.access_token;
//     if (newAT) { setAccessToken(newAT); return newAT; }
//     setAccessToken(null); return null;
//   } catch { setAccessToken(null); return null; }
// }

// api.interceptors.response.use(
//   (r) => r,
//   async (error: AxiosError) => {
//     const resp = error.response;
//     const cfg = error.config as InternalAxiosRequestConfig | undefined;
//     if (resp?.status === 401 && cfg && !cfg._retry) {
//       cfg._retry = true;
//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           const token = await refreshAccessToken();
//           waiters.forEach(w => (token ? w.resolve() : w.reject(new Error('No token'))));
//         } finally { waiters = []; isRefreshing = false; }
//       }
//       await new Promise<void>((resolve, reject) => waiters.push({ resolve, reject }));
//       return api(cfg);
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


// src/lib/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

/** ---------- Base clients ---------- */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  withCredentials: true,
});

export const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  withCredentials: false,
});

/** ---------- Token manager ---------- */
const ACCESS_TOKEN_KEY = "at";
let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY) || null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}
export function getAccessToken() {
  return accessToken;
}
export function handleLogoutClientOnly() {
  setAccessToken(null);
}
export async function handleLoginSuccessToken(token: string) {
  setAccessToken(token);
}

/** Ensure we have an AT before making protected calls (optional helper) */
export async function ensureAuth() {
  if (!getAccessToken()) {
    await refreshAccessToken();
  }
  return Boolean(getAccessToken());
}

/** ---------- Request interceptor: attach AT ---------- */
declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

api.interceptors.request.use((cfg) => {
  cfg.headers = cfg.headers || {};
  const at = getAccessToken();
  if (at) cfg.headers.Authorization = `Bearer ${at}`;
  cfg.withCredentials = true;
  return cfg;
});

/** ---------- Refresh logic (single-flight) ---------- */
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newAT: string | undefined =
      data?.accessToken || data?.token || data?.access_token;
    if (newAT) {
      setAccessToken(newAT);
      return newAT;
    }
    setAccessToken(null);
    return null;
  } catch {
    setAccessToken(null);
    return null;
  }
}

/** ---------- Response interceptor: handle 401 once ---------- */
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const resp = error.response;
    const cfg = error.config as InternalAxiosRequestConfig | undefined;

    if (!resp || resp.status !== 401 || !cfg || cfg._retry) {
      return Promise.reject(error);
    }

    cfg._retry = true;

    // Start or join a single refresh in flight
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null; // next 401 can start a new refresh
      });
    }

    const token = await refreshPromise;
    if (!token) {
      // Truly unauthenticated now; let the caller (auth context) react and redirect
      return Promise.reject(error);
    }

    // Replay original request with fresh token
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${token}`;
    return api(cfg);
  }
);

export default api;
