module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['svelte3', '@typescript-eslint', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['!**/*', 'vite.config.ts', './node_modules/**', './src/**/*.cjs'],
  overrides: [
    {
      files: ['*.ts', '*.js', '*.svelte'],
      rules: {
        'no-underscore-dangle': 'off',
        'no-await-in-loop': 'off',
        'no-plusplus': 'off',
        'no-restricted-syntax': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/no-var-requires': 'off',
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
      processor: 'svelte3/svelte3',
    },
  ],
  settings: {
    'svelte3/typescript': require('typescript'),
  },
};
