const { test } = require("node:test");
const assert = require("node:assert/strict");
const { SudokuGame } = require("../dist/cjs");
const { PUZZLE, parseGrid, empty } = require("./helpers.cjs");
test("clues are protected and copies cannot edit the game", () => {
  const game = new SudokuGame(parseGrid(PUZZLE));
  assert.equal(game.isGiven({ row: 0, col: 0 }), true);
  assert.equal(game.isGiven(null), false);
  assert.equal(game.placeNumber({ row: 0, col: 0 }, 2), false);
  assert.equal(game.clearCell({ row: 0, col: 0 }), false);
  const g = game.getInitialGrid();
  g[0][0] = 0;
  assert.equal(game.getInitialGrid()[0][0], 5);
  assert.equal(game.isSolved(), false);
  assert.deepEqual(game.getCandidates({ row: 0, col: 2 }), [1, 2, 4]);
  assert.ok(game.getHint());
});
test("undo/redo branching and reset", () => {
  const g = new SudokuGame();
  assert.equal(g.undo(), false);
  assert.equal(g.redo(), false);
  assert.equal(g.placeNumber({ row: 0, col: 0 }, 1), true);
  assert.equal(g.placeNumber({ row: 0, col: 1 }, 1), false);
  assert.equal(g.undo(), true);
  assert.equal(g.getGrid()[0][0], 0);
  assert.equal(g.redo(), true);
  assert.equal(g.getGrid()[0][0], 1);
  assert.equal(g.clearCell({ row: 0, col: 0 }), true);
  assert.equal(g.clearCell({ row: 0, col: 0 }), false);
  g.undo();
  assert.equal(g.getGrid()[0][0], 1);
  g.undo();
  g.placeNumber({ row: 0, col: 0 }, 2);
  assert.equal(g.redo(), false);
  g.reset();
  assert.deepEqual(g.getGrid(), empty());
  assert.equal(g.undo(), false);
  assert.equal(g.clearCell({ row: NaN, col: 0 }), false);
});
test("history bounded to 100 moves", () => {
  const g = new SudokuGame();
  for (let i = 0; i < 120; i++) {
    g.placeNumber({ row: 0, col: 0 }, 1);
    g.clearCell({ row: 0, col: 0 });
  }
  let n = 0;
  while (g.undo()) n++;
  assert.equal(n, 100);
});
test("serialize restores clues and current board without history", () => {
  const g = new SudokuGame(parseGrid(PUZZLE));
  const h = g.getHint();
  g.placeNumber(h.position, h.value);
  const restored = SudokuGame.deserialize(g.serialize());
  assert.deepEqual(restored.getGrid(), g.getGrid());
  assert.deepEqual(restored.getInitialGrid(), g.getInitialGrid());
  assert.equal(restored.undo(), false);
  restored.reset();
  assert.deepEqual(restored.getGrid(), parseGrid(PUZZLE));
});
for (const value of [
  null,
  123,
  "x".repeat(10001),
  "invalid",
  "null",
  "{}",
  '{"version":2}',
  '{"version":1,"initial":[],"grid":[]}',
])
  test(`deserialize rejects ${String(value).slice(0, 40)}`, () =>
    assert.throws(() => SudokuGame.deserialize(value)));
test("saved board cannot rewrite givens", () => {
  const g = empty(),
    initial = empty();
  initial[0][0] = 1;
  g[0][0] = 2;
  assert.throws(
    () =>
      SudokuGame.deserialize(JSON.stringify({ version: 1, initial, grid: g })),
    /initial clue/,
  );
});
