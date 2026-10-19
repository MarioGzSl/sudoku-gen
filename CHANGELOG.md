# Changelog

## 2.0.0

- Guarantee unique generated puzzles, with reproducible seeds, optional rotational symmetry and explicit clue targets.
- Replace row-major backtracking with bounded MRV search and singles propagation. Add pure solving, saturated counting, analysis, candidates and conflicts.
- Fix imported-board hints mutating the puzzle and stale cached answers after edits; add explained logical hints and a documented difficulty heuristic.
- Reject malformed grids, non-integer values and invalid coordinates without mutating caller input.
- Add SudokuGame with protected clues, bounded undo/redo and validated save/restore.
- Add SVG rendering and optional PNG rasterization, with three themes, candidates, hints and solution accents.
- Add Node worker solving with cancellation, CommonJS/ESM exports and TypeScript declarations.
- Replace vulnerable legacy test dependencies, add regression/corpus/generation/package tests, executable examples and API guides.
- Include the MIT license. Keep maintainer documentation outside the npm package.

Compatibility notes: Node.js 22+ is now the supported runtime. Existing Sudoku methods remain, but malformed JavaScript inputs are rejected more strictly. Generated clue counts may exceed their targets to preserve uniqueness; difficulty names describe clue profiles rather than human ratings. Search has explicit resource limits and can throw SearchLimitError.

## 1.0.1

- Link the npm package to its GitHub repository, documentation and issue tracker.
- Replace the legacy token-based publication workflow with npm Trusted Publishing.
- Check published versions in npm so multi-commit pushes and retries are handled correctly.
- Update CI to supported Node.js versions and validate the release checks.
- Generate puzzles from randomized valid solutions instead of potentially unsolvable random clues, preventing generation and tests from stalling.
