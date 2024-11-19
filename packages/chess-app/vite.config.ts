/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import fs from "fs"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  const primaryPath = path.resolve(
    __dirname,
    "./node_modules/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs"
  )
  const pathInWorkspace = path.resolve(__dirname, "../lib/dist/bc-lib.browser.min.mjs")
  const filePath = fs.existsSync(primaryPath) ? primaryPath : pathInWorkspace

  console.log(filePath) // This will log the path based on the file's existence.

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Define the alias pointing to the specific entry point in node_modules
        "@bitcoin-computer/lib": path.resolve(__dirname, filePath)
      }
    },
    server: {
      port: parseInt(env.VITE_PORT)
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      testTimeout: 20000
    }
  }
})
