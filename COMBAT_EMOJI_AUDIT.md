# Combat output emoji audit — Levels 1–50

## Findings and corrections

The complete root Worker and all 621 JSON documents were scanned for Unicode extended pictographs, flags, and keycap emoji; decoded JSON strings were also checked by the permanent regression test. All 15 approved progression marker types are covered. The generated artifact duplicates these same sources and was exercised directly.

Exactly two decorative combat leaks remained, both hardcoded Bond strings:

| Location | Before | After |
| --- | --- | --- |
| worker.js:3054, applyFamiliarAction | 🌌 Bond empowers your Familiar! | Bond empowers your Familiar! |
| worker.js:3347, resolvePlayerCombatAction | 🌌 Bond: Your Familiar's next assistance is empowered! | Bond: Your Familiar's next assistance is empowered! |

Both original strings were reproduced in assembled combat receipts using the pre-fix source bundled in memory. They are not inherited from canonical progression metadata. The first appears when an armed Familiar consumes Bond; the second appears when Rising Power first reaches its maximum while the Familiar is active. Only the emoji and its following space were removed. The existing newlines, wording, mechanics, and timing remain intact.

No additional decorative combat leaks were found in any other Level 1–50 ability. Rising Power's bonus/reset paths and Storyteller's activation/all three chapter paths are clean. All names and secondary spell/mastery/passive/Familiar text in the JSON scan are clean outside explicitly allowed levelUpLine metadata. Canonical text is consumed only by unlock formatters, called for newly earned levels in combat victory, adventure reward, and exploration. No combat label derives its name from the canonical list.

## Authored symbol requiring review — not changed

One non-progression gameplay pictograph remains: ♥ in the quoted sign text **NO ♥**, at data/adventures/starfall-trench/adventure-30-the-starfall-annex.json:45. It appears to be intentional writing on an in-world sign, not a decorative ability prefix. As instructed, it was retained for user review. Consequently, this report does not claim that every gameplay string is pictograph-free; decorative progression leakage was removed, with this explicit authored-symbol exception.

## Preservation and test coverage

- All 52 canonical entries remain verbatim, including the 51 entries with emojis and emoji-free Help!. Canonical fingerprint test passed.
- Levels 1 and 5 retain both entries. Level 30 remains only its approved Familiar paragraph, without a chart.
- Level 42 retains 🌊, Level 44 retains 🌌, Level 49 retains ⭐ in unlock announcements. Ordinary receipts are separately checked.
- Production diff is exactly two string replacements plus regenerated dist/worker.js. No gameplay, Level 1–50 mechanics, costs, damage, dice, state, XP, or flavor wording changed.
- Bond still arms after current Familiar assistance, doubles the next assistance's mechanical components once per Familiar, leaves Rising Power intact, and retains the five-action Familiar duration. All 11 Familiar outcome cases and existing Bond edge cases pass.
- Bundle loading, zero external definition requests, staged KV, diagnostics, generic Discord delivery, and deployment safeguards are unchanged.

The new scripts/test-combat-emojis.cjs runs 30 existing focused scenario suites for source and generated-artifact variants, plus every Jellyfish mood at mastery levels 10 and 21. It checks **2,003 assembled receipts**. Explicit marker checks prove that forced paths include Bond arming/consumption, Rising Power bonus/reset, Storyteller chapters, Meteor/Lunar Alignment, Legacy jackpots, Fae Mischief, Shizuki's Presence, Harmony, Rhythm, Curiosity, Fae Aid/Second Opinion/Intervention, Charge, Tidal Wave, and Help!. Familiar, Bubble, Wake, gun, delayed/mastery effects and additional passive suites are exercised as well. The generated variant uses the real embedded content loader with network forbidden, not the source fixture's mocked JSON loader.

The shared assertion removes only complete canonical unlock paragraphs before scanning the remainder; it does not exempt entire victory messages. The JSON backstop permits only legacy levelUpLine metadata and the exact authored heart-sign exception. Existing canonical tests ensure unlock emojis remain intentionally present. Punctuation, arrows, dice, chapter names, capitalization, and ordinary Unicode typography are preserved.

## Files changed

- worker.js — two Bond receipt prefixes only.
- dist/worker.js — deterministically regenerated.
- scripts/test-astral-bond.cjs — expected receipt prefixes updated; all mechanical assertions retained.
- scripts/test-leviathans-wake.cjs — optional artifact source for the shared offline fixture; artifact mode uses the real bundled loader.
- scripts/test-combat-emojis.cjs — systematic output regression suite and JSON scan.
- COMBAT_EMOJI_AUDIT.md — this report and occurrence inventory.

## Validation

47 suites executed: **44 passed**, with the same three known stale failures (Evocation digest, obsolete Stim progression-command expectation, Jellyfish expected damage 4 versus 23). No mechanics changed to satisfy those failures. Canonical/progression, Bond/Familiar, Rising Power, Storyteller, shared combat, deployment-artifact smoke, Free-tier, persistence, and long-response tests passed. The audit suite also explicitly completed through its awaited exported main function.

Generated artifact smoke: 48 command sequences across six regions, all 27 architecture scenarios, and retrieval parity for all 621 documents passed. Free-tier +200-definition scaling and 2,000 stress commands passed. Expansion validation passed (180 adventures, 180 normal enemies, 180 bosses). All **621 JSON** and **53 JavaScript** files parsed. Build freshness and git diff --check passed.

Not run: live Cloudflare/Discord execution, workerd/Miniflare, actual Free CPU enforcement, distributed live KV tests. Random content coverage combines forced dynamic paths with the exhaustive authored JSON scan; it is not an exhaustive enumeration of every possible gameplay state.

Nothing was deployed, committed, pushed, remotely registered, or written to live KV/player data. The future upload artifact remains **dist/worker.js**, not root worker.js. No new wording/mechanics discrepancy was introduced or corrected; earlier canonical-report findings remain unchanged.

## Occurrence inventory

The pre-fix runtime-source inventory contained **79 emoji-bearing lines**: 51 allowed canonical entries, 14 legacy unlock metadata lines, 11 internal validation literals, two corrected Bond leaks, and one authored heart sign requiring review. Generated copies are not separate sources. Tests/docs also contain examples and expectations; those are internal-only, not runtime output.

Classes: **1** allowed progression/unlock metadata; **2** corrected combat leak; **3** authored gameplay symbol requiring review; **4** internal-only validator/test/documentation.

| Source location | Text/entry | Class |
| --- | --- | --- |
| worker.js:3054 | message: (astralBond ? "🌌 Bond empowers your Familiar!\n\n" : "") + | 2 |
| worker.js:3347 | "🌌 Bond: Your Familiar's next assistance is empowered!"; | 2 |
| worker.js:10077 | lvl 45 Spell 🔫 Conjure Gun | 4 |
| worker.js:10098 | lvl 40 Spell 🌊 Tidal Wave | 4 |
| worker.js:10328 | lvl 41 Mastery ☄️ Meteor Alignment | 4 |
| worker.js:10335 | lvl 44 Mastery 🌌 Bond | 4 |
| worker.js:10476 | lvl 48 Mastery 🌿 Shizuki's Presence | 4 |
| worker.js:10577 | lvl 38 Passive ✨ Reprieve | 4 |
| worker.js:10584 | lvl 39 Passive 🌙 Lunar Patience | 4 |
| worker.js:10618 | lvl 42 Passive 🌊 Rising Power | 4 |
| worker.js:10698 | lvl 46 Passive ⭐ Legacy | 4 |
| worker.js:10709 | lvl 47 Passive 🌿 Fae Mischief | 4 |
| worker.js:10731 | lvl 49 Passive ⭐ Storyteller | 4 |
| worker.js:10813 | lvl 1 Spell 🧚 Elf Blessing | 1 |
| worker.js:10814 | lvl 1 Command 💉 Stim | 1 |
| worker.js:10815 | lvl 2 Spell ✨ Star Spark | 1 |
| worker.js:10816 | lvl 3 Spell 🪼 Jellyfish | 1 |
| worker.js:10817 | lvl 4 Spell 🌿 Mend | 1 |
| worker.js:10818 | lvl 5 Spell 🌙 Moonbeam | 1 |
| worker.js:10819 | lvl 5 Spell ✨ Evocation | 1 |
| worker.js:10820 | lvl 6 Mastery ⭐ Star Spark Mastery I | 1 |
| worker.js:10821 | lvl 7 Passive Perk ✨ Resilience | 1 |
| worker.js:10822 | lvl 8 Spell 🫧 Bubble | 1 |
| worker.js:10823 | lvl 9 Passive Perk ✨ Momentum | 1 |
| worker.js:10824 | lvl 10 Mastery 🪼 Jellyfish Mastery I | 1 |
| worker.js:10825 | lvl 11 Passive Perk ✨ Harvest | 1 |
| worker.js:10826 | lvl 12 Spell 🌟 Echo | 1 |
| worker.js:10827 | lvl 13 Mastery 🧚 Elf Blessing Mastery I | 1 |
| worker.js:10828 | lvl 14 Passive Perk ⭐ Aftershock | 1 |
| worker.js:10829 | lvl 15 Spell ☄️ Falling Star | 1 |
| worker.js:10830 | lvl 16 Mastery 🫧 Bubble Mastery I | 1 |
| worker.js:10831 | lvl 17 Passive 🌿 Fae Aid | 1 |
| worker.js:10832 | lvl 18 Mastery 🌿 Mend Mastery I | 1 |
| worker.js:10833 | lvl 19 Passive Perk ⭐ Curiosity | 1 |
| worker.js:10834 | lvl 20 Spell 🌊 Leviathan's Wake | 1 |
| worker.js:10835 | lvl 21 Mastery 🪼 Jellyfish Mastery II | 1 |
| worker.js:10836 | lvl 22 Passive ✨ Patience | 1 |
| worker.js:10837 | lvl 23 Mastery 🫧 Bubble Mastery II | 1 |
| worker.js:10838 | lvl 24 Spell 🍓 Berries | 1 |
| worker.js:10839 | lvl 25 Passive ✨ Awakening | 1 |
| worker.js:10840 | lvl 26 Mastery ⭐ Star Spark Mastery II | 1 |
| worker.js:10841 | lvl 27 Mastery 🌙 Moonbeam Mastery I | 1 |
| worker.js:10842 | lvl 28 Passive ✨ Harmony | 1 |
| worker.js:10843 | lvl 29 Passive 🌿 Fae Second Opinion | 1 |
| worker.js:10844 | lvl 30 Spell 🌌 Familiar | 1 |
| worker.js:10845 | lvl 31 Passive 🌌 Kinship | 1 |
| worker.js:10846 | lvl 32 Passive ✨ Rhythm | 1 |
| worker.js:10847 | lvl 33 Passive ⭐ Astral Expedition | 1 |
| worker.js:10848 | lvl 34 Mastery 🌟 Echo Mastery I | 1 |
| worker.js:10849 | lvl 35 Spell 🎲 All or Nothing | 1 |
| worker.js:10850 | lvl 36 Passive ⭐ Defiance | 1 |
| worker.js:10851 | lvl 37 Mastery 🌊 Leviathan's Wake Mastery I | 1 |
| worker.js:10852 | lvl 38 Passive ✨ Reprieve | 1 |
| worker.js:10853 | lvl 39 Passive 🌙 Lunar Patience | 1 |
| worker.js:10854 | lvl 40 Spell 🌊 Tidal Wave | 1 |
| worker.js:10855 | lvl 41 Mastery ☄️ Meteor Alignment | 1 |
| worker.js:10856 | lvl 42 Passive 🌊 Rising Power | 1 |
| worker.js:10857 | lvl 43 Passive 🌿 Fae Intervention | 1 |
| worker.js:10858 | lvl 44 Mastery 🌌 Bond | 1 |
| worker.js:10859 | lvl 45 Spell 🔫 Conjure Gun | 1 |
| worker.js:10860 | lvl 46 Passive ⭐ Legacy | 1 |
| worker.js:10861 | lvl 47 Passive 🌿 Fae Mischief | 1 |
| worker.js:10862 | lvl 48 Mastery 🌿 Shizuki's Presence | 1 |
| worker.js:10863 | lvl 49 Passive ⭐ Storyteller | 1 |
| data/adventures/starfall-trench/adventure-30-the-starfall-annex.json:45 | Quoted sign: NO ♥ | 3 |
| data/masteries/falling-star-mastery-1.json:8 | lvl 41 Mastery ☄️ Meteor Alignment | 1 |
| data/masteries/familiar-mastery-1.json:8 | lvl 44 Mastery 🌌 Bond | 1 |
| data/masteries/leviathans-wake-mastery-1.json:8 | lvl 37 Mastery 🌊 Leviathan's Wake Mastery I | 1 |
| data/masteries/shizukis-presence.json:8 | lvl 48 Mastery 🌿 Shizuki's Presence | 1 |
| data/perks/astral-defiance.json:7 | lvl 36 Passive ⭐ Defiance | 1 |
| data/perks/astral-reprieve.json:7 | lvl 38 Passive ✨ Reprieve | 1 |
| data/perks/fae-mischief.json:7 | lvl 47 Passive 🌿 Fae Mischief | 1 |
| data/perks/legacy.json:7 | lvl 46 Passive ⭐ Legacy | 1 |
| data/perks/lunar-patience.json:7 | lvl 39 Passive 🌙 Lunar Patience | 1 |
| data/perks/rising-power.json:7 | lvl 42 Passive 🌊 Rising Power | 1 |
| data/perks/storyteller.json:7 | lvl 49 Passive ⭐ Storyteller | 1 |
| data/spells/all-or-nothing.json:9 | lvl 35 Spell 🎲 All or Nothing | 1 |
| data/spells/conjure-gun.json:9 | lvl 45 Spell 🔫 Conjure Gun | 1 |
| data/spells/tidal-wave.json:9 | lvl 40 Spell 🌊 Tidal Wave | 1 |
