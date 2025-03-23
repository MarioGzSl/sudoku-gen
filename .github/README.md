# GitHub Workflows

## npm Publishing Workflow

This repository includes a GitHub Actions workflow that automatically publishes the package to npm when:

1. Changes are pushed to the `main` branch
2. The version number in `package.json` has been updated

### Setup Instructions

To use this workflow, you need to configure an npm token as a GitHub secret:

1. **Generate an npm Access Token**:
   - Log in to your npm account at [npmjs.com](https://www.npmjs.com/)
   - Go to your profile settings
   - Select "Access Tokens"
   - Click "Generate New Token"
   - Choose "Publish" as the token type
   - Save the token (it will only be shown once)

2. **Add the Token to GitHub Secrets**:
   - Go to your GitHub repository
   - Click on "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Set the name as `NPM_TOKEN`
   - Paste your npm token as the value
   - Click "Add secret"

### How It Works

The workflow performs the following steps:

1. Checks out the repository code
2. Sets up Node.js environment
3. Installs dependencies with `npm ci`
4. Builds the package
5. Runs tests
6. Compares the current version in package.json with the previous version
7. If the version has changed, publishes the package to npm

### Publishing a New Version

To publish a new version:

1. Update the version number in `package.json`
2. Commit the changes
3. Push to the `main` branch
4. The workflow will automatically publish the new version

### Troubleshooting

If the workflow fails, check the following:

- Ensure your npm token is valid and has publish permissions
- Verify the version in package.json was actually updated
- Check if you have the proper ownership rights to the package on npm 