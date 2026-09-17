# Regional enemy combat perks: implementation and balance report

## Result and scope

Implemented twelve regional perks through six shared packages in `worker.js`. Package sizes are **1 / 1 / 2 / 2 / 3 / 3**. All 180 normal enemies and 180 bosses receive their region's identical package. Enemy HP, static damage bonuses, rewards, spell definitions, mastery definitions, and progression announcements were not edited. The existing balance audit remains the baseline; the new effects are conditional runtime effects rather than changes to that roster's static numbers.

The main result is a strong distinction between varied and repeated offensive play in Astral Nexus. In the tested 150 HP / 200 Mana / +9 Strength build without Armor or Fae investment, Horizonfold Ray wins changed from 100/100 to **10/100** for repeated Moonbeam, **38/100** for repeated Tidal Wave, and **43/100** for repeated Conjure Gun. The varied rotation won **100/100** with the perks enabled. These are fixed-policy simulations with support spells, not population win rates or a proof of optimal balance. The largest Nexus boss is particularly punishing to repetition, as required by the +50 mechanic.

## Exact packages

| Region | Perk | Implemented rule |
|---|---|---|
| Moonlit Reef | Gentle Current | Every third successful primary damaging action arms +5 on the next damaging enemy hit. Attacks and offensive spells count. A miss or full block preserves the pending bonus. Pending bonuses do not stack. |
| Starfall Trench | Starfall Pressure | The fourth successful offensive spell arms a 10-Mana drain. Basic attacks and support do not count. The pending effect and counter remain armed through misses/full blocks, then reset when a damaging hit resolves the drain. |
| Whispering Kelp Forest | Tangling Kelp | At response start, zero player Protection grants +5 to a landed attack before defenses. Any existing Protection excludes the bonus, even if the attack later breaks that Protection. |
| Whispering Kelp Forest | Kelp Recovery | Every fourth actual enemy response heals 10 enemy HP after normal resolution, capped at max HP. Neither dead enemy nor concluded combat is revived. |
| Leviathan's Wake | Crushing Wake | Every third actual enemy response adds +15 on a natural hit, before defenses. The receipt announces the special response before the normal enemy hit receipt. A natural miss wastes that response's bonus. |
| Leviathan's Wake | Deepwater Hunger | An individual recovery of at least 20 actual Mana arms one 10-Mana drain. Repeated qualifying recovery cannot stack drains. Miss/full block preserves it. |
| Sunken King's Throne | Royal Guard | Two successful primary damaging spells arm a 15-point reduction on the next positive primary spell payload. Support/failure preserves the streak; a successful attack breaks the streak. Guard is consumed when it reduces damage, even if the result is zero. The streak resets when Guard arms. |
| Sunken King's Throne | King's Tax | After two successful spells, the next offensive attempt must be affordable with a separate +5 Mana reserve. For immediate spells, the surcharge is paid only if the primary hit will damage HP after Guard/Protection. Failures pay normal cost and preserve tax eligibility. Normal cost discounts apply before the flat surcharge. |
| Sunken King's Throne | Throne's Resolve | On the first surviving crossing from at least 25% HP to below 25%, gain 20 enemy Protection after that damage group finishes. Once per enemy. An enemy initialized below the threshold gets no retroactive grant. |
| Astral Nexus | Reality Echo | Repeating the last successful damaging spell adds a separate +50 component to the associated normal enemy response, on a natural hit. Support/failure preserves identity; successful attack clears it; a different successful spell replaces it. A third consecutive identical spell can trigger again. The response-specific component expires on a miss or full block. |
| Astral Nexus | Mana Fracture | Each individual recovery of at least 25 actual Mana proposes `Math.round(actual × .25)` pending Mana loss. Keep the largest pending amount only. The next damaging enemy hit drains up to that amount from current Mana; miss/full block preserves it. |
| Astral Nexus | Nexus Adaptation | After surviving three successful primary damaging actions, +5 total attack damage; after six, +10 total. Cap +10. Attack and offensive spells qualify; independent follow-ups do not create additional actions. |

### Action counting and delayed spell interpretation

- Immediate spells and attacks count once when their primary payload removes enemy HP and the enemy survives the completed damage group. Damage wholly prevented by Guard/Protection does not advance these success counters. A missed attack does not break a spell chain.
- Conjure Gun is one spell action, regardless of its 140 binary shot results. Strength still applies once through its existing spell logic.
- Echo, Aftershock, Charge detonation, Familiar/Bond assistance, Bubble retaliation and Berries' incidental damage cannot create extra regional action/cast counts. A support spell's incidental damage can still cross the Resolve threshold and is absorbed by enemy Protection.
- **Wake exception:** the existing runtime explicitly commits the summon as a successful offensive action (`harmonySuccess` and `expeditionQualifies`) even though its payload arrives later. It cannot roll a miss. Regional counters therefore record the original summon once, using the `leviathans-wake` identity. Warning and arrival never count again. Royal Guard is reserved at summon and reduces up to 15 primary damage at arrival. Tax, when due, is paid at summon. This avoids reordering spell history around intervening actions or taxing a previously paid cast on arrival. A later shield, early enemy death, or a Guard-reduced small Wake does not retroactively undo the committed summon count.
- **Help! exception:** the existing isolated ultimate is excluded from action/cast/repetition counters, Royal Guard and King's Tax. Its percentage HP removal now passes through the shared enemy Protection layer; the receipt reports actual HP removed. Its half-current-Mana payment, success odds, and normal enemy response remain unchanged. It preserves the last ordinary damaging spell identity.
- Successful attack clears spell history/streak, **not an already armed Royal Guard**. Thus `spell → spell → attack` does not erase Guard; the next damaging spell still encounters it. Alternating an attack before a two-spell streak forms prevents Guard activation. This preserves the requested consumption rule rather than silently granting attacks a dispel effect.

### Tax safety

The full possible cost is checked before rolling or consuming modifiers. Immediate spell damage is then known before the existing Mana payment. A nonmutating preview accounts for Royal Guard and enemy Protection; the extra 5 is charged only for a qualifying primary hit. No post-damage debit or tax refund is needed. The surcharge itself is never discounted. For example, Tidal Wave with first-chapter Storyteller and Charge costs `30 × .8 × .5 + 5 = 17` when taxed. A failed Falling Star after two successful casts needs 35 Mana available before acceptance, spends its normal 30, and leaves the pending tax counter unchanged.

## Incoming damage and recovery semantics

Reality Echo's +50 is stored separately from the enemy's base attack and other regional attack bonuses. For a natural hit, these components form **one incoming damage event**. Armor reduces that combined event once, preserving the normal minimum-one rule before shields. Bubble, Jellyfish guard, Berry Protection, Manta Protection, Berry guard, and Familiar Protection then process in their existing order. Fae Intervention sees the resulting lethal hit once; Mend, Fae Aid, Awakening and the other surviving-hit effects retain their normal timing. No multiplier is applied to the +50 component.

Natural 1 deals zero regardless of regional bonuses. A completely blocked combined hit deals no HP damage; it cannot collect a pending Mana drain. This interprets “successful damaging attack” as positive damage after defenses. A partial block or Armor reduction does not reduce the size of a Mana drain: a 1-HP hit can still collect all 10 pending Mana, subject only to current Mana. Reality Echo is response-specific and expires even if missed/blocked; Gentle Current, Pressure, Hunger and Fracture persist until a damaging hit.

Protection for Tangling Kelp means the sum of actual Bubble, Berry, Manta and Familiar pools at response start. Armor and one-hit damage reductions are not Protection pools. The shared enemy Protection layer absorbs primary damage and each independent damage follow-up in order, before HP. Resolve is granted only after the completed damage group, so the hit that crosses the threshold is not retroactively shielded.

Mana recovery is observed at each source, using actual positive increases after caps. Hooks cover Evocation (including overflow), Shizuki's Presence, Awakening, Resilience, Jellyfish moods, Legacy, Familiar and Kinship separately, Echo Mastery, Bubble Mastery, Harmony, Wake mastery, Curiosity, and both kinds of Berries. Victory-only rewards do not arm a dead enemy. Recovery before a response can arm that response's drain; recovery during/after its hit arms a later response, because pending effects are snapshotted at response start.

Examples: 190→200 despite a nominal 80 return is only 10 recovery and arms neither Hunger nor Fracture. A Berries cast from 190 first pays 20, then a capped 80 return restores 30: Nexus records 8 fractured Mana. Evocation from 80→200 restores 120, fractures 30, and leaves 170 if its enemy response deals damage. Level 48+ overflow from 20→300 restores 280 and fractures 70, leaving 230 after a damaging response. This overflow is available from the mastery without first activating the separate two-Fae convergence reward.

An integration test exposed an existing response merge issue: Resilience rebuilt player progress from the pre-Shizuki value, discarding Shizuki recovery earlier in the same response. The merge now uses the latest progress. A tested 40-Mana Presence event followed by a 10-Mana Resilience event preserves both, and fractures only 10 from the qualifying 40 event, not 13 from an incorrectly aggregated 50. No recovery amount, threshold, unlock or spell balance number was changed.

## Regional balance estimates

All expected attack additions below are unmitigated, with 5% natural misses. Armor floors, Protection, early kills and support timing can reduce actual HP pressure. The base roster was regenerated by `scripts/audit-combat-balance.cjs`: 360 combat enemies, 16 spells; all static HP/damage figures remain unchanged.

| Region | Mean normal / boss HP | Mean base enemy damage normal / boss | Added HP pressure | Added Mana pressure | Added enemy durability |
|---|---:|---:|---|---|---|
| Moonlit Reef | 86.2 / 125.63 | 12.91 / 15.73 | +5 per consumed Current; approximately at most 5/3 = 1.67 per successful player action over a long fight | None | None |
| Starfall Trench | 185 / 300 | 19.40 / 22.25 | None | Up to 10 per four successful spells, approximately 2.5 Mana/spell in sustained unblocked play | None |
| Whispering Kelp Forest | 250 / 367.5 | 21.30 / 24.15 | +4.75 expected per unprotected response, about +22% / +20% of base | None | Up to 10 every four responses, 2.5 enemy HP/response over long fights |
| Leviathan's Wake | 315 / 442.5 | 23.20 / 26.05 | +14.25 expected on each third response, averaging +4.75/response | One 10-Mana drain after a qualifying recovery; no stacking | None |
| Sunken King's Throne | 387.5 / 522.5 | 25.10 / 28.43 | None directly; longer fights create extra enemy replies | Approximately +5 per three successful spells, before failure/absorption effects | Guard up to 15 per armed consumption; one 20-point shield |
| Astral Nexus | 467.5 / 622.5 | 27.95 / 31.75 | +47.5 expected on a repeated-spell response; Adaptation adds +4.75 or +9.5 expected per response | 25% of each qualifying recovery, largest pending amount only | No added HP, healing or enemy shield |

**Moonlit:** short beginner encounters can end before Current activates. At unmodified Moonbeam output (21.06), regional mean normal HP is about 4.1 casts and mean boss HP about 6.0; a surviving third cast can activate Current, but bosses are more likely to see it multiple times. This is a small addition rather than a level-one HP increase. Misses or weak attacks can extend a battle without advancing its action counter.

**Starfall:** a crude 21.06-damage Moonbeam plan takes about nine casts for a mean normal and fifteen for a mean boss before overkill/recovery. That suggests roughly two versus three 10-Mana collections when the enemy survives the thresholds and lands hits. Protection can postpone collection, while successful basic attacks do not advance the spell counter. They also do not reset its cumulative progress. This is modest pressure rather than an anti-spell lockout.

**Kelp:** an unprotected enemy response now averages approximately 26.05 normal / 28.90 boss damage before Armor. Even a small Protection pool prevents the +5 condition for that response. A typical unmastered Bubble offers 11.67 average protection and can also avoid the conditional 5, making protection worth materially more than its nominal pool here. Healing is small relative to player spells; a 12-response fight can heal at most 30 HP, while a weak attack plan may allow repeated heals. Bosses are more likely to reach several four-response milestones. The no-protection condition is the larger pressure source.

**Wake:** the three-response cycle gives a predictable extra 15 on its dangerous response; base mean plus long-run bonus is approximately 27.95 normal / 30.80 boss damage. Normal enemies surviving at least three responses activate Crushing Wake; bosses commonly reach six or more. An Awakening restoring 25 Mana can return a later 10 to Hunger, whereas a 150-Mana Evocation loses only 10. Repeated recovery while armed cannot compound that drain. Protection timed to the third response is useful.

**Throne:** the one-time 20 shield is about 5.2% of mean normal HP or 3.8% of mean boss HP. Guard is up to 15 per three-spell cycle, reducing a 79-damage Gun by about 19% on that guarded cast, not on every spell or each binary shot. Separate Echo/Familiar output is not reduced by Guard, although Resolve Protection absorbs it. Tax's average +1.67 Mana per successful spell is small relative to late resource pools. Longer boss fights see more Guard/Tax cycles. The two effects mostly tax prolonged spell-only plans without directly adding enemy attack damage.

**Nexus:** Reality Echo dominates the new immediate HP pressure. Horizonfold Ray's base mean attack is 29.85; a repeated-spell reply at full Adaptation averages **86.85 raw damage**, versus **39.35** at full Adaptation with no repetition. With only 150 HP and no other defense, two such repeated replies are already dangerous. The mature kit's shields, healing, Stim and lethal-hit protection matter. Fracture limits recovery efficiency without removing most of a refill: the 280-Mana overflow example still nets 210 after collection. Adaptation adds urgency even to attack-heavy and varied plans, with a modest cap. Larger bosses reach both thresholds more reliably than normal enemies.

## Nexus simulations

Ran **8,400 battles**: three actual enemies × seven policies × two stat allocations × perks off/on × 100 seeds. Initial seed is `(imul(trial + 1, 0x9e3779b9) XOR 0x51ea2026) >>> 0`, with LCG constants 1664525 and 1013904223. This disperses starting states rather than clustering first rolls from adjacent seeds. Actual `dist/worker.js` combat functions and local in-memory KV execute spells, passives, defenses, enemy responses, victory and defeat. The comparison disables only regional package flags inside an isolated VM; it does not modify the repository. All random selections are seeded, including Curiosity recovery outcomes and cosmetic choices. The JSON records the tested artifact's SHA-256. No trial reached the 100-step cutoff.

Both allocations use 150 HP / 200 Mana / +9 Strength at Level 50. The first leaves Armor and Fae at zero to avoid inventing values omitted from the supplied example. The second invests 10 Armor and 5 Fae; it uses 39 of 49 available points with Vitality 5, Focus 10 and Strength 9. Other points remain unspent. There are no rest buffers.

Policies use one opening Elf Blessing and Familiar, recast Bubble when absent and Mana is at least 45, cast Mend when absent and HP is below 100 with at least 50 Mana, use Stim at HP ≤60, and use available Evocation at Mana <40. If the selected offensive spell is unaffordable at its normal cost, they use `/attack`. Familiar is not resummoned. Help!, Echo, Berries, and Wake are not in these policy rotations; their interactions are covered by deterministic tests. A “repeat” policy selects the same offensive spell repeatedly but still uses those support actions and occasional attack fallback. Thus this models ordinary supported play, not an unprotected stationary damage race or an optimized planner.

The attack-only policy uses basic attacks and one emergency Stim, with passive abilities still enabled; it deliberately omits the spell support opener and recovery policy. Compare it as a fallback floor, not as a controlled one-variable damage comparison.

### Win percentages with regional perks enabled

Each cell is wins out of 100. Sampling uncertainty near 50% is roughly ±10 percentage points at 95% confidence; 100/100 is not proof of guaranteed success.

| Offensive policy | Convergence 469 HP, Armor/Fae 0 | Horizonfold 577 HP, Armor/Fae 0 | Heart 680 HP, Armor/Fae 0 | Convergence, Armor 10/Fae 5 | Horizonfold, Armor 10/Fae 5 | Heart, Armor 10/Fae 5 |
|---|---:|---:|---:|---:|---:|---:|
| Gun → Tidal → Moonbeam → Jellyfish | 100% | 100% | 100% | 100% | 100% | 100% |
| Repeat Moonbeam | 59% | 10% | 2% | 99% | 72% | 10% |
| Repeat Tidal Wave | 97% | 38% | 2% | 100% | 98% | 33% |
| Repeat Conjure Gun | 100% | 43% | 1% | 100% | 99% | 26% |
| Gun → Tidal → attack | 100% | 100% | 100% | 100% | 100% | 100% |
| Attack → attack → Moonbeam | 100% | 100% | 66% | 100% | 100% | 100% |
| Attack only, plus emergency Stim | 0% | 0% | 0% | 0% | 0% | 0% |

With regional perks disabled, the spell-supported policies won 100/100 in every tested scenario except repeated Moonbeam against Heart without Armor/Fae, which won 99/100. Attack-only already lost all trials except 9/100 against Convergence with Armor 10. Consequently, these perks do not solve the low basic attack's independent damage/survival budget; they create value for inserting attacks into an otherwise supported rotation.

### Horizonfold detail: 150 HP / 200 Mana / +9 Strength, zero Armor/Fae

Means include all trials unless explicitly labeled winners. Incoming damage means damage after defenses but before HP floor/Fae Intervention, so lethal overkill is included; it is not net HP lost. Recovery totals count events while the enemy remains alive. Winner resource figures include the game's normal victory rewards.

| Policy | Wins | Enemy responses | Incoming damage | Mana drained | Combat Mana recovered | Evocations | Fae Intervention used | Winner HP / Mana after rewards |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Varied | 100% | 6.44 | 141.88 | 40.41 | 278.29 | 0.46 | 0% | 118.73 / 137.03 |
| Repeat Moonbeam | 10% | 7.29 | 413.57 | 25.96 | 220.87 | 0.15 | 98% | 51.90 / 101.30 |
| Repeat Tidal | 38% | 7.23 | 391.13 | 45.52 | 302.91 | 0.51 | 90% | 58.92 / 150.24 |
| Repeat Gun | 43% | 7.10 | 365.51 | 63.66 | 364.81 | 0.82 | 82% | 60.40 / 162.40 |
| Spell → spell → attack | 100% | 7.78 | 189.73 | 62.22 | 341.24 | 0.87 | 0% | 98.39 / 150.99 |
| Attack-heavy supported | 100% | 11.29 | 287.23 | 15.25 | 216.27 | 0.01 | 1% | 93.53 / 103.19 |
| Attack only + Stim | 0% | 9.91 | 350.03 | 0 | 0 | 0 | 100% | No victories |

These results support the requested direction: varied play retains an advantage, while repetition spends survival resources rapidly. The +50 is substantially stronger than every earlier regional attack perk. Against Heart of the Nexus it can feel oppressive to a player who ignores the receipt and repeats spells, especially without Armor/Fae investment. No reduction to the required +50 was made. Normal Nexus enemies can still be overpowered with supported Gun spam; bosses sustain the punishment long enough to make it decisive. Recovery remains powerful even with Fracture: it adds a measurable cost without eliminating Evocation or Shizuki's returns.

The earlier reported Horizonfold victory at 62 HP / 30 Mana is one playtest with an unspecified rotation and omitted Armor/Fae values. This model uses explicit policies and records post-victory rewards; it should not be expected to reproduce that single ending exactly.

## Architecture, persistence and receipts

`REGIONAL_ENEMY_PERKS` determines the package from the active combat's `regionId`. Central helpers handle primary action completion, individual Mana recovery, response preparation, successful enemy damage, HP-threshold crossing and post-response healing. No enemy files or new content fetches are needed. Per-enemy counters are bounded, and flags, last spell identity, pending drains, Guard, and Adaptation live in `combatState.regionalEnemy`. Enemy Protection lives on that combat's enemy object. Old battles with no regional state migrate lazily from zero; new enemy/region identity resets the regional record.

Existing battle creation starts fresh state; victory and defeat use the existing combat deletion paths, and subsequent adventure enemies create a new combat object. No separate flee command was found. No permanent player progression fields were added. Existing staged-KV final flush remains responsible for at-most-one underlying write per key. New real-entry tests exercise all three Nexus effects in one command and first-write failure discard. Multi-key partial flush is still the existing architecture's limitation, not a transaction guarantee introduced here.

Receipts are short `Perk: Name — mechanical effect` lines. No lore scenes, decorative emojis or authored flavor paragraphs were added. Names appear on activation, active damage/recovery effects, shield absorption or collection, rather than listing inactive packages every turn. Ephemeral receipt queues are held in a WeakMap and are not saved as player/combat history.

## Validation and existing issues

- New regional tests: **24 deterministic scenario groups passed**, covering every package, combined effects, real commands, tax affordability/discounts/failure behavior, Protection, Fae Intervention, Awakening/Shizuki/Berries recovery, Wake/Help, Conjure Gun, secondary damage exclusions, normal/boss parity, reset and invalid-state rejection.
- All **48** `scripts/test-*.cjs` suites were executed on the final runtime: **45 passed, three failed at unchanged stale assertions**.
- `test-evocation.cjs`: approved-text hash mismatch at line 10.
- `test-jellyfish-mastery-2.cjs`: expected 4 versus actual 23 at line 50.
- `test-stim.cjs`: removed progression command expected to return `Level 1 — Stim`, but returns `Unknown command` at line 326; its preceding twelve groups pass.
- All three failures were independently reproduced with `HEAD:worker.js` substituted read-only during the tests. The test files and canonical wording were not changed to make them green.
- Expansion validator passed: 180 adventures, 180 normals, 180 bosses, 621 JSON documents. Independent parsing of all 621 source JSON documents passed.
- Syntax checks passed for root Worker, generated Worker, regional tests and regional simulation tooling.
- Deterministic build regenerated `dist/worker.js`; build freshness passed. It remains the deployment artifact.
- Deployment-artifact safeguards and Free-tier architecture/stress suites passed as part of the full run, including source/content matching, zero content requests, staged write budgets and 1,000-command stress.
- `git diff --check` passed. Baseline audit tooling was rerun, preserving the static roster/spell calculations. The new 8,400-battle simulation completed with zero timeouts.

Momentum eligibility wording and Leviathan's Wake's description/timing discrepancy remain pre-existing and unchanged. Tests that terminate at their stale assertions do not execute their later assertions; new regional coverage independently exercises the relevant Mana and combat behavior. No live Discord playtest, remote KV test, production deployment or optimal-policy search was run. Other regions receive formula-based balance estimates and deterministic mechanics tests, rather than population simulations across all 360 opponents.

## Files and local-only safety

Changed runtime: `worker.js`, regenerated `dist/worker.js`.

Added: `scripts/test-regional-enemy-perks.cjs`, `scripts/audit-regional-enemy-perks.cjs`, `regional-enemy-perks-simulations.json`, this report. The prior four audit artifacts already existed before this task; their baseline outputs were rerun, not converted into per-enemy perk configurations.

No canonical source JSON or progression text changed. No weapons or unrelated enemy/player stat changes were made. Nothing was deployed, committed, pushed, remotely registered, or written to live Cloudflare/KV/player data.
