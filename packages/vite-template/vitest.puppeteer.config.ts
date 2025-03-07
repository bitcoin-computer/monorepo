/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config'
import baseConfig from './vite.config'

// Extend the core Vite configuration with Puppeteer-specific test settings
export default defineConfig(({ mode }) => {
  // Load the base Vite configuration
  const base = baseConfig({ mode, command: 'serve' })

  return {
    ...base,
    test: {
      include: ['tests/**/*.test.ts'],
      environment: 'node',
      testTimeout: 30000,
    },
  }
})
