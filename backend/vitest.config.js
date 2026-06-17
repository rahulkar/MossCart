import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.js"],
    globalSetup: ["./vitest.global-setup.js"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret-must-be-at-least-32-characters-long",
      CORS_ORIGIN: "http://localhost:5173",
    },
    testTimeout: 15000,
  },
});
