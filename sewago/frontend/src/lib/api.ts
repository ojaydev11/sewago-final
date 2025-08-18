import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
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

export async function safeJsonFetch<T>(
  input: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<{ ok: true; data: T } | { ok: false; error: Error }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? 15000);
  try {
    const res = await fetch(`${BASE_URL}${input}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
      next: init?.next,
    });
    if (!res.ok) return { ok: false, error: new Error(`HTTP ${res.status}`) };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error as Error };
  } finally {
    clearTimeout(timeout);
  }
}


