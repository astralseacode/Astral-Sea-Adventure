# Production regression investigation

## Finding and confidence

The exact local `dist/worker.js` does **not** reproduce the reported failures.
The current root `worker.js`, executed without the generated content prefix,
reproduces **all four reported responses with the same valid account state**.
This is strong evidence for a deployment artifact mismatch or missing bundle.
It is not proof of which file/version is serving live traffic: production code,
deployment metadata, and production logs were not accessible in this investigation.
Do not reset player data or deploy based solely on this local inference.

No generated lookup defect was found. No gameplay/runtime/build change was made.
The existing artifact was already fresh and was preserved byte for byte.

## Exact reproduction

Fixture: separate synthetic Discord account `987654321`, valid Level 50 progress,
Moonlit Reef, Adventure 1 entrance, no active enemy. The active adventure matters:
the reported attack response indicates an adventure exists, although combat does
not. A second fixture with no adventure was also tested.

| Command | Exact generated artifact | Root source without bundle |
| --- | --- | --- |
| shop | Normal Berry/Star Candy shop | Same normal shop |
| attack | Reported normal no-enemy response | Same normal no-enemy response |
| adventure | Moonlit Reef Adventures; Bubble Nibbler Hideout | Adventures are not available in Moonlit Reef right now. |
| cast moonbeam | There isn't an enemy to cast Moonbeam at yet. | The Astral Sea is unusually turbulent. Please try again shortly. |

With no adventure, both attack and cast in the correct artifact normally return
`You are not currently in an Adventure. Start one with /adventure.`

### Adventure failure chain

`performAdventureUnlocked` reads progress, selects
`getRegionById(progress.currentRegion) || REGIONS[0]`, then calls
`getRegionCombatEntries('moonlit-reef')`. The first availability dependency is
the enemy index, **before** loading an adventure manifest or room document:

```text
cache alias: combat:moonlit-reef
old URL suffix: /main/data/enemies/moonlit-reef/index.json
bundle key: enemies/moonlit-reef/index.json
```

Without the bundle, the precise error is:
`Missing bundled game content: enemies/moonlit-reef/index.json. Rebuild dist/worker.js.`
The availability catch converts this exception into the reported unavailable
message. That catch does not itself log the index error.

There is also an earlier content failure in `getPlayerProgress` when masteries
are missing: `masteries/starspark-mastery-1.json`. Its existing broad catch logs
`content.bundle` and returns default progress. Thus defaulted region/progress
can be a secondary consequence of absent content, even with healthy KV.
In the negative control, attack can still succeed and can normalize/write its
adventure record. A successful attack response therefore does not prove that all
progress/content dependencies worked. No live records were inspected or changed.

### Cast failure chain

For a nonempty spell argument, `performCastUnlocked` loads all 16 spell
definitions before checking combat eligibility. It then loads progress,
14 masteries, and 21 perks on the successful path. With no bundle, the first
rejection is raised by the initial spell registry load, before any KV read:

```text
log: Astral Sea runtime failure
command: cast
stage: content.bundle
errorName: Error
errorMessage: Missing bundled game content: spells/elf-blessing.json. Rebuild dist/worker.js.
```

This locally reproduced exception explains why even Moonbeam outside combat can
return turbulence. It is the predicted production exception, not an observed
production log. Shop uses inline `SHOP_ITEMS` and flavor tables and does not
prove the embedded JSON map exists.

## Content and path audit

The new permanent test observes `fetchCachedJson` while invoking the **actual
family loaders**, delegates to the original loader, and compares each returned
document against source JSON. It asserts exact equality of the set of paths
observed and the set of all source paths. No content loader is mocked to provide
documents. All 621 are embedded and all 621 were reached through family loaders.

| Family | Source | Embedded | Retrieved | Runtime key relative to data/ | Command coverage |
| --- | ---: | ---: | ---: | --- | --- |
| Spells | 16 | 16 | 16 | spells/{registry filename}.json | cast, Help!, combat |
| Masteries | 14 | 14 | 14 | masteries/{registry filename}.json | cast, combat, stats |
| Perks | 21 | 21 | 21 | perks/{registry filename}.json | cast, Storyteller, combat |
| Regions | 6 | 6 | 6 | regions/{region ID}.json | journal, progression |
| Exploration | 6 | 6 | 6 | explore/{region.file} | explore |
| Journal notes | 6 | 6 | 6 | notes/{region ID}.json | journal, explore note reward |
| Normal enemies and indexes | 186 | 186 | 186 | enemies/{region ID}/{enemy ID}.json or index.json | adventure, combat |
| Bosses | 180 | 180 | 180 | enemies/bosses/{region ID}/{boss ID}.json | all definitions validated by enemy loader |
| Adventures and manifests | 186 | 186 | 186 | adventures/{region ID}/{manifest filename} or manifest.json | list, start, directions, rewards, victory |
| **Total** | **621** | **621** | **621** | | |

Each region has 30 adventures, 30 normal enemies, 30 bosses, one adventure
manifest and one enemy index. Rooms and their flavor are nested in adventure
documents, not separate files. Items/shop tables, XP formulas, and some flavor
tables are inline Worker code: zero standalone JSON files in those categories.
All other JSON-backed content is included in the table; the set equality test
would fail on any unvisited miscellaneous document.

Normalization findings:

- Persisted regions use canonical IDs, not display names. Command normalization
  accepts IDs, display names, case/space variants and defined aliases; it removes
  apostrophes and converts separators to hyphens. All six display-name, uppercase,
  whitespace, and ID variants passed, including both apostrophe-bearing names.
- The builder preserves nested directories and converts filesystem separators
  to `/`. Nothing is flattened.
- The loader removes the exact `GITHUB_DATA_BASE + '/'` prefix and indexes by
  the remaining relative path; cache aliases such as `spell:star-spark` are not
  bundle paths. Registry filenames and manifest filenames remain authoritative.
- `star-spark` correctly resolves to `spells/starspark.json`; adventure internal
  IDs correctly resolve through their manifest filenames.
- All actual generated URLs have forward slashes, canonical lowercase filenames,
  the correct category prefix, and one `.json` suffix. No authored runtime path
  needs URL decoding. The loader does not promise to accept arbitrary backslashes,
  encoded spaces, or case variants in URLs, and no real loader generates them.
- Old URL construction and current URL construction are unchanged; the content
  transport changed from HTTP to the relative-key map. Every real family URL
  resolves to the same canonical JSON document as its corresponding source file.

## Tests, harness, and coverage boundaries

Previous architecture testing did exercise **both** kinds of fixtures: the
27 Free-tier scenarios read exact `dist/worker.js`; many older combat suites
execute root source with mocked content. The earlier 621-file parity loop called
the real generic loader with constructed URLs. The new test additionally proves
all paths are reached by actual registry/manifest/family loaders and adds the
reported no-combat sequence and a wrong-upload negative control.

Execution used the available Node-backed offline harness. Test CommonJS modules
were loaded through `node:vm`; the generated Worker's sole module export was
adapted to a local binding. Content and gameplay code were otherwise unchanged.
Discord signatures/transport and KV are simulated; no external game data is
fetched. This is not a Cloudflare workerd, CPU-limit, or real distributed-KV test.

Validation results:

- New artifact test: 48 sequence commands (four commands, with/without active
  adventure, across all six regions), plus all 27 architecture scenarios: PASS.
- Moonlit Reef, Starfall Trench, Whispering Kelp Forest, Leviathan's Wake,
  Sunken King's Throne, Astral Nexus: adventures available; normal no-combat
  cast rejection; zero runtime error logs for every sequence.
- All 621 documents retrieved and source-equal through real loaders: PASS.
- Cold paths under simulated 50-request ceiling: zero content requests, at most
  one write per changed key per command: PASS.
- Additional 100 spell and 100 perk definitions: zero content requests: PASS.
- Staging: read-your-writes, delete, serialized mutations, abort before flush,
  first-write failure, partial-flush diagnostics, poisoned reads, Twitch: PASS.
- Direct vs staged progress reads match in every region; stored region retained,
  no enemy invented, active adventures retained by the correct artifact: PASS.
- Stress: 1,000 exact generated-artifact commands, 71 encounters, zero exceptions;
  1,000 source-fixture reliability commands, 74 encounters, zero exceptions.
- Shared combat, Help!, Storyteller, Shizuki's Presence, Fae Mischief, Conjure Gun
  and roll isolation, Legacy, Wake, progression, adventure/explore/journal: PASS.
- Explicit artifact semantic checks include adventure reward, explore XP,
  journal heading, victory cleanup, Level 50 unlock, and Help! causing Storyteller
  chapter 1 with enemy HP 443 -> 222.
- 45 test scripts executed: **42 passed**, three known stale failures unchanged:
  Evocation approved-flavor digest; obsolete Stim progression-command assertion;
  Jellyfish damage expectation 4 versus current 23. No gameplay adjusted for them.
- Expansion validator: 180 adventures, 180 normal enemies, 180 bosses, 621 JSON:
  PASS. All 621 JSON documents parse. JavaScript syntax: 51 files PASS.
- Generator `build({check:true})`, equivalent to `node scripts/build-worker.cjs
  --check`, passed before changes and after validation. No regeneration needed.
- `git diff --check`: PASS.

Not run: live Discord invocations, production logs/code download, Cloudflare
workerd/Miniflare, actual Free CPU enforcement, cross-isolate KV propagation,
production deployment. No claim is made that offline timings prove live limits.

## Changes made

1. Added `scripts/test-deployment-artifact.cjs` with actual-family retrieval,
   six-region sequence, explicit gameplay outcomes, and root-upload negative control.
2. Added optional account ID and initialization control to the existing test
   harness so both scripts can receive identical valid KV state without loading
   missing definitions during test setup. Defaults preserve existing fixtures.
3. README now requires artifact smoke testing after generation.
4. Added this report.

Root Worker, generator, dist artifact, all source JSON, gameplay, Levels 1-50,
Help!, Storyteller, approved flavor, no-emoji behavior, and diagnostics are unchanged.
Staging remains enabled. No raw-GitHub fallback was added; cold content requests
remain **zero**. Existing multi-key partial-commit and cross-isolate concurrency
limitations remain as documented in the architecture report.

## Identify the live artifact before deciding the next action

No Wrangler configuration or automated deployment workflow exists in this repo.
A manual editor/upload workflow can therefore select root source, a stale file,
or another version. A truncated bundle may fail syntax outright; a script that
omits the generated prefix but retains root code produces this exact pattern.
The repository cannot establish what Cloudflare currently serves.

For existing live logs: Cloudflare dashboard -> Workers & Pages -> select the
Worker -> Logs -> Live. Inspect a failing cast's `Astral Sea runtime failure`
event and share only `command`, `stage`, `errorName`, and `errorMessage`.
Do not share request headers, tokens, player IDs, or KV values.
This navigation follows [Cloudflare's real-time logs documentation](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/).
If an existing failure is unavailable, any new live test is a user action; none
was invoked by this investigation.

Also inspect the currently active deployment/version's script, not merely an
unsaved editor draft. Compare its first two comment lines with the following.
Root source begins `const GITHUB_EXPLORE_BASE =` and has no generated prefix.
A different digest signals different source/content. A matching comment is useful
but not a complete byte-integrity guarantee; compare full downloaded bytes when
the upload workflow preserves them. Minification may change bytes/comments.

```text
// GENERATED by scripts/build-worker.cjs. DO NOT EDIT.
// Source/content SHA-256: 82106272d25da1a61ee6842755dd7ccc2d2b8e2bc5643a8a49bce18108e25554
```

Exact future upload artifact:
`C:/Users/Foxyy/OneDrive/Documents/Astral Sea Adventure/Astral-Sea-Adventure/dist/worker.js`

- UTF-8 file size: **1,682,811 bytes**.
- Complete file SHA-256: `0c1234b4f733ff566ae4ed11bd6de678a97ceca416bb01fbf0914b15d7a2c56f`.
- The source/content digest above is distinct from the complete file hash.
- Verify locally with `Get-FileHash -Algorithm SHA256 -LiteralPath .\dist\worker.js`.
- Record the Cloudflare version ID beside this hash when a future deployment is
  approved; verify the version serving the Discord endpoint matches that record.

**Nothing was deployed, committed, pushed, reset, or changed in live KV.**
The remaining evidence needed to confirm production root cause is the active
script identity and sanitized cast diagnostic. Local investigation is complete;
production attribution remains provisional until that evidence is supplied.
