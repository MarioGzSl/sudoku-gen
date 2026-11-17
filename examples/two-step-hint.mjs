import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getHint, parseGrid, renderSudokuSvg } from "sudoku-easy-solver";

const grid = parseGrid(
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
);
const hint = getHint(grid, { allowGuess: false });
if (!hint) throw new Error("This example needs a puzzle with a logical hint");

const { row, col } = hint.position;
const board = renderSudokuSvg(grid, { highlights: [hint.position] });
const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Two-step Sudoku hint</title>
<style>
  body { max-width: 34rem; margin: 2rem auto; padding: 0 1rem; font: 1rem/1.5 system-ui, sans-serif; color: #17384a; }
  h1 { margin: 0; font-family: Georgia, serif; }
  svg { display: block; width: 100%; height: auto; }
  details { margin-top: 1rem; padding: 0.8rem 1rem; background: #f5f2ea; }
  summary { cursor: pointer; font-weight: 600; }
</style>
<main>
  <h1>Sudoku hint</h1>
  <p>Look at row ${row + 1}, column ${col + 1}. Which digit fits there?</p>
  ${board}
  <details>
    <summary>Reveal the digit and explanation</summary>
    <p><strong>${hint.value}</strong> &mdash; ${hint.explanation}</p>
  </details>
</main>
</html>`;

const output = process.env.SUDOKU_OUTPUT_DIR || "sudoku-images";
await mkdir(output, { recursive: true });
const file = join(output, "two-step-hint.html");
await writeFile(file, html);
console.log(`Open ${file} in a browser to try the hint.`);
