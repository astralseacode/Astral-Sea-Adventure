# Entry region boss balance investigation

## Scope

This is an offline what-if investigation of the first authored Adventure in Starfall Trench, Whispering Kelp Forest, Leviathan's Wake, and Astral Nexus. The player builds, seeded path choices, Berry policy, production one-Stim rule, and full Adventure runtime are inherited from the previous audit. Only the target boss definition returned inside an isolated VM is adjusted. Normal enemies, later bosses, canonical data, and production code remain unchanged. A phase-effects-off diagnostic replaces the VM's `bossPhase` lookup with `null`; phase transition notices still occur, but their added effects do not.

Sunken King's Throne level 30, at 48.8% completion in the prior full Adventure audit, is a reference for a more survivable unlock. It is not altered or swept here. Moonlit Reef is likewise outside this targeted investigation.

The initial sweep uses 40 seeds per configuration (160 attempts for classless Starfall, 240 for the other entry regions). Selected HP-only, damage-only, combined, and Kelp perk diagnostics are retested with 80 seeds per configuration across later levels and Adventures. The final JSON contains 103 sweep cells with 22,640 attempts and 127 curve cells with 46,720 attempts: 69,360 offline initial attempts in total. These rates are deterministic policy outcomes, not human win probabilities or statistical confidence claims. The stated 30–45% target applies to initial-attempt Adventure 1 completion at the unlock level.

## Canonical mechanics

Enemy attack rolls are uniform d20. Roll 1 misses for 0 damage; rolls 2–5 deal 5, 6–10 deal 10, 11–15 deal 15, 16–19 deal 20, and roll 20 deals 30 before boss bonus, regional effects, armor, Protection, and other defenses. The mean table damage is 12.75, so with a positive flat `damageBonus`, raw means before regional effects are 12.75 + 0.95 × bonus. Boss phases activate when HP falls strictly below 75%, 50%, and 25% of the boss's *current variant maximum*. Shortening a fight can prevent later phases and enemy responses. A damage-bonus reduction keeps duration similar but lowers each successful hit before defenses.

| Adventure 1 region | Boss | HP | Damage bonus | Mean raw attack before regional effects | Normal enemy HP / bonus | Regional and phase mechanics |
|---|---|---:|---:|---:|---:|---|
| Starfall L5 | Meteor Lure Angler | 260 | +9 | 21.30 | Starstone Lanternfish 150 / +6 | Pressure arms after 4 successful damaging spells, then drains 10 Mana on a hit. Boss phases change this to 15 Mana every 3 spells, 20 every 2, and 30 every 2. |
| Kelp L10 | Chorus Fin Schoolmother | 325 | +11 | 23.20 | Murmurleaf Minnow 215 / +8 | Tangling Kelp adds +5 damage when no Protection. Kelp Recovery heals the enemy 10 HP every fourth response; phases change this to 12/4, 15/4, and 15/3. |
| Leviathan L20 | Breaker Fin Alpha | 400 | +13 | 25.10 | Wake Riding Razorfish 280 / +10 | Crushing Wake adds +15 damage on every third response; phases change the addition to +18, +20, +25. Deepwater Hunger arms a 10 Mana drain after a single recovery of at least 20 Mana. |
| Nexus L40 | Contradiction Leviathan | 565 | +18 | 29.85 | Paradox Minnow 425 / +14 | Repeated damaging spell identity arms a +50 Reality Echo follow-up on the next non-missed enemy response. Mana Fracture arms a drain equal to 25% of a single recovery of at least 25 Mana. Nexus Adaptation adds +5 damage after 3 and +10 after 6 successful damaging player actions. Boss phases add Reality Shell Protection: 10 every 4 actions, 12 every 3, then 15 every 2. |

For canonical boss HP, phases 1/2/3 begin at **194/129/64 HP or less** for Starfall, **243/162/81** for Kelp, **299/199/99** for Leviathan, and **423/282/141** for Nexus. The runtime uses strict percentage comparisons, so reaching exactly 75%, 50%, or 25% does not activate the next phase. An audit-only HP cut also moves these thresholds because it changes the boss's maximum HP.

These are pre-defense means. Armor and Protection reduce actual HP loss; Bubble and other player defenses can absorb a response, while Nexus Reality Shell absorbs player damage and can lengthen the boss fight. Kelp's lack-of-Protection bonus particularly punishes builds that do not establish a shield. Berries and Stim use the production recovery rules, and regional Mana drains can change spell affordability. The actual recorded boss HP damage per response and player damage per action include armor, Protection, spells, misses, and recovery. No single optimal build is assumed. At L5, Star Spark, Jelly, Mend, Moonbeam, and Evocation are available by progression; Bubble becomes available at L8. At L10, those and Bubble are available. At L20, Falling Star and Leviathan's Wake are also unlocked. At L40, Familiar and Tidal Wave are unlocked, among other abilities. Nexus Adventure 1's authored enemy is level 50 even though the region unlocks at level 40. The four policies use only their specified subset of available tools. Their class/weapon rotation is Knight/sword-and-shield, Rogue/daggers, Berserker/axe, Lancer/spear, Vanguard/hammer, and Ranger/bow.

The prior 100-seed full Adventure audit recorded mean boss player actions **among successful kills** of 17.7 for Starfall (6 wins), 12.5 for Kelp (43 wins), 13.3 for Leviathan (84 wins), and 16.4 for Nexus (95 wins). These are selected winning attempts, not the action count a typical losing build would need to win. The paired variant tables below instead report mean actions and responses over everyone who reached the boss, including deaths.

## Results

<!-- RESULTS_START -->
### Entry sensitivity sweep

The sweep holds each boss’s normal rooms and player policies fixed. Only the listed boss parameter changes. “Damage” means an integer reduction to the canonical flat damage bonus on a non-missed attack; it is not a percentage reduction to final HP damage.

#### Starfall Trench

| Audit-only boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Phase activations | In 30–45% band? |
|---|---:|---:|---:|---:|---:|---:|---|
| canonical | 160 | 1.9% | 81.9% | 2.3% | 29/128 | 224 | no |
| 5% HP cut | 160 | 4.4% | 81.9% | 5.3% | 29/124 | 242 | no |
| 10% HP cut | 160 | 6.3% | 81.9% | 7.6% | 29/121 | 252 | no |
| 15% HP cut | 160 | 11.3% | 81.9% | 13.7% | 29/113 | 265 | no |
| 20% HP cut | 160 | 13.8% | 81.9% | 16.8% | 29/109 | 271 | no |
| 25% HP cut | 160 | 16.9% | 81.9% | 20.6% | 29/104 | 280 | no |
| 30% HP cut | 160 | 22.5% | 81.9% | 27.5% | 29/95 | 302 | no |
| 35% HP cut | 160 | 26.9% | 81.9% | 32.8% | 29/88 | 319 | no |
| 40% HP cut | 160 | 30.6% | 81.9% | 37.4% | 29/82 | 332 | yes |
| 50% HP cut | 160 | 46.3% | 81.9% | 56.5% | 29/57 | 336 | no |
| 60% HP cut | 160 | 61.3% | 81.9% | 74.8% | 29/33 | 343 | no |
| −1 damage bonus | 160 | 4.4% | 81.9% | 5.3% | 29/124 | 241 | no |
| −2 damage bonus | 160 | 5.0% | 81.9% | 6.1% | 29/123 | 249 | no |
| −3 damage bonus | 160 | 6.9% | 81.9% | 8.4% | 29/120 | 258 | no |
| −4 damage bonus | 160 | 12.5% | 81.9% | 15.3% | 29/111 | 278 | no |
| −5 damage bonus | 160 | 13.8% | 81.9% | 16.8% | 29/109 | 287 | no |
| −6 damage bonus | 160 | 21.2% | 81.9% | 26.0% | 29/97 | 300 | no |
| 5% HP cut + −1 damage bonus | 160 | 5.6% | 81.9% | 6.9% | 29/122 | 251 | no |
| 10% HP cut + −1 damage bonus | 160 | 7.5% | 81.9% | 9.2% | 29/119 | 262 | no |
| 10% HP cut + −2 damage bonus | 160 | 8.7% | 81.9% | 10.7% | 29/117 | 272 | no |
| 15% HP cut + −2 damage bonus | 160 | 13.1% | 81.9% | 16.0% | 29/110 | 283 | no |
| 20% HP cut + −2 damage bonus | 160 | 20.6% | 81.9% | 25.2% | 29/98 | 293 | no |
| 20% HP cut + −3 damage bonus | 160 | 21.9% | 81.9% | 26.7% | 29/96 | 302 | no |
| 25% HP cut + −3 damage bonus | 160 | 23.7% | 81.9% | 29.0% | 29/93 | 319 | no |
| 30% HP cut + −4 damage bonus | 160 | 33.8% | 81.9% | 41.2% | 29/77 | 342 | yes |
| phase effects off | 160 | 0.6% | 81.9% | 0.8% | 29/130 | 227 | no |

#### Whispering Kelp Forest

| Audit-only boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Phase activations | In 30–45% band? |
|---|---:|---:|---:|---:|---:|---:|---|
| canonical | 240 | 9.2% | 70.4% | 13.0% | 71/147 | 332 | no |
| 5% HP cut | 240 | 9.6% | 70.4% | 13.6% | 71/146 | 345 | no |
| 10% HP cut | 240 | 11.7% | 70.4% | 16.6% | 71/141 | 358 | no |
| 15% HP cut | 240 | 15.0% | 70.4% | 21.3% | 71/133 | 375 | no |
| 20% HP cut | 240 | 20.4% | 70.4% | 29.0% | 71/120 | 389 | no |
| 25% HP cut | 240 | 23.3% | 70.4% | 33.1% | 71/113 | 403 | no |
| 30% HP cut | 240 | 26.7% | 70.4% | 37.9% | 71/105 | 414 | no |
| 35% HP cut | 240 | 30.4% | 70.4% | 43.2% | 71/96 | 425 | yes |
| 40% HP cut | 240 | 33.8% | 70.4% | 47.9% | 71/88 | 432 | yes |
| −1 damage bonus | 240 | 11.7% | 70.4% | 16.6% | 71/141 | 351 | no |
| −2 damage bonus | 240 | 14.6% | 70.4% | 20.7% | 71/134 | 363 | no |
| −3 damage bonus | 240 | 15.4% | 70.4% | 21.9% | 71/132 | 382 | no |
| −4 damage bonus | 240 | 15.8% | 70.4% | 22.5% | 71/131 | 384 | no |
| −5 damage bonus | 240 | 19.6% | 70.4% | 27.8% | 71/122 | 391 | no |
| −6 damage bonus | 240 | 22.9% | 70.4% | 32.5% | 71/114 | 406 | no |
| 5% HP cut + −1 damage bonus | 240 | 14.2% | 70.4% | 20.1% | 71/135 | 365 | no |
| 10% HP cut + −1 damage bonus | 240 | 15.8% | 70.4% | 22.5% | 71/131 | 378 | no |
| 10% HP cut + −2 damage bonus | 240 | 19.6% | 70.4% | 27.8% | 71/122 | 386 | no |
| 15% HP cut + −2 damage bonus | 240 | 21.7% | 70.4% | 30.8% | 71/117 | 402 | no |
| 20% HP cut + −2 damage bonus | 240 | 25.4% | 70.4% | 36.1% | 71/108 | 409 | no |
| 20% HP cut + −3 damage bonus | 240 | 28.3% | 70.4% | 40.2% | 71/101 | 419 | no |
| 25% HP cut + −3 damage bonus | 240 | 32.1% | 70.4% | 45.6% | 71/92 | 425 | yes |
| 30% HP cut + −4 damage bonus | 240 | 36.2% | 70.4% | 51.5% | 71/82 | 446 | yes |
| phase effects off | 240 | 10.0% | 70.4% | 14.2% | 71/145 | 337 | no |
| first-boss Tangling +5 off | 240 | 17.1% | 70.4% | 24.3% | 71/128 | 387 | no |
| 15% HP cut + first-boss Tangling +0 | 240 | 26.3% | 70.4% | 37.3% | 71/106 | 420 | no |
| 20% HP cut + first-boss Tangling +0 | 240 | 29.2% | 70.4% | 41.4% | 71/99 | 429 | no |
| 20% HP cut + first-boss Tangling +2 | 240 | 25.8% | 70.4% | 36.7% | 71/107 | 413 | no |
| 25% HP cut + first-boss Tangling +2 | 240 | 30.4% | 70.4% | 43.2% | 71/96 | 424 | yes |

#### Leviathan's Wake

| Audit-only boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Phase activations | In 30–45% band? |
|---|---:|---:|---:|---:|---:|---:|---|
| canonical | 240 | 15.8% | 80.8% | 19.6% | 46/156 | 470 | no |
| 5% HP cut | 240 | 17.5% | 80.8% | 21.6% | 46/152 | 480 | no |
| 10% HP cut | 240 | 22.1% | 80.8% | 27.3% | 46/141 | 501 | no |
| 15% HP cut | 240 | 27.1% | 80.8% | 33.5% | 46/129 | 517 | no |
| 20% HP cut | 240 | 34.6% | 80.8% | 42.8% | 46/111 | 525 | yes |
| 25% HP cut | 240 | 40.8% | 80.8% | 50.5% | 46/96 | 531 | yes |
| 30% HP cut | 240 | 47.1% | 80.8% | 58.2% | 46/81 | 543 | no |
| 35% HP cut | 240 | 55.8% | 80.8% | 69.1% | 46/60 | 550 | no |
| 40% HP cut | 240 | 59.2% | 80.8% | 73.2% | 46/52 | 560 | no |
| −1 damage bonus | 240 | 15.8% | 80.8% | 19.6% | 46/156 | 477 | no |
| −2 damage bonus | 240 | 20.4% | 80.8% | 25.3% | 46/145 | 490 | no |
| −3 damage bonus | 240 | 24.6% | 80.8% | 30.4% | 46/135 | 499 | no |
| −4 damage bonus | 240 | 28.3% | 80.8% | 35.1% | 46/126 | 507 | no |
| −5 damage bonus | 240 | 32.9% | 80.8% | 40.7% | 46/115 | 512 | yes |
| −6 damage bonus | 240 | 37.9% | 80.8% | 46.9% | 46/103 | 522 | yes |
| 5% HP cut + −1 damage bonus | 240 | 21.2% | 80.8% | 26.3% | 46/143 | 491 | no |
| 10% HP cut + −1 damage bonus | 240 | 26.3% | 80.8% | 32.5% | 46/131 | 511 | no |
| 10% HP cut + −2 damage bonus | 240 | 27.9% | 80.8% | 34.5% | 46/127 | 518 | no |
| 15% HP cut + −2 damage bonus | 240 | 35.0% | 80.8% | 43.3% | 46/110 | 523 | yes |
| 20% HP cut + −2 damage bonus | 240 | 40.8% | 80.8% | 50.5% | 46/96 | 531 | yes |
| 20% HP cut + −3 damage bonus | 240 | 46.7% | 80.8% | 57.7% | 46/82 | 542 | no |
| 25% HP cut + −3 damage bonus | 240 | 51.2% | 80.8% | 63.4% | 46/71 | 554 | no |
| 30% HP cut + −4 damage bonus | 240 | 57.9% | 80.8% | 71.6% | 46/55 | 563 | no |
| phase effects off | 240 | 17.9% | 80.8% | 22.2% | 46/151 | 475 | no |

#### Astral Nexus

| Audit-only boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Phase activations | In 30–45% band? |
|---|---:|---:|---:|---:|---:|---:|---|
| canonical | 240 | 15.8% | 84.2% | 18.8% | 38/164 | 525 | no |
| 5% HP cut | 240 | 25.8% | 84.2% | 30.7% | 38/140 | 537 | no |
| 10% HP cut | 240 | 30.4% | 84.2% | 36.1% | 38/129 | 546 | yes |
| 15% HP cut | 240 | 39.6% | 84.2% | 47.0% | 38/107 | 555 | yes |
| 20% HP cut | 240 | 49.2% | 84.2% | 58.4% | 38/84 | 563 | no |
| 25% HP cut | 240 | 54.6% | 84.2% | 64.9% | 38/71 | 573 | no |
| 30% HP cut | 240 | 60.8% | 84.2% | 72.3% | 38/56 | 578 | no |
| 35% HP cut | 240 | 65.0% | 84.2% | 77.2% | 38/46 | 586 | no |
| 40% HP cut | 240 | 67.9% | 84.2% | 80.7% | 38/39 | 586 | no |
| −1 damage bonus | 240 | 20.4% | 84.2% | 24.3% | 38/153 | 527 | no |
| −2 damage bonus | 240 | 25.4% | 84.2% | 30.2% | 38/141 | 537 | no |
| −3 damage bonus | 240 | 26.7% | 84.2% | 31.7% | 38/138 | 544 | no |
| −4 damage bonus | 240 | 31.7% | 84.2% | 37.6% | 38/126 | 551 | yes |
| −5 damage bonus | 240 | 36.7% | 84.2% | 43.6% | 38/114 | 555 | yes |
| −6 damage bonus | 240 | 40.0% | 84.2% | 47.5% | 38/106 | 562 | yes |
| 5% HP cut + −1 damage bonus | 240 | 31.7% | 84.2% | 37.6% | 38/126 | 542 | yes |
| 10% HP cut + −1 damage bonus | 240 | 35.8% | 84.2% | 42.6% | 38/116 | 550 | yes |
| 10% HP cut + −2 damage bonus | 240 | 38.8% | 84.2% | 46.0% | 38/109 | 556 | yes |
| 15% HP cut + −2 damage bonus | 240 | 44.2% | 84.2% | 52.5% | 38/96 | 564 | yes |
| 20% HP cut + −2 damage bonus | 240 | 52.5% | 84.2% | 62.4% | 38/76 | 572 | no |
| 20% HP cut + −3 damage bonus | 240 | 54.2% | 84.2% | 64.4% | 38/72 | 580 | no |
| 25% HP cut + −3 damage bonus | 240 | 60.4% | 84.2% | 71.8% | 38/57 | 590 | no |
| 30% HP cut + −4 damage bonus | 240 | 65.8% | 84.2% | 78.2% | 38/44 | 593 | no |
| phase effects off | 240 | 25.8% | 84.2% | 30.7% | 38/140 | 529 | no |

### Selected candidates at unlock and later checkpoints

| Region | Selected variant | Boss HP (canonical → variant) | Flat damage bonus (canonical → variant) |
|---|---|---:|---:|
| Starfall Trench | 40% HP cut | 260 → 156 | +9 → +9 |
| Starfall Trench | −6 damage bonus | 260 → 260 | +9 → +3 |
| Starfall Trench | 30% HP cut + −4 damage bonus | 260 → 182 | +9 → +5 |
| Whispering Kelp Forest | 35% HP cut | 325 → 211 | +11 → +11 |
| Whispering Kelp Forest | −6 damage bonus | 325 → 325 | +11 → +5 |
| Whispering Kelp Forest | 25% HP cut + −3 damage bonus | 325 → 244 | +11 → +8 |
| Whispering Kelp Forest | first-boss Tangling +5 off | 325 → 325 | +11 → +11 |
| Whispering Kelp Forest | 15% HP cut + first-boss Tangling +0 | 325 → 276 | +11 → +11 |
| Whispering Kelp Forest | 20% HP cut + first-boss Tangling +0 | 325 → 260 | +11 → +11 |
| Whispering Kelp Forest | 20% HP cut + first-boss Tangling +2 | 325 → 260 | +11 → +11 |
| Whispering Kelp Forest | 25% HP cut + first-boss Tangling +2 | 325 → 244 | +11 → +11 |
| Leviathan's Wake | 20% HP cut | 400 → 320 | +13 → +13 |
| Leviathan's Wake | −5 damage bonus | 400 → 400 | +13 → +8 |
| Leviathan's Wake | 15% HP cut + −2 damage bonus | 400 → 340 | +13 → +11 |
| Astral Nexus | 10% HP cut | 565 → 509 | +18 → +18 |
| Astral Nexus | −4 damage bonus | 565 → 565 | +18 → +14 |
| Astral Nexus | 5% HP cut + −1 damage bonus | 565 → 537 | +18 → +17 |
| Astral Nexus | 15% HP cut | 565 → 480 | +18 → +18 |
| Astral Nexus | 10% HP cut + −1 damage bonus | 565 → 509 | +18 → +17 |

These cells use the larger curve sample. The baseline is rerun with the same seeds. Later Adventure bosses are unchanged by an Adventure 1 boss-only injection; direct replay verified identical completion, seeds, and paths for those cells.

#### Starfall Trench progression

| Level | Adventure | Boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Entry band confirmed? |
|---:|---:|---|---:|---:|---:|---:|---:|---|
| 5 | 1 | canonical | 320 | 1.6% | 81.9% | 1.9% | 58/257 | no |
| 6 | 1 | canonical | 320 | 5.3% | 82.2% | 6.5% | 57/246 | — |
| 7 | 1 | canonical | 320 | 4.7% | 85.9% | 5.5% | 45/260 | — |
| 8 | 1 | canonical | 320 | 5.9% | 85.9% | 6.9% | 45/256 | — |
| 9 | 1 | canonical | 320 | 10.9% | 90.9% | 12.0% | 29/256 | — |
| 10 | 1 | canonical | 320 | 53.4% | 97.8% | 54.6% | 7/142 | — |
| 5 | 1 | 40% HP cut | 320 | 37.2% | 81.9% | 45.4% | 58/143 | yes |
| 6 | 1 | 40% HP cut | 320 | 44.7% | 82.2% | 54.4% | 57/120 | — |
| 7 | 1 | 40% HP cut | 320 | 49.4% | 85.9% | 57.5% | 45/117 | — |
| 8 | 1 | 40% HP cut | 320 | 47.8% | 85.9% | 55.6% | 45/122 | — |
| 9 | 1 | 40% HP cut | 320 | 52.5% | 90.9% | 57.7% | 29/123 | — |
| 10 | 1 | 40% HP cut | 320 | 85.6% | 97.8% | 87.5% | 7/39 | — |
| 5 | 1 | −6 damage bonus | 320 | 24.4% | 81.9% | 29.8% | 58/184 | no |
| 6 | 1 | −6 damage bonus | 320 | 28.1% | 82.2% | 34.2% | 57/173 | — |
| 7 | 1 | −6 damage bonus | 320 | 32.8% | 85.9% | 38.2% | 45/170 | — |
| 8 | 1 | −6 damage bonus | 320 | 30.6% | 85.9% | 35.6% | 45/177 | — |
| 9 | 1 | −6 damage bonus | 320 | 36.6% | 90.9% | 40.2% | 29/174 | — |
| 10 | 1 | −6 damage bonus | 320 | 78.4% | 97.8% | 80.2% | 7/62 | — |
| 5 | 1 | 30% HP cut + −4 damage bonus | 320 | 41.9% | 81.9% | 51.1% | 58/128 | yes |
| 6 | 1 | 30% HP cut + −4 damage bonus | 320 | 46.3% | 82.2% | 56.3% | 57/115 | — |
| 7 | 1 | 30% HP cut + −4 damage bonus | 320 | 51.2% | 85.9% | 59.6% | 45/111 | — |
| 8 | 1 | 30% HP cut + −4 damage bonus | 320 | 55.3% | 85.9% | 64.4% | 45/98 | — |
| 9 | 1 | 30% HP cut + −4 damage bonus | 320 | 53.1% | 90.9% | 58.4% | 29/121 | — |
| 10 | 1 | 30% HP cut + −4 damage bonus | 320 | 87.8% | 97.8% | 89.8% | 7/32 | — |
| 10 | 15 | canonical | 320 | 36.6% | 92.5% | 39.5% | 24/179 | — |
| 10 | 15 | 40% HP cut | 320 | 36.6% | 92.5% | 39.5% | 24/179 | — |
| 10 | 15 | −6 damage bonus | 320 | 36.6% | 92.5% | 39.5% | 24/179 | — |
| 10 | 15 | 30% HP cut + −4 damage bonus | 320 | 36.6% | 92.5% | 39.5% | 24/179 | — |
| 10 | 30 | canonical | 320 | 15.9% | 87.8% | 18.1% | 39/230 | — |
| 10 | 30 | 40% HP cut | 320 | 15.9% | 87.8% | 18.1% | 39/230 | — |
| 10 | 30 | −6 damage bonus | 320 | 15.9% | 87.8% | 18.1% | 39/230 | — |
| 10 | 30 | 30% HP cut + −4 damage bonus | 320 | 15.9% | 87.8% | 18.1% | 39/230 | — |

#### Whispering Kelp Forest progression

| Level | Adventure | Boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Entry band confirmed? |
|---:|---:|---|---:|---:|---:|---:|---:|---|
| 10 | 1 | canonical | 480 | 7.5% | 69.0% | 10.9% | 149/295 | no |
| 15 | 1 | canonical | 480 | 22.5% | 88.3% | 25.5% | 56/316 | — |
| 20 | 1 | canonical | 320 | 37.5% | 90.9% | 41.2% | 29/171 | — |
| 10 | 1 | 35% HP cut | 480 | 30.4% | 69.0% | 44.1% | 149/185 | yes |
| 15 | 1 | 35% HP cut | 480 | 58.1% | 88.3% | 65.8% | 56/145 | — |
| 20 | 1 | 35% HP cut | 320 | 70.9% | 90.9% | 78.0% | 29/64 | — |
| 10 | 1 | −6 damage bonus | 480 | 21.2% | 69.0% | 30.8% | 149/229 | no |
| 15 | 1 | −6 damage bonus | 480 | 47.9% | 88.3% | 54.2% | 56/194 | — |
| 20 | 1 | −6 damage bonus | 320 | 62.8% | 90.9% | 69.1% | 29/90 | — |
| 10 | 1 | 25% HP cut + −3 damage bonus | 480 | 31.9% | 69.0% | 46.2% | 149/178 | yes |
| 15 | 1 | 25% HP cut + −3 damage bonus | 480 | 57.9% | 88.3% | 65.6% | 56/146 | — |
| 20 | 1 | 25% HP cut + −3 damage bonus | 320 | 72.2% | 90.9% | 79.4% | 29/60 | — |
| 20 | 15 | canonical | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 15 | 35% HP cut | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 15 | −6 damage bonus | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 15 | 25% HP cut + −3 damage bonus | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | canonical | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 20 | 30 | 35% HP cut | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 20 | 30 | −6 damage bonus | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 20 | 30 | 25% HP cut + −3 damage bonus | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 10 | 1 | first-boss Tangling +5 off | 480 | 16.0% | 69.0% | 23.3% | 149/254 | no |
| 15 | 1 | first-boss Tangling +5 off | 480 | 40.2% | 88.3% | 45.5% | 56/231 | — |
| 20 | 1 | first-boss Tangling +5 off | 320 | 59.1% | 90.9% | 64.9% | 29/102 | — |
| 20 | 15 | first-boss Tangling +5 off | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | first-boss Tangling +5 off | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 10 | 1 | 15% HP cut + first-boss Tangling +0 | 480 | 25.2% | 69.0% | 36.6% | 149/210 | no |
| 15 | 1 | 15% HP cut + first-boss Tangling +0 | 480 | 51.2% | 88.3% | 58.0% | 56/178 | — |
| 20 | 1 | 15% HP cut + first-boss Tangling +0 | 320 | 71.3% | 90.9% | 78.4% | 29/63 | — |
| 20 | 15 | 15% HP cut + first-boss Tangling +0 | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | 15% HP cut + first-boss Tangling +0 | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 10 | 1 | 20% HP cut + first-boss Tangling +0 | 480 | 29.6% | 69.0% | 42.9% | 149/189 | no |
| 15 | 1 | 20% HP cut + first-boss Tangling +0 | 480 | 55.0% | 88.3% | 62.3% | 56/160 | — |
| 20 | 1 | 20% HP cut + first-boss Tangling +0 | 320 | 75.0% | 90.9% | 82.5% | 29/51 | — |
| 20 | 15 | 20% HP cut + first-boss Tangling +0 | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | 20% HP cut + first-boss Tangling +0 | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 10 | 1 | 20% HP cut + first-boss Tangling +2 | 480 | 25.8% | 69.0% | 37.5% | 149/207 | no |
| 15 | 1 | 20% HP cut + first-boss Tangling +2 | 480 | 49.4% | 88.3% | 55.9% | 56/187 | — |
| 20 | 1 | 20% HP cut + first-boss Tangling +2 | 320 | 67.2% | 90.9% | 73.9% | 29/76 | — |
| 20 | 15 | 20% HP cut + first-boss Tangling +2 | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | 20% HP cut + first-boss Tangling +2 | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |
| 10 | 1 | 25% HP cut + first-boss Tangling +2 | 480 | 30.0% | 69.0% | 43.5% | 149/187 | yes |
| 15 | 1 | 25% HP cut + first-boss Tangling +2 | 480 | 57.5% | 88.3% | 65.1% | 56/148 | — |
| 20 | 1 | 25% HP cut + first-boss Tangling +2 | 320 | 71.9% | 90.9% | 79.0% | 29/61 | — |
| 20 | 15 | 25% HP cut + first-boss Tangling +2 | 320 | 30.3% | 87.5% | 34.6% | 40/183 | — |
| 20 | 30 | 25% HP cut + first-boss Tangling +2 | 320 | 11.3% | 83.1% | 13.5% | 54/230 | — |

#### Leviathan's Wake progression

| Level | Adventure | Boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Entry band confirmed? |
|---:|---:|---|---:|---:|---:|---:|---:|---|
| 20 | 1 | canonical | 480 | 13.5% | 81.7% | 16.6% | 88/327 | no |
| 25 | 1 | canonical | 480 | 42.9% | 95.0% | 45.2% | 24/250 | — |
| 30 | 1 | canonical | 320 | 55.6% | 98.1% | 56.7% | 6/136 | — |
| 20 | 1 | 20% HP cut | 480 | 31.3% | 81.7% | 38.3% | 88/242 | yes |
| 25 | 1 | 20% HP cut | 480 | 69.8% | 95.0% | 73.5% | 24/121 | — |
| 30 | 1 | 20% HP cut | 320 | 80.6% | 98.1% | 82.2% | 6/56 | — |
| 20 | 1 | −5 damage bonus | 480 | 30.0% | 81.7% | 36.7% | 88/248 | yes |
| 25 | 1 | −5 damage bonus | 480 | 66.5% | 95.0% | 70.0% | 24/137 | — |
| 30 | 1 | −5 damage bonus | 320 | 78.7% | 98.1% | 80.3% | 6/62 | — |
| 20 | 1 | 15% HP cut + −2 damage bonus | 480 | 32.9% | 81.7% | 40.3% | 88/234 | yes |
| 25 | 1 | 15% HP cut + −2 damage bonus | 480 | 69.4% | 95.0% | 73.0% | 24/123 | — |
| 30 | 1 | 15% HP cut + −2 damage bonus | 320 | 82.8% | 98.1% | 84.4% | 6/49 | — |
| 30 | 15 | canonical | 320 | 45.9% | 95.0% | 48.4% | 16/157 | — |
| 30 | 15 | 20% HP cut | 320 | 45.9% | 95.0% | 48.4% | 16/157 | — |
| 30 | 15 | −5 damage bonus | 320 | 45.9% | 95.0% | 48.4% | 16/157 | — |
| 30 | 15 | 15% HP cut + −2 damage bonus | 320 | 45.9% | 95.0% | 48.4% | 16/157 | — |
| 30 | 30 | canonical | 320 | 22.8% | 87.2% | 26.2% | 41/206 | — |
| 30 | 30 | 20% HP cut | 320 | 22.8% | 87.2% | 26.2% | 41/206 | — |
| 30 | 30 | −5 damage bonus | 320 | 22.8% | 87.2% | 26.2% | 41/206 | — |
| 30 | 30 | 15% HP cut + −2 damage bonus | 320 | 22.8% | 87.2% | 26.2% | 41/206 | — |

#### Astral Nexus progression

| Level | Adventure | Boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Entry band confirmed? |
|---:|---:|---|---:|---:|---:|---:|---:|---|
| 40 | 1 | canonical | 480 | 15.4% | 86.3% | 17.9% | 66/340 | no |
| 45 | 1 | canonical | 480 | 60.0% | 98.8% | 60.8% | 6/186 | — |
| 50 | 1 | canonical | 320 | 91.9% | 100.0% | 91.9% | 0/26 | — |
| 40 | 1 | 10% HP cut | 480 | 28.1% | 86.3% | 32.6% | 66/279 | no |
| 45 | 1 | 10% HP cut | 480 | 72.5% | 98.8% | 73.4% | 6/126 | — |
| 50 | 1 | 10% HP cut | 320 | 96.9% | 100.0% | 96.9% | 0/10 | — |
| 40 | 1 | −4 damage bonus | 480 | 30.6% | 86.3% | 35.5% | 66/267 | yes |
| 45 | 1 | −4 damage bonus | 480 | 74.0% | 98.8% | 74.9% | 6/119 | — |
| 50 | 1 | −4 damage bonus | 320 | 96.9% | 100.0% | 96.9% | 0/10 | — |
| 40 | 1 | 5% HP cut + −1 damage bonus | 480 | 27.9% | 86.3% | 32.4% | 66/280 | no |
| 45 | 1 | 5% HP cut + −1 damage bonus | 480 | 70.8% | 98.8% | 71.7% | 6/134 | — |
| 50 | 1 | 5% HP cut + −1 damage bonus | 320 | 95.0% | 100.0% | 95.0% | 0/16 | — |
| 50 | 15 | canonical | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 15 | 10% HP cut | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 15 | −4 damage bonus | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 15 | 5% HP cut + −1 damage bonus | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 30 | canonical | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |
| 50 | 30 | 10% HP cut | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |
| 50 | 30 | −4 damage bonus | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |
| 50 | 30 | 5% HP cut + −1 damage bonus | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |
| 40 | 1 | 15% HP cut | 480 | 36.9% | 86.3% | 42.8% | 66/237 | yes |
| 45 | 1 | 15% HP cut | 480 | 78.1% | 98.8% | 79.1% | 6/99 | — |
| 50 | 1 | 15% HP cut | 320 | 97.5% | 100.0% | 97.5% | 0/8 | — |
| 50 | 15 | 15% HP cut | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 30 | 15% HP cut | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |
| 40 | 1 | 10% HP cut + −1 damage bonus | 480 | 32.7% | 86.3% | 37.9% | 66/257 | yes |
| 45 | 1 | 10% HP cut + −1 damage bonus | 480 | 75.6% | 98.8% | 76.6% | 6/111 | — |
| 50 | 1 | 10% HP cut + −1 damage bonus | 320 | 97.5% | 100.0% | 97.5% | 0/8 | — |
| 50 | 15 | 10% HP cut + −1 damage bonus | 320 | 71.3% | 97.5% | 73.1% | 8/84 | — |
| 50 | 30 | 10% HP cut + −1 damage bonus | 320 | 51.9% | 97.5% | 53.2% | 8/146 | — |

### Boss-entry resources and combat exposure

The table uses the larger curve sample at each unlock level. Phase reach is the number of boss-reaching attempts that reached phases 1/2/3. Deaths by phase are deaths *while* phase 0/1/2/3 was active; this does not establish causation.

| Region | Change | Boss HP mean/median | Boss Mana mean/median | Berries at boss | Stims/Berries used per attempt | Mean encounter / total actions | Boss player actions / enemy responses | Player damage per boss action | Boss HP damage per response | Phase reach 1/2/3 | Deaths by phase 0/1/2/3 |
|---|---|---|---|---:|---|---|---|---:|---:|---|---|
| Starfall Trench | canonical | 88.8/105.0 | 87.6/100.0 | 2.0 | 1.7/4.0 | 12.0/21.4 | 12.2/11.6 | 12.4 | 18.8 | 236/141/39 | 26/95/102/34 |
| Starfall Trench | 40% HP cut | 88.8/105.0 | 87.6/100.0 | 2.0 | 1.7/3.9 | 11.4/20.4 | 11.0/10.0 | 11.9 | 19.1 | 256/218/157 | 6/38/58/41 |
| Starfall Trench | −6 damage bonus | 88.8/105.0 | 87.6/100.0 | 2.0 | 1.7/4.0 | 13.6/24.3 | 15.8/15.0 | 12.6 | 13.7 | 258/209/132 | 4/49/77/54 |
| Starfall Trench | 30% HP cut + −4 damage bonus | 88.8/105.0 | 87.6/100.0 | 2.0 | 1.6/3.9 | 12.3/21.9 | 12.9/11.9 | 12.2 | 15.5 | 260/235/181 | 2/25/54/47 |
| Whispering Kelp Forest | canonical | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/4.0 | 11.8/18.7 | 11.7/10.7 | 20.0 | 22.6 | 305/204/86 | 26/101/118/50 |
| Whispering Kelp Forest | 35% HP cut | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.8 | 11.3/17.9 | 10.6/9.3 | 19.0 | 22.9 | 324/282/203 | 7/42/74/62 |
| Whispering Kelp Forest | −6 damage bonus | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 12.9/20.4 | 14.1/13.0 | 20.4 | 17.6 | 320/261/173 | 11/59/88/71 |
| Whispering Kelp Forest | 25% HP cut + −3 damage bonus | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 11.9/18.8 | 11.9/10.6 | 19.6 | 20.1 | 322/281/201 | 9/41/73/55 |
| Whispering Kelp Forest | first-boss Tangling +5 off | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/4.0 | 12.6/19.8 | 13.4/12.3 | 20.2 | 19.2 | 317/247/149 | 14/70/98/72 |
| Whispering Kelp Forest | 15% HP cut + first-boss Tangling +0 | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 12.3/19.4 | 12.8/11.5 | 19.9 | 19.3 | 322/273/186 | 9/49/86/66 |
| Whispering Kelp Forest | 20% HP cut + first-boss Tangling +0 | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 12.2/19.2 | 12.5/11.2 | 19.7 | 19.3 | 324/281/200 | 7/43/80/59 |
| Whispering Kelp Forest | 20% HP cut + first-boss Tangling +2 | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 12.0/18.9 | 12.1/10.8 | 19.8 | 20.5 | 320/270/188 | 11/50/81/65 |
| Whispering Kelp Forest | 25% HP cut + first-boss Tangling +2 | 95.4/116.0 | 111.3/115.0 | 2.4 | 1.5/3.9 | 11.9/18.7 | 11.8/10.5 | 19.6 | 20.6 | 321/277/199 | 10/44/71/62 |
| Leviathan's Wake | canonical | 112.0/130.0 | 116.8/130.0 | 2.3 | 1.7/4.0 | 11.9/21.2 | 11.9/10.7 | 24.8 | 24.8 | 383/300/148 | 9/83/152/83 |
| Leviathan's Wake | 20% HP cut | 112.0/130.0 | 116.8/130.0 | 2.3 | 1.7/3.9 | 11.6/20.6 | 11.3/9.9 | 23.9 | 25.4 | 387/337/238 | 5/50/99/88 |
| Leviathan's Wake | −5 damage bonus | 112.0/130.0 | 116.8/130.0 | 2.3 | 1.7/4.0 | 12.6/22.4 | 13.4/12.0 | 24.8 | 21.1 | 388/348/233 | 4/40/115/89 |
| Leviathan's Wake | 15% HP cut + −2 damage bonus | 112.0/130.0 | 116.8/130.0 | 2.3 | 1.7/4.0 | 12.0/21.3 | 12.0/10.6 | 24.2 | 23.9 | 388/347/251 | 4/41/96/93 |
| Astral Nexus | canonical | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 12.2/22.8 | 12.7/11.8 | 35.2 | 26.0 | 414/348/217 | 0/66/131/143 |
| Astral Nexus | 10% HP cut | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 12.1/22.5 | 12.4/11.3 | 34.9 | 25.9 | 414/370/257 | 0/44/113/122 |
| Astral Nexus | −4 damage bonus | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 12.8/23.8 | 13.9/12.7 | 34.7 | 23.0 | 414/377/270 | 0/37/107/123 |
| Astral Nexus | 5% HP cut + −1 damage bonus | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 12.3/22.9 | 12.8/11.7 | 35.0 | 25.3 | 414/363/242 | 0/51/121/108 |
| Astral Nexus | 15% HP cut | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 11.9/22.2 | 12.0/10.8 | 34.9 | 25.9 | 414/383/279 | 0/31/104/102 |
| Astral Nexus | 10% HP cut + −1 damage bonus | 135.3/160.0 | 149.6/160.0 | 2.2 | 1.7/4.0 | 12.1/22.6 | 12.5/11.4 | 34.9 | 25.2 | 414/368/265 | 0/46/103/108 |

### Build and policy spread at unlock

Each class uses its existing weapon. The sample rotates class and policy together, so class rates are descriptive and partly confounded by policy. Full per-policy and per-class counts are in the JSON.

**Starfall Trench:**

- canonical: policies — weapon 0/80 (0.0%); spell 0/80 (0.0%); mixed 0/80 (0.0%); supported 5/80 (6.3%). Classes — Classless 5/320 (1.6%). Regional receipts: pressure 810.
- 40% HP cut: policies — weapon 35/80 (43.8%); spell 21/80 (26.3%); mixed 20/80 (25.0%); supported 43/80 (53.7%). Classes — Classless 119/320 (37.2%). Regional receipts: pressure 764.
- −6 damage bonus: policies — weapon 23/80 (28.7%); spell 16/80 (20.0%); mixed 12/80 (15.0%); supported 27/80 (33.8%). Classes — Classless 78/320 (24.4%). Regional receipts: pressure 1002.
- 30% HP cut + −4 damage bonus: policies — weapon 38/80 (47.5%); spell 25/80 (31.3%); mixed 23/80 (28.7%); supported 48/80 (60.0%). Classes — Classless 134/320 (41.9%). Regional receipts: pressure 883.

**Whispering Kelp Forest:**

- canonical: policies — weapon 22/80 (27.5%); spell 0/80 (0.0%); mixed 13/160 (8.1%); supported 1/160 (0.6%). Classes — Knight 10/80 (12.5%); Rogue 1/80 (1.3%); Berserker 22/80 (27.5%); Lancer 0/80 (0.0%); Vanguard 3/80 (3.7%); Ranger 0/80 (0.0%). Regional receipts: kelpRecovery 1618, tanglingKelp 6530.
- 35% HP cut: policies — weapon 53/80 (66.2%); spell 1/80 (1.3%); mixed 67/160 (41.9%); supported 25/160 (15.6%). Classes — Knight 36/80 (45.0%); Rogue 15/80 (18.8%); Berserker 53/80 (66.2%); Lancer 1/80 (1.3%); Vanguard 31/80 (38.8%); Ranger 10/80 (12.5%). Regional receipts: kelpRecovery 1550, tanglingKelp 6143.
- −6 damage bonus: policies — weapon 39/80 (48.7%); spell 0/80 (0.0%); mixed 55/160 (34.4%); supported 8/160 (5.0%). Classes — Knight 32/80 (40.0%); Rogue 5/80 (6.3%); Berserker 39/80 (48.7%); Lancer 0/80 (0.0%); Vanguard 23/80 (28.7%); Ranger 3/80 (3.7%). Regional receipts: kelpRecovery 1852, tanglingKelp 7083.
- 25% HP cut + −3 damage bonus: policies — weapon 57/80 (71.3%); spell 0/80 (0.0%); mixed 71/160 (44.4%); supported 25/160 (15.6%). Classes — Knight 40/80 (50.0%); Rogue 12/80 (15.0%); Berserker 57/80 (71.3%); Lancer 0/80 (0.0%); Vanguard 31/80 (38.8%); Ranger 13/80 (16.3%). Regional receipts: kelpRecovery 1666, tanglingKelp 6453.
- first-boss Tangling +5 off: policies — weapon 36/80 (45.0%); spell 0/80 (0.0%); mixed 34/160 (21.2%); supported 7/160 (4.4%). Classes — Knight 18/80 (22.5%); Rogue 3/80 (3.7%); Berserker 36/80 (45.0%); Lancer 0/80 (0.0%); Vanguard 16/80 (20.0%); Ranger 4/80 (5.0%). Regional receipts: kelpRecovery 1776, tanglingKelp 6987.
- 15% HP cut + first-boss Tangling +0: policies — weapon 48/80 (60.0%); spell 0/80 (0.0%); mixed 57/160 (35.6%); supported 16/160 (10.0%). Classes — Knight 30/80 (37.5%); Rogue 9/80 (11.3%); Berserker 48/80 (60.0%); Lancer 0/80 (0.0%); Vanguard 27/80 (33.8%); Ranger 7/80 (8.7%). Regional receipts: kelpRecovery 1731, tanglingKelp 6790.
- 20% HP cut + first-boss Tangling +0: policies — weapon 52/80 (65.0%); spell 0/80 (0.0%); mixed 65/160 (40.6%); supported 25/160 (15.6%). Classes — Knight 35/80 (43.8%); Rogue 14/80 (17.5%); Berserker 52/80 (65.0%); Lancer 0/80 (0.0%); Vanguard 30/80 (37.5%); Ranger 11/80 (13.8%). Regional receipts: kelpRecovery 1708, tanglingKelp 6700.
- 20% HP cut + first-boss Tangling +2: policies — weapon 53/80 (66.2%); spell 0/80 (0.0%); mixed 59/160 (36.9%); supported 12/160 (7.5%). Classes — Knight 33/80 (41.2%); Rogue 7/80 (8.7%); Berserker 53/80 (66.2%); Lancer 0/80 (0.0%); Vanguard 26/80 (32.5%); Ranger 5/80 (6.3%). Regional receipts: kelpRecovery 1672, tanglingKelp 6559.
- 25% HP cut + first-boss Tangling +2: policies — weapon 57/80 (71.3%); spell 0/80 (0.0%); mixed 67/160 (41.9%); supported 20/160 (12.5%). Classes — Knight 36/80 (45.0%); Rogue 10/80 (12.5%); Berserker 57/80 (71.3%); Lancer 0/80 (0.0%); Vanguard 31/80 (38.8%); Ranger 10/80 (12.5%). Regional receipts: kelpRecovery 1656, tanglingKelp 6472.

**Leviathan's Wake:**

- canonical: policies — weapon 48/160 (30.0%); spell 0/80 (0.0%); mixed 4/80 (5.0%); supported 13/160 (8.1%). Classes — Knight 7/80 (8.7%); Rogue 20/80 (25.0%); Berserker 0/80 (0.0%); Lancer 4/80 (5.0%); Vanguard 6/80 (7.5%); Ranger 28/80 (35.0%). Regional receipts: crushingWake 2673, deepwaterHunger 1423.
- 20% HP cut: policies — weapon 90/160 (56.3%); spell 3/80 (3.7%); mixed 14/80 (17.5%); supported 43/160 (26.9%). Classes — Knight 19/80 (23.7%); Rogue 44/80 (55.0%); Berserker 3/80 (3.7%); Lancer 14/80 (17.5%); Vanguard 24/80 (30.0%); Ranger 46/80 (57.5%). Regional receipts: crushingWake 2577, deepwaterHunger 1412.
- −5 damage bonus: policies — weapon 93/160 (58.1%); spell 2/80 (2.5%); mixed 10/80 (12.5%); supported 39/160 (24.4%). Classes — Knight 19/80 (23.7%); Rogue 43/80 (53.7%); Berserker 2/80 (2.5%); Lancer 10/80 (12.5%); Vanguard 20/80 (25.0%); Ranger 50/80 (62.5%). Regional receipts: crushingWake 2830, deepwaterHunger 1484.
- 15% HP cut + −2 damage bonus: policies — weapon 89/160 (55.6%); spell 2/80 (2.5%); mixed 17/80 (21.2%); supported 50/160 (31.3%). Classes — Knight 25/80 (31.3%); Rogue 41/80 (51.2%); Berserker 2/80 (2.5%); Lancer 17/80 (21.2%); Vanguard 25/80 (31.3%); Ranger 48/80 (60.0%). Regional receipts: crushingWake 2675, deepwaterHunger 1425.

**Astral Nexus:**

- canonical: policies — weapon 1/80 (1.3%); spell 7/160 (4.4%); mixed 13/160 (8.1%); supported 53/80 (66.2%). Classes — Knight 2/80 (2.5%); Rogue 7/80 (8.7%); Berserker 53/80 (66.2%); Lancer 1/80 (1.3%); Vanguard 5/80 (6.3%); Ranger 6/80 (7.5%). Regional receipts: realityShell 698, manaFracture 1820, nexusAdaptation 1788.
- 10% HP cut: policies — weapon 5/80 (6.3%); spell 22/160 (13.8%); mixed 40/160 (25.0%); supported 68/80 (85.0%). Classes — Knight 9/80 (11.3%); Rogue 19/80 (23.7%); Berserker 68/80 (85.0%); Lancer 5/80 (6.3%); Vanguard 13/80 (16.3%); Ranger 21/80 (26.3%). Regional receipts: realityShell 683, manaFracture 1798, nexusAdaptation 1788.
- −4 damage bonus: policies — weapon 7/80 (8.7%); spell 24/160 (15.0%); mixed 47/160 (29.4%); supported 69/80 (86.3%). Classes — Knight 11/80 (13.8%); Rogue 25/80 (31.3%); Berserker 69/80 (86.3%); Lancer 7/80 (8.7%); Vanguard 13/80 (16.3%); Ranger 22/80 (27.5%). Regional receipts: realityShell 863, manaFracture 1893, nexusAdaptation 1790.
- 5% HP cut + −1 damage bonus: policies — weapon 5/80 (6.3%); spell 21/160 (13.1%); mixed 39/160 (24.4%); supported 69/80 (86.3%). Classes — Knight 10/80 (12.5%); Rogue 20/80 (25.0%); Berserker 69/80 (86.3%); Lancer 5/80 (6.3%); Vanguard 11/80 (13.8%); Ranger 19/80 (23.7%). Regional receipts: realityShell 699, manaFracture 1813, nexusAdaptation 1789.
- 15% HP cut: policies — weapon 13/80 (16.3%); spell 32/160 (20.0%); mixed 60/160 (37.5%); supported 72/80 (90.0%). Classes — Knight 14/80 (17.5%); Rogue 32/80 (40.0%); Berserker 72/80 (90.0%); Lancer 13/80 (16.3%); Vanguard 18/80 (22.5%); Ranger 28/80 (35.0%). Regional receipts: realityShell 668, manaFracture 1769, nexusAdaptation 1788.
- 10% HP cut + −1 damage bonus: policies — weapon 5/80 (6.3%); spell 26/160 (16.3%); mixed 57/160 (35.6%); supported 69/80 (86.3%). Classes — Knight 14/80 (17.5%); Rogue 28/80 (35.0%); Berserker 69/80 (86.3%); Lancer 5/80 (6.3%); Vanguard 12/80 (15.0%); Ranger 29/80 (36.2%). Regional receipts: realityShell 701, manaFracture 1793, nexusAdaptation 1789.

Across the reported sweep and curve cells there were 0 action-cap events. Mean per-encounter actions, total actions, player and enemy damage, boss response counts, phase reach, and regional receipt counts for every cell are in the JSON.
<!-- RESULTS_END -->

## Interpretation and limits

**Starfall:** The confirmed level 5 sample has 1.6% completion with the canonical boss, 37.2% with 40% less boss HP, and 41.9% with 30% less HP plus a 4-point damage-bonus cut. A 6-point damage-bonus cut alone reaches only 24.4%. Boss reach remains 81.9% in every variant: the 18.1% lost before the boss cannot be recovered by changing this boss. Shorter fights reduce average boss responses from 11.6 to 10.0 for the HP-only candidate; damage reduction lengthens exposure to 15.0 responses while making each hit lighter. The HP-only and combined candidates meet the entry band, but they raise Adventure 1 at level 10 from 53.4% to 85.6% and 87.8%, respectively. Later Adventures 15 and 30 retain their original harder results. These are strong entry fixes with a clear risk of making the *first* mature Adventure easy.

**Kelp:** The smallest screened HP-only and combined candidates confirm at 30.4% (35% less boss HP) and 31.9% (25% less HP plus a 3-point damage-bonus cut) at level 10. A 6-point damage-bonus cut alone reaches 21.2%. Tangling Kelp is also material: suppressing its +5 no-Protection bonus on the first boss alone raises completion from 7.5% to 16.0%. A narrower combination of 25% less boss HP and reducing that boss-only Tangling bonus from +5 to +2 reaches 30.0%. The normal-room bottleneck remains: only 69.0% of attempts reach the boss; the spell policy reached it in only 39% of attempts in the prior 100-seed audit. Even the confirmed candidates leave the spell policy at 0–1% completion in this sample. At level 20, Adventure 1 rises from 37.5% to roughly 71–72% with these candidates, while Adventures 15 and 30 remain unchanged. Boss-only tuning meets the *aggregate* entry target, but does not solve the build and normal-enemy problems. Murmurleaf Minnow and spell-policy interaction need separate investigation before a production choice.

**Leviathan:** A 20% boss HP cut, 5-point damage-bonus cut, and 15% HP plus 2-point bonus cut confirm at 31.3%, 30.0%, and 32.9% entry completion. They preserve the later-Adventure gradient because only Breaker Fin Alpha changes. Adventure 1 at level 30 rises from 55.6% to 80.6%, 78.7%, or 82.8%, making the first mature Adventure substantially easier. The spell policy remains at 2–4% even with these candidates; it reached the boss in only 55% of attempts in the prior audit. Boss-only tuning cannot make every reasonable policy viable here.

**Nexus:** The smallest screened HP-only (10%) and combined (5% HP plus 1-point bonus) variants fall below the band in the larger sample, at 28.1% and 27.9%. The 4-point damage-bonus cut confirms at 30.6%. The next-smallest HP-only (15%) and combined (10% HP plus 1-point bonus) variants confirm at 36.9% and 32.7%. Phase effects contribute: turning off their added effects moves the entry sweep from 15.8% to 25.8%, but does not reach the band by itself. At level 50, Adventure 1 was already 91.9% in the paired baseline and reaches 96.9–97.5% with the confirmed candidates. Adventures 15/30 are unchanged. Any Nexus candidate needs explicit acceptance of a near-certain mature first Adventure. The supported policy dominates Nexus outcomes; the aggregate hides large class/policy disparities.

Across regions, a boss HP reduction shortens the fight and often avoids enemy responses. A flat damage-bonus reduction lets the fight run longer and can increase exposure to later phases, even as HP damage per response falls. The phase-off diagnostics barely changed Starfall, Kelp, or Leviathan entry completion, so the current evidence does not support weakening those phase packages as the primary fix. Kelp's baseline Tangling perk is more consequential than its added boss phases, but changing that perk on the first boss alone does not meet the target. Nexus’s shell phases have a larger contribution, but its baseline boss is still difficult with phase effects disabled. No variant is an automatic production recommendation.

Normal-enemy deaths in the confirmed canonical entry samples were 58/320 for Starfall, 149/480 for Kelp, 88/480 for Leviathan, and 66/480 for Nexus. Starfall and Nexus are chiefly boss bottlenecks in this population, so these results do not establish a need to alter Starstone Lanternfish or Paradox Minnow. Kelp has the largest normal-room loss, and Leviathan's spell policy has poor boss reach; Murmurleaf Minnow and Wake Riding Razorfish merit focused follow-up before assuming a boss-only change makes those regions broadly accessible. These observations do not by themselves specify a safe normal-enemy adjustment.

The target is a design band for the simulated initial attempt, not a mandate to pick the closest numerical result. First-boss-only injection leaves Adventures 15/30 untouched by construction; later Adventure results are separately replayed to verify this. Reaching a phase and dying while it is active does not prove the phase caused death. The phase-off diagnostic estimates contribution through the whole encounter, while paired seeds and identical direction choices control the main sources of variation. Combat RNG can diverge after earlier variant-dependent turns.

Regional receipt totals count effects across the *whole Adventure*, including any normal fights on the chosen path. They are event counts, not the number of attempts affected. Phase reach and deaths by active phase are specific to the first boss. The boss-only Tangling diagnostic changes the damage response but retains the canonical printed receipt, so its Tangling receipt total should not be read as a count of applied +5 bonuses.

The sweep is a finite grid. “Smallest” means the smallest tested parameter change that entered the band within that option type; it is not a proof of a globally minimal balance change. Boundary results, especially exactly 30.0%, should be treated as sensitive to the tested policy population and seeds.

Entry-level attempts can choose paths with zero to three normal fights. HP, Mana, Stim reset, and Berries are handled by the production runtime. No artificial pre-boss refill occurs. A first death ends the simulated attempt; the live game permits retries from the room or boss antechamber.

## Safety and validation

Both new scripts passed `node --check`. The 103 sweep and 127 curve cells parsed as JSON; no action cap occurred. Two repeated smoke runs produced identical SHA-256 results. The telemetry repair replay asserted identical completed and boss-reached counts for every affected Kelp and Nexus cell. Adventure Berry, Stim, boss phase, regional perk, generated artifact, Free-tier, and generated Worker build checks passed. `git diff --check` passed; Git emitted only line-ending notices for the pre-existing modified Worker files. `worker.js` SHA-256 remained `015FE3B3494F227BA8F992984D5C353A20A238E7EEC54C7933024E57EC9CFA0D` and `dist/worker.js` remained `04A461BB603DC9411A1D376D21CEEC3D9E1B71220D663610F41DEADD7F71AFFE` from before this investigation. The simulation does not implement any candidate. No canonical enemy or Adventure JSON, gameplay code, player data, live KV, commands, or deployment state was changed. Nothing was deployed, committed, pushed, or remotely registered.
