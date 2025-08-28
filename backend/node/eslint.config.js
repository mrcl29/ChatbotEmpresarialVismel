import js from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier'

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setInterval: 'readonly', // Asegúrate de que ESLint reconozca setInterval como global
        setTimeout: 'readonly', // También puedes agregar setTimeout si es necesario
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      semi: ['error', 'never'], // Configura ESLint para no usar punto y coma
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
      'prettier/prettier': ['error', { semi: false }], // Asegura que Prettier no use punto y coma
    },
  },
]
