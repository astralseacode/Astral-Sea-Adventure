# Regional boss phases: paired A/B balance audit

## Executive summary

This audit ran **14,400 real-runtime battles**: 72 configurations × 100 deterministic seeds × phases OFF/ON. Every ON battle has an OFF battle with the same boss, level, build, class, weapon, policy, initial saved state, and seed. Existing regional perks remained active in both arms. No game values were changed.

The largest measured phase deltas in this matrix were Moonlit Reef Level 5 (**−6.0 percentage points**), Leviathan's Wake Level 30 (**−5.3**), and Sunken King's Throne Level 40 (**−6.7**). Starfall Trench Level 5 was **0/600 wins in both arms**: that is a severe baseline-policy outcome, not evidence that Blackwater Pressure caused the losses. At Level 10, Starfall fell from 25.5% to 23.2% with phases, alongside much higher Mana drain. Kelp bosses were also very hard without phases; more healing did not produce an action-cap stalemate in this sample. These are deterministic policy results, **not the game's true human win rates**.

## Method

- Real `dist/worker.js` combat runtime in isolated VMs, in-memory KV, no network or live accounts. Production `worker.js` and `dist/worker.js` were not edited for this audit. The source SHA-256 recorded in the results is `015fe3b3494f227ba8f992984d5c353a20a238e7eec54c7933024e57ec9cfa0d`.
- OFF is a simulation-only override of phase advancement plus the pre-phase 20-Protection Throne's Resolve crossing. Boss identity, authored stats, victory behavior, and every existing regional perk remain active. ON uses production behavior. There is no player-facing toggle.
- Every pairing restores the same initial KV snapshot and seeds a SHA-256-derived 32-bit LCG (`1664525`, `1013904223`) before each arm. Combat branches can consume different later random draws; identical seeds guarantee identical starting streams, not identical rolls after the branches diverge.
- **100 seeds per exact boss/level/class/strategy pairing**, 72 pairings, 7,200 matched pairs. There are 600 OFF and 600 ON battles per region and level. No deliberately bad stress policy is included in primary aggregates.
- Levels: Moonlit Reef **1/5**; Starfall Trench **5/10**; Whispering Kelp Forest **10/20**; Leviathan's Wake **20/30**; Sunken King's Throne **30/40**; Astral Nexus **40/50**. The first is entry, the second later/mature.
- Stat budget is exactly **level − 1** points (0/4/9/19/29/39/49). Each strategy repeatedly allocates from a fixed priority list, respecting the runtime's Vitality/Focus/Strength/Luck/Armor cap of 10 and Fae cap of 5. Weapon favors Strength, Vitality, Armor; spell favors Focus and Fae; mixed spreads Vitality, Strength, Focus, Armor, Fae; supported favors Vitality and Armor. Luck receives points after preferred stats cap. Saved maximum HP and Mana are computed from those stats. There are no free extra points.
- Level 1 and 5 profiles are classless. At Level 10+, each of the six class families is tested once at each region/level, with its matching owned and equipped permanent weapon. This assumes the weapon was previously purchased; purchase affordability is outside combat and was not simulated. Runtime class tier/title follows the tested level. No Level 45 Conjure Gun or Level 30 Familiar is used early: spell eligibility comes from authored `requiredLevel` data.
- Four non-omniscient policies: **weapon** attacks; **spell** rotates available damaging spells; **mixed** alternates attack and available damaging spells; **supported** rotates offense and may use Blessing, Familiar, Bubble, and one Mend when available and sensible. A single Stim is used below 35% maximum HP or 40 HP, and Evocation is used by non-weapon policies below 25 Mana when available. Low-Mana spell choices fall back to attacks. No policy reads future rolls or hidden boss state. No Berries were supplied.
- Bosses are actual authored files at approximately the 20th, 50th, and 80th HP percentiles within each region. Their damage bonuses rise with HP here, so the low/median/high selections also track increasing authored attack damage. Each boss receives two configurations per level. For class-eligible levels, class, boss, and strategy are stratified across six configurations rather than fully crossed. Class comparisons therefore have **100 seeds per class and level**, but are confounded by their assigned boss and strategy.
- An **80-command cap** distinguishes stalemates from deaths. There were **zero caps**. Means for HP and Mana on wins use winners only and are unstable when very few fights win. Receipt-based bonus damage figures are nominal bonuses before player defenses unless stated otherwise.

## Selected bosses

| Region | Lower HP | Median HP | Higher HP |
| --- | --- | --- | --- |
| Moonlit Reef | Starshell Wayfinder (`starshell-wayfinder-boss`), 86 HP, +2 damage | Veilclaw Prime (`veilclaw-prime-boss`), 125 HP, +3 | Moonkeeper Eternal (`moonkeeper-eternal-boss`), 161 HP, +4 |
| Starfall Trench | Eclipse Jaw Moray (`eclipse-jaw-moray-boss`), 274 HP, +9 | Starshower Medusa (`starshower-medusa-boss`), 299 HP, +10 | Firmament Warden (`firmament-warden-boss`), 323 HP, +11 |
| Whispering Kelp Forest | Midnight Bell Medusa (`midnight-bell-medusa-boss`), 340 HP, +11 | First Root Guardian (`first-root-guardian-boss`), 366 HP, +12 | Reed Crowned Hunter (`reed-crowned-hunter-boss`), 392 HP, +13 |
| Leviathan's Wake | Marrow Crown Urchin (`marrow-crown-urchin-boss`), 415 HP, +13 | Gravewing Manta (`gravewing-manta-boss`), 441 HP, +14 | Worldscar Worm (`worldscar-worm-boss`), 467 HP, +15 |
| Sunken King's Throne | Regalia Clawlord (`regalia-clawlord-boss`), 491 HP, +16 | Royal Master Chef Krakenet (`exchequer-krakenet-boss`), 521 HP, +16 | High Gaoler Serpent (`high-gaoler-serpent-boss`), 550 HP, +17 |
| Astral Nexus | Reality Bite Apex (`reality-bite-apex-boss`), 585 HP, +19 | Nothing Bloom Mantis (`nothing-bloom-mantis-boss`), 621 HP, +20 | Endless Dusk Behemoth (`endless-dusk-behemoth`), 656 HP, +21 |

## Entry versus mature: paired phase delta

Each row has **600 matched seeds**. Delta is ON win rate minus OFF win rate, in percentage points. Actions and responses include wins and losses. HP/Mana are means on wins only; `—` means there were no wins. The machine-readable file also has medians, boss/class/strategy splits, matched rows, deaths, Stim/Evocation/Fae counts, phase reach, and actions per phase.

| Region | Level | OFF wins | ON wins | Phase delta | Mean actions OFF→ON | Mean responses OFF→ON | Win HP OFF→ON | Win Mana OFF→ON |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Moonlit Reef | 1 | 295/600 (49.2%) | 271/600 (45.2%) | −4.0 pp | 9.45→9.29 | 8.80→8.67 | 46.1→45.3 | 90.0→89.2 |
| Moonlit Reef | 5 | 468/600 (78.0%) | 432/600 (72.0%) | −6.0 pp | 10.22→10.09 | 9.11→9.04 | 55.0→52.4 | 63.6→63.9 |
| Starfall Trench | 5 | 0/600 (0%) | 0/600 (0%) | 0.0 pp | 10.00→10.00 | 9.67→9.67 | — | — |
| Starfall Trench | 10 | 153/600 (25.5%) | 139/600 (23.2%) | −2.3 pp | 12.34→12.36 | 11.08→11.13 | 33.3→33.2 | 72.5→74.7 |
| Whispering Kelp Forest | 10 | 4/600 (0.7%) | 2/600 (0.3%) | −0.4 pp | 10.19→10.19 | 9.18→9.19 | 15.3→23.5 | 65.0→80.0 |
| Whispering Kelp Forest | 20 | 16/600 (2.7%) | 12/600 (2.0%) | −0.7 pp | 11.38→11.38 | 10.35→10.36 | 41.9→43.7 | 81.3→82.9 |
| Leviathan's Wake | 20 | 3/600 (0.5%) | 2/600 (0.3%) | −0.2 pp | 10.91→10.76 | 9.91→9.76 | 43.7→54.5 | 106.7→50.0 |
| Leviathan's Wake | 30 | 258/600 (43.0%) | 226/600 (37.7%) | −5.3 pp | 12.01→11.80 | 10.92→10.76 | 81.2→76.9 | 121.1→123.4 |
| Sunken King's Throne | 30 | 173/600 (28.8%) | 161/600 (26.8%) | −2.0 pp | 13.84→13.96 | 12.88→13.02 | 72.0→68.1 | 121.6→119.3 |
| Sunken King's Throne | 40 | 349/600 (58.2%) | 309/600 (51.5%) | −6.7 pp | 14.94→15.18 | 13.69→13.99 | 76.6→75.7 | 126.6→121.6 |
| Astral Nexus | 40 | 10/600 (1.7%) | 6/600 (1.0%) | −0.7 pp | 11.53→11.54 | 10.84→10.86 | 81.7→72.3 | 77.4→100.8 |
| Astral Nexus | 50 | 515/600 (85.8%) | 502/600 (83.7%) | −2.1 pp | 13.68→14.01 | 11.49→11.85 | 110.2→105.8 | 117.7→114.2 |

Matched pair changes support the direction of the deltas: for example, Starfall Level 10 had 15 OFF-only wins and 1 ON-only win; Leviathan Level 30 had 37 and 5; Throne Level 40 had 44 and 4. Equal starting seeds do not force identical later rolls after action paths diverge.

## Regional investigations

**Moonlit Reef.** ON produced 10,550 nominal Gentle Current bonus damage at Level 1 versus 6,380 OFF, and 11,495 versus 6,505 at Level 5. ON phase-specific nominal bonus totals were Level 1: phase 1/2/3 = 3,129/3,546/3,060, and Level 5: 3,143/3,618/4,284. Phase 3 was reached in 354/600 entry and 503/600 mature fights. The −4.0/−6.0 pp deltas suggest an observable opening-region increase without a large extra action count in these policies. Entry baseline itself was 49.2%, so the phase is not the sole source of difficulty.

**Starfall Trench.** Level 5 drained **6,210 Mana OFF versus 9,280 ON**, but all 600 pairs lost in both arms. ON deaths with at least 50 Mana still available numbered **397/600**; 9 died at zero Mana. No Level 5 ON battle reached phase 3. This points to substantial baseline boss difficulty for these entry policies; Blackwater Pressure cannot explain their losses. At Level 10, drain rose **8,070→18,645**; zero-Mana actions rose 5→41, actions below 20 Mana 188→355, and low-Mana attack fallbacks 0→28. ON Mana drain by phase was **1,990 before phase 1; 6,065 in phase 1; 6,535 in phase 2; 4,055 in phase 3**. Phase 3 was reached in 255/600. ON Level 10 deaths at zero Mana numbered 23, while **280 died with at least 50 Mana**. The −2.3 pp phase delta shows added pressure, but Mana starvation is not the dominant recorded death condition. Sinking/Crushing/Blackwater contributions cannot be isolated causally from a single progressive fight; the per-phase drain and action counts in the JSON show where pressure occurred.

**Whispering Kelp Forest.** Level 10 boss healing rose **9,930→11,346 HP** across 600 battles; Level 20 rose **11,960→15,375**. Actual enemy HP damage dealt was 112,249→112,289 at Level 10 and 161,764→161,914 at Level 20, across both wins and losses. Healing is material, but battles remained short (longest 17/19 commands at Levels 10/20) and **none reached the 80-command cap**. Baseline wins were only 4/600 and 16/600; phase deltas were −0.4 and −0.7 pp. These policies generally died rather than entering a regeneration stalemate. Strategy splits in the JSON show supported Level 20 at 5.0% OFF versus 3.5% ON, while several other strategies had no wins; sparse winners should not be overinterpreted.

**Leviathan's Wake.** Level 20 wins were 3→2/600; only 24/600 ON fights reached phase 3. At Level 30, wins were **258→226/600**. Nominal Crushing Wake bonus rose 30,210→38,414 at Level 30; 1,987 ON activations occurred versus 2,014 OFF, because fights diverged and some ended sooner. Deaths on a Wake response were 133→175 at Level 30. Of ON Wake responses at Level 30, 378 had some combat Protection before the response. This differs sharply from the previous 8/8 Knight diagnostic: the larger stratified sample does not support a blanket claim that Leviathan is easy. The final +25 phase was reached in 306/600 mature fights, and the result varies with build, boss, and policy.

**Sunken King's Throne.** At Level 40, Royal Guard prevented 22,651→26,474 primary damage, King's Tax paid 7,370→8,783 extra Mana, and Throne's Resolve granted 11,160→16,470 Protection. ON reached phase 3 in 519/600 fights. Win rate fell **58.2%→51.5%** and mean responses rose 13.69→13.99. At Level 30 the delta was −2.0 pp. Weapon-heavy and spell-heavy splits at Level 40 were 55%→49% and 26%→17%, respectively, but they use different assigned bosses and classes; the comparison is descriptive. The layered package has a measurable effect in this matrix and merits human review before any tuning.

**Astral Nexus.** Level 40 Reality Shell formed **668** times, generating 7,554 Protection; Level 50 formed **1,171** times, generating 15,350 Protection. Recorded Protection consumed was 4,844 and 14,770 respectively, including piercing. There were no blocked shell trigger cycles in this sample. Mana Fracture-related drain remained active in both arms (Level 50 total drain 5,919 OFF and 6,239 ON), and Nexus Adaptation reached both +5 and +10 in all 600 fights per arm at each level. These varied spell rotations did **not** repeat the same successful spell consecutively, so Reality Echo triggered zero times here; this is a policy coverage limit, not a claim that Echo is harmless. Fae Intervention activated 112 OFF and 135 ON times at Level 50. Win rate was 1.7%→1.0% at entry Level 40 and 85.8%→83.7% at Level 50. The large level gap dominates the modest measured shell delta.

### Phase-specific receipts

The arrays below are **pre-phase / below 75% / below 50% / below 25%**. They sum over each region's 600 ON battles at that level. They help locate effects within a fight, but later phases necessarily have fewer surviving actions.

| Region and level | Effect by phase |
| --- | --- |
| Starfall L5 | Mana drained: 2,530 / 6,335 / 415 / 0; Pressure armings: 312 / 390 / 16 / 0 |
| Starfall L10 | Mana drained: 1,990 / 6,065 / 6,535 / 4,055; Pressure armings: 244 / 512 / 277 / 110 |
| Kelp L10 | HP healed: 4,650 / 5,136 / 1,335 / 225 |
| Kelp L20 | HP healed: 1,380 / 8,520 / 4,545 / 930 |
| Throne L30 | Guard damage prevented: 7,339 / 8,648 / 4,577 / 2,067; Tax paid: 2,220 / 1,825 / 1,106 / 736 |
| Throne L40 | Guard damage prevented: 5,985 / 7,814 / 7,786 / 4,889; Tax paid: 1,540 / 2,375 / 2,156 / 2,712 |
| Nexus L40 | Shell Protection generated: 0 / 3,240 / 3,384 / 930 |
| Nexus L50 | Shell Protection generated: 0 / 110 / 8,640 / 6,600 |

Raw rows and aggregates also contain actions in each phase, Moonlit and Crushing Wake bonus by phase, and phase reached before each outcome.

### Class observations

Each class has **200 seeds per region** across entry/mature levels where classes are included, but each class/level is assigned one boss and one strategy. These are not controlled class rankings. Nexus Lancer recorded **766 Protection pierced** in its Level 40 weapon configuration; that specific pair won 0/100 both OFF and ON. At Level 50 its assigned policy was spell-heavy and did not use Spear, so no Lancer-wide win advantage can be inferred. Nexus class-group ON minus OFF deltas ranged from 0.0 pp (Lancer, Ranger) to −5.5 pp (Berserker); assignment differences may explain part of that spread. Leviathan class-group deltas ranged 0.0 to −5.5 pp, and Throne ranged −2.0 to −7.5 pp. No class changes are warranted from this design.

## Action caps, concerns, and follow-up investigation

There were **zero action-cap/stalemate events** out of 14,400 battles. No cap rows have boss/player residual resources to report. The 80-command cap remains in the reproducible script for future runs.

Potential concerns: entry-level Starfall, Kelp, Leviathan, and Nexus baselines were already harsh under these scripted builds; floor-level win rates hide some phase effects. Starfall's Level 10 Mana drain more than doubled with phases even though many deaths retained substantial Mana. Throne's Level 40 −6.7 pp delta and layered Guard/Tax/Resolve receipts warrant close playtesting. Kelp's additional healing did not create long fights here but could matter with lower-offense or higher-survival policies. Leviathan Level 30's −5.3 pp delta and Wake-associated deaths contrast with the small earlier Knight result.

Results that appear bounded in this sample: no phase package created an action-cap loop; Moonlit phase 3 appeared often without overwhelming the region-wide win rate; Nexus shells generated Protection but shifted mature wins by −2.1 pp in these policies. These are observations, not safety guarantees.

Recommended **investigation only**: human-playtest entry-level Starfall and Kelp with legitimately acquired gear and different stat choices; compare Level 30 Leviathan with defensive and offensive builds on the same boss; playtest Throne's Level 40 spell tax/Guard layering; run a separate intentional Reality Echo repetition stress test; and fully cross Spear versus other weapons on the *same* Nexus boss, strategy, and level. Do not infer exact buffs or nerfs from this audit.

## Limits

This is a stratified policy simulation, not human play. The 72 configurations cover all selected bosses, levels, strategies, and six classes, but do not fully cross them. A class result can reflect its assigned boss and policy. Baseline floor/ceiling win rates obscure phase effects. Win-only HP/Mana means at low win counts are unstable. The A/B seed stream can diverge after gameplay diverges. Reward income, weapon purchase timing, equipment swaps, consumable inventory, player experimentation, and tactical choices based on visible fight state were not modeled. No repetitive-spell stress policy was included in primary aggregates. The raw results and exact pairing keys are preserved in `boss-phase-ab-results.json` for further analysis.

## Validation and files

Added `scripts/audit-boss-phases-ab.cjs`, `boss-phase-ab-results.json`, and this report. The prior small diagnostic files were preserved. All 7,200 pairs have one OFF and one ON row, and the final run had zero caps. The boss-phase, regional-perk, weapon, class, class-receipt, combat-receipt, Storyteller, Fae Second Opinion, Familiar, Astral Bond, Stim, Leviathan's Wake, Discord long-response, Astral Nexus gate, and runtime-reliability tests passed. Worker/audit syntax, expansion validation, result JSON parse, deterministic build freshness, deployment-artifact safeguards, Free-tier checks, and `git diff --check` passed. `test-evocation` still fails before combat assertions at its approved-text SHA comparison; Evocation content was not edited.

The production source and generated artifact SHA-256 values were unchanged before and after this audit: `worker.js` = `015fe3b3494f227ba8f992984d5c353a20a238e7eec54c7933024e57ec9cfa0d`; `dist/worker.js` = `04a461bb603dc9411a1d376d21ceec3d9e1b71220d663610f41deadd7f71affe`. Their worktree changes predate this audit. No game balance values were changed. Nothing was deployed, committed, pushed, remotely registered, or written to live KV or Cloudflare.
