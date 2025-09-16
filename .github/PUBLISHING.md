# Publishing Guide

This document explains how to set up automated NPM publishing and GitHub releases for the EquilateralAgents Open Core package.

## Required GitHub Secrets

To enable automated publishing, you need to configure the following secrets in your GitHub repository:

### 1. NPM_TOKEN

Create an NPM access token for publishing:

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile avatar → "Access Tokens"
3. Click "Generate New Token" → "Granular Access Token"
4. Configure the token:
   - **Name**: `EquilateralAgents-Open-Core-Publishing`
   - **Expiration**: Choose appropriate duration
   - **Scope**: Select the packages you want to publish
   - **Permissions**:
     - `read and write` for the package
     - `read` for organization (if applicable)

5. Copy the token (starts with `npm_`)
6. In your GitHub repository, go to Settings → Secrets and variables → Actions
7. Add a new repository secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your npm token

### 2. GitHub Token (Automatic)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions for creating releases and managing repository content. No manual configuration needed.

## Publishing Process

### Automated Release and Publishing

1. **Create a Release**:
   ```bash
   # Go to Actions tab in GitHub
   # Run "Create Release" workflow
   # Enter version (e.g., 1.0.1)
   # Choose release type (release/prerelease)
   ```

2. **Automatic NPM Publishing**:
   - When a release is created, the NPM publish workflow automatically triggers
   - The package is published to npm with provenance
   - All files are filtered according to `.npmignore` and `package.json` files array

### Manual Publishing

You can also trigger NPM publishing manually:

1. Go to Actions tab → "Publish to NPM"
2. Click "Run workflow"
3. Optionally specify a version (or use package.json version)

## Workflow Files

- `.github/workflows/release.yml` - Creates GitHub releases and tags
- `.github/workflows/npm-publish.yml` - Publishes to NPM registry
- `.github/workflows/test.yml` - Tests package across multiple Node.js versions

## Package Configuration

- `package.json` - Contains package metadata and publishing configuration
- `.npmignore` - Excludes development files from NPM package
- `VERSION` - Tracks current version (updated by release workflow)

## Verification

After publishing, verify:

1. **NPM Package**: https://www.npmjs.com/package/equilateral-agents-open-core
2. **GitHub Release**: https://github.com/happyhippo-ai/equilateral-agents-open-core/releases
3. **Installation Test**:
   ```bash
   npm install equilateral-agents-open-core
   node -e "console.log(require('equilateral-agents-open-core'))"
   ```

## Troubleshooting

### Common Issues

1. **NPM_TOKEN Invalid**:
   - Verify token has correct permissions
   - Check token expiration
   - Ensure token scope includes your package

2. **Package Already Exists**:
   - NPM doesn't allow overwriting published versions
   - Increment version number in package.json
   - Use semantic versioning (major.minor.patch)

3. **Files Missing from Package**:
   - Check `.npmignore` file
   - Verify `files` array in `package.json`
   - Test with `npm pack --dry-run`

### Support

For publishing issues, check:
- GitHub Actions logs
- NPM publish logs
- Package.json configuration

For questions, open an issue in the repository.