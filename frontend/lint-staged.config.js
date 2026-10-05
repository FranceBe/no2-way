// Runs on `git commit`, on the staged frontend files only (see .husky/pre-commit)
export default {
    '*.{ts,tsx,js}': [
        // Fix what can be fixed, fail on any remaining error or warning
        'eslint --fix --max-warnings=0 --no-warn-ignored',
        // Type-check the whole project once (a change can break another file)
        () => 'tsc -b',
        // Unit tests that import one of the staged files, directly or not
        (files) =>
            `vitest related --run --project unit --passWithNoTests ${files.join(' ')}`,
    ],
}
