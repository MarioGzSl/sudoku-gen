# GitHub workflows

Pull requests and branches are built and tested on Node.js 22 and 24.
Pushes to `main` run the publication workflow on Node.js 24.

## Publishing a new version

1. Make and test your changes.
2. Run `npm version patch --no-git-tag-version` (or `minor` / `major`).
3. Commit both `package.json` and `package-lock.json`, then merge into `main`.
4. Check the **Publish to npm** workflow in GitHub Actions.

The workflow checks the npm registry instead of comparing adjacent commits.
An existing version is skipped; a new stable version greater than `latest` is
published only after the build and tests pass. Registry errors stop the workflow.
You can retry through **Actions → Publish to npm → Run workflow** on `main`.
Published versions cannot be overwritten. Prerelease publishing is not automated.

## npm authentication

Publishing uses npm Trusted Publishing (OIDC), without `NPM_TOKEN`.
The package's trusted publisher configuration must match:

- Provider: GitHub Actions
- Organization or user: `MarioGzSl`
- Repository: `sudoku-gen`
- Workflow filename: `npm-publish.yml`
- Environment: leave empty
- Allow direct publishing with `npm publish`

The workflow grants `id-token: write`, uses a GitHub-hosted runner and includes
provenance. Repository URLs in `package.json` must continue to match this repo.
Do not add long-lived npm tokens to the workflow.

See [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/).

## Contributing and verification

Use Node.js 22+ and run:

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run test:release
npm run test:types
npm run test:package
npm run test:examples
npm audit --audit-level=high
```

The validation workflow runs on Linux and Windows with Node.js 22 and 24.
The tests cover malformed inputs, immutable input, solution existence and counts,
95 difficult reference puzzles, unique generation across seeded samples, game
history, render options and PNG output, worker cancellation and CJS/ESM consumers.
Package tests install the actual tarball into a temporary consumer directory.
They also check that the npm README and tarball exclude maintainer-only content.
Coverage thresholds apply to compiled library code: 95% lines/functions and 85%
branches. A passing suite is evidence for these tested contracts, not a proof that
all possible bugs or Sudoku variants are covered.

`npm run docs:assets` regenerates the real puzzle/solution/hint SVG and PNG examples.
Do not add AI-generated artwork to this release. Keep package usage documentation
in the root README and `docs/`; keep publication and contributor details here.
