import { defineConfig } from 'vitest/config'
import path from 'path'

// The package and the repo root each install React. Point both at one copy or render tests throw.
const react = path.resolve(__dirname, '../../node_modules/react')
const reactDom = path.resolve(__dirname, '../../node_modules/react-dom')

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react$/, replacement: react },
      { find: /^react\/jsx-runtime$/, replacement: path.join(react, 'jsx-runtime') },
      { find: /^react\/jsx-dev-runtime$/, replacement: path.join(react, 'jsx-dev-runtime') },
      { find: /^react-dom$/, replacement: reactDom },
      { find: /^react-dom\/client$/, replacement: path.join(reactDom, 'client') },
    ],
  },
})
