/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  const primaryPath = path.resolve(__dirname, "./node_modules/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs")
  const pathInWorkspace = path.resolve(__dirname, "../lib/dist/bc-lib.browser.min.mjs")
  const filePath = fs.existsSync(primaryPath) ? primaryPath : pathInWorkspace

  return {
    plugins: [react()],
    resolve: {
      alias: { "@bitcoin-computer/lib": filePath }
    },
    server: {
      port: env.VITE_PORT ? parseInt(env.VITE_PORT, 10) : 3000
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"]
    },
    optimizeDeps: {
      exclude: ["fs"],
    },
  }
})
