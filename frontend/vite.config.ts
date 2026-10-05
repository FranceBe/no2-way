/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
import path from 'node:path'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname = import.meta.dirname

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [react()],
    test: {
        // Applies to `vitest run --project unit --coverage` (npm run coverage)
        coverage: {
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.{test,stories}.{ts,tsx}',
                'src/mocks/**',
                'src/test/**',
                'src/main.tsx',
                'src/env.d.ts',
            ],
            // Checked by the pre-commit hook: the run fails below these.
            // Set just under the current numbers; raise them as tests are added
            thresholds: {
                statements: 85,
                branches: 80,
                functions: 70,
                lines: 85,
            },
        },
        projects: [
            {
                // Unit tests: *.test.ts(x) files, run in jsdom
                extends: true,
                test: {
                    name: 'unit',
                    include: ['src/**/*.test.{ts,tsx}'],
                    environment: 'jsdom',
                    setupFiles: ['src/test/setup.ts'],
                    // Fake API origin: requests to it are intercepted by MSW in tests
                    env: {
                        VITE_API_URL: 'http://api.test',
                        VITE_USE_MOCKS: 'false',
                    },
                },
            },
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                    },
                },
            },
        ],
    },
})
