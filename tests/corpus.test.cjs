const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { solveGrid, parseGrid, analyze } = require("../dist/cjs");
const { verifySolution } = require("./helpers.cjs");
const puzzles = fs
  .readFileSync(path.join(__dirname, "fixtures/norvig-top95.txt"), "utf8")
  .trim()
  .split(/\s+/);
test("95 difficult puzzles from Peter Norvig: valid solutions, unchanged clues", () => {
  assert.equal(puzzles.length, 95);
  for (const [i, text] of puzzles.entries()) {
    const grid = parseGrid(text);
    try {
      const result = solveGrid(grid);
      assert.ok(result);
      verifySolution(result, grid);
      assert.equal(
        grid
          .flat()
          .map((v) => v || ".")
          .join(""),
        text,
      );
    } catch (e) {
      e.message = `Puzzle ${i + 1}: ${e.message}`;
      throw e;
    }
  }
});
