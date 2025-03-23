/**
 * The difficulty level of a Sudoku puzzle
 */
export enum SudokuDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

/**
 * Represents a Sudoku grid (9x9)
 * 0 represents an empty cell
 * 1-9 represent filled cells
 */
export type SudokuGrid = number[][];

/**
 * Cell position in the grid
 */
export interface Position {
  row: number;
  col: number;
} 