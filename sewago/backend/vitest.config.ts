import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    hookTimeout: 30000,
    env: {
      NODE_ENV: "test",
      CLIENT_ORIGIN: "http://localhost:3000",
    },
  },
});


