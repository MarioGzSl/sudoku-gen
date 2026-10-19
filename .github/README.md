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
