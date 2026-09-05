# Releasing

This package is published to the public npm registry as `eslint-plugin-date-guard`.

## Release Workflow

Releases are staged through GitHub Actions and npm trusted publishing. The workflow uses GitHub OIDC and does not require an `NPM_TOKEN` secret.

The npm package settings should be:

1. Trusted Publisher: GitHub Actions.
2. Organization/user: `davidbes`.
3. Repository: `eslint-plugin-date-guard`.
4. Workflow filename: `release.yml`.
5. Allowed actions: leave `Allow npm publish` unchecked, so the workflow can only run `npm stage publish`.
6. Publishing access: require 2FA and disallow bypass 2FA tokens.

## Releasing a Version

1. Update `version` in `package.json` and `package-lock.json`.
2. Run `npm run verify`.
3. Commit and push the version change.
4. Create and publish a GitHub Release with a tag matching the package version, for example `v0.1.1`.
5. Wait for the workflow to stage the package.
6. Review and approve the staged package with 2FA on npmjs.com, or use the CLI:

```sh
npm stage list eslint-plugin-date-guard
npm stage view <stage-id>
npm stage approve <stage-id>
```

The workflow runs `npm ci`, `npm run verify`, checks that the release tag matches `package.json`, and then runs `npm stage publish` against the public npm registry. The package is not publicly released until a maintainer approves the staged package.

The workflow can also be run manually with `workflow_dispatch`, but manual runs only execute `npm stage publish --dry-run`.
