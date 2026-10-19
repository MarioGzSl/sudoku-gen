import { copyGrid, emptyGrid } from "./grid.js";
import { checkOptions, search, SearchLimitError, shuffle } from "./engine.js";
import {
  SudokuDifficulty,
  type GenerateOptions,
  type SudokuGrid,
} from "./types.js";
export interface GeneratedPuzzle {
  grid: SudokuGrid;
  solution: SudokuGrid;
  clues: number;
  targetClues: number;
  profile: SudokuDifficulty;
  symmetry: "none" | "rotational";
}
function randomSource(seed: string | number | undefined): () => number {
  if (seed === undefined) return Math.random;
  if (
    typeof seed !== "string" &&
    (typeof seed !== "number" || !Number.isFinite(seed))
  )
    throw new TypeError("seed must be a finite number or string");
  let state = 2166136261;
  for (const char of `${typeof seed}:${seed}`)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
/** Unique puzzles. The clue target is best-effort; uniqueness and symmetry take precedence. */
export function generateDetailed(
  options: GenerateOptions = {},
): GeneratedPuzzle {
  checkOptions(options);
  const profile = options.difficulty ?? SudokuDifficulty.MEDIUM;
  if (!Object.values(SudokuDifficulty).includes(profile))
    throw new TypeError("Unknown Sudoku difficulty profile");
  const symmetry = options.symmetry ?? "none";
  if (symmetry !== "none" && symmetry !== "rotational")
    throw new TypeError("symmetry must be none or rotational");
  const attempts = options.maxAttempts ?? 3;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 50)
    throw new RangeError("maxAttempts must be an integer from 1 to 50");
  const targets = { easy: 46, medium: 36, hard: 29, expert: 23 },
    targetClues = targets[profile];
  const random = randomSource(options.seed),
    maxNodes = options.maxNodes ?? 5_000_000;
  let remaining = maxNodes,
    best: GeneratedPuzzle | undefined;
  const run = (grid: SudokuGrid, limit: number, randomized = false) => {
    if (remaining <= 0) throw new SearchLimitError(maxNodes);
    try {
      const result = search(
        grid,
        limit,
        { maxNodes: remaining, signal: options.signal },
        randomized ? random : undefined,
      );
      remaining -= result.stats.nodes;
      return result;
    } catch (error) {
      if (error instanceof SearchLimitError)
        throw new SearchLimitError(maxNodes);
      throw error;
    }
  };
  for (let attempt = 0; attempt < attempts; attempt++) {
    const solution = run(emptyGrid(), 1, true).solution!;
    const grid = copyGrid(solution);
    const groups =
      symmetry === "rotational"
        ? Array.from({ length: 41 }, (_, i) => (i === 40 ? [40] : [i, 80 - i]))
        : Array.from({ length: 81 }, (_, i) => [i]);
    shuffle(groups, random);
    let clues = 81;
    for (const group of groups) {
      if (clues - group.length < targetClues) continue;
      const saved = group.map((i) => grid[Math.floor(i / 9)][i % 9]);
      group.forEach((i) => {
        grid[Math.floor(i / 9)][i % 9] = 0;
      });
      if (run(grid, 2).count === 1) clues -= group.length;
      else
        group.forEach((i, n) => {
          grid[Math.floor(i / 9)][i % 9] = saved[n];
        });
    }
    if (!best || clues < best.clues)
      best = { grid, solution, clues, targetClues, profile, symmetry };
    if (clues === targetClues) break;
  }
  return best!;
}
export function generatePuzzle(options: GenerateOptions = {}): SudokuGrid {
  return generateDetailed(options).grid;
}
