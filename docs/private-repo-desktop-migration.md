# Abbate desktop updater: preparing a private source repository

## Current compatibility boundary

The published desktop release **0.2.0** has the update feed URL
`https://github.com/Cra4Zzy/Andreas-app/releases/download/desktop-update-feed/latest.json`
embedded in the native application. Taking this repository private immediately
would prevent unauthenticated existing desktop installations from accessing that
feed, even if newer apps used an alternative URL.

**Do not make the repository private or merge this branch yet.**

## Proposed bridge release 0.2.1

1. Build 0.2.1 with the same Tauri application identifier and updater signing key.
2. Prepare the signed binaries and a manifest with versioned URLs under
   `https://app.gabelstaplerfahrschule-andreas.de/dist/desktop/releases/desktop-v0.2.1/`.
3. Publish binaries to ALL-INKL with dedicated restricted FTPS credentials.
4. Fetch each file again over public HTTPS and compare it byte-for-byte.
5. Atomically publish `/dist/desktop/latest.json` after binary verification and
   compare it to the generated manifest.
6. **Only then** update the old GitHub `desktop-update-feed` release so 0.2.0
   clients can download the signed 0.2.1 bridge release.
7. Update website download links to the public ALL-INKL binaries.

The existing ALL-INKL frontend and Supabase data are not migrated or altered.

## Required sign-off before considering privacy

- Confirm clean GitHub Actions tests and a successful manual release.
- Confirm real Windows and macOS download links are publicly reachable.
- Confirm existing installed **0.2.0** clients update to **0.2.1**, and the
  installed 0.2.1 clients query ALL-INKL for future versions.
- Confirm legacy `desktop-pilot` downloads have either been migrated or
  withdrawn from the public site.
- **Maintain the legacy GitHub feed while any 0.2.0 installs may remain.**
  Taking the existing repository private would still break updater access for
  offline/rarely used 0.2.0 installs. A safe long-term plan may require a separate
  publicly accessible compatibility channel without public source code.
- Only after all routes are compatible and recovery is defined, change the
  source repository's visibility. Public clones made before that point cannot
  be revoked by changing visibility.

## Guardrails

- Development happens on `chore/private-repo-update-migration`; do not merge
  or manually dispatch the signed release before verification.
- FTPS credentials and Tauri private signing key remain GitHub secrets; never
  commit them, log them or expose them to the client.
- Keep immutable versioned binaries and signed manifest URLs.
