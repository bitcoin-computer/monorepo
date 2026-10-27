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

  // The app and @bitcoin-computer/components each install React. Tests need one copy.
  const react = path.resolve(__dirname, '../../node_modules/react')
  const reactDom = path.resolve(__dirname, '../../node_modules/react-dom')

  return {
    ...base,
    resolve: {
      ...base.resolve,
      alias: [
        { find: '@bitcoin-computer/lib', replacement: getAliasPath() },
        { find: /^react$/, replacement: react },
        { find: /^react\/jsx-runtime$/, replacement: path.join(react, 'jsx-runtime') },
        { find: /^react\/jsx-dev-runtime$/, replacement: path.join(react, 'jsx-dev-runtime') },
        { find: /^react-dom$/, replacement: reactDom },
        { find: /^react-dom\/client$/, replacement: path.join(reactDom, 'client') },
      ],
    },
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
