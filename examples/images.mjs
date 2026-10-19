import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseGrid,
  solveGrid,
  getHint,
  renderSudokuSvg,
} from "sudoku-easy-solver";
import { renderSudokuPng } from "sudoku-easy-solver/image";
const output = process.env.SUDOKU_OUTPUT_DIR || "sudoku-images";
await mkdir(output, { recursive: true });
const grid = parseGrid(
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
);
const solution = solveGrid(grid);
const hint = getHint(grid, { allowGuess: false });
for (const [name, board, options] of [
  [
    "puzzle",
    grid,
    {
      title: "A moment of focus",
      subtitle: "A unique Sudoku, ready to solve.",
      theme: "paper",
    },
  ],
  [
    "solution",
    solution,
    {
      title: "The complete picture",
      subtitle: "Original clues in white. Answers in mint.",
      theme: "midnight",
      givens: grid,
    },
  ],
  [
    "hint",
    grid,
    {
      title: "One step forward",
      subtitle: hint.explanation,
      theme: "paper",
      hint,
      showCandidates: true,
    },
  ],
]) {
  const opts = { ...options, size: 1200 };
  // Long explanations belong alongside the image; keep its caption concise.
  if (opts.subtitle.length > 100)
    opts.subtitle = `Row ${hint.position.row + 1}, column ${hint.position.col + 1}: ${hint.value}. ${hint.technique}.`;
  await writeFile(join(output, `${name}.svg`), renderSudokuSvg(board, opts));
  await writeFile(
    join(output, `${name}.png`),
    await renderSudokuPng(board, opts),
  );
}
console.log(`Rendered puzzle, answer and hint to ${output}`);
