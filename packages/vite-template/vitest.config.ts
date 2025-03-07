/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config'
import baseConfig from './vite.config'
import path from 'path'
import fs from 'fs'

function getAliasPath() {
  const monorepoPath = path.resolve(__dirname, '../lib/dist/bc-lib.browser.min.mjs')
  const standalonePath = path.resolve(
    __dirname,
    './node_modules/@bitcoin-computer/lib/dist/bc-lib.browser.min.mjs',
  )
  return fs.existsSync(monorepoPath) ? monorepoPath : standalonePath
}

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
        '@bitcoin-computer/lib': getAliasPath(),
      },
    },
  }
})
