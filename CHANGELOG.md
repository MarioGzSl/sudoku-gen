# Changelog

## 1.0.1

- Link the npm package to its GitHub repository, documentation and issue tracker.
- Replace the legacy token-based publication workflow with npm Trusted Publishing.
- Check published versions in npm so multi-commit pushes and retries are handled correctly.
- Update CI to supported Node.js versions and validate the release checks.
- Generate puzzles from randomized valid solutions instead of potentially unsolvable random clues, preventing generation and tests from stalling.
