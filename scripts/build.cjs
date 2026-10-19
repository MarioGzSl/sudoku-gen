const { spawnSync } = require("node:child_process");
const { rmSync, writeFileSync, readFileSync } = require("node:fs");
const { resolve, join } = require("node:path");
const root = resolve(__dirname, "..");
process.chdir(root);
const output = resolve(root, "dist");
if (output !== join(root, "dist"))
  throw new Error("Unexpected build output path");
rmSync(output, { recursive: true, force: true });
const tsc = require.resolve("typescript/bin/tsc");
for (const [module, directory] of [
  ["commonjs", "cjs"],
  ["ES2022", "esm"],
]) {
  const result = spawnSync(
    process.execPath,
    [
      tsc,
      "-p",
      "tsconfig.json",
      "--module",
      module,
      "--outDir",
      `dist/${directory}`,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
  writeFileSync(
    `dist/${directory}/package.json`,
    JSON.stringify({ type: directory === "esm" ? "module" : "commonjs" }),
  );
}
// The ESM entry must resolve its worker dependency relative to itself, never the caller's cwd.
const file = "dist/esm/async.js";
const source = readFileSync(file, "utf8");
const needle = "createRequire(__filename)";
if (!source.includes(needle))
  throw new Error("Worker location build transform did not match");
writeFileSync(file, source.replace(needle, "createRequire(import.meta.url)"));
