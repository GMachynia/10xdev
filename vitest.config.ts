import { defineConfig } from "vitest/config";
import path from "path";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "**/*.config.{js,ts,mjs}",
        "**/*.d.ts",
        "**/types.ts",
        "**/database.types.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tailwindcss()],
});
