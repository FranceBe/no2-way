import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    // Read by shared/db.ts when the module loads
    env: { TABLE_NAME: "test-table", TFL_APP_KEY: "" },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/test/**", "src/**/*.test.ts"],
      // Checked by the pre-commit hook: `vitest run --coverage` fails below these
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
  },
});
