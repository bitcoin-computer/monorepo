/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config'
import baseConfig from './vite.config'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load the base Vite configuration
  const base = baseConfig({ mode, command: 'serve' })

  return {
    ...base,
    test: {
      globals: true,
      include: ['src/**/*.test.tsx'],
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      alias: {
        // Define the alias pointing to the specific entry point in node_modules
        '@bitcoin-computer/lib': path.resolve(__dirname, '../lib/dist/bc-lib.browser.min.mjs'),
      },
    },
  }
})
