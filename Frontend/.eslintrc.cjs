module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ['src/components/ui/*.jsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['src/pages/dashboard/edit-resume/components/form-components/*.jsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['src/pages/dashboard/edit-resume/components/preview-components/*.jsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.config.js', 'vite.config.js', 'tailwind.config.js'],
      env: { node: true },
    },
  ],
}
