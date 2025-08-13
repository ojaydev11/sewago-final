import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  timeout: 8000,
});

// Attach a client-side request id for correlation when supported
api.interceptors.request.use((config) => {
  try {
    const id = (typeof crypto !== "undefined" && (crypto as any).randomUUID?.()) || undefined;
    if (id) {
      (config.headers as any)["x-request-id"] = id;
    }
  } catch {}
  return config;
});

// Surface server request id on errors for debugging
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const reqId = error?.response?.headers?.["x-request-id"];
    if (reqId) {
      // eslint-disable-next-line no-console
      console.error("API error reqId=", reqId, error?.response?.status);
    }
    return Promise.reject(error);
  }
);


