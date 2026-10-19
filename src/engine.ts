import {
  assertGrid,
  boxOf,
  hasGridShape,
  getConflicts,
  positionOf,
  UNITS,
} from "./grid.js";
import type {
  Analysis,
  CountOptions,
  ReadonlyGrid,
  SearchStats,
  SolveOptions,
  SudokuGrid,
} from "./types.js";
export class SearchLimitError extends Error {
  constructor(public readonly maxNodes: number) {
    super(`Sudoku search exceeded ${maxNodes} nodes`);
    this.name = "SearchLimitError";
  }
}
export function checkOptions(options: SolveOptions): number {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object");
  const max = options.maxNodes ?? 2_000_000;
  if (!Number.isSafeInteger(max) || max < 1)
    throw new RangeError("maxNodes must be a positive safe integer");
  if (
    options.signal !== undefined &&
    (typeof options.signal?.aborted !== "boolean" ||
      typeof options.signal?.throwIfAborted !== "function" ||
      typeof options.signal?.addEventListener !== "function" ||
      typeof options.signal?.removeEventListener !== "function")
  )
    throw new TypeError("signal must be an AbortSignal");
  options.signal?.throwIfAborted();
  return max;
}
export interface SearchResult {
  count: number;
  solution: SudokuGrid | null;
  stats: SearchStats;
}
/** Minimum-remaining-values search with bitmasks and a saturated solution count. */
export function search(
  grid: ReadonlyGrid,
  limit: number,
  options: SolveOptions = {},
  random?: () => number,
): SearchResult {
  assertGrid(grid);
  const maxNodes = checkOptions(options);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000)
    throw new RangeError("limit must be an integer from 1 to 1000");
  const cells = grid.flat(),
    rows = Array<number>(9).fill(0),
    cols = Array<number>(9).fill(0),
    boxes = Array<number>(9).fill(0);
  const result: SearchResult = {
    count: 0,
    solution: null,
    stats: { nodes: 0, guesses: 0, backtracks: 0 },
  };
  for (let index = 0; index < 81; index++) {
    const { row, col } = positionOf(index),
      bit = cells[index] ? 1 << cells[index] : 0;
    rows[row] |= bit;
    cols[col] |= bit;
    boxes[boxOf(row, col)] |= bit;
  }
  function visit(): void {
    options.signal?.throwIfAborted();
    if (++result.stats.nodes > maxNodes) throw new SearchLimitError(maxNodes);
    let best = -1,
      mask = 0,
      size = 10;
    const candidateMasks = Array<number>(81).fill(0);
    for (let index = 0; index < 81; index++) {
      if (cells[index]) continue;
      const { row, col } = positionOf(index);
      const choices = 1022 & ~(rows[row] | cols[col] | boxes[boxOf(row, col)]);
      candidateMasks[index] = choices;
      let count = 0;
      for (let bits = choices; bits; bits &= bits - 1) count++;
      if (count === 0) {
        result.stats.backtracks++;
        return;
      }
      if (count < size) {
        best = index;
        mask = choices;
        size = count;
        if (count === 1) break;
      }
    }
    if (best !== -1 && size > 1) {
      // No naked singles remain. Propagate hidden singles and detect impossible units.
      outer: for (const unit of UNITS) {
        let present = 0;
        for (const index of unit) present |= 1 << cells[index];
        for (let value = 1; value <= 9; value++) {
          const bit = 1 << value;
          if (present & bit) continue;
          let location = -1,
            matches = 0;
          for (const index of unit)
            if (candidateMasks[index] & bit) {
              location = index;
              matches++;
            }
          if (matches === 0) {
            result.stats.backtracks++;
            return;
          }
          if (matches === 1) {
            best = location;
            mask = bit;
            size = 1;
            break outer;
          }
        }
      }
    }
    if (best === -1) {
      result.count++;
      result.solution ??= Array.from({ length: 9 }, (_, row) =>
        cells.slice(row * 9, row * 9 + 9),
      );
      return;
    }
    const { row, col } = positionOf(best),
      box = boxOf(row, col);
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (value) => mask & (1 << value),
    );
    if (random) shuffle(values, random);
    if (size > 1) result.stats.guesses++;
    for (const value of values) {
      const bit = 1 << value;
      cells[best] = value;
      rows[row] |= bit;
      cols[col] |= bit;
      boxes[box] |= bit;
      visit();
      cells[best] = 0;
      rows[row] ^= bit;
      cols[col] ^= bit;
      boxes[box] ^= bit;
      if (result.count >= limit) return;
    }
  }
  visit();
  return result;
}
export function shuffle<T>(values: T[], random: () => number): void {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
}
/** Pure solver; null means unsolvable. Resource exhaustion throws, never returns null. */
export function solveGrid(
  grid: ReadonlyGrid,
  options: SolveOptions = {},
): SudokuGrid | null {
  return search(grid, 1, options).solution;
}
export function countSolutions(
  grid: ReadonlyGrid,
  options: CountOptions = {},
): number {
  checkOptions(options);
  return search(grid, options.limit ?? 2, options).count;
}
export function analyze(grid: unknown, options: SolveOptions = {}): Analysis {
  checkOptions(options);
  const empty: Analysis = {
    status: "invalid",
    solutionCount: null,
    solution: null,
    conflicts: [],
    stats: { nodes: 0, guesses: 0, backtracks: 0 },
  };
  if (!hasGridShape(grid)) return empty;
  const conflicts = getConflicts(grid);
  if (conflicts.length) return { ...empty, conflicts };
  try {
    const result = search(grid, 2, options);
    return {
      status:
        result.count === 0
          ? "unsolvable"
          : result.count === 1
            ? "unique"
            : "multiple",
      solutionCount: result.count,
      solution: result.solution,
      conflicts,
      stats: result.stats,
    };
  } catch (error) {
    if (!(error instanceof SearchLimitError)) throw error;
    return {
      ...empty,
      status: "limit-exceeded",
      stats: { ...empty.stats, nodes: error.maxNodes },
    };
  }
}
