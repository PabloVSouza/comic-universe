const js = require('@eslint/js')
const typescript = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const prettier = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module',
        ecmaVersion: 2021,
        project: ['./tsconfig.json', './tsconfig.web.json', './tsconfig.node.json']
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'readonly',
        JSX: 'readonly',
        IComic: 'readonly',
        IChapter: 'readonly',
        IPage: 'readonly',
        IUser: 'readonly',
        IReadProgress: 'readonly',
        ISettingsOption: 'readonly',
        IRepoPluginInfo: 'readonly',
        IRepoApiPluginList: 'readonly',
        IRepoPluginRepository: 'readonly',
        IRepoPluginRepositoryConstruct: 'readonly',
        IDBRepository: 'readonly',
        IDBMethods: 'readonly',
        TOption: 'readonly',
        TWindow: 'readonly',
        TWindowProps: 'readonly',
        Lang: 'readonly',
        GenerlLang: 'readonly',
        DashboardLang: 'readonly',
        DownloadComicLang: 'readonly',
        HomeNavLang: 'readonly',
        SearchComicLang: 'readonly',
        PaginationLang: 'readonly',
        SettingsLang: 'readonly',
        UsersLang: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'prettier': prettier
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this
      'no-useless-catch': 'warn',
      'prettier/prettier': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts'
    ]
  }
]
