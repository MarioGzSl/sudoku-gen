const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  Sudoku,
  getHint,
  rateDifficulty,
  generateDetailed,
  generatePuzzle,
  SudokuDifficulty,
  countSolutions,
  SearchLimitError,
} = require("../dist/cjs");
const {
  PUZZLE,
  SOLUTION,
  IMPOSSIBLE,
  empty,
  parseGrid,
  verifySolution,
  referenceCount,
} = require("./helpers.cjs");
test("imported hint does not solve or alter board (regression)", () => {
  const s = Sudoku.fromString(PUZZLE);
  const h = s.getHint();
  assert.ok(h);
  assert.deepEqual(Object.keys(h).sort(), ["position", "value"]);
  assert.equal(s.toString(), PUZZLE);
  assert.equal(s.placeNumber(h.position, h.value), true);
});
test("explained hint and logical-only hint", () => {
  const s = Sudoku.fromString(PUZZLE);
  const h = s.getHint({ explain: true, allowGuess: false });
  assert.equal(h.technique, "naked-single");
  assert.ok(h.relatedCells.length);
  assert.ok(h.explanation.includes("Only"));
  assert.equal(getHint(empty(), { allowGuess: false }), null);
  const reveal = getHint(empty());
  assert.equal(reveal.technique, "solution");
  assert.ok(reveal.explanation.includes("other completions"));
});
test("hints do not reuse a stale solution after edits (regression)", () => {
  const s = Sudoku.fromString(SOLUTION);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) s.clearCell({ row: r, col: c });
  s.placeNumber({ row: 0, col: 1 }, 5);
  const hint = s.getHint();
  assert.ok(hint);
  assert.notEqual(hint.value, 5);
  assert.equal(s.placeNumber(hint.position, hint.value), true);
});
test("no hint on completed or impossible board", () => {
  assert.equal(getHint(parseGrid(SOLUTION)), null);
  assert.equal(getHint(parseGrid(IMPOSSIBLE)), null);
  assert.equal(new Sudoku(parseGrid(SOLUTION)).getHint(), null);
});
test("hint flags and search limits validated", () => {
  assert.throws(() => getHint(empty(), { allowGuess: "yes" }));
  assert.throws(() => getHint(empty(), { explain: 1 }));
  assert.throws(() => getHint(empty(), { maxNodes: 1 }), SearchLimitError);
});
for (const difficulty of Object.values(SudokuDifficulty))
  test(`unique generated ${difficulty} puzzles across fixed seeds`, () => {
    for (let seed = 0; seed < 12; seed++) {
      const result = generateDetailed({ difficulty, seed, maxAttempts: 2 });
      assert.equal(result.profile, difficulty);
      assert.ok(result.clues >= result.targetClues);
      assert.equal(result.clues, result.grid.flat().filter(Boolean).length);
      verifySolution(result.solution, result.grid);
      assert.equal(countSolutions(result.grid), 1);
      assert.equal(referenceCount(result.grid), 1);
    }
  });
test("same seed is reproducible, different seeds vary, rotational blanks preserve symmetry", () => {
  const options = {
    difficulty: "hard",
    seed: "daily-2026",
    symmetry: "rotational",
  };
  const a = generateDetailed(options),
    b = generateDetailed(options);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.grid, generatePuzzle({ ...options, seed: "another" }));
  const flat = a.grid.flat();
  for (let i = 0; i < 81; i++) assert.equal(flat[i] === 0, flat[80 - i] === 0);
});
test("legacy generation overload, default generation and copies", () => {
  const s = new Sudoku();
  const grid = s.generate(SudokuDifficulty.EASY);
  assert.equal(grid.flat().filter(Boolean).length, 46);
  grid[0][0] = 99;
  assert.equal(s.isValid(), true);
  assert.equal(s.generate({ seed: "x" }).length, 9);
  assert.equal(generatePuzzle().length, 9);
});
for (const opts of [
  { difficulty: "invalid" },
  { symmetry: "mirror" },
  { maxAttempts: 0 },
  { maxAttempts: 51 },
  { maxAttempts: 1.5 },
  { seed: NaN },
  { seed: Infinity },
  { seed: {} },
  null,
])
  test(`invalid generation ${JSON.stringify(opts)}`, () =>
    assert.throws(() => generatePuzzle(opts)));
test("generation budget and cancellation leave existing board unchanged", () => {
  const s = Sudoku.fromString(PUZZLE);
  assert.throws(() => s.generate({ seed: 1, maxNodes: 1 }), SearchLimitError);
  assert.equal(s.toString(), PUZZLE);
  const c = new AbortController();
  c.abort();
  assert.throws(() => generatePuzzle({ signal: c.signal }));
});
test("generation budget covers all uniqueness checks", () =>
  assert.throws(
    () => generatePuzzle({ seed: 1, maxNodes: 90 }),
    SearchLimitError,
  ));
test("difficulty rating includes solved, logical, searched and impossible boards", () => {
  assert.equal(rateDifficulty(parseGrid(SOLUTION)).level, "easy");
  const easy = new Sudoku(parseGrid(PUZZLE)).rateDifficulty();
  assert.ok(easy.nakedSingles > 0);
  assert.equal(rateDifficulty(parseGrid(IMPOSSIBLE)).level, "unsolvable");
  assert.ok(["hard", "expert"].includes(rateDifficulty(empty()).level));
});

test("hidden-single hints explain their unit and lead to a valid completion", () => {
  const grid = parseGrid(
    "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......",
  );
  const hint = getHint(grid, { allowGuess: false });
  assert.equal(hint.technique, "hidden-single");
  assert.equal(hint.relatedCells.length, 8);
  assert.match(hint.explanation, /Within (row|column|box)/);
  const game = new Sudoku(grid);
  assert.equal(game.placeNumber(hint.position, hint.value), true);
  verifySolution(game.solve(), grid);
});
test("rating distinguishes hidden singles from searched puzzles", () => {
  const medium = parseGrid(
    "002000600016000700450900100000810007030000001701045800504008000000000076060094508",
  );
  const rating = rateDifficulty(medium);
  assert.equal(rating.level, "medium");
  assert.ok(rating.hiddenSingles > 0);
  assert.equal(rating.guesses, 0);
  assert.equal(
    rateDifficulty(
      parseGrid(
        "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......",
      ),
    ).level,
    "hard",
  );
  assert.equal(
    rateDifficulty(
      parseGrid(
        "52...6.........7.13...........4..8..6......5...........418.........3..2...87.....",
      ),
    ).level,
    "expert",
  );
});
