import {
  assertGrid,
  candidatesUnchecked,
  copyGrid,
  positionOf,
  UNITS,
} from "./grid.js";
import { checkOptions, search } from "./engine.js";
import type {
  DifficultyRating,
  Hint,
  HintOptions,
  ReadonlyGrid,
  SolveOptions,
} from "./types.js";
export function logicalHint(grid: ReadonlyGrid): Hint | null {
  const candidates = Array.from({ length: 81 }, (_, i) =>
    candidatesUnchecked(grid, Math.floor(i / 9), i % 9),
  );
  for (let index = 0; index < 81; index++) {
    if (candidates[index].length === 1) {
      const position = positionOf(index),
        value = candidates[index][0];
      const peers = new Set(
        UNITS.filter((unit) => unit.includes(index)).flat(),
      );
      peers.delete(index);
      return {
        position,
        value,
        technique: "naked-single",
        relatedCells: [...peers].sort((a, b) => a - b).map(positionOf),
        explanation: `Only ${value} can go in row ${position.row + 1}, column ${position.col + 1}: the row, column and box exclude every other digit.`,
      };
    }
  }
  for (let u = 0; u < UNITS.length; u++) {
    const unit = UNITS[u];
    for (let value = 1; value <= 9; value++) {
      const places = unit.filter((index) => candidates[index].includes(value));
      if (places.length === 1) {
        const position = positionOf(places[0]),
          label =
            u < 9
              ? `row ${u + 1}`
              : u < 18
                ? `column ${u - 8}`
                : `box ${u - 17}`;
        return {
          position,
          value,
          technique: "hidden-single",
          relatedCells: unit.filter((i) => i !== places[0]).map(positionOf),
          explanation: `Within ${label}, only row ${position.row + 1}, column ${position.col + 1} can contain ${value}.`,
        };
      }
    }
  }
  return null;
}
/** Non-mutating hint. Search reveals on ambiguous boards describe one completion, not a forced move. */
export function getHint(
  grid: ReadonlyGrid,
  options: HintOptions = {},
): Hint | null {
  assertGrid(grid);
  checkOptions(options);
  for (const flag of [options.explain, options.allowGuess])
    if (flag !== undefined && typeof flag !== "boolean")
      throw new TypeError("Hint flags must be booleans");
  const first = grid.flat().indexOf(0);
  if (first === -1) return null;
  const solution = search(grid, 1, options).solution;
  if (!solution) return null;
  const logical = logicalHint(grid);
  if (logical) return logical;
  if (options.allowGuess === false) return null;
  const position = positionOf(first),
    value = solution[position.row][position.col];
  return {
    position,
    value,
    technique: "solution",
    relatedCells: [],
    explanation: `${value} is part of one valid completion. This is a search-based reveal, not a logical deduction; other completions may exist.`,
  };
}
export function rateDifficulty(
  grid: ReadonlyGrid,
  options: SolveOptions = {},
): DifficultyRating {
  assertGrid(grid);
  const found = search(grid, 1, options),
    working = copyGrid(grid);
  const result: DifficultyRating = {
    level: "easy",
    nakedSingles: 0,
    hiddenSingles: 0,
    guesses: found.stats.guesses,
    clues: grid.flat().filter(Boolean).length,
  };
  if (!found.solution) return { ...result, level: "unsolvable" };
  for (let i = 0; i < 81; i++) {
    const hint = logicalHint(working);
    if (!hint) break;
    working[hint.position.row][hint.position.col] = hint.value;
    if (hint.technique === "naked-single") result.nakedSingles++;
    else result.hiddenSingles++;
  }
  result.level = working.flat().includes(0)
    ? result.guesses > 20
      ? "expert"
      : "hard"
    : result.hiddenSingles
      ? "medium"
      : "easy";
  return result;
}
