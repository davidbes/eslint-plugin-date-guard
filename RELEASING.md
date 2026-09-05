# Releasing

This package is published to the public npm registry as `eslint-plugin-date-guard`.

## GitHub Actions Release

The repository includes a `Release` GitHub Actions workflow that publishes to npm with trusted publishing. It uses GitHub OIDC and does not require an `NPM_TOKEN` secret.

Trusted publishing is configured on npm after the package exists:

1. Open the package settings for `eslint-plugin-date-guard` on npmjs.com.
2. Add a trusted publisher for GitHub Actions.
3. Use `davidbes` as the organization/user, `eslint-plugin-date-guard` as the repository, and `release.yml` as the workflow filename.
4. Allow direct `npm publish`.

After trusted publishing works, set the package publishing access to require 2FA and disallow tokens.

To release a version:

1. Update `version` in `package.json` and `package-lock.json`.
2. Commit the change.
3. Create and publish a GitHub Release with a tag matching the package version, for example `v0.1.0`.

The workflow runs `npm ci`, `npm run verify`, checks that the release tag matches `package.json`, and then runs `npm publish` against the public npm registry.

The workflow can also be run manually with `workflow_dispatch`, but manual runs only execute `npm publish --dry-run`.

## First Publish

Trusted publisher configuration is added from package settings, so the first publish of a new package is local and interactive:

```sh
npm login
npm run verify
npm publish
```

Use an npm account with 2FA enabled and permission to publish `eslint-plugin-date-guard`.

Do not create a GitHub Release for the same version after publishing it locally. For example, if `0.1.0` is published locally, configure trusted publishing and use the workflow starting with `0.1.1` or the next intended version.
