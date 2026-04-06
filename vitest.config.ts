import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
    // 통합 테스트는 npm run test:integration으로 별도 실행 (실제 백엔드 필요)
    exclude: ["**/node_modules/**", "**/integration/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
