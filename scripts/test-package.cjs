const { execFileSync } = require("node:child_process");
const {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
} = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const assert = require("node:assert/strict");
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run with npm run test:package");
const dir = mkdtempSync(join(tmpdir(), "sudoku-package-test-"));
const packed = JSON.parse(
  execFileSync(
    process.execPath,
    [npm, "pack", "--ignore-scripts", "--json", "--pack-destination", dir],
    { encoding: "utf8" },
  ),
)[0];
const files = packed.files.map((f) => f.path);
assert.ok(files.includes("LICENSE"));
assert.ok(files.includes("dist/esm/index.js"));
assert.ok(files.includes("dist/cjs/index.d.ts"));
assert.equal(
  files.some((f) => /^(.github|tests|coverage|docs|scripts)\//.test(f)),
  false,
);
const readme = readFileSync("README.md", "utf8");
assert.equal(
  /CI\/CD|github actions|trusted publishing|npm-publish|deployment pipeline/i.test(
    readme,
  ),
  false,
);
writeFileSync(join(dir, "package.json"), "{}");
execFileSync(
  process.execPath,
  [
    npm,
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--package-lock=false",
    join(dir, packed.filename),
  ],
  { cwd: dir, stdio: "pipe" },
);
writeFileSync(
  join(dir, "consumer.cjs"),
  `const a=require('sudoku-easy-solver');const assert=require('node:assert/strict');
const grid=a.parseGrid('530070000600195000098000060800060003400803001700020006060000280000419005000080079');
assert.equal(a.analyze(grid).status,'unique');assert.ok(a.renderSudokuSvg(grid).startsWith('<svg'));
require('sudoku-easy-solver/async').solveGridAsync(grid).then(s=>assert.ok(new a.Sudoku(s).isSolved())).catch(e=>{console.error(e);process.exitCode=1});`,
);
execFileSync(process.execPath, [join(dir, "consumer.cjs")], {
  cwd: tmpdir(),
  stdio: "pipe",
  timeout: 10000,
});
writeFileSync(
  join(dir, "consumer.mjs"),
  `import assert from 'node:assert/strict';import {Sudoku,generatePuzzle} from 'sudoku-easy-solver';
import {solveGridAsync} from 'sudoku-easy-solver/async';import {renderSudokuPng} from 'sudoku-easy-solver/image';
const grid=generatePuzzle({seed:'pack'});assert.ok(new Sudoku(await solveGridAsync(grid)).isSolved());
await assert.rejects(renderSudokuPng(grid),{message: /optional.*resvg-js peer/});`,
);
execFileSync(process.execPath, [join(dir, "consumer.mjs")], {
  cwd: tmpdir(),
  stdio: "pipe",
  timeout: 15000,
});
console.log(
  `Package verified: ${files.length} files, CJS/ESM, worker from another cwd, optional PNG dependency, no CI/CD documentation.`,
);
