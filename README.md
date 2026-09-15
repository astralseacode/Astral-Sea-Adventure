# Astral-Sea-Adventure
This is the base code to the Astral Sea that works on streamelement commands for Twitch ^^

## Build and validate locally

Edit `worker.js` for code and the individual files under `data/` for content.
All source JSON remains authoritative; do not edit generated copies.

```text
node scripts/build-worker.cjs
node scripts/build-worker.cjs --check
node scripts/test-deployment-artifact.cjs
node scripts/test-free-tier.cjs
node scripts/test-runtime-reliability.cjs
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-expansion.ps1
git diff --check
```

The deterministic build validates and embeds every source JSON file into
`dist/worker.js`. `--check` fails if that artifact is missing or stale. Rebuild
after changing code or content. No dependencies, network access, account changes,
or deployment are performed by the build.

Generation alone does not validate a release. The deployment-artifact smoke test
must pass before uploading: it executes the exact generated file, checks every
document through the game's real loaders, and exercises all six regions.

**The standalone upload artifact is now `dist/worker.js`, not the root
`worker.js`.** It retains the same module Worker export and existing bindings,
routes, secrets, and command schema. The repository does not contain a Wrangler
configuration; use this artifact wherever the existing manual upload workflow
previously used the root file. No remote JSON uploads are required for runtime
content loading. Deployment and command registration are separate manual actions.

Static definitions are lazily parsed and recursively frozen within the Worker;
commands perform zero external requests to load game content. Player state is
never stored in the static definition cache.

Discord and Twitch commands stage KV mutations in memory and flush each changed
key once. This is not a multi-key database transaction or a distributed lock.
See `FREE_TIER_ARCHITECTURE_REPORT.md` for failure behavior, measured counts,
and the remaining KV concurrency/rate-limit limitations.
