import {
  assertGrid,
  copyGrid,
  emptyGrid,
  getCandidates,
  getConflicts,
  parseGrid,
  stringifyGrid,
  validateGrid,
  validPosition,
} from "./grid.js";
import { analyze, countSolutions, solveGrid } from "./engine.js";
import { generatePuzzle } from "./generate.js";
import { getHint, rateDifficulty } from "./hints.js";
import {
  SudokuDifficulty,
  type ReadonlyGrid,
  type Position,
  type SudokuGrid,
  type GenerateOptions,
  type SolveOptions,
  type CountOptions,
  type Hint,
  type HintOptions,
} from "./types.js";
/** Mutable game-board convenience API. Pure equivalents are exported separately. */
export class Sudoku {
  private grid: SudokuGrid = emptyGrid();
  constructor(grid?: ReadonlyGrid) {
    if (grid !== undefined) this.setGrid(grid);
  }
  static fromString(text: string): Sudoku {
    return new Sudoku(parseGrid(text));
  }
  getGrid(): SudokuGrid {
    return copyGrid(this.grid);
  }
  setGrid(grid: ReadonlyGrid): void {
    assertGrid(grid);
    this.grid = copyGrid(grid);
  }
  toString(empty: "0" | "." = "0"): string {
    return stringifyGrid(this.grid, empty);
  }
  generate(
    difficultyOrOptions:
      | SudokuDifficulty
      | GenerateOptions = SudokuDifficulty.MEDIUM,
  ): SudokuGrid {
    const options =
      typeof difficultyOrOptions === "string"
        ? { difficulty: difficultyOrOptions }
        : difficultyOrOptions;
    const grid = generatePuzzle(options);
    this.grid = grid;
    return this.getGrid();
  }
  /** Mutates this board only when a solution is found. */
  solve(options: SolveOptions = {}): SudokuGrid | null {
    const solved = solveGrid(this.grid, options);
    if (!solved) return null;
    this.grid = solved;
    return this.getGrid();
  }
  isValid(): boolean {
    return validateGrid(this.grid);
  }
  isSolved(): boolean {
    return (
      this.isValid() &&
      this.grid.every((row) => row.every((value) => value !== 0))
    );
  }
  getCandidates(position: Position): number[] {
    return getCandidates(this.grid, position);
  }
  getConflicts(): Position[] {
    return getConflicts(this.grid);
  }
  analyze(options: SolveOptions = {}) {
    return analyze(this.grid, options);
  }
  countSolutions(options: CountOptions = {}) {
    return countSolutions(this.grid, options);
  }
  rateDifficulty(options: SolveOptions = {}) {
    return rateDifficulty(this.grid, options);
  }
  getHint(options: HintOptions & { explain: true }): Hint | null;
  getHint(options?: HintOptions): { position: Position; value: number } | null;
  getHint(
    options: HintOptions = {},
  ): Hint | { position: Position; value: number } | null {
    const hint = getHint(this.grid, options);
    return hint && !options.explain
      ? { position: hint.position, value: hint.value }
      : hint;
  }
  /** Checks local rules, not whether the move preserves solvability. */
  placeNumber(position: Position, value: number): boolean {
    if (
      !validPosition(position) ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 9
    )
      return false;
    if (!getCandidates(this.grid, position).includes(value)) return false;
    this.grid[position.row][position.col] = value;
    return true;
  }
  clearCell(position: Position): boolean {
    if (!validPosition(position)) return false;
    this.grid[position.row][position.col] = 0;
    return true;
  }
  reset(): void {
    this.grid = emptyGrid();
  }
  prettyPrint(grid: ReadonlyGrid = this.grid): string {
    assertGrid(grid);
    const border = "+-------+-------+-------+\n";
    let output = border;
    for (let r = 0; r < 9; r++) {
      output +=
        "| " +
        [0, 3, 6]
          .map((c) =>
            grid[r]
              .slice(c, c + 3)
              .map((v) => v || " ")
              .join(" "),
          )
          .join(" | ") +
        " |\n";
      if (r % 3 === 2) output += border;
    }
    return output;
  }
}
