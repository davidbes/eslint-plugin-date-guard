# Releasing

This package is published to the public npm registry as `eslint-plugin-date-guard`.

## GitHub Actions Release

The repository includes a `Release` GitHub Actions workflow that publishes to npm.

Before using the workflow, add an npm automation token as a repository secret named `NPM_TOKEN`.

To release a version:

1. Update `version` in `package.json` and `package-lock.json`.
2. Commit the change.
3. Create and publish a GitHub Release with a tag matching the package version, for example `v0.1.0`.

The workflow runs `npm ci`, `npm run verify`, checks that the release tag matches `package.json`, and then runs `npm publish` against the public npm registry using `NPM_TOKEN`.

The workflow can also be run manually with `workflow_dispatch`. Manual runs default to `npm publish --dry-run`.

## Local Publishing

Publishing locally uses the default npm registry:

```sh
npm login
npm publish
```

Use an npm account with permission to publish `eslint-plugin-date-guard`.
