const { test } = require("node:test");
const assert = require("node:assert/strict");
const { solveGridAsync } = require("../dist/cjs/async");
const { SearchLimitError } = require("../dist/cjs");
const {
  PUZZLE,
  IMPOSSIBLE,
  empty,
  parseGrid,
  verifySolution,
} = require("./helpers.cjs");
test("worker solves without blocking and preserves input", async () => {
  const grid = parseGrid(PUZZLE);
  let tick = false;
  const interval = setInterval(() => {
    tick = true;
  }, 1);
  try {
    const solved = await solveGridAsync(grid);
    assert.ok(tick);
    verifySolution(solved, grid);
    assert.deepEqual(grid, parseGrid(PUZZLE));
  } finally {
    clearInterval(interval);
  }
});
test("worker returns no solution and serializes search errors", async () => {
  assert.equal(await solveGridAsync(parseGrid(IMPOSSIBLE)), null);
  await assert.rejects(
    solveGridAsync(empty(), { maxNodes: 1 }),
    SearchLimitError,
  );
  await assert.rejects(solveGridAsync([]), TypeError);
});
test("worker cancellation before and during work", async () => {
  const before = new AbortController();
  before.abort(new Error("before"));
  await assert.rejects(
    solveGridAsync(empty(), { signal: before.signal }),
    /before/,
  );
  const during = new AbortController();
  const task = solveGridAsync(empty(), { signal: during.signal });
  during.abort(new Error("during"));
  await assert.rejects(task, /during/);
});
test("worker preserves falsy abort reasons", async () => {
  const c = new AbortController();
  const task = solveGridAsync(empty(), { signal: c.signal });
  c.abort(0);
  try {
    await task;
    assert.fail("must reject");
  } catch (error) {
    assert.equal(error, 0);
  }
});

test("worker rejects incomplete signal lookalikes before starting", async () => {
  await assert.rejects(
    solveGridAsync(empty(), {
      signal: { aborted: false, throwIfAborted() {} },
    }),
    TypeError,
  );
});
