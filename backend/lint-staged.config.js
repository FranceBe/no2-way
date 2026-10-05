// Runs on `git commit` for staged files under backend/ (see ../.husky/pre-commit)
export default {
  "*.ts": [
    // Fix what can be fixed, fail on any remaining error or warning
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    // Type-check the whole project once (a change can break another file)
    () => "tsc --noEmit",
    // Every test, with coverage: fails under the thresholds in vitest.config.ts
    () => "vitest run --coverage",
    // The Lambda bundles must still build
    () => "npm run build",
  ],
};
