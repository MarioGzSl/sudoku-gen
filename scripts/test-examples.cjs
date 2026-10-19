const { spawnSync } = require("node:child_process");
const { mkdtempSync, readdirSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const output = mkdtempSync(join(tmpdir(), "sudoku-examples-"));
for (const file of readdirSync("examples").filter((f) => f.endsWith(".mjs"))) {
  const result = spawnSync(process.execPath, [`examples/${file}`], {
    encoding: "utf8",
    timeout: 20000,
    env: { ...process.env, SUDOKU_OUTPUT_DIR: output },
  });
  if (result.status !== 0) {
    console.error(file, result.stdout, result.stderr, result.error);
    process.exit(1);
  }
  console.log(`${file}: passed`);
}
