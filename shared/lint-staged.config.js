// Runs on `git commit` for staged files under shared/ (see ../.husky/pre-commit)
export default {
    '*.ts': [
        'eslint --fix --max-warnings=0 --no-warn-ignored',
        'prettier --write',
        // The contract changed: both sides must still compile against it
        () => 'tsc --noEmit',
        () => 'tsc --noEmit -p ../backend',
        () => 'tsc -b ../frontend',
    ],
}
