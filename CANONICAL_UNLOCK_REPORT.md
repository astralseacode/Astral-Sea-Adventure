# Canonical Level 1–50 unlock presentation

## Implementation

Previously, `formatLevelUpUnlocks` combined spell `levelUpLine` fields with
mastery/perk fields or generated fallback summaries. Many early entries had no
approved full text, and the command-only Stim unlock was absent. The previous
Rising Power presentation filter also removed its emoji from unlock announcements.

`CANONICAL_LEVEL_UNLOCKS` in root `worker.js` is now the single authoritative
announcement list: 52 verbatim approved paragraphs in ascending level order.
The entries were extracted directly from the approved attachment without rewriting
wording, punctuation, or emojis. Existing definition metadata was not suitable as
the canonical list: it was incomplete, included older wording, and excluded Stim.
The frozen list is embedded code in the generated Worker and needs no loader,
network requests, or new JSON document. Individual gameplay JSON remains editable.

All three unlock formatters now consume this list. Old definition `levelUpLine`
fields remain untouched as legacy metadata required by existing schema checks;
they no longer supply player-facing unlock announcements. They are not a second
announcement source and should not be edited to update announcements.

- Every level 1–50 is covered.
- Level 1: Elf Blessing, then Stim. Level 5: Moonbeam, then Evocation.
- All other levels contain exactly one approved entry.
- Level 30 consists only of the approved Familiar paragraph, ending in
  `before leaving to begin an adventure of its own.` No outcome table/list added.
- Level 41, 46, 49, and 50 wording matches the approved paragraphs exactly.
- Level 42 includes `🌊 Rising Power`; Level 44 includes `🌌 Bond` intentionally.
- Ordinary Rising Power damage/reset receipts remain emoji-free. No names,
  combat receipts, status formatters, or activation/flavor strings were changed
  by this task. Progression markers are confined to the unlock formatter outputs.

The existing combat-victory, adventure-reward, and exploration level-up paths all
already call the shared formatter with starting/ending levels. The formatter
selects every entry with `startingLevel < entryLevel <= endingLevel`, retaining
canonical ordering and same-level order. No already-earned entries are emitted.
Level 1 entries are available through the unlock formatter; existing character
creation/initial-level behavior was not redesigned to announce them automatically.

## Delivery and mechanics

Discord's existing delivery infrastructure is unchanged: initial chunk in the
interaction response, remaining chunks in ordered follow-ups, maximum 1,900
UTF-16 characters per chunk, exact text reconstruction, and disabled mentions.
An actual generated-artifact victory from Level 1 to 50 verifies all 50 newly
earned entries exactly once and in order. Follow-up failure was injected into a
second real victory: one gameplay execution, one failed delivery attempt, rewards
still committed once, combat cleared, no gameplay retry.

No changes to XP, thresholds, costs, dice, damage, qualifiers, turns, state,
cooldowns, Familiar/Bond, Rising Power, Storyteller, Help!, or persistence.
The Free-tier bundle, staged KV, diagnostics, and deployment handling are unchanged.
Runtime game-definition content requests remain zero. `dist/worker.js` was rebuilt
using `scripts/build-worker.cjs` and tested directly; root source is not the upload.

## Wording versus implementation findings — not changed

- Momentum's phrase “qualifying offensive d20” currently means normal Attack
  and Moonbeam only (`eligibleActions: ["attack", "moonbeam"]`). Natural 20 is
  the implemented threshold; other spells' d20 rolls do not qualify. This is an
  eligibility clarification, not a claim that all d20 actions trigger Momentum.
- Leviathan's Wake's approved “arrives after your next action” is less precise
  than the existing flow: casting stores stage 1, the next qualifying action
  displays the warning and moves to stage 2, and the following action resolves
  arrival before its normal action. Neither wording nor timing was changed.
- Help!'s percentage wording omits integer rounding: existing Mana cost rounds
  half upward via `Math.round`, and enemy HP removed uses `Math.floor`. Preserved.
- Legacy's “making the cast free” describes a 10-Mana refund, not a waived upfront
  cost. Existing affordability checks and any interactions with cost modifiers
  remain unchanged.

## Changed files for this task

- `worker.js`: canonical list and the three announcement formatters.
- `dist/worker.js`: deterministically regenerated upload artifact.
- `scripts/test-canonical-unlocks.cjs`: exact wording fingerprint, all levels,
  same-level unlocks, level skips, Familiar exclusion, emoji boundaries, actual
  generated victory delivery, mention suppression, and follow-up failure.
- `scripts/test-free-tier.cjs`: expose captured message payloads in test results.
- `scripts/test-rising-power.cjs`: expect the newly approved unlock emoji while
  retaining emoji-free combat checks and all mechanics assertions.
- `scripts/test-help.cjs`, `scripts/test-legacy.cjs`, `scripts/test-tidal-wave.cjs`:
  update announcement expectations only; gameplay assertions unchanged.
- `CANONICAL_UNLOCK_REPORT.md`: this report.

## Validation

All tests ran through the available offline Node/V8 harness (simulated Discord
and in-memory KV). Exact wording is protected by a SHA-256 snapshot of the approved
52 paragraphs joined by LF:
`4febd4cb030cc10729f414f5b3632726a6683a1e9f3f4ee7e49ceab5d5fccf6e`.
The source and generated artifact must both match every level's entries.

- 46 test suites executed; final result **43 passed**, three unchanged known
  stale failures: Evocation flavor digest, obsolete Stim progression-command
  expectation, Jellyfish damage expectation 4 versus 23.
- Canonical/progression/level-up tests, spell/mastery/passive suites, Rising Power,
  Bond, Familiar, Storyteller, Help!, Legacy, Tidal Wave, shared combat: passed
  except the three explicitly identified stale baselines above.
- Generic Discord delivery and canonical multi-level delivery/failure tests: passed.
- Deployment-artifact smoke: 48 sequence commands over six regions, 27 architecture
  scenarios, all 621 documents retrieved through real family loaders: passed.
- Free-tier scenarios, +200 synthetic definitions, staging/persistence tests: passed.
- 2,000 stress commands across generated-artifact and reliability suites: passed.
- Expansion validator: 180 adventures, 180 normal enemies, 180 bosses: passed.
- **621 JSON files**, all parsed; no JSON modified or added.
- **52 JavaScript files** parsed successfully.
- Deterministic build freshness and `git diff --check`: passed.

Not run: live Cloudflare/Discord testing, workerd/Miniflare, actual Free CPU-limit
enforcement, or distributed live KV tests. No live-state verification is claimed.

Nothing was deployed, committed, pushed, remotely registered, or written to live
KV/player data. Future deployment artifact remains **`dist/worker.js`**.
