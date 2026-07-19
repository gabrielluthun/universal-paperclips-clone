import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/universal-paperclips-clone/",
  plugins: [tailwindcss()],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
