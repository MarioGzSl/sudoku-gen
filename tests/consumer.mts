import {
  Sudoku,
  SudokuDifficulty,
  SudokuGame,
  generateDetailed,
  solveGrid,
  countSolutions,
  analyze,
  getHint,
  getCandidates,
  getConflicts,
  renderSudokuSvg,
  parseGrid,
  stringifyGrid,
  type ReadonlyGrid,
  type Hint,
} from "sudoku-easy-solver";
import { renderSudokuPng } from "sudoku-easy-solver/image";
import { solveGridAsync } from "sudoku-easy-solver/async";
const generated = generateDetailed({
  difficulty: SudokuDifficulty.MEDIUM,
  seed: "types",
});
const frozen: ReadonlyGrid = Object.freeze(
  generated.grid.map((row) => Object.freeze(row)),
);
const board = new Sudoku(frozen);
const simple = board.getHint();
const explained: Hint | null = board.getHint({ explain: true });
const pure: Hint | null = getHint(frozen);
const game = SudokuGame.deserialize(new SudokuGame(frozen).serialize());
const solved = solveGrid(frozen);
countSolutions(frozen, { limit: 2 });
analyze(frozen);
getCandidates(frozen, { row: 0, col: 0 });
getConflicts(frozen);
renderSudokuSvg(frozen, { showCandidates: true, theme: "midnight" });
const png: Promise<Uint8Array> = renderSudokuPng(frozen);
solveGridAsync(frozen, { signal: new AbortController().signal });
parseGrid(stringifyGrid(frozen));
// @ts-expect-error grid values cannot be strings
new Sudoku([["1"]]);
// @ts-expect-error misspelled theme
renderSudokuSvg(frozen, { theme: "dark" });
// @ts-expect-error unsupported symmetry
board.generate({ symmetry: "diagonal" });
