const { appendFileSync } = require("node:fs");

function shouldPublish(pkg, registry) {
  if (pkg.name !== "sudoku-easy-solver" || registry.name !== pkg.name) {
    throw new Error("Unexpected package name; refusing to publish.");
  }
  const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  if (!stableVersion.test(pkg.version)) {
    throw new Error("Automatic publishing requires a stable x.y.z version.");
  }
  if (!registry.versions || !registry["dist-tags"]) {
    throw new Error("Invalid registry response.");
  }
  if (Object.hasOwn(registry.versions, pkg.version)) return false;

  const latest = registry["dist-tags"].latest;
  if (!stableVersion.test(latest)) throw new Error("Invalid latest version.");
  const nextParts = pkg.version.split(".").map(BigInt);
  const latestParts = latest.split(".").map(BigInt);
  for (let index = 0; index < 3; index++) {
    if (nextParts[index] > latestParts[index]) return true;
    if (nextParts[index] < latestParts[index]) break;
  }
  throw new Error("New version must be greater than npm latest.");
}

async function main() {
  const pkg = require("../package.json");
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`,
    {
      signal: AbortSignal.timeout(30000),
    },
  );
  // An authentication, network or registry error must never trigger a publish.
  if (!response.ok)
    throw new Error(`Registry request failed: HTTP ${response.status}`);
  const publish = shouldPublish(pkg, await response.json());
  console.log(
    `${pkg.name}@${pkg.version}: ${publish ? "ready to publish" : "already published; skipping"}`,
  );
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `publish=${publish}\n`);
  }
}

module.exports = { shouldPublish };
if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
