# Full Adventure difficulty audit and level 5 second Stim experiment

## Scope and method

This is an offline simulation of the generated production Worker, with in-memory KV and network disabled. It uses the real Adventure start, direction, boss confirmation, combat, Stim, and Berry handlers. Boss phases remain on. The second-Stim variant changes only the `STIM_USES_PER_BATTLE` constant in the source string loaded into the audit VM for level 5+ cases; it also changes the corresponding state validator. `worker.js` and `dist/worker.js` are untouched by this audit.

Each cell uses 100 deterministic seeds per player configuration. Path selection has its own seed stream, so paired current/second-Stim attempts choose the same direction in every shared room. Combat RNG remains deterministic per seed, but can diverge once the alternate Stim action changes turn order. A simulated attempt ends at first death. This is stricter than the live retry flow, which leaves the Adventure active and resets HP after defeat. Combat is capped at 80 player actions per encounter and 160 per Adventure.

The tested player begins at full HP/Mana with four owned Berries. Stat points are allocated across vitality, strength, focus, armor, fae, and luck according to four broad builds. At level 10+, the six existing class/weapon pairs are rotated through configurations. The four deterministic policies are weapon attacks, spell rotation, mixed attacks and spells, and supported casting. Support can use Blessing, Familiar, Bubble, Mend, and Evocation when unlocked. Policies observe present HP, Mana, enemy HP, current buffs, ability access, and resources; they do not inspect future rolls or rooms. Stim is used at at most 35% HP (or 40 HP), and a second Stim requires an intervening offensive action and a return to critical HP. Berries can be used at at most 50% HP, when 25 Mana makes an intended spell affordable, or when both HP and Mana are substantially depleted. The normal-room policy reserves two Berries for later rooms unless HP is at or below 30% and no Stim remains. Successful Berry uses go through the real `/eat berry` handler.

The entry checkpoint uses Adventure 1, which is the Adventure a newly unlocked region exposes. The mature checkpoint tests three eligible authored Adventures: earliest, median, and latest eligible number. Starfall also tests levels 6–9 on Adventure 1. Every Adventure uses seeded actual choices among three visible directions per room. Each authored Adventure has three choice rooms and a boss antechamber. Its normal encounter count depends on the chosen path, from zero to three. This samples paths rather than enumerating all 27 possible direction triples.

## Production Adventure lifecycle

1. `/adventure` starts an authored Adventure and saves its Adventure state. Each of three rooms offers three authored directions. A direction can start a normal combat or resolve a treasure, healing, or empty room. The chosen route determines the number and order of normal enemies. Every sampled Adventure has a boss after the third room; the boss starts only after confirmation.
2. A normal victory writes the battle's remaining HP into the Adventure state, awards XP and other rewards, advances the room, and clears combat. XP gains can unlock abilities during the same Adventure. A healing choice restores its authored amount of HP up to the HP cap. There is no general full heal or Mana refill between encounters, although combat victory perks and healing choices may grant recovery.
3. HP in Adventure state and Mana in player progress carry into the next fight and the boss. Berry inventory and Adventure `berriesEaten` also carry. Persistent player progress, including timed statuses where applicable, remains in progress. New combat creates a fresh combat state: Protection, Familiar state, Rising Power, Shizuki/Fae source, Storyteller state, regional counters, boss phase counters, battle-local buffs/debuffs, and once-per-battle flags reset. This follows the actual new-state construction rather than a harness reset.
4. Current Stim is one use **per combat encounter**, including each normal fight and the boss. It is not inventory. A successful use fully restores HP, consumes a combat action, and can draw an enemy response. A new combat state starts at zero uses, so a later normal fight or boss has a fresh allowance. The audit-only variant allows two uses in every level 5+ encounter.
5. `/eat berry` is limited to four successful uses **per Adventure**, consumes one inventory Berry, and restores up to 25 HP and 25 Mana. It does not consume a combat turn. Spending one during a normal encounter leaves one fewer at the boss. A failed or unnecessary use does not consume the allowance. The audit starts with four inventory Berries and does not conjure more.
6. On defeat, production clears combat, restores player HP, and leaves the Adventure at the normal room or boss antechamber for a retry. This audit counts the first defeat as a failed initial attempt and stops there.

## Results

Results, comparisons, and diagnostics are generated below from `full-adventure-balance-results.json`.

<!-- RESULTS_START -->
**Coverage:** 120 configurations × 100 seeds × 2 rulesets = 24,000 initial Adventure attempts. 18 distinct authored Adventures were sampled from 186 in the repository. 486 distinct complete three-room direction paths were observed. No attempt hit an action cap (0 total).

### Completion, boss reach, and conditional boss wins

| Region | Level | Started per ruleset | Current complete | Current boss reach | Current win given reach | 2-Stim complete | 2-Stim boss reach | 2-Stim win given reach | Completion change |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Moonlit Reef | 1 | 400 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 0.0 pp |
| Moonlit Reef | 5 | 1200 | 70.2% | 95.1% | 73.8% | 77.7% | 99.4% | 78.1% | 7.5 pp |
| Starfall Trench | 5 | 400 | 1.5% | 81.0% | 1.9% | 11.7% | 95.8% | 12.3% | 10.2 pp |
| Starfall Trench | 10 | 1200 | 35.4% | 93.0% | 38.1% | 57.9% | 97.8% | 59.2% | 22.5 pp |
| Whispering Kelp Forest | 10 | 600 | 7.2% | 69.0% | 10.4% | 17.5% | 83.7% | 20.9% | 10.3 pp |
| Whispering Kelp Forest | 20 | 1200 | 26.1% | 87.4% | 29.8% | 47.5% | 94.6% | 50.2% | 21.4 pp |
| Leviathan's Wake | 20 | 600 | 14.0% | 82.0% | 17.1% | 36.5% | 94.7% | 38.6% | 22.5 pp |
| Leviathan's Wake | 30 | 1200 | 41.1% | 94.0% | 43.7% | 74.2% | 99.4% | 74.6% | 33.1 pp |
| Sunken King's Throne | 30 | 600 | 48.8% | 90.2% | 54.2% | 67.5% | 97.7% | 69.1% | 18.7 pp |
| Sunken King's Throne | 40 | 1200 | 77.6% | 99.3% | 78.1% | 93.9% | 100.0% | 93.9% | 16.3 pp |
| Astral Nexus | 40 | 600 | 15.8% | 86.7% | 18.3% | 46.2% | 98.8% | 46.7% | 30.4 pp |
| Astral Nexus | 50 | 1200 | 71.8% | 98.5% | 72.8% | 89.7% | 100.0% | 89.7% | 17.9 pp |

The level 1 comparison uses one Stim in both arms by design. The boss win column is conditional on reaching the boss; it is not the Adventure completion rate. Percentages include sampled paths with zero to three normal combats.

### Resources and encounter burden

| Region | Level | Ruleset | Mean boss HP | Mean boss Mana | Mean Berries at boss | Mean Stims used before/during boss | Mean Berries used before/during boss | Deaths normal/boss | Mean actions per encounter / Adventure |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| Moonlit Reef | 1 | current | 91.1 | 94.7 | 4.0 | 0.0/0.1 | 0.0/0.1 | 0/0 | 2.5/5.0 |
| Moonlit Reef | 1 | second | 91.1 | 94.7 | 4.0 | 0.0/0.1 | 0.0/0.1 | 0/0 | 2.5/5.0 |
| Moonlit Reef | 5 | current | 94.4 | 88.1 | 3.0 | 0.4/0.5 | 1.2/1.4 | 59/299 | 7.7/14.9 |
| Moonlit Reef | 5 | second | 95.3 | 87.4 | 3.0 | 0.6/1.0 | 1.0/1.5 | 7/261 | 8.7/17.2 |
| Starfall Trench | 5 | current | 90.0 | 88.1 | 2.1 | 0.9/0.8 | 2.3/1.7 | 76/318 | 12.0/21.2 |
| Starfall Trench | 5 | second | 91.7 | 87.0 | 2.1 | 1.5/1.9 | 2.0/2.0 | 17/336 | 14.6/28.3 |
| Starfall Trench | 10 | current | 92.3 | 99.8 | 2.3 | 0.7/0.9 | 1.8/2.1 | 84/691 | 11.1/21.2 |
| Starfall Trench | 10 | second | 95.5 | 97.4 | 2.5 | 1.0/1.7 | 1.6/2.3 | 26/479 | 12.8/25.3 |
| Whispering Kelp Forest | 10 | current | 95.6 | 111.0 | 2.4 | 0.8/0.7 | 2.3/1.6 | 186/371 | 11.8/18.7 |
| Whispering Kelp Forest | 10 | second | 95.7 | 102.8 | 2.3 | 1.5/1.6 | 2.0/1.9 | 98/397 | 14.1/25.2 |
| Whispering Kelp Forest | 20 | current | 109.8 | 118.0 | 2.4 | 0.7/0.8 | 1.9/2.0 | 151/736 | 11.9/21.8 |
| Whispering Kelp Forest | 20 | second | 113.4 | 115.6 | 2.5 | 1.1/1.7 | 1.6/2.3 | 65/565 | 13.9/26.8 |
| Leviathan's Wake | 20 | current | 111.8 | 116.5 | 2.3 | 0.9/0.8 | 2.1/1.9 | 108/408 | 11.9/21.2 |
| Leviathan's Wake | 20 | second | 114.3 | 112.3 | 2.4 | 1.5/1.8 | 1.7/2.2 | 32/349 | 14.0/27.1 |
| Leviathan's Wake | 30 | current | 120.4 | 130.0 | 2.5 | 0.7/0.9 | 1.7/2.3 | 72/635 | 11.6/22.5 |
| Leviathan's Wake | 30 | second | 124.7 | 127.4 | 2.6 | 0.9/1.7 | 1.4/2.5 | 7/303 | 12.9/25.7 |
| Sunken King's Throne | 30 | current | 121.6 | 132.5 | 2.5 | 0.6/0.8 | 1.7/2.1 | 59/248 | 13.9/26.0 |
| Sunken King's Throne | 30 | second | 123.5 | 130.3 | 2.6 | 0.9/1.4 | 1.5/2.3 | 14/181 | 15.4/30.2 |
| Sunken King's Throne | 40 | current | 142.3 | 146.3 | 2.8 | 0.3/0.7 | 1.2/2.5 | 8/261 | 13.4/26.1 |
| Sunken King's Throne | 40 | second | 144.9 | 145.1 | 2.9 | 0.4/1.0 | 1.1/2.5 | 0/73 | 13.9/27.4 |
| Astral Nexus | 40 | current | 136.3 | 150.7 | 2.2 | 0.9/0.8 | 2.1/1.9 | 80/425 | 12.3/22.7 |
| Astral Nexus | 40 | second | 139.1 | 144.5 | 2.4 | 1.3/1.9 | 1.7/2.3 | 7/316 | 14.1/28.2 |
| Astral Nexus | 50 | current | 154.4 | 172.6 | 2.6 | 0.6/0.8 | 1.5/2.3 | 18/321 | 12.2/24.1 |
| Astral Nexus | 50 | second | 161.1 | 170.2 | 2.7 | 0.8/1.4 | 1.3/2.5 | 0/124 | 13.0/26.0 |

Stim availability at boss entry is 1 in every current run and 2 in every second-Stim level 5+ run, because the boss is a fresh combat. Starting HP/Mana are set by each configuration’s stat allocation and are in the raw rows. Victory HP/Mana, every encounter entry, restoration amounts, regional counters, and phase events are also recorded per run.

### Starfall progression

| Level | Ruleset | Complete | Boss reach | Win given reach | Normal/boss deaths | Boss HP/Mana/Berries | Mean Stims used | Mean Berries used |
|---:|---|---:|---:|---:|---:|---|---:|---:|
| 5 | current | 1.5% | 81.0% | 1.9% | 76/318 | 90.0/88.1/2.1 | 1.7 | 4.0 |
| 5 | second | 11.7% | 95.8% | 12.3% | 17/336 | 91.7/87.0/2.1 | 3.4 | 4.0 |
| 6 | current | 4.8% | 82.0% | 5.8% | 72/309 | 90.8/94.1/2.2 | 1.7 | 4.0 |
| 6 | second | 17.2% | 97.3% | 17.7% | 11/320 | 90.5/91.2/2.2 | 3.4 | 4.0 |
| 7 | current | 4.3% | 85.0% | 5.0% | 60/323 | 91.3/93.6/2.2 | 1.7 | 4.0 |
| 7 | second | 16.8% | 96.0% | 17.4% | 16/317 | 91.5/91.0/2.3 | 3.3 | 4.0 |
| 8 | current | 6.5% | 85.8% | 7.6% | 57/317 | 94.3/90.7/2.2 | 1.7 | 4.0 |
| 8 | second | 23.7% | 96.5% | 24.6% | 14/291 | 96.1/88.2/2.3 | 3.2 | 4.0 |
| 9 | current | 10.2% | 92.0% | 11.1% | 32/327 | 89.1/90.8/1.9 | 1.8 | 4.0 |
| 9 | second | 29.2% | 98.8% | 29.6% | 5/278 | 94.7/89.5/2.1 | 3.3 | 4.0 |
| 10 | current | 35.4% | 93.0% | 38.1% | 84/691 | 92.3/99.8/2.3 | 1.6 | 3.9 |
| 10 | second | 57.9% | 97.8% | 59.2% | 26/479 | 95.5/97.4/2.5 | 2.7 | 3.9 |

Starfall level 10 includes three eligible Adventures; levels 5–9 use Adventure 1. Their rates therefore also reflect different Adventure coverage.

### Entry-level diagnostics

- **Moonlit Reef level 1:** 400 current attempts; 0 normal deaths and 0 boss deaths. Death enemies: none. Mean boss-entry HP/Mana/Berries 91.1/94.7/4.0. Mean player actions in the boss encounter among boss-reaching attempts: 2.7. Mean winning HP/Mana: 76.2/92.9. Player damage to normal enemies/bosses 8300/9200; enemy HP damage 13900. Second Stim changes completion by 0.0 pp and mean Stim use from 0.1 to 0.1 per attempt. Boss phase activations 436 current versus 436 second.
- **Starfall Trench level 5:** 400 current attempts; 76 normal deaths and 318 boss deaths. Death enemies: Meteor Lure Angler 318, Starstone Lanternfish 76. Mean boss-entry HP/Mana/Berries 90.0/88.1/2.1. Mean player actions in the boss encounter among boss-reaching attempts: 12.4. Mean winning HP/Mana: 22.0/16.7. Player damage to normal enemies/bosses 53892/49826; enemy HP damage 139648. Second Stim changes completion by 10.2 pp and mean Stim use from 1.7 to 3.4 per attempt. Boss phase activations 597 current versus 910 second.
- **Whispering Kelp Forest level 10:** 600 current attempts; 186 normal deaths and 371 boss deaths. Death enemies: Chorus Fin Schoolmother 371, Murmurleaf Minnow 186. Mean boss-entry HP/Mana/Berries 95.6/111.0/2.4. Mean player actions in the boss encounter among boss-reaching attempts: 11.7. Mean winning HP/Mana: 41.7/107.3. Player damage to normal enemies/bosses 115194/96692; enemy HP damage 215756. Second Stim changes completion by 10.3 pp and mean Stim use from 1.5 to 3.2 per attempt. Boss phase activations 818 current versus 1148 second.
- **Leviathan's Wake level 20:** 600 current attempts; 108 normal deaths and 408 boss deaths. Death enemies: Breaker Fin Alpha 408, Wake Riding Razorfish 108. Mean boss-entry HP/Mana/Berries 111.8/116.5/2.3. Mean player actions in the boss encounter among boss-reaching attempts: 11.9. Mean winning HP/Mana: 49.2/114.2. Player damage to normal enemies/bosses 154797/144896; enemy HP damage 256764. Second Stim changes completion by 22.5 pp and mean Stim use from 1.7 to 3.3 per attempt. Boss phase activations 1146 current versus 1540 second.
- **Sunken King's Throne level 30:** 600 current attempts; 59 normal deaths and 248 boss deaths. Death enemies: Standard Bearer Revenant 248, Drowned Banner Guard 59. Mean boss-entry HP/Mana/Berries 121.6/132.5/2.5. Mean player actions in the boss encounter among boss-reaching attempts: 14.9. Mean winning HP/Mana: 87.5/124.8. Player damage to normal enemies/bosses 197352/221638; enemy HP damage 236116. Second Stim changes completion by 18.7 pp and mean Stim use from 1.4 to 2.3 per attempt. Boss phase activations 1453 current versus 1682 second.
- **Astral Nexus level 40:** 600 current attempts; 80 normal deaths and 425 boss deaths. Death enemies: Contradiction Leviathan 425, Paradox Minnow 80. Mean boss-entry HP/Mana/Berries 136.3/150.7/2.2. Mean player actions in the boss encounter among boss-reaching attempts: 12.8. Mean winning HP/Mana: 84.2/110.6. Player damage to normal enemies/bosses 246899/233948; enemy HP damage 300949. Second Stim changes completion by 30.4 pp and mean Stim use from 1.7 to 3.2 per attempt. Boss phase activations 1329 current versus 1708 second.

### Authored Adventure variation at mature checkpoints

| Region | Level | Adventure | Boss | Current complete | Current boss reach | Second complete |
|---|---:|---|---|---:|---:|---:|
| Moonlit Reef | 5 | 1 Bubble Nibbler Hideout | bubble-nibbler-boss | 100.0% | 100.0% | 100.0% |
| Moonlit Reef | 5 | 15 Moonveil Stalker Fen | veilclaw-prime-boss | 96.5% | 100.0% | 99.8% |
| Moonlit Reef | 5 | 30 Moonlit Lab | moonlit-officer-boss | 14.0% | 85.3% | 33.3% |
| Starfall Trench | 10 | 1 Lanterns Below the Falling Sky | meteor-lure-angler-boss | 53.7% | 97.8% | 75.7% |
| Starfall Trench | 10 | 15 Falling Light Drift | starshower-medusa-boss | 37.0% | 93.0% | 60.0% |
| Starfall Trench | 10 | 30 The Starfall Annex | starfall-annex-officer-boss | 15.5% | 88.2% | 38.0% |
| Whispering Kelp Forest | 20 | 1 Murmurleaf Paths | chorus-fin-schoolmother-boss | 36.0% | 91.7% | 63.0% |
| Whispering Kelp Forest | 20 | 15 Shrinebark Pilgrimage | first-root-guardian-boss | 30.5% | 88.0% | 48.5% |
| Whispering Kelp Forest | 20 | 30 The Verdant Pursuit Station | verdant-pursuit-officer-boss | 11.7% | 82.5% | 31.0% |
| Leviathan's Wake | 30 | 1 Wake Rider Crossing | breaker-fin-alpha-boss | 55.0% | 98.0% | 89.0% |
| Leviathan's Wake | 30 | 15 Abysslung Expanse | gravewing-manta-boss | 44.8% | 95.0% | 73.5% |
| Leviathan's Wake | 30 | 30 Grave of the First Wake | first-leviathan-echo-boss | 23.5% | 89.0% | 60.0% |
| Sunken King's Throne | 40 | 1 The Fallen Banner Way | standard-bearer-revenant-boss | 86.8% | 99.8% | 98.0% |
| Sunken King's Throne | 40 | 8 The Drowned Archive | grand-archivist-wisp-boss | 76.2% | 99.0% | 95.0% |
| Sunken King's Throne | 40 | 16 Regal Fang Canal | crown-fang-moray-boss | 69.8% | 99.3% | 88.7% |
| Astral Nexus | 50 | 1 The Paradox Shoal | contradiction-leviathan-boss | 91.5% | 100.0% | 99.8% |
| Astral Nexus | 50 | 15 Voidflower Garden | nothing-bloom-mantis-boss | 72.3% | 97.8% | 92.0% |
| Astral Nexus | 50 | 30 Heart of the Astral Sea | heart-of-the-nexus-boss | 51.5% | 97.8% | 77.2% |

Across all attempts, current/second total HP restored by Stim was 1,649,899/2,918,264, HP restored by Berries 1,091,330/1,083,997, and Mana restored by Berries 734,851/739,496. Evocation actions were 5708/8325; observed Fae Intervention events were 0/0; boss phase activation receipts were 26097/31003. Region-specific receipt counts and highest boss phase reached are in the raw JSON.

<!-- RESULTS_END -->

## Interpretation limits

Under the tested policies, Starfall at its level 5 unlock remains extremely difficult: 1.5% initial-attempt completion with the current rule and 11.7% with two Stims. The extra Stim helps substantially in absolute terms, especially by raising boss reach from 81.0% to 95.8%, but 336 of 400 second-Stim attempts still die to its boss. The boss is the main bottleneck even after normal-fight attrition; 318 of 400 current attempts die there. Its average boss entry is 90 HP, 88 Mana, and 2.1 Berries, with a fresh Stim available. The boss result is therefore not explained only by arriving depleted. All four Berries are typically consumed by the end, so the extra Stim does not materially ease Berry pressure at level 5. The same encounter becomes progressively more survivable over levels 6–9, but the current completion rate is still only 10.2% at level 9. This supports the earlier isolated-boss finding that the baseline boss fight is difficult at unlock level; it does not assign a target rate.

Kelp level 10 (7.2% current), Leviathan level 20 (14.0%), and Nexus level 40 (15.8%) also show low entry completion. Most entrants reach their bosses, and boss deaths exceed normal-enemy deaths in each. Sunken Throne level 30 is comparatively survivable at 48.8% current completion. At mature checkpoints, the second Stim raises Sunken Throne level 40 to 93.9% completion and Astral Nexus level 50 to 89.7%; Moonlit Adventure 1 is already certain in this sample. The extra allowance can make selected mature content close to automatic while leaving the hardest later Adventures much less certain. It also increases boss-phase exposure because players survive longer.

There is a strong authored-Adventure gradient. At level 10, Starfall Adventure 1 completes at 53.7% under current rules, while Adventure 30 completes at 15.5%. Similar declines appear across the sampled earliest, median, and latest eligible Adventures in other regions. The level 10 aggregate is therefore an average over content with very different difficulty; it should not be read as Adventure 1's rate. All entry-level diagnosis uses Adventure 1, as a newly unlocked player has not completed prior Adventures in that region.

These are policy outcomes, not human win probabilities. The four builds are reasonable fixed heuristics, not optimized players. Adventure 1 is the only entry-level Adventure sampled; later Adventure numbers require prior progression. Seeded room choices can produce zero normal fights, so an Adventure completion rate mixes easier and harder routes. Combat RNG diverges after different Stim decisions, despite paired initial seeds and shared direction prefixes. The second-Stim VM variant is an audit mechanism, not a production patch. No target win rate is assumed.

## Validation and production safety

The harness asserts Adventure start, canonical boss confirmation, encounter and path order, Berry count and HP/Mana changes, Berry's zero-turn behavior, and matching paired path prefixes. The canonical runtime itself saves persistent resources and starts each combat with a new battle state. The raw results include each encounter's entry HP/Mana, per-attempt Berry event details, deaths, phase reach, regional receipts, damage, action counts, and cap events.

`node --check` passed for both new scripts. The 24,000-attempt JSON parsed, and a repeated two-seed smoke run produced identical SHA-256 hashes. Adventure Berry, Stim, boss phase, regional enemy perk, runtime reliability, deployment artifact, Free-tier, generated Worker build check, and `git diff --check` passed. `worker.js` SHA-256 remained `015FE3B3494F227BA8F992984D5C353A20A238E7EEC54C7933024E57EC9CFA0D`; `dist/worker.js` remained `04A461BB603DC9411A1D376D21CEEC3D9E1B71220D663610F41DEADD7F71AFFE`. Both files had pre-existing modifications from earlier work; this audit did not edit either. No values, unlocks, enemies, Adventures, rewards, commands, or player data were changed. Nothing was deployed, committed, pushed, remotely registered, or written to live KV.
