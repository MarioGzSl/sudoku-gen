const { test } = require("node:test");
const assert = require("node:assert/strict");
const { renderSudokuSvg, getHint, solveGrid } = require("../dist/cjs");
const { renderSudokuPng } = require("../dist/cjs/image");
const { PUZZLE, parseGrid, empty } = require("./helpers.cjs");
for (const theme of ["paper", "midnight", "minimal"])
  test(`render ${theme} SVG with accessible markup and font-independent digits`, () => {
    const g = parseGrid(PUZZLE),
      svg = renderSudokuSvg(g, { theme, size: 720 });
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.includes('width="720"'));
    assert.ok(svg.includes("<title"));
    assert.ok(svg.includes("<desc"));
    assert.ok(svg.includes("<path"));
    assert.equal(svg.includes("<script"), false);
    assert.deepEqual(g, parseGrid(PUZZLE));
  });
test("render puzzle, solution, candidates, highlights and hint", async () => {
  const grid = parseGrid(PUZZLE),
    solution = solveGrid(grid),
    hint = getHint(grid);
  const opts = {
    title: "Sudoku & <script>",
    subtitle: 'A "quoted" clue',
    showCandidates: true,
    highlights: [{ row: 0, col: 2 }],
    hint,
  };
  const svg = renderSudokuSvg(grid, opts);
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.ok(svg.includes("&amp;"));
  assert.ok(svg.includes("&quot;"));
  assert.ok(svg.includes("#F8D88C"));
  assert.ok(svg.includes("#DDEFE5"));
  assert.ok(renderSudokuSvg(solution, { givens: grid }).includes("#007F78"));
  const png = await renderSudokuPng(grid, { ...opts, size: 450 });
  assert.deepEqual([...png.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(png.buffer, png.byteOffset);
  assert.equal(view.getUint32(16), 450);
  assert.equal(view.getUint32(20), 450);
  assert.ok(png.length > 10000);
  assert.notDeepEqual(
    png,
    await renderSudokuPng(solution, { size: 450, givens: grid }),
  );
});
test("subtitle only and no-title defaults render", () => {
  assert.ok(renderSudokuSvg(empty(), { subtitle: "Notes" }).includes("Notes"));
  assert.ok(renderSudokuSvg(empty()).includes("Sudoku puzzle"));
});
for (const opts of [
  null,
  [],
  { size: 255 },
  { size: 2049 },
  { size: NaN },
  { size: 512.5 },
  { theme: "__proto__" },
  { theme: "bad" },
  { title: 4 },
  { title: "x".repeat(61) },
  { subtitle: "x".repeat(101) },
  { subtitle: "\u0001" },
  { showCandidates: "yes" },
  { givens: [] },
  { highlights: [null] },
  { highlights: Array(82).fill({ row: 0, col: 0 }) },
  { highlights: "0" },
  { hint: null },
  { hint: { position: { row: 0, col: 0 }, value: 1 } },
  { hint: { position: { row: NaN, col: 0 }, value: 1 } },
])
  test(`invalid render options ${JSON.stringify(opts)?.slice(0, 50)}`, () =>
    assert.throws(() => renderSudokuSvg(parseGrid(PUZZLE), opts)));
test("givens must match board and PNG validates before loading renderer", async () => {
  const grid = empty(),
    givens = empty();
  givens[0][0] = 1;
  assert.throws(() => renderSudokuSvg(grid, { givens }));
  await assert.rejects(renderSudokuPng([]), TypeError);
});

test("invalid Unicode is rejected while valid international titles render", async () => {
  for (const title of ["\ud800", "\udc00", "\ufffe", "\uffff"])
    assert.throws(() => renderSudokuSvg(empty(), { title }), TypeError);
  const title = "Sudoku — 日本語 🧩";
  assert.ok(renderSudokuSvg(empty(), { title }).includes(title));
  assert.ok((await renderSudokuPng(empty(), { title })).length > 0);
});
