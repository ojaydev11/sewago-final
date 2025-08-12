import { api } from "./api";

let isRefreshing = false;
let pending: Array<() => void> = [];

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sewago_access") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
        return api(original);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const res = await api.post("/auth/refresh");
        localStorage.setItem("sewago_access", res.data.accessToken);
        pending.forEach((fn) => fn());
        pending = [];
        return api(original);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);


