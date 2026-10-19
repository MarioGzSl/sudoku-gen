const { test } = require("node:test");
const assert = require("node:assert/strict");
const api = require("../dist/cjs");
const {
  Sudoku,
  validateGrid,
  getConflicts,
  getCandidates,
  parseGrid,
  stringifyGrid,
  solveGrid,
  countSolutions,
  analyze,
  SearchLimitError,
} = api;
const {
  PUZZLE,
  SOLUTION,
  IMPOSSIBLE,
  empty,
  verifySolution,
  referenceCount,
} = require("./helpers.cjs");
const frozen = (grid) => Object.freeze(grid.map((row) => Object.freeze(row)));
for (const [name, value] of Object.entries({
  null: null,
  undefined: undefined,
  string: "123",
  short: [],
  sparse: Array(9),
  nullRows: Array(9).fill(null),
  sparseRows: Array.from({ length: 9 }, () => Array(9)),
})) {
  test(`grid rejects ${name}`, () => {
    assert.equal(validateGrid(value), false);
    assert.throws(() => solveGrid(value), TypeError);
    assert.equal(analyze(value).status, "invalid");
  });
}
for (const value of [NaN, Infinity, -1, 10, 1.5, "5", undefined, null])
  test(`grid value ${String(value)} rejected`, () => {
    const g = empty();
    g[0][0] = value;
    assert.equal(validateGrid(g), false);
    assert.throws(() => new Sudoku(g));
  });
for (const [r, c] of [
  [0, 1],
  [1, 0],
  [1, 1],
])
  test(`detect both conflicting cells at ${r},${c}`, () => {
    const g = empty();
    g[0][0] = 5;
    g[r][c] = 5;
    assert.deepEqual(getConflicts(g), [
      { row: 0, col: 0 },
      { row: r, col: c },
    ]);
    assert.equal(analyze(g).status, "invalid");
  });
test("frozen input and read-only operations are never mutated", () => {
  const g = frozen(parseGrid(PUZZLE));
  const s = new Sudoku(g);
  assert.equal(s.isValid(), true);
  assert.deepEqual(s.getCandidates({ row: 0, col: 2 }), [1, 2, 4]);
  assert.equal(s.getConflicts().length, 0);
  verifySolution(solveGrid(g), g);
  assert.equal(stringifyGrid(g), PUZZLE);
});
test("all output grids are defensive copies", () => {
  const s = new Sudoku(parseGrid(PUZZLE));
  const g = s.getGrid();
  g[0][0] = 0;
  assert.equal(s.getGrid()[0][0], 5);
  const solved = s.solve();
  solved[0][0] = 0;
  assert.equal(s.getGrid()[0][0], 5);
});
test("candidates on filled cells, invalid position, invalid grid", () => {
  assert.deepEqual(getCandidates(parseGrid(PUZZLE), { row: 0, col: 0 }), []);
  assert.throws(() => getCandidates(empty(), { row: -1, col: 0 }), RangeError);
  assert.throws(() => getConflicts([]), TypeError);
});
for (const pos of [
  null,
  undefined,
  {},
  "0",
  { row: NaN, col: 0 },
  { row: 0.5, col: 0 },
  { row: 0, col: 0.5 },
  { row: 0, col: NaN },
  { row: 0, col: 9 },
  { row: -1, col: 0 },
])
  test(`invalid position ${JSON.stringify(pos)}`, () => {
    const s = new Sudoku();
    assert.equal(s.placeNumber(pos, 5), false);
    assert.equal(s.clearCell(pos), false);
    assert.equal(s.isValid(), true);
  });
for (const value of [NaN, Infinity, 1.5, "5", undefined, null, 0, 10])
  test(`place rejects ${String(value)}`, () => {
    const s = new Sudoku();
    assert.equal(s.placeNumber({ row: 0, col: 0 }, value), false);
    assert.deepEqual(s.getGrid(), empty());
  });
test("place, clear, reset and frozen setGrid", () => {
  const s = new Sudoku();
  assert.equal(s.placeNumber({ row: 0, col: 0 }, 5), true);
  assert.equal(s.placeNumber({ row: 0, col: 0 }, 6), false);
  assert.equal(s.placeNumber({ row: 0, col: 1 }, 5), false);
  assert.equal(s.clearCell({ row: 0, col: 0 }), true);
  s.setGrid(frozen(parseGrid(PUZZLE)));
  assert.equal(s.isSolved(), false);
  s.reset();
  assert.deepEqual(s.getGrid(), empty());
});
test("parse and stringify round trip", () => {
  const s = Sudoku.fromString(
    PUZZLE.replaceAll("0", ".").match(/.{9}/g).join("\n"),
  );
  assert.equal(s.toString(), PUZZLE);
  assert.equal(s.toString("."), PUZZLE.replaceAll("0", "."));
  assert.throws(() => s.toString("-"));
  for (const value of [
    null,
    12,
    "0".repeat(80),
    "0".repeat(82),
    "x".repeat(81),
  ])
    assert.throws(() => parseGrid(value));
});
test("deterministic pure solver preserves clues and yields expected solution", () => {
  const g = parseGrid(PUZZLE);
  assert.equal(stringifyGrid(solveGrid(g)), SOLUTION);
  assert.equal(stringifyGrid(g), PUZZLE);
  assert.deepEqual(solveGrid(g), solveGrid(g));
});
test("solved board returns a copy and no-solution leaves input unchanged", () => {
  const g = parseGrid(SOLUTION);
  assert.notEqual(solveGrid(g), g);
  const s = Sudoku.fromString(IMPOSSIBLE);
  assert.equal(s.isValid(), true);
  assert.equal(s.solve(), null);
  assert.equal(s.toString(), IMPOSSIBLE);
  assert.equal(s.analyze().status, "unsolvable");
});
test("analysis distinguishes invalid, impossible, unique and multiple", () => {
  assert.equal(analyze(parseGrid(PUZZLE)).status, "unique");
  assert.equal(analyze(empty()).status, "multiple");
  assert.equal(analyze(parseGrid(IMPOSSIBLE)).solutionCount, 0);
  assert.equal(countSolutions(empty(), { limit: 3 }), 3);
  assert.equal(new Sudoku(parseGrid(PUZZLE)).countSolutions(), 1);
  assert.equal(referenceCount(parseGrid(PUZZLE)), 1);
  assert.equal(referenceCount(empty()), 2);
});
test("resource limits are not confused with no solution", () => {
  assert.throws(() => solveGrid(empty(), { maxNodes: 1 }), SearchLimitError);
  const a = analyze(empty(), { maxNodes: 1 });
  assert.equal(a.status, "limit-exceeded");
  assert.equal(a.solutionCount, null);
  assert.equal(a.stats.nodes, 1);
  const s = new Sudoku();
  assert.throws(() => s.solve({ maxNodes: 1 }), SearchLimitError);
  assert.deepEqual(s.getGrid(), empty());
});
for (const maxNodes of [0, -1, NaN, Infinity, 1.5])
  test(`invalid budget ${maxNodes}`, () =>
    assert.throws(() => solveGrid(empty(), { maxNodes }), RangeError));
for (const limit of [0, -1, 1001, NaN, 1.5])
  test(`invalid count limit ${limit}`, () =>
    assert.throws(() => countSolutions(empty(), { limit }), RangeError));
test("invalid options and cancellation", () => {
  for (const opts of [null, [], 5, { signal: {} }, { signal: null }])
    assert.throws(() => solveGrid(empty(), opts), TypeError);
  const c = new AbortController();
  c.abort(new Error("cancelled"));
  assert.throws(() => solveGrid(empty(), { signal: c.signal }), /cancelled/);
  assert.throws(() => analyze(empty(), { signal: c.signal }), /cancelled/);
});
test("prettyPrint defaults, explicit grid, and bad grid", () => {
  const s = Sudoku.fromString(PUZZLE);
  const text = s.prettyPrint();
  assert.equal(text.split("\n").length, 14);
  assert.ok(text.includes("| 5 3   |"));
  assert.equal(s.prettyPrint(parseGrid(SOLUTION)).includes("5 3 4"), true);
  assert.throws(() => s.prettyPrint([]));
});
test("constructor does not silently treat null as empty", () =>
  assert.throws(() => new Sudoku(null), TypeError));
