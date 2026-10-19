import { Sudoku } from "./Sudoku.js";
import { assertGrid, copyGrid, emptyGrid, validPosition } from "./grid.js";
import { getHint } from "./hints.js";
import type {
  GameState,
  HintOptions,
  Position,
  ReadonlyGrid,
  SudokuGrid,
} from "./types.js";
/** Optional game state with protected clues and bounded undo/redo (100 moves). */
export class SudokuGame {
  private initial: SudokuGrid;
  private board: Sudoku;
  private past: SudokuGrid[] = [];
  private future: SudokuGrid[] = [];
  constructor(initial: ReadonlyGrid = emptyGrid()) {
    assertGrid(initial);
    this.initial = copyGrid(initial);
    this.board = new Sudoku(initial);
  }
  getGrid(): SudokuGrid {
    return this.board.getGrid();
  }
  getInitialGrid(): SudokuGrid {
    return copyGrid(this.initial);
  }
  isGiven(position: Position): boolean {
    return (
      validPosition(position) && this.initial[position.row][position.col] !== 0
    );
  }
  isSolved(): boolean {
    return this.board.isSolved();
  }
  getCandidates(position: Position): number[] {
    return this.board.getCandidates(position);
  }
  getHint(options: HintOptions = {}) {
    return getHint(this.board.getGrid(), options);
  }
  private remember(before: SudokuGrid): void {
    this.past.push(before);
    if (this.past.length > 100) this.past.shift();
    this.future = [];
  }
  placeNumber(position: Position, value: number): boolean {
    if (this.isGiven(position)) return false;
    const before = this.getGrid();
    if (!this.board.placeNumber(position, value)) return false;
    this.remember(before);
    return true;
  }
  clearCell(position: Position): boolean {
    if (
      !validPosition(position) ||
      this.isGiven(position) ||
      this.getGrid()[position.row][position.col] === 0
    )
      return false;
    const before = this.getGrid();
    this.board.clearCell(position);
    this.remember(before);
    return true;
  }
  undo(): boolean {
    const previous = this.past.pop();
    if (!previous) return false;
    this.future.push(this.getGrid());
    this.board.setGrid(previous);
    return true;
  }
  redo(): boolean {
    const next = this.future.pop();
    if (!next) return false;
    this.past.push(this.getGrid());
    this.board.setGrid(next);
    return true;
  }
  reset(): void {
    this.board.setGrid(this.initial);
    this.past = [];
    this.future = [];
  }
  serialize(): string {
    return JSON.stringify({
      version: 1,
      initial: this.initial,
      grid: this.getGrid(),
    } satisfies GameState);
  }
  /** Restores clues and board; history is intentionally not serialized. */
  static deserialize(text: string): SudokuGame {
    if (typeof text !== "string" || text.length > 10000)
      throw new TypeError("Invalid serialized game");
    let state: GameState;
    try {
      state = JSON.parse(text);
    } catch {
      throw new TypeError("Invalid serialized game JSON");
    }
    if (!state || state.version !== 1)
      throw new TypeError("Unsupported game state version");
    assertGrid(state.initial);
    assertGrid(state.grid);
    if (
      state.initial.some((row, r) =>
        row.some((v, c) => v !== 0 && v !== state.grid[r][c]),
      )
    )
      throw new TypeError("Saved board changes an initial clue");
    const game = new SudokuGame(state.initial);
    game.board.setGrid(state.grid);
    return game;
  }
}
