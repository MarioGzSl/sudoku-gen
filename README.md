# sudoku-easy-solver

**From a blank grid to a playable puzzle, an explained hint, or a printable image.**

A TypeScript Sudoku toolkit for **unique puzzle generation**, fast solving, candidates,
solution analysis and SVG/PNG rendering. The core has **no runtime dependencies** and
ships CommonJS, ESM and TypeScript declarations.

| A puzzle to play | An answer sheet to share |
| :---: | :---: |
| [![Sudoku puzzle rendered as a PNG with the paper theme](https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/puzzle.png)](https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/puzzle.png) | [![Solved Sudoku rendered as a PNG with the midnight theme and mint answer digits](https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/solution.png)](https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/solution.png) |
| Warm paper, clear clues, room to think. | Original clues in white; solved digits in mint. |

Actual **1200 × 1200 PNG exports** from the same puzzle. Click either image to open
the full resolution file. Create your own with the [image export example](#export-beautiful-svg-and-png-images).

[Quick start](#your-first-puzzle) ·
[Hints](#candidates-and-useful-hints) ·
[Game state](#a-game-with-protected-clues-and-undo) ·
[API reference](https://github.com/MarioGzSl/sudoku-gen/blob/main/docs/API.md) ·
[Image export](https://github.com/MarioGzSl/sudoku-gen/blob/main/docs/IMAGES.md) ·
[Examples](https://github.com/MarioGzSl/sudoku-gen/tree/main/examples) ·
[Español](https://github.com/MarioGzSl/sudoku-gen/blob/main/docs/ES.md)

## Install

```sh
npm install sudoku-easy-solver
```

Node.js 22 or newer is supported. The core ESM module also works in modern browsers.
PNG export and the asynchronous worker helper are optional Node-only entry points.

## What can I build?

| Build | Use |
| --- | --- |
| A daily puzzle | `generateDetailed({ seed: 'daily-42', symmetry: 'rotational' })` |
| A solver or puzzle checker | `solveGrid()`, `analyze()`, `countSolutions()` |
| An interactive game | `SudokuGame`, candidates, protected clues, undo/redo |
| A hint button | `getHint()` with technique, explanation and related cells |
| A printable puzzle or answer sheet | `renderSudokuSvg()` or `renderSudokuPng()` |
| A puzzle importer | `parseGrid()` / `stringifyGrid()` and `Sudoku.fromString()` |

## Your first puzzle

```ts
import { Sudoku, SudokuDifficulty } from 'sudoku-easy-solver';

const sudoku = new Sudoku();
sudoku.generate({
  difficulty: SudokuDifficulty.MEDIUM,
  seed: 'my-first-puzzle',
  symmetry: 'rotational',
});

console.log(sudoku.prettyPrint());
console.log(sudoku.analyze().status); // 'unique'

const hint = sudoku.getHint({ explain: true });
if (hint) {
  console.log(hint.explanation);
  sudoku.placeNumber(hint.position, hint.value);
}
```

`getHint()` never changes the board. Positions use zero-based `row` and `col` indexes.
Grid values are integers: `0` is empty, `1`–`9` are digits.

## Solve and analyze without changing the input

```ts
import { parseGrid, solveGrid, analyze } from 'sudoku-easy-solver';

const grid = parseGrid(`
  530070000
  600195000
  098000060
  800060003
  400803001
  700020006
  060000280
  000419005
  000080079
`);

const result = analyze(grid);
// status: 'invalid' | 'unsolvable' | 'unique' | 'multiple' | 'limit-exceeded'
const solution = solveGrid(grid); // a new grid, or null if no solution exists
```

Need a mutable board instead? `new Sudoku(grid).solve()` fills that instance on success.
Use `getGrid()` to retrieve a defensive copy.

## Candidates and useful hints

```ts
import { getCandidates, getHint } from 'sudoku-easy-solver';

const candidates = getCandidates(grid, { row: 0, col: 2 }); // [1, 2, 4]
const hint = getHint(grid, { allowGuess: false });
// A naked/hidden single with an explanation, or null when neither is available.
```

Hints identify their technique: `naked-single`, `hidden-single`, or `solution`.
A `solution` hint reveals a value from **one valid completion**; on an ambiguous puzzle
it is not necessarily forced. Set `allowGuess: false` to disable these reveals.

## A game with protected clues and undo

```ts
import { SudokuGame } from 'sudoku-easy-solver';

const game = new SudokuGame(grid);
const hint = game.getHint();
if (hint) game.placeNumber(hint.position, hint.value);
game.undo();
game.redo();

const saved = game.serialize();
const restored = SudokuGame.deserialize(saved);
```

`SudokuGame` protects the original clues and keeps up to 100 undo steps. Saved games
include the original and current board; undo/redo history is not serialized.

## Export beautiful SVG and PNG images

Choose **paper** for a warm printable board, **midnight** for dark backgrounds,
or **minimal** for monochrome output. Add titles, color the solution, or turn a
logical hint into an illustrated next step.

<p align="center">
  <a href="https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/hint.png">
    <img src="https://raw.githubusercontent.com/MarioGzSl/sudoku-gen/670001d64f0a6e44844bae1c7da277761ea7a773/docs/assets/hint.png" alt="PNG Sudoku hint: row 5, column 5 is highlighted with a 5; empty cells show candidate pencil marks" width="600">
  </a>
</p>

*A hint, explained visually: candidate pencil marks and a highlighted next move.
The preview does not change the puzzle.*

SVG works without additional packages:

```ts
import { renderSudokuSvg } from 'sudoku-easy-solver';

const svg = renderSudokuSvg(grid, {
  theme: 'paper', // also 'midnight' or 'minimal'
  size: 900,
  title: 'Daily Sudoku',
  subtitle: 'A little focus, one cell at a time.',
  showCandidates: false,
});
```

For raster PNG output in Node.js, install the optional rendering engine:

```sh
npm install @resvg/resvg-js
```

```ts
import { writeFile } from 'node:fs/promises';
import { renderSudokuPng } from 'sudoku-easy-solver/image';

await writeFile('puzzle.png', await renderSudokuPng(grid, { size: 1200 }));

if (solution) {
  await writeFile('solution.png', await renderSudokuPng(solution, {
    givens: grid, // original clues and solved digits use different colors
    title: 'The solution',
    theme: 'midnight',
  }));
}
```

Export hints, highlight cells, or show pencil marks with the same options.
[See the complete image guide](https://github.com/MarioGzSl/sudoku-gen/blob/main/docs/IMAGES.md).

The [runnable image example](https://github.com/MarioGzSl/sudoku-gen/blob/main/examples/images.mjs)
creates all three previews above as both SVG and PNG files.

## Keep your Node.js application responsive

```ts
import { solveGridAsync } from 'sudoku-easy-solver/async';

const controller = new AbortController();
const pending = solveGridAsync(grid, {
  maxNodes: 2_000_000,
  signal: controller.signal,
});
const solved = await pending;
```

This helper uses a real worker thread. Browser applications can run the core module
inside their own Web Worker. Wrapping a synchronous solve in a Promise alone does not
move computation off the main thread.

## Guarantees and limits

| Topic | Contract |
| --- | --- |
| Puzzle size | Standard 9×9 Sudoku with 3×3 boxes. No 4×4, 16×16 or variants. |
| Generated puzzles | Exactly one solution. Removal preserves this invariant. |
| Difficulty profiles | `easy`, `medium`, `hard`, `expert` target 46, 36, 29, 23 clues. They are **not human difficulty ratings**. |
| Clue target | Best effort. Uniqueness and symmetry take precedence; the result may contain more clues. Use `generateDetailed()` to inspect both counts. |
| Difficulty analysis | `rateDifficulty()` reports a documented heuristic using singles and search. It is not a calibrated expert grading system. |
| Validation | `isValid()` / `validateGrid()` check local rules. Use `analyze()` to check existence and uniqueness of a solution. |
| Moves | `placeNumber()` rejects local conflicts; it does not prove the move can be completed. |
| Counting | `countSolutions()` stops at `limit` (2 by default). A result of 2 means **at least two**. |
| Reproducibility | Identical options and seed reproduce a puzzle within this library version. No promise of identical seeds across future versions. |
| Search limits | Default 2 million nodes; generation uses 5 million total. Exhaustion throws `SearchLimitError`; `analyze()` returns `limit-exceeded`. |
| Hints | Naked singles, hidden singles and explicitly identified solution reveals. No pairs, X-Wing, chains or complete human-solving engine yet. |
| Rendering | SVG and square PNG, 256–2048 px. Digits are vector paths; optional text uses system fonts when rasterized. No JPEG/PDF output. |
| Randomness | Seeded PRNG or `Math.random()`. Not cryptographic and not uniform across all possible Sudokus. |

Malformed grid inputs throw `TypeError` in operations that require a grid.
`validateGrid()` returns `false`, while `analyze()` reports `invalid`.
Invalid move values or coordinates return `false` from `placeNumber()` and `clearCell()`.
No operation intentionally modifies a grid supplied by the caller.

## Upgrading from 1.x

Version 2 requires Node.js 22+. The existing `Sudoku` methods and difficulty enum
remain available. Malformed JavaScript inputs are rejected more strictly, hints
no longer solve imported boards as a side effect, and generation now preserves
uniqueness even when it needs more clues than the profile target. Search can throw
`SearchLimitError`; set a suitable budget or use the asynchronous worker when needed.
Import the package by name, rather than relying on internal `dist/` paths.

## License

MIT © MarioGzSl. The optional PNG engine has its own license.
