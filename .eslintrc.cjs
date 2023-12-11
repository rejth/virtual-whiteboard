module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'plugin:svelte/prettier',
  ],
  ignorePatterns: ['!**/*', 'vite.config.ts', './node_modules/**', './src/**/*.cjs'],
  overrides: [
    {
      files: ['*.ts', '*.js', '*.svelte'],
      rules: {
        'no-underscore-dangle': 'off',
        'no-await-in-loop': 'off',
        'no-plusplus': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/prefer-default-export': 'off',
        'linebreak-style': ['error', 'unix'],
      },
    },
    {
      files: ['*.ts'],
      rules: {},
    },
    {
      files: ['*.js'],
      rules: {},
    },
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
};
