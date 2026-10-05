// Runs on `git commit` for staged files under frontend/ (see ../.husky/pre-commit)
export default {
    '*.{ts,tsx,js}': [
        // Fix what can be fixed, fail on any remaining error or warning
        'eslint --fix --max-warnings=0 --no-warn-ignored',
        'prettier --write',
        // Type-check the whole project once (a change can break another file)
        () => 'tsc -b',
        // Every unit test, with coverage: fails under the thresholds in vite.config.ts
        () => 'vitest run --project unit --coverage',
        () => 'vite build',
    ],
    '*.{css,json,md}': 'prettier --write',
}
