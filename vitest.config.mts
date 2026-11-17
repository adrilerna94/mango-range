import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      // Archivos de rutas de Next que solo componen piezas ya probadas: los
      // cubren los E2E de Playwright (e2e/), que no suman a este informe.
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/app/**/components/**",
      ],
      // CI falla si la cobertura de la lógica y los componentes baja de aquí.
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
