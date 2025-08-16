// Minimal flat config for ESLint v9 in packages/node
export default [
  {
    files: ['**/*.{js,cjs,mjs}'],
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
    languageOptions: { ecmaVersion: 2021, sourceType: 'module' },
    rules: {},
  },
];
