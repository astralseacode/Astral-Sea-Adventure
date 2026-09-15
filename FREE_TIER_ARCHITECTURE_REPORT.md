# Free-tier architecture and persistence report

Local implementation, 2026-09-15. The live Worker is confirmed to use Free.
This report supersedes the architecture risks in RUNTIME_RELIABILITY_AUDIT.md;
the audit and its structured diagnostics are preserved.

## Outcome and scope

All 621 source JSON files remain unchanged. No spells, perks, masteries,
commands, progression levels, regions, journals, adventures, or flavor were
removed. The new generated standalone Worker performs **zero external content
fetches** on both cold and warm commands. Every changed key is physically written
at most once per Discord/Twitch command in the tested production entry paths.

This eliminates the 51-fetch cold-cast failure and intermediate same-command KV
writes. It does not make Workers KV atomic, strongly consistent, or exempt from
its limits across separate requests. Nothing was deployed.

## Why the original path made 51 requests

The sources are individual JSON files in data/spells, data/masteries, data/perks,
and the other data directories. The root Worker had no imports, asset binding,
Wrangler configuration, dependency manifest, or build step in this repository.
It used fetch() against raw.githubusercontent.com URLs under the repository's
main/data directory. These were external HTTP subrequests, not KV or local
Worker asset reads.

getSpellDefinitions eagerly fetched all 16 registered spells before resolving a
name. getPlayerProgress/getActiveMasteries fetched all 14 masteries, and
getActivePerks fetched all 21 perks. Filtering by level happened after loading.
That made 16 + 14 + 21 = 51 on a cold cast, including ordinary Moonbeam.
The five-minute per-isolate DATA_CACHE hid these requests on warm invocations;
it did not protect cold starts and did not deduplicate concurrent cache misses.
Exploration also fetched its regional log file directly, outside that cache.
Victory unlocks could fetch even more content: the measured level-up path used 59.

## Chosen build and authoring architecture

- Keep root worker.js as the editable code and all individual data/**/*.json as
  the authoritative authored content.
- scripts/build-worker.cjs walks every JSON path in deterministic sorted order,
  parses it to validate JSON, and generates dist/worker.js.
- The artifact embeds a generated path-to-JSON-string map plus the Worker code.
  JSON strings are parsed lazily on first lookup, then recursively frozen and
  cached. This avoids eagerly parsing all 621 documents at startup.
- Existing content loaders keep their validation and call sites. Their old URLs
  are now lookup keys; fetchCachedJson never sends HTTP. Exploration uses the
  same bundled lookup. Missing data is a diagnosed content.bundle error; there
  is no remote fallback that could silently restore the subrequest problem.
- The Worker remains a single module with the same export, routes, bindings,
  secrets, and command schema. No new service, database, or asset binding is
  needed. Where the existing manual upload used root worker.js, a future reviewed
  upload must use **dist/worker.js**. The root source alone is not deployable
  game content anymore.
- Editing data/spells/help.json requires only rebuilding, not editing duplicate
  hand-maintained definitions. Future definitions still use the existing ID
  registries when appropriate, but registering one does not add an HTTP request.

Commands documented in README.md:

    node scripts/build-worker.cjs
    node scripts/build-worker.cjs --check
    node scripts/test-free-tier.cjs
    node scripts/test-runtime-reliability.cjs
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-expansion.ps1
    git diff --check

The check compares the exact deterministic artifact with a fresh render and
fails on missing/stale output. A source/content SHA-256 is included in its
generated header. There are no timestamps or machine-specific paths in it.
The build is local, dependency-free, and sends no network requests.
The artifact is 1,682,811 UTF-8 bytes; measured gzip size is 360,453 bytes.

## Cold command measurements

Each row used a fresh Worker VM, a cleared content cache, Level 50 local progress,
the same seeded rolls, and the real Discord router. Setup writes are excluded.
The legacy HTTP transport served local files with a relaxed budget so full old
counts could be measured. The new artifact enforced a maximum of 50 external
subrequests. Each measured row used zero follow-ups; separate delivery tests
cover outputs requiring follow-ups. Content count is not a claim that Discord
follow-up requests cease to exist.

Star Spark and Jellyfish use their actual Discord values star-spark and jelly;
the architecture pass does not introduce new spell aliases. /stats supplies the
existing level/status display; no removed progression command was restored.

| Command/scenario | Content fetches before | After | Progress puts before | After |
| --- | ---: | ---: | ---: | ---: |
| moonbeam | 51 | 0 | 3 | 1 |
| star spark | 51 | 0 | 3 | 1 |
| jellyfish | 51 | 0 | 5 | 1 |
| Help! | 51 | 0 | 2 | 1 |
| conjure gun | 51 | 0 | 3 | 1 |
| attack | 35 | 0 | 2 | 1 |
| explore | 16 | 0 | 1 | 1 |
| adventure | 17 | 0 | 0 | 0 |
| journal | 20 | 0 | 0 | 0 |
| level/status | 14 | 0 | 0 | 0 |
| inventory/profile | 14 | 0 | 0 | 0 |
| victory/reward | 43 | 0 | 2 | 1 |
| defeat | 35 | 0 | 1 | 1 |
| stim | 35 | 0 | 2 | 1 |
| evocation | 51 | 0 | 2 | 1 |
| berries | 51 | 0 | 2 | 1 |
| familiar | 51 | 0 | 2 | 1 |
| echo | 51 | 0 | 1 | 1 |
| wake | 51 | 0 | 3 | 1 |
| wake arrival | 36 | 0 | 3 | 1 |
| Storyteller threshold | 51 | 0 | 2 | 1 |
| Familiar/Bond | 36 | 0 | 3 | 1 |
| level-up unlock | 59 | 0 | 2 | 1 |
| adventure reward | 22 | 0 | 1 | 1 |
| adventure berries | 22 | 0 | 1 | 1 |
| adventure combat start | 22 | 0 | 0 | 0 |
| adventure victory | 37 | 0 | 2 | 1 |

Counts are deterministic examples, not universal maxima for every random branch.
After the change the zero-content-fetch and at-most-one-write/key invariants
apply independently of branch. Adventure reward, berry discovery, and combat
start also reduced adventure-key puts from 2 to 1. A new adventure writes only
its adventure key; read-only status/journal/profile paths write no changed
progress in these fixtures.

## Growth, cache, and state isolation

The scalability test adds 100 synthetic spells and 100 synthetic perk files to
the generated representation in memory. It registers the extra spells so the
eager spell loader actually visits them and explicitly loads the extra perk
files. Content requests remain **zero**, not 49 or 50. No synthetic files are
written to data/.

DATA_CACHE now caches parsed immutable static definitions for the lifetime of
the deployed version; a new build/Worker version supplies new content. Clearing
it changes parsing work only, never network correctness. Definitions and nested
arrays are frozen and mutation isolation is tested. Player/combat state is kept
in command-local maps and existing KV keys, never in that static cache.
No request correctness depends on a previous warm content request.

## Same-key write audit and consolidation

The new withCommandPersistence boundary surrounds Discord command dispatch,
authorized /devlevel, and Twitch command dispatch. It holds a command-level
per-player in-isolate lock through final persistence. Existing gameplay/action
locks remain inside it with separate lock keys.

The command-local Backpack view:

1. Reads each key into a command-local snapshot, deduplicating concurrent reads.
2. Stages puts and deletes; subsequent reads see the latest staged value.
3. Lets all existing payment, reward, healing, and rollback code run unchanged
   against this staged view.
4. Discards staged state if command execution throws, or if any KV read failed
   even when a legacy helper caught that error.
5. On success, flushes each changed key once. No-op writes/restorations are skipped.
   The final write's TTL/options are retained for changed puts.

Multi-write sources identified by inspection and instrumented paths:

- Progress normalization during reads can save stats, caps, rest-buffer state,
  status effects, and level-granted stat points before a later command save.
- Combat cap synchronization can save combat before final turn persistence.
- Ordinary spell payment, Expedition counters/milestones, Familiar assistance,
  Echo/Legacy restoration, Curiosity rewards, Harmony/Momentum, and Jellyfish
  effects can each write progress before the enemy turn's final save.
- Enemy responses can add Bubble recovery or other resource updates before the
  final HP/progress save.
- Help! previously saved Mana payment and then final enemy-response progress.
- Berries and Familiar saved payment and resulting state separately.
- Evocation and Stim saved their immediate effects before normal turn resolution.
- Wake can save payment, cooldown advancement, delayed arrival restoration, and
  final action/turn state.
- Victory combines prior action saves with reward/XP/Harvest/Defiance and
  adventure/unlock persistence. A defeat can similarly follow an already-paid
  spell or resource-changing turn.
- Adventure directions save last-direction state, then reward/room/combat status;
  start, advancement, completion, and retry paths can touch adventure/combat
  multiple times. Rewards can also touch progress and candy keys.
- Inventory/candy/berry changes, eating, shop purchases, rest/cooldowns, stat
  allocation, daily/gamble, and their rollback branches all pass through the
  same staging boundary. Distinct keys are still distinct commits.
- Storyteller's chapter mutation is persisted with the final combat state; it
  does not require an independent write.
- An already-applied /devlevel override now performs zero writes rather than
  rewriting an identical value. Its regression assertion was updated for this
  intentional persistence change; XP/stat behavior was not changed.

No top-level player command is intentionally allowed multiple physical puts to
the same key in one invocation. Helper-level save calls remain because they
express read-after-write and rollback behavior relied upon by the game. Calling
internal helpers directly outside a command boundary (as older unit fixtures
do for setup) is not a production command and is not write-consolidated.

## Failure behavior and data integrity limits

Before flushing, a gameplay exception discards the staged view: zero physical
writes, including zero physical rollback writes. In-memory rollback reads still
work, so removing intermediate persistence does not erase required state
transitions.

A failed first physical write yields the generic error once and makes no retry
or compensating write. The rejecting-write fixture confirms unchanged storage
and one attempted write. This specifically breaks the previous
write -> 429 -> rollback write -> 429 chain.

If a later key fails, earlier acknowledged writes can already be durable. The
error is logged with committedKeyCount, along with command, operation/category,
stack, response state, and redaction. This counter counts completed operations;
a transport failure cannot prove whether an unacknowledged write reached storage.
There is no automatic retry of gameplay or rewards and no claim of atomic
multi-key rollback. Tests deliberately exercise failure on the combat key
after progress has committed.

This limitation already existed with separate KV keys. Consolidation removes
intermediate commits but cannot supply a cross-key transaction. Failed partial
commits still require investigation; blindly retrying a user command can see
partially updated data. No data migration or new persistence technology was
introduced.

## Concurrency and remaining Free-tier limitations

Concurrent commands for the same player in one isolate are serialized through
their flush. A test runs ten overlapping read/increment/write commands without
lost updates. Each individual command has a consistent read-your-writes view.

Remaining limitations are explicit:

- Locks are in-memory, not distributed across Worker isolates or regions.
- KV remains eventually consistent. The next command can read stale data, and
  commands in different isolates can overwrite each other or duplicate rewards.
- This pass enforces one changed write per key **per command**, not one write per
  second globally. Two separate commands writing the same key within a second
  may still receive KV 429. No speculative sleep/retry was added.
- Discord interaction-ID deduplication and cross-platform identity-wide locks
  were not introduced.
- Free-plan daily quotas and CPU limits still apply; lower per-command costs do
  not imply unlimited players or traffic.

Thus this is a targeted fix for the demonstrated cold-loading and repeated
within-command write failures, not a guarantee of strongly consistent gameplay
under arbitrary concurrent traffic.

## Discord acknowledgement and diagnostics

The selected cold-command local measurements fell from roughly 2–13 ms before
to 0–4 ms after in the final small-path measurement. These are offline wall times,
not Cloudflare CPU measurements or real KV/network latency. Request-local reads
and write consolidation reduce I/O, but storage latency and lock queues can
still approach Discord's three-second initial-response deadline.

No interaction-delivery redesign was made. Gameplay still executes once; initial
responses, safe 1,900-unit chunks, ordered follow-ups, and caught/logged follow-up
failures remain covered. The existing 250 ms delay is still a heuristic, not an
acknowledgement guarantee.

Structured diagnostics from the audit remain. Static loading now reports
content.bundle/content.json/definition-validation errors. KV read/write,
combat-stage, initial-response, follow-up, and outer Worker diagnostics remain,
and partial-commit counts were added. Twitch's command/stage is now recorded
without logging its username. Tokens, identities, keys, URLs, authorization,
quoted values, and secrets remain redacted. Players still get the generic
turbulence message for unexpected errors.

## Mechanical and narrative preservation

All 27 measured scenarios were run against the original implementation and the
new standalone artifact with the same seed. Receipts and final stored state
matched after normalizing timestamps. No source content changed.

Help! remains Level 50, requires at least 150 current Mana, costs
Math.round(currentMana / 2), is once per battle, and uses one raw d20 with
1–10 failure and 11–20 success. Success removes Math.floor(currentEnemyHP / 2).
No offensive scaling, critical, Fae Mischief, Storyteller/Charge discount, or
second mechanical shot was introduced. Both outcomes consume the action, cost,
and use. Its approved flavor and emoji-free output are unchanged. No new
player-facing flavor or emojis were added anywhere. Existing Levels 1–49 and
their content are preserved rather than rewritten by this architecture pass.

## Validation results

- 44 offline suites executed: **41 passed**, with the same three known baseline
  assertion failures below.
- Free-tier suite: 27 cold paths, explicit external budget 50, zero content
  requests, at most one physical put per changed key; +200 synthetic definitions.
- Persistence tests: in-memory rollback/discard, rejecting first write, later-key
  partial failure, poisoned reads, staged put/delete visibility, no-op writes,
  serialized concurrent commands, and Twitch routing.
- Generated-artifact stress: **1,000 sequential commands**, 71 encounters, zero
  exceptions, zero content requests, one-write/key/command ceiling enforced,
  clearing the content cache on every command.
- Shared runtime reliability stress: **1,000 sequential commands**, 74 encounters,
  zero exceptions; 14 screenshot follow-up spell inputs also passed.
- Total across those two stress runs: **2,000 sequential commands**.
- Required suites passed: shared combat/Wake, Help!, Storyteller, Shizuki's
  Presence, Fae Mischief, Conjure Gun isolation, Legacy, Discord long responses,
  level-up/schema, and all other previously passing combat suites.
- Adventure/explore/journal/status paths passed both cold measurements and
  before/after receipt/state comparisons.
- Deterministic generation and --check passed.
- Expansion validator passed: 180 adventures, 180 normal enemies, 180 bosses.
- **621 JSON files parsed; 50 JavaScript files syntax-checked**, including the
  generated Worker.
- git diff --check passed.

Known unchanged baseline assertions:

1. Evocation: approved-text digest mismatch.
2. Stim: expects the obsolete progression command.
3. Jellyfish Mastery II: expects 4 at Level 50 while existing Fae Mischief/Legacy
   resolves 23.

The /devlevel test was separately updated to expect no write for an unchanged
repeat invocation and passes. No gameplay was altered to satisfy the three
stale assertions.

All suites above actually executed through the offline Node-backed CommonJS/VM
harness. Direct node CLI was not run because no executable is on PATH.
Cloudflare deployment/startup/CPU measurements, real Discord acknowledgement,
live KV consistency/rate enforcement, and the historical narrative-only
baseline validator were not run. No live data or account settings were accessed.

## Files changed in this pass

- worker.js: bundled content access, shared command staging/flush, retained
  diagnostics plus commit context.
- scripts/build-worker.cjs: deterministic standalone generator and freshness check.
- dist/worker.js: generated, reviewable standalone artifact; do not hand-edit.
- scripts/test-free-tier.cjs: cold paths, growth, persistence, concurrency, and
  generated-artifact stress.
- scripts/test-runtime-reliability.cjs: prior failure probes now assert safe cold
  loading/single commit and preserve failed-commit diagnostic coverage.
- scripts/test-devlevel.cjs: intentional no-op-write expectation.
- README.md: integrated authoring/build/check/validation and upload-artifact guide.
- FREE_TIER_ARCHITECTURE_REPORT.md: this report.

RUNTIME_RELIABILITY_AUDIT.md and its prior diagnostics remain in the working tree.
All 621 data source files remain intact. Nothing was deployed, committed, pushed,
remotely registered, written to live player/KV data, or changed in the Cloudflare
account or plan.

## Platform references

- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- KV write constraints: https://developers.cloudflare.com/kv/api/write-key-value-pairs/
- KV consistency: https://developers.cloudflare.com/kv/concepts/how-kv-works/
- Discord lifecycle: https://docs.discord.com/developers/interactions/receiving-and-responding
