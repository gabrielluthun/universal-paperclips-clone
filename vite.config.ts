import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => ({
  // Pages GitHub en prod ; racine en local pour les assets.
  base: command === "build" ? "/universal-paperclips-clone/" : "/",
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
}));
