import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            // One typescript-eslint is shared by every workspace: without this, an
            // editor linting several of them at once can't tell which root is ours
            parserOptions: { tsconfigRootDir: import.meta.dirname },
        },
    },
])
