/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

console.log("debug path: ", __dirname);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Define the alias pointing to the specific entry point in node_modules
      "@bitcoin-computer/lib": path.resolve(
        __dirname,
        "../lib/dist/bc-lib.browser.min.mjs"
      ),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
