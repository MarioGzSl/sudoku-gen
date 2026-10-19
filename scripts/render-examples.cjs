const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");
const result = spawnSync(process.execPath, ["examples/images.mjs"], {
  stdio: "inherit",
  env: { ...process.env, SUDOKU_OUTPUT_DIR: resolve("docs/assets") },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
