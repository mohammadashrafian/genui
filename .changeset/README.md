# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

When making changes to the codebase, run `pnpm changeset` to create a new changeset describing
what changed and the semver bump type (patch, minor, or major).

The CI will automatically open a "Version Packages" PR that bumps versions and updates changelogs.
Merging that PR triggers an automatic npm publish.
