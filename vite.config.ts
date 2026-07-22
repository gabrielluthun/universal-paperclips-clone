import { defineConfig } from "vitest/config";

export default defineConfig({
  // Chemins relatifs : OK sous /universal-paperclips-clone/ sur GitHub Pages.
  base: "./",
  // Dossier servi par « Deploy from a branch » → /docs
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
