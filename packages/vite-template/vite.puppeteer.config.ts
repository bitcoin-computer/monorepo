/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Define the alias pointing to the specific entry point in node_modules
        '@bitcoin-computer/lib': path.resolve(__dirname, '../lib/dist/bc-lib.browser.min.mjs'),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT),
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"
      }
    },
    test: {
      include: ['tests/**/*.test.ts'],
      environment: 'node',
      testTimeout: 30000,
    },
  }
})
