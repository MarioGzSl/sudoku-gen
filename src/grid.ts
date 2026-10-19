import type { Position, ReadonlyGrid, SudokuGrid } from "./types.js";
export const emptyGrid = (): SudokuGrid =>
  Array.from({ length: 9 }, () => Array<number>(9).fill(0));
export const copyGrid = (grid: ReadonlyGrid): SudokuGrid =>
  grid.map((row) => [...row]);
export const positionOf = (index: number): Position => ({
  row: Math.floor(index / 9),
  col: index % 9,
});
export const boxOf = (row: number, col: number): number =>
  Math.floor(row / 3) * 3 + Math.floor(col / 3);
export function validPosition(position: unknown): position is Position {
  if (!position || typeof position !== "object") return false;
  const { row, col } = position as Position;
  return (
    Number.isInteger(row) &&
    row >= 0 &&
    row < 9 &&
    Number.isInteger(col) &&
    col >= 0 &&
    col < 9
  );
}
export function hasGridShape(grid: unknown): grid is SudokuGrid {
  if (!Array.isArray(grid) || grid.length !== 9) return false;
  // Indexed reads reject sparse arrays, which Array.every would skip.
  for (let r = 0; r < 9; r++) {
    if (!Array.isArray(grid[r]) || grid[r].length !== 9) return false;
    for (let c = 0; c < 9; c++) {
      const value = grid[r][c];
      if (!Number.isInteger(value) || value < 0 || value > 9) return false;
    }
  }
  return true;
}
export const UNITS: number[][] = [
  ...Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => r * 9 + c),
  ),
  ...Array.from({ length: 9 }, (_, c) =>
    Array.from({ length: 9 }, (_, r) => r * 9 + c),
  ),
  ...Array.from({ length: 9 }, (_, b) =>
    Array.from(
      { length: 9 },
      (_, i) =>
        (Math.floor(b / 3) * 3 + Math.floor(i / 3)) * 9 + (b % 3) * 3 + (i % 3),
    ),
  ),
];
/** All duplicate cells, once each, in row-major order. Never writes to input. */
export function getConflicts(grid: ReadonlyGrid): Position[] {
  if (!hasGridShape(grid))
    throw new TypeError("Expected a 9×9 grid of integers from 0 to 9");
  const conflicts = new Set<number>();
  for (const unit of UNITS) {
    const seen = new Map<number, number>();
    for (const index of unit) {
      const { row, col } = positionOf(index),
        value = grid[row][col];
      if (value === 0) continue;
      const previous = seen.get(value);
      if (previous !== undefined) {
        conflicts.add(previous);
        conflicts.add(index);
      } else seen.set(value, index);
    }
  }
  return [...conflicts].sort((a, b) => a - b).map(positionOf);
}
/** Local consistency only. A valid grid can still have no solution. */
export function validateGrid(grid: unknown): grid is SudokuGrid {
  return hasGridShape(grid) && getConflicts(grid).length === 0;
}
export function assertGrid(grid: unknown): asserts grid is SudokuGrid {
  if (!validateGrid(grid)) throw new TypeError("Invalid Sudoku grid");
}
export function candidatesUnchecked(
  grid: ReadonlyGrid,
  row: number,
  col: number,
): number[] {
  if (grid[row][col] !== 0) return [];
  let used = 0;
  for (let i = 0; i < 9; i++) {
    used |= (1 << grid[row][i]) | (1 << grid[i][col]);
    used |=
      1 <<
      grid[Math.floor(row / 3) * 3 + Math.floor(i / 3)][
        Math.floor(col / 3) * 3 + (i % 3)
      ];
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => !(used & (1 << value)));
}
export function getCandidates(
  grid: ReadonlyGrid,
  position: Position,
): number[] {
  assertGrid(grid);
  if (!validPosition(position))
    throw new RangeError(
      "Position must use integer row/col indexes from 0 to 8",
    );
  return candidatesUnchecked(grid, position.row, position.col);
}
/** Exactly 81 digits/dots after removing whitespace; other punctuation is rejected. */
export function parseGrid(text: string): SudokuGrid {
  if (typeof text !== "string")
    throw new TypeError("Sudoku text must be a string");
  const compact = text.replace(/\s/g, "");
  if (!/^[0-9.]{81}$/.test(compact))
    throw new TypeError(
      "Expected exactly 81 digits or dots (whitespace is allowed)",
    );
  const grid = Array.from({ length: 9 }, (_, r) =>
    [...compact.slice(r * 9, r * 9 + 9)].map((c) =>
      c === "." ? 0 : Number(c),
    ),
  );
  assertGrid(grid);
  return grid;
}
export function stringifyGrid(
  grid: ReadonlyGrid,
  empty: "0" | "." = "0",
): string {
  assertGrid(grid);
  if (empty !== "0" && empty !== ".")
    throw new TypeError("Empty cell marker must be 0 or .");
  return grid
    .flat()
    .map((value) => (value === 0 ? empty : String(value)))
    .join("");
}
