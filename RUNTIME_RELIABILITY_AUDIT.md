# Runtime reliability audit

Local audit, 2026-09-15. Baseline: `fc41c91` (`lvl 50 Help! Spell`).

## Finding

The live incident's root cause is **not confirmed**: no production exception log,
Worker plan/configuration, or timing trace was supplied. Two distinct failure
mechanisms reproduce the exact player-facing fallback under documented platform
constraints. Ordinary gameplay and the supplied screenshot sequence do not.

Only diagnostic logging was changed in the Worker. No caching, persistence,
response delivery, spell rules, random rolls, flavor, or balance was changed.
The platform probes intentionally continue to reproduce the failures; this is
not a claim that production reliability has been fixed.

## Exact fallback sources and call chain

There are exactly two emitters in `worker.js`:

1. `handleDiscordInteractionCore`, its command-dispatch catch (currently line
   1739): returns an ephemeral type-4 Discord message. Any exception escaping a
   dispatched command can reach this catch: content fetching/validation, KV,
   gameplay, state validation, or response construction. It is not a special
   timeout, Help!, or rate-limit detector.
2. Exported `fetch`, its outer catch (currently line 1011): returns plain text
   with HTTP 500. This catches errors outside the command catch, including
   request verification, pre-command shop-session deletion, response splitting
   or scheduling, other routes, and Twitch. An HTTP-500 text response is not a
   valid successful Discord interaction acknowledgement.

Normal cast chain:

`fetch -> handleDiscordInteraction -> handleDiscordInteractionCore -> /cast
dispatch -> performCast -> withPlayerMutationLock -> performCastUnlocked ->
content/progress/combat loading -> spell resolution -> enemy response/victory ->
savePlayerProgress/saveCombatState -> discordMessage -> long-response handling`.

An exception in the cast chain returns through the awaited calls to the command
catch. Normal gameplay rejections return messages instead of throwing.
Malformed request JSON and bad signatures have their own responses. Failure to
parse an already-built response as JSON returns that response unchanged.

## Existing and added diagnostics

The original command catch called `console.error` with `Discord /<command> error:`
and the original Error object. The outer catch logged `Astral Sea Worker error:`
and the Error. Thus top-level exceptions were **not swallowed**. An Error object
normally carries a stack, but the old code did not explicitly serialize it or
record subsystem, elapsed time, or response phase.

Two broad catches were less useful: `getPlayerProgress` returns an empty progress
object for errors inside its normalization block, and `getCombatState` returns
null for errors inside its parse/normalization block. Those blocks include
dependent content/storage operations, not just JSON parsing. This can disguise
storage failures as absent/default state. Their existing behavior remains; they
now log failures. Initial KV reads outside those blocks already propagated.

New structured records contain command, subsystem/stage, elapsed milliseconds,
exception name/message, stack, fetch exception cause, and response phase. KV
errors identify only operation and namespace category, never the actual key or
value. Content fetching, HTTP, JSON parsing, and definition validation have
distinct labels. Combat cast, player action, enemy response, Wake, Help!, and
victory have stage labels. Follow-up delivery has its own label.

The logger does not include command arguments, request bodies, player snapshots,
headers, or interaction credentials. Known request identities/secrets are
redacted, as are URLs, authorization values, player-key patterns, quoted text,
and long numeric IDs. Redaction and unchanged generic player output are tested.
Response phases describe what this Worker prepared; they do **not** claim that
Discord acknowledged receipt. Existing unrelated log sites were not rewritten.

## Reproduction A: cold content requests exceed the Free-plan allowance

The cast path loads all definitions, even when the requested spell is an ordinary
Moonbeam or a repeat/underfunded Help! attempt:

| Definition group | External fetches on a cold cache |
| --- | ---: |
| Spells | 16 |
| Masteries | 14 |
| Perks | 21 |
| Total | 51 |

`getSpellDefinitions` loads 16 files. Progress loading/active masteries loads 14
more. Active perks loads another 21. The local probe restored the real
`fetchCachedJson` implementation, cleared `DATA_CACHE`, served responses from
local files, and rejected external fetch number 51. No real HTTP was sent.

An ordinary `/cast moonbeam` then produced:

`Could not fetch perk:storyteller: Too many subrequests.`

The command catch returned the exact turbulence message. Resetting the per-request
fetch counter and repeating in the same now-warm instance fetched only the
remaining file and succeeded. The cache is per-isolate, expires after five
minutes, and has no in-flight request deduplication. Cold instances, expirations,
and overlapping cache misses can therefore make content failures intermittent.

Cloudflare documents 50 external subrequests per invocation on Workers Free;
Paid defaults are different. The deployment plan is unknown, so this is a
**reproduced Free-plan incompatibility, not proof of the live incident's cause**.
Other content-dependent commands/victories and follow-ups may add requests.
Adding Help!'s data entry raised these registries from 50 to 51; its combat
mechanics and flavor are not necessary to trigger this failure.

Source: https://developers.cloudflare.com/workers/platform/limits/

## Reproduction B: repeated progress-key writes

Cloudflare KV documents a maximum of one write to the same key per second;
excess writes can throw 429 errors. The existing command flow performs multiple
separate writes, sometimes on additional random/reward branches.

The local probe permits the first write to each key and rejects the second
within the command. An ordinary Moonbeam produced the turbulence response.
There were three attempted writes to its progress key: Mana payment, the next
progress update, then rollback after the failure. The rollback also failed.
Successful offensive casts can save the Expedition counter, recovery/perk
effects, and final HP separately. Help! itself saves its payment and then saves
final progress in the enemy response. No Help! cast is needed for this problem.

The probe demonstrates a realistic platform failure path, not the actual timing
or enforcement behavior of the unseen live request. No speculative delays,
retries, write buffering, or storage migration were added.

Source: https://developers.cloudflare.com/kv/api/write-key-value-pairs/

## State, concurrency, and serialization audit

- The mutation promise chain serializes operations only within one isolate.
  It neither spaces writes one second apart nor locks across isolates.
- Progress and combat are separate KV keys with no atomic transaction. Partial
  commits and failed compensating writes are possible. A turbulence response
  does not guarantee that nothing was persisted.
- There is no general Discord interaction-ID deduplication. A separately
  redelivered interaction is different from follow-up delivery retry; the latter
  does not rerun gameplay.
- Several operations reread progress after writing it. KV is eventually
  consistent, including no absolute same-location read-after-write guarantee.
  This is a consistency risk; it was not reproduced against live KV.
- Stored combat/progress data are plain JSON. Optional fields serialize normally;
  no circular object, BigInt, invalid recent field, or unbounded binary-shot
  state was observed. The largest stored value in the stress run was 1,377 bytes.
  This observation does not bound every possible production account.
- The screenshot's once-per-battle flag, First Page chapter, odd enemy maximum,
  and post-turn Mana all pass current state validation.

Source: https://developers.cloudflare.com/kv/concepts/how-kv-works/

## Discord lifecycle and platform audit

Gameplay runs once before the response is split. Short outputs use one type-4
response. Long output returns the first nonempty chunk, with remaining chunks
sent in order through `/webhooks/<application>/<token>` using `ctx.waitUntil`.
Content is capped at 1,900 UTF-16 units per chunk and surrogate boundaries are
preserved. Follow-up bodies contain content, optional ephemeral flags, and
disabled mentions. No second initial-response call was found.

The follow-up promise has its own catch. HTTP 503 and thrown delivery errors
are logged, do not rerun gameplay, and do not propagate to the turbulence catch.
This is covered by the existing long-response suite and the new fixture.
Missing follow-up credentials return the existing separate delivery warning.

There are real timing risks that are **not established causes of this message**:

- The Worker does not defer acknowledgement before content/KV/gameplay work.
  Discord requires an initial response within three seconds; tokens last fifteen
  minutes for follow-ups. Slow content, KV, or lock queues can exceed that window.
- The 250 ms follow-up delay is a heuristic, not acknowledgement confirmation.
  Without a `waitUntil` context, the fallback branch awaits follow-ups before
  returning the first response. Production's Worker entry passes its context.
- A follow-up HTTP 429 is logged but not retried. No follow-up or content fetch
  has an application-level deadline. Neither issue reruns the action.
- Cold content loading, validation of all definitions on repeated reads, and
  JSON work consume CPU/subrequests. Actual Cloudflare CPU limits and production
  latency cannot be measured in the offline harness. Platform CPU termination
  is not necessarily a catchable JS exception and does not inherently emit this
  custom turbulence text.

Sources:
https://docs.discord.com/developers/interactions/receiving-and-responding
https://developers.cloudflare.com/workers/platform/limits/

## Screenshot and recent combat systems

Reproduced the exact natural 17 success, 443 -> 222 enemy HP, 250 -> 125 Mana,
First Page activation, enemy natural 13 for 30 damage, and
`HP 170/200 | MP 125/250 | Enemy 222/443`.

The fixture uses valid long-rest caps (Vitality 5, Focus 10) and enemy damage
bonus 15 to match the reported receipt. It does not assume hidden live modifiers.
Each of 14 next-spell inputs was tested from this reconstructed state. Both
`help` and `help!` return the normal already-used rejection; other casts complete
or return normal gameplay rejections without exceptions.

Inspection and focused suites covered Tidal Wave, Meteor Alignment, Rising
Power/Rhythm, Fae Intervention, Familiar/Bond, Conjure Gun and natural-roll
isolation, Echo, Legacy, Fae Mischief, Shizuki's Presence/overflow, Storyteller,
Help!, delayed Wake, enemy turns, and victory/reset handling. No reproducible
gameplay exception was found in these paths. This is bounded test evidence, not
proof that every possible persisted state is safe.

Help!'s long output did not trigger turbulence in local response handling.
Length can require extra follow-up fetches; this is a request/delivery concern,
separate from the halving calculation or the next command's game state.

## Validation

New `scripts/test-runtime-reliability.cjs` uses the actual Worker/Discord command
and response handlers. Only signature verification, HTTP transport, and KV are
faked locally. Deterministic seed `0x51EA`; queued rolls reproduce the screenshot.

- 1,000 sequential Discord combat commands, 74 encounters, 73 completed battles:
  zero exceptions with unconstrained local persistence/content transport.
- 14 screenshot follow-up inputs passed.
- Both documented-limit probes reproduced turbulence as expected; the warm
  retry succeeded. New stage assertions failed against the original Worker and
  passed after diagnostics were added.
- Redaction, generic player output, normalization-error logging, and follow-up
  failure without rerunning gameplay passed.
- Existing suites passed: shared Wake harness (13 groups), Help!, Storyteller,
  Shizuki's Presence, Fae Mischief, Conjure Gun isolation, Legacy, Discord long
  responses, Tidal Wave, Meteor Alignment, Rising Power, Fae Aid/Intervention,
  Bond, Conjure Gun, Rhythm, Familiar, Echo Mastery I.
- Three existing suite failures reproduced on the unmodified audit baseline:
  Evocation's text digest differs; Stim expects the removed progression command;
  Jellyfish expects 4 damage at Level 50, where Fae Mischief changes 1/1/2 to
  1/1/1 and Perfect Jellyfish/Legacy produces 23. These assertions are test-only,
  not runtime exceptions. No gameplay or expected values were altered to pass.
- Expansion validator passed: 180 adventures, 180 normal enemies, 180 bosses,
  **621 JSON files**.
- JavaScript syntax and all JSON parsing passed; `git diff --check` passed.

Tests actually ran through the offline Node-backed VM/CommonJS harness. Direct
`node` CLI commands were not run because no executable is available on PATH.
Production timing, Cloudflare enforcement/plan, live content availability, actual
Discord acknowledgement/token acceptance, and live logs were not tested or
accessed. The historical narrative-formatting validator was not run; it checks
a separate pre-cleanup baseline, and this task makes no narrative edits.

## Files and next evidence needed

- `worker.js`: diagnostics only, including logs in existing broad state catches.
- `scripts/test-runtime-reliability.cjs`: screenshot, stress, platform probes,
  and diagnostic regression checks.
- `RUNTIME_RELIABILITY_AUDIT.md`: this audit.

An existing live `Discord /cast error:` log and the Cloudflare plan would often
already distinguish the two reproduced paths. The new diagnostics are local
only and are not active on the live bot. Do not call the incident fixed until
the production cause is confirmed and its targeted remediation is validated.

Nothing was deployed, committed, pushed, remotely registered, or written to live
KV/player data. No production credentials or player data were read.
