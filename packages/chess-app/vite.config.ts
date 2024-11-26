/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from "vite"
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react()],
    resolve: {
      alias: { 
        "@bitcoin-computer/lib": path.resolve(__dirname, "../lib/dist/bc-lib.browser.min.mjs"),
        buffer: 'buffer'
      }
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
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
          }),
        ],
      },
    },
  }
})
