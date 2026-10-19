const { parseGrid } = require("../dist/cjs");
const PUZZLE =
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const SOLUTION =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const IMPOSSIBLE =
  "123456780000000009000000000000000000000000000000000000000000000000000000000000000";
const empty = () => Array.from({ length: 9 }, () => Array(9).fill(0));
function verifySolution(solution, clues) {
  const assert = require("node:assert/strict");
  assert.equal(solution.length, 9);
  const unit = (values) =>
    assert.equal([...values].sort().join(""), "123456789");
  for (let r = 0; r < 9; r++) {
    unit(solution[r]);
    unit(solution.map((row) => row[r]));
    unit(
      Array.from(
        { length: 9 },
        (_, i) =>
          solution[Math.floor(r / 3) * 3 + Math.floor(i / 3)][
            (r % 3) * 3 + (i % 3)
          ],
      ),
    );
    for (let c = 0; c < 9; c++)
      if (clues[r][c]) assert.equal(solution[r][c], clues[r][c]);
  }
}
// Independent set-based reference, deliberately different from the bitmask implementation.
function referenceCount(input, limit = 2) {
  const grid = input.map((row) => row.slice());
  let count = 0;
  function visit() {
    let target, choices;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!grid[r][c]) {
          const used = new Set([
            ...grid[r],
            ...grid.map((row) => row[c]),
            ...Array.from(
              { length: 9 },
              (_, i) =>
                grid[Math.floor(r / 3) * 3 + Math.floor(i / 3)][
                  Math.floor(c / 3) * 3 + (i % 3)
                ],
            ),
          ]);
          const possible = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
            (n) => !used.has(n),
          );
          if (!possible.length) return;
          if (!choices || possible.length < choices.length) {
            target = [r, c];
            choices = possible;
          }
        }
    if (!target) {
      count++;
      verifySolution(grid, input);
      return;
    }
    for (const n of choices) {
      grid[target[0]][target[1]] = n;
      visit();
      grid[target[0]][target[1]] = 0;
      if (count >= limit) return;
    }
  }
  visit();
  return count;
}
module.exports = {
  PUZZLE,
  SOLUTION,
  IMPOSSIBLE,
  empty,
  verifySolution,
  referenceCount,
  parseGrid,
};
