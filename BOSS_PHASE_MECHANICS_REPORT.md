# Regional boss phases

Bosses use the canonical `enemy.isBoss` flag. Their phase and Reality Shell counter live inside the existing battle-local `regionalEnemy` state. Normal enemies keep the same regional perks and values. Bosses keep those perks too; the phase configuration adjusts the listed values and adds Reality Shell only for Astral Nexus bosses. Existing battles with older regional state receive zeroed phase fields on first use.

Phase thresholds are strict: HP below 75%, 50%, and 25% of maximum. The phase only increases. The main player action resolves damage, secondary damage, and its qualifying regional action under the prior phase; then a surviving boss advances directly to its highest reached phase. Kills do not announce phases. Healing cannot regress a phase. Battle state is removed with combat state. Throne's Resolve uses 30 Protection on a surviving boss crossing below 25%; it remains one once-per-battle activation, with no 20+30 grant. Phase announcements are queued once with existing regional receipts.

| Region | Below 75% | Below 50% | Below 25% |
| --- | --- | --- | --- |
| Moonlit Reef | First Ripple: Gentle Current +7 | Rising Current: +9 | Moonlit Surge: +12 |
| Starfall Trench | Sinking Pressure: 15 Mana / 3 spells | Crushing Depths: 20 / 2 | Blackwater Pressure: 30 / 2 |
| Whispering Kelp Forest | Creeping Vines: 12 HP / 4 responses | Thickened Growth: 15 / 4 | Strangling Bloom: 15 / 3 |
| Leviathan's Wake | Distant Tremor: Crushing Wake +18 / 3 responses | Rising Wake: +20 / 3 | Abyssal Breaker: +25 / 3 |
| Sunken King's Throne | Royal Vigil: Guard 18, Tax 5, Resolve 20 | King's Decree: Guard 20, Tax 7, Resolve 20 | Last Decree: Guard 20, Tax 8, Resolve 30 |
| Astral Nexus | Fractured Shell: 10 Protection / 4 actions | Unstable Shell: 12 / 3 | Collapsing Shell: 15 / 2 |

Starfall Pressure snapshots its drain amount when armed, so a phase change does not rewrite a pending drain. Its existing spell counter carries over. Existing cadence counters also carry over; when a new shorter cadence is reached, the next qualifying event may trigger immediately. Reality Shell uses the same committed player action hook as Nexus Adaptation, so multi-packet actions count once and Help! retains its exclusion. A completed shell cycle is consumed even if Protection is already present. It never stacks and cannot be banked for an instant replacement. It uses ordinary enemy Protection, including existing Spear piercing.

## Seeded balance audit

`scripts/audit-boss-phases.cjs` runs the actual local combat runtime with in-memory KV and a seeded LCG. It samples one median-HP boss per region, at player levels 5/10/20/30/40/50 respectively, with level-budgeted stat allocation and a sword-and-shield class from level 20. Four simple policies are tested twice each: weapon attacks; Star Spark; alternating attack, Star Spark, and Moonbeam with one Familiar attempt; and Conjure Gun/attack/Star Spark with one Bubble attempt. The policies use one Stim at low HP and Evocation when low on Mana. They do not know enemy rolls or choose actions using boss state. This is a small diagnostic sample, not a balance estimate for all 180 bosses or all builds. Raw runs and all requested counters are in `boss-phase-simulations.json`.

| Region | Wins | Mean / median actions | Mean responses | HP / Mana on wins | Mana drained | Boss healing | Protection generated | Phase 3 reached |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Moonlit Reef | 3/8 | 13.13 / 13 | 12.75 | 65.33 / 76.67 | 0 | 0 | 0 | 7/8 |
| Starfall Trench | 0/8 | 16.25 / 16.5 | 16.25 | — | 105 | 0 | 0 | 0/8 |
| Whispering Kelp Forest | 4/8 | 17.5 / 17.5 | 15.13 | 87.5 / 82.5 | 0 | 374 | 0 | 7/8 |
| Leviathan's Wake | 8/8 | 17.75 / 18.5 | 14.88 | 109.75 / 72.5 | 60 | 0 | 0 | 8/8 |
| Sunken King's Throne | 7/8 | 20.25 / 21 | 17.38 | 136.14 / 132.43 | 0 | 0 | 210 | 7/8 |
| Astral Nexus | 6/8 | 14.25 / 15 | 13 | 115.17 / 175 | 19 | 0 | 223 | 6/8 |

Notable counts across eight runs per region: Leviathan's Wake had 38 Crushing Wake activations; Throne had 19 Royal Guard receipts and 17 King's Tax payments; Nexus had 17 Reality Shell formations, 12 Reality Echo triggers, and 2 Fae Interventions. Stim use ranged from 4 to 8 per region; Evocation occurred 3 times in Starfall. Raw results include deaths and actions spent in each phase.

Concerns to investigate with broader samples: Starfall's selected boss defeated all eight policies before phase 3; the observed 105 Mana drained adds pressure, but this audit cannot isolate how much of the result comes from the new drain versus the boss's existing damage and HP. Kelp Recovery restored 374 total HP and fights took 17.5 actions on average, so slower strategies may stall. Throne's combined package generated 210 Protection and 17 tax payments, yet seven runs won. Nexus formed 17 shells while retaining Reality Echo; six runs won, with two Fae Interventions. Leviathan's +25 final cadence was reached in all eight runs and all survived to win under this build. No values were changed based on this audit.

Validation: `test-boss-phases`, the existing regional enemy perk suite, combat receipt presentation, weapons, classes, class combat receipts, Fae Second Opinion, Storyteller, Familiar, Astral Bond, Stim, Berries, Discord long response, Astral Nexus level gate, level-up unlocks, Leviathan's Wake, runtime reliability, expansion validation, syntax, deterministic build/freshness, deployment artifact, Free-tier checks, and `git diff --check` passed. `test-evocation` stops at its approved-text SHA assertion; `data/spells/evocation.json` was not changed by this work.
