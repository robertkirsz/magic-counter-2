// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  [
    globalIgnores(['dist', 'src/components/ui']),
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser
      },
      rules: {
        // Disable overly strict React Compiler rules that conflict with common patterns
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/purity': 'off',
        'react-hooks/refs': 'off'
      }
    },
    {
      files: ['cypress/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off'
      }
    },
    {
      files: ['tailwind.config.js'],
      languageOptions: {
        globals: {
          ...globals.node,
          module: 'readonly',
          require: 'readonly',
          exports: 'readonly'
        }
      }
    }
  ],
  storybook.configs['flat/recommended']
)
