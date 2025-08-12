import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  timeout: 8000,
});

// Attach a client-side request id for correlation when supported
  api.interceptors.request.use((config) => {
  try {
      const globalCrypto: unknown = typeof crypto !== "undefined" ? crypto : undefined;
      const id = (globalCrypto as { randomUUID?: () => string } | undefined)?.randomUUID?.();
    if (id) {
        (config.headers as Record<string, string>)["x-request-id"] = id;
    }
  } catch {}
  return config;
});

  // Surface server request id on errors for debugging
  api.interceptors.response.use(
  (resp) => resp,
  (error) => {
      const typed = error as { response?: { status?: number; headers?: Record<string, string> } };
      const reqId = typed?.response?.headers?.["x-request-id"];
      if (reqId) {
        // eslint-disable-next-line no-console
        console.error("API error reqId=", reqId, typed?.response?.status);
      }
      return Promise.reject(error);
  }
);


