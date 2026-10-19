# API reference

All positions are `{ row, col }`, zero-based integers 0–8. `ReadonlyGrid` accepts frozen
input. Every returned grid is independent of the caller's input. Standard Sudoku only.

## Pure functions

| Function | Result / behavior |
| --- | --- |
| `validateGrid(unknown)` | Boolean; shape, integer values 0–9, no duplicates. Does not establish solvability. |
| `getConflicts(grid)` | Every duplicate-involved cell once, sorted row-major. Accepts conflicting but structurally valid boards. |
| `getCandidates(grid, position)` | Sorted locally legal digits. Empty array for an occupied cell. Invalid position throws `RangeError`. |
| `parseGrid(text)` | Exactly 81 digits or dots after removing whitespace. Dots and zero mean empty. Other punctuation and conflicts are rejected. |
| `stringifyGrid(grid, empty = '0')` | 81 characters. `empty` can be `'0'` or `'.'`. |
| `solveGrid(grid, options?)` | First deterministic solution, or `null` if unsolvable. Does not require uniqueness. |
| `countSolutions(grid, options?)` | Saturated count, from 0 to `limit` (default 2, allowed 1–1000). |
| `analyze(grid, options?)` | Status, count capped at two, solution, conflicts and search statistics. |
| `generatePuzzle(options?)` | Unique generated puzzle. |
| `generateDetailed(options?)` | `{ grid, solution, clues, targetClues, profile, symmetry }`. |
| `getHint(grid, options?)` | Explained hint or `null`; never changes the grid. |
| `rateDifficulty(grid, options?)` | Heuristic level and counts of naked singles, hidden singles, search guesses and original clues. |
| `renderSudokuSvg(grid, options?)` | Self-contained SVG string. See [image guide](IMAGES.md). |

`solveGridAsync` is exported from `sudoku-easy-solver/async` (Node worker thread).
`renderSudokuPng` is exported from `sudoku-easy-solver/image` (optional native peer).

## Search controls

`SolveOptions`: `maxNodes?: number`, `signal?: AbortSignal`.

- `maxNodes` must be a positive safe integer. The default is 2,000,000.
- `SearchLimitError` means the result is unknown, not unsolvable.
- `analyze()` converts this error into `status: 'limit-exceeded'`, with null count/solution.
- Invalid options and an aborted signal still throw. Abort reasons propagate unchanged.
- Synchronous functions check a signal during search, but JavaScript cannot dispatch a
  new UI event while that same thread is busy. Use the Node worker helper or a browser
  Worker for interactive cancellation.
- `solveGridAsync()` rejects for validation errors, limits or cancellation. It terminates
  its worker after completion or cancellation and does not mutate the board.

Analysis states: `invalid`, `unsolvable`, `unique`, `multiple`, `limit-exceeded`.
`multiple` means at least two solutions, never an exact total. `stats` contains visited
nodes, branch points (`guesses`) and encountered dead ends (`backtracks`).

## Generation controls

```ts
const result = generateDetailed({
  difficulty: SudokuDifficulty.HARD,
  seed: 'daily-42',
  symmetry: 'rotational',
  maxAttempts: 3,
  maxNodes: 5_000_000,
});
```

Profiles target 46 / 36 / 29 / 23 clues. Generation first searches for a randomized
complete solution, then removes clues only when a second solution cannot be found.
It is not restricted to permutations of one predefined completed grid.

`maxAttempts` is 1–50 (default 3). Each attempt starts a fresh complete grid. The best
result is returned, which may have more clues than requested. `maxNodes` is a total
budget across complete-grid and uniqueness searches. If exhausted, no unverified
puzzle is returned. `Sudoku.generate()` leaves its old board unchanged on failure.

`seed` accepts a finite number or string; number `1` and string `'1'` are distinct.
Omit it to use `Math.random()`. Symmetry is `'none'` or 180-degree `'rotational'` and
refers to the pattern of blank cells, not mirrored digits.

## Hints and difficulty

An explained hint contains:

```ts
{
  position: { row: 4, col: 4 },
  value: 5,
  technique: 'naked-single',
  explanation: 'Only 5 can go ...',
  relatedCells: [/* zero-based positions supporting the deduction */],
}
```

`allowGuess: false` disables search-based reveals. In that mode `null` can mean the
board is solved, unsolvable, or simply requires techniques beyond singles. Use
`analyze()` to distinguish these situations. Hint explanations are currently English.
`getHint()` first checks that a completion exists. It never offers a cached answer
that conflicts with subsequent edits.

`rateDifficulty()` repeatedly applies naked and hidden singles. A board completed
with naked singles is `easy`; one needing hidden singles is `medium`. If singles do
not finish it, the deterministic solver's search count decides `hard` (at most 20
branch points) or `expert` (more than 20). Unsolvable input returns `unsolvable`.
This is an implementation heuristic, not a measure of human solving time or a
claim that more advanced human techniques are impossible. Already solved boards
rate as `easy`. Ambiguous boards may be rated, so check uniqueness separately.

## Mutable `Sudoku`

- `new Sudoku(grid?)`, `Sudoku.fromString(text)`.
- `getGrid()`, `setGrid(grid)`, `toString(empty?)`.
- `generate(profile)` preserves the original enum overload; `generate(options)` adds controls.
- `solve(options?)` fills this instance only on success. Failure or exceptions preserve it.
- `isValid()`, `isSolved()`, `getCandidates(position)`, `getConflicts()`.
- `analyze()`, `countSolutions()`, `rateDifficulty()` accept the corresponding options.
- `getHint()` preserves the original `{ position, value }` response.
- `getHint({ explain: true })` returns the full explained hint.
- `placeNumber(position, value)` only writes into empty cells, returning false for invalid input or conflicts.
- `clearCell(position)` clears any valid position, including original clues. Use `SudokuGame` to protect clues.
- `reset()` empties the board; `prettyPrint(grid?)` returns an ASCII representation.

## `SudokuGame`

`new SudokuGame(initial?)` protects all nonzero initial cells. It adds `isGiven()`,
`getInitialGrid()`, `undo()`, `redo()`, `serialize()` and `SudokuGame.deserialize()`.
It also exposes `getGrid()`, `isSolved()`, `getCandidates()`, `getHint()`,
`placeNumber()` and `clearCell()`.

Only successful edits enter history. Clearing an empty cell returns false. An edit
following undo discards the redo branch. History stores up to 100 moves. `reset()`
restores the initial puzzle and clears history (unlike `Sudoku.reset()`).

Serialized format is versioned JSON with `version: 1`, `initial` and `grid`. Restoration
validates both boards and rejects any changed initial clue. History is not saved.
It does not prove a restored game's moves preserve solvability; call `analyze()`.
