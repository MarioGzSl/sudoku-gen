const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  solveGrid,
  countSolutions,
  validateGrid,
  analyze,
} = require("../dist/cjs");
const {
  SOLUTION,
  parseGrid,
  referenceCount,
  verifySolution,
} = require("./helpers.cjs");

test("solution counts agree with an independent oracle across transformed boards", () => {
  let state = 20261019;
  const random = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const solution = parseGrid(SOLUTION);
  for (let sample = 0; sample < 60; sample++) {
    const shift = sample % 9;
    const grid = solution.map((row, r) =>
      row.map((v, c) => {
        const value = sample % 2 ? solution[c][r] : v;
        return random() < 0.35 + (sample % 4) * 0.12
          ? ((value + shift - 1) % 9) + 1
          : 0;
      }),
    );
    const original = grid.map((row) => row.slice());
    verifySolution(solveGrid(grid), grid);
    assert.equal(
      countSolutions(grid),
      referenceCount(grid),
      `sample ${sample}`,
    );
    assert.deepEqual(grid, original);
    // Locally legal but globally impossible moves must not be treated as solutions.
    const row = sample % 9,
      col = (sample * 7) % 9;
    grid[row][col] = ((sample * 5) % 9) + 1;
    if (validateGrid(grid)) {
      const expected = referenceCount(grid);
      assert.equal(countSolutions(grid), expected);
      assert.equal(
        analyze(grid).status,
        expected === 0 ? "unsolvable" : expected === 1 ? "unique" : "multiple",
      );
    } else assert.equal(analyze(grid).status, "invalid");
  }
});
