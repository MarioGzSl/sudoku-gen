/** Generation profiles are clue-density targets, not calibrated human difficulty. */
export enum SudokuDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}
export type SudokuGrid = number[][];
export type ReadonlyGrid = readonly (readonly number[])[];
export interface Position {
  row: number;
  col: number;
}
export interface SolveOptions {
  /** Maximum visited nodes; default 2,000,000. Throws SearchLimitError on exhaustion. */
  maxNodes?: number;
  /** Checked during search. Use a Worker for interactive cancellation. */
  signal?: AbortSignal;
}
export interface CountOptions extends SolveOptions {
  /** Saturation limit; default 2. */ limit?: number;
}
export interface SearchStats {
  nodes: number;
  guesses: number;
  backtracks: number;
}
export interface Analysis {
  status: "invalid" | "unsolvable" | "unique" | "multiple" | "limit-exceeded";
  solutionCount: number | null;
  solution: SudokuGrid | null;
  conflicts: Position[];
  stats: SearchStats;
}
export interface GenerateOptions extends SolveOptions {
  difficulty?: SudokuDifficulty;
  seed?: string | number;
  symmetry?: "none" | "rotational";
  /** Complete-grid attempts, 1–50. Default 3. */ maxAttempts?: number;
}
export interface Hint {
  position: Position;
  value: number;
  technique: "naked-single" | "hidden-single" | "solution";
  explanation: string;
  relatedCells: Position[];
}
export interface HintOptions extends SolveOptions {
  explain?: boolean;
  /** Default true; false permits only logical singles, never a search-based reveal. */
  allowGuess?: boolean;
}
export interface DifficultyRating {
  /** Heuristic, not a human difficulty guarantee. */
  level: "easy" | "medium" | "hard" | "expert" | "unsolvable";
  nakedSingles: number;
  hiddenSingles: number;
  guesses: number;
  clues: number;
}
export interface GameState {
  version: 1;
  initial: SudokuGrid;
  grid: SudokuGrid;
}
