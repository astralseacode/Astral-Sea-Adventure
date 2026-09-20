# Wishpocket design audit — proposal only

Wishpocket is **not implemented or approved**. This report reads the current local source and JSON; it changes no gameplay. The candidate distribution is 45% Common, 50% Uncommon, 5% Wishpocket. Current production remains 50% Common and 50% Uncommon. Values below are design starting points, not simulated win rates.

## Method and source of truth

- Read all 30 `data/enemies/<region>/index.json` entries for each of six regions (180 normal enemies), their corresponding enemy JSON, all six Adventure manifests, and bosses 1, 15, and 30 (18 boss records). Bosses were excluded from normal distributions.
- Reward means use each enemy's uniform integer reward range midpoint, `(min + max) / 2`, then average those 30 midpoints. Medians and quartiles are across the 30 enemies' midpoints. The *roll range* columns show the lowest authored minimum and highest authored maximum. This does not apply Luck; production adds Luck after the base Star Candy roll. Ordinary `/battle` Uncommon payouts apply `Math.floor` to the rolled base reward before Luck.
- Damage estimates use the actual attack and spell formulas in `worker.js` and spell JSON. They are pre-enemy-defense expected damage per committed offensive action with no buffs, mastery, crit-fishing, or unusual Fae interactions unless named. A four-action total is an arithmetic reference, not a survival or kill probability.
- Key runtime locations: `performBattle`, `startCombatEncounter`, `performAttackUnlocked`, `resolveWeaponAttack`, `resolveSpellRoll`, `performEatUnlocked`, `resolveCombatVictory`, `resolvePlayerCombatAction`, `getRegionCombatEntries`, `getEnemyDefinition`, `randomInteger`, and `randomChoice` in `worker.js`.

## 1. Normal enemy HP and within-region growth

| Region | Normal enemies | HP min | Q1 | Median | Q3 | Max | Mean | #1 / #15 / #30 HP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Moonlit Reef | 30 | 20 | 74 | 87 | 102 | 145 | 86.2 | Bubble Nibbler 20 / Moonveil Stalker 86 / Moonlit Grunt 145 |
| Starfall Trench | 30 | 150 | 167 | 185 | 201 | 220 | 185 | Starstone Lanternfish 150 / Falling Light Medusa 184 / Starfall Annex Grunt 220 |
| Whispering Kelp Forest | 30 | 215 | 232 | 250 | 266 | 285 | 250 | Murmurleaf Minnow 215 / Shrinebark Guardian 249 / Verdant Pursuit Grunt 285 |
| Leviathan's Wake | 30 | 280 | 297 | 315 | 331 | 350 | 315 | Wake Riding Razorfish 280 / Abysslung Manta 314 / Firstwake Gravekeeper 350 |
| Sunken King's Throne | 30 | 345 | 366 | 387.5 | 407 | 430 | 387.5 | Drowned Banner Guard 345 / Royal Kitchen Octopus 386 / Festival Crown Guardian 430 |
| Astral Nexus | 30 | 425 | 446 | 467.5 | 487 | 510 | 467.5 | Paradox Minnow 425 / Voidflower Mantis 466 / Astral Heart Echo 510 |

HP rises across all 30 authored encounters in a region as well as between regions. Moonlit is especially wide: its first normal enemy has 20 HP, while its final normal enemy has 145 HP. A single global Wishpocket HP value would be too high for entry Moonlit or trivial in Nexus. The proposed Wishpocket values below are well below each region's normal median, especially after Moonlit.

## 2. Normal enemy XP and Star Candy economy

| Region | XP roll range across pool | XP mean / median | XP Q1–Q3 | Candy roll range across pool | Candy mean / median | Candy Q1–Q3 |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| Moonlit Reef | 12–250 | 64.47 / 57 | 39.5–77 | 35–550 | 164.8 / 148.25 | 104–197.5 |
| Starfall Trench | 210–460 | 327.5 / 327.5 | 284.5–364.5 | 210–720 | 442.5 / 442.5 | 392–486.5 |
| Whispering Kelp Forest | 340–600 | 462.5 / 462.5 | 417.5–502 | 340–950 | 622.5 / 622.5 | 569.5–668.5 |
| Leviathan's Wake | 480–780 | 622.5 / 622.5 | 567–671 | 480–1,250 | 827.5 / 827.5 | 756–889 |
| Sunken King's Throne | 650–1,020 | 827.5 / 827.5 | 753.5–891.5 | 650–1,650 | 1,105 / 1,105 | 1,012–1,186 |
| Astral Nexus | 900–1,400 | 1,142.5 / 1,142.5 | 1,035.5–1,235.5 | 900–2,300 | 1,525 / 1,525 | 1,383–1,648.5 |

Representative authored ranges at Adventure positions 1 / 15 / 30:

| Region | XP ranges (#1 / #15 / #30) | Candy ranges (#1 / #15 / #30) |
| --- | --- | --- |
| Moonlit | 12–18 / 50–61 / 200–250 | 35–55 / 130–160 / 450–550 |
| Starfall | 210–280 / 282–367 / 360–460 | 210–480 / 282–596 / 360–720 |
| Kelp | 340–410 / 417–502 / 500–600 | 340–700 / 417–821 / 500–950 |
| Wake | 480–550 / 577–661 / 680–780 | 480–900 / 577–1,069 / 680–1,250 |
| Throne | 650–720 / 780–865 / 920–1,020 | 650–1,200 / 780–1,417 / 920–1,650 |
| Nexus | 900–970 / 1,093–1,178 / 1,300–1,400 | 900–1,600 / 1,093–1,938 / 1,300–2,300 |

The range rises materially within every region. `/battle` selects from the *whole* current-region normal pool, so its baseline reward economy is the pool-wide mean, not the first Adventure's enemy. Current Uncommon XP is 1.10 times its rolled normal XP for all three variants. Frenzied and Fae Touched Star Candies are also 1.10 times their rolled normal Candy value; Armored Candy remains canonical.

## 3. Boss reward boundaries

Ranges are authored rolls, before Luck. Each cell is `HP; XP min–max; Star Candies min–max`.

| Region | Adventure 1 boss | Adventure 15 boss | Adventure 30 boss |
| --- | --- | --- | --- |
| Moonlit | Bubble Nibbler Boss: 23; 18–27; 50–75 | Veilclaw Prime: 125; 80–98; 195–240 | Moonlit Officer: 240; 350–400; 1,000–1,200 |
| Starfall | Meteor Lure Angler: 260; 360–560; 750–1,050 | Starshower Medusa: 299; 457–666; 895–1,253 | Starfall Annex Officer: 340; 560–780; 1,050–1,470 |
| Kelp | Chorus Fin Schoolmother: 325; 520–760; 1,000–1,400 | First Root Guardian: 366; 636–866; 1,193–1,670 | Verdant Pursuit Officer: 410; 760–980; 1,400–1,960 |
| Wake | Breaker Fin Alpha: 400; 720–1,000; 1,350–1,890 | Gravewing Manta: 441; 855–1,106; 1,567–2,194 | First Leviathan Echo: 485; 1,000–1,220; 1,800–2,520 |
| Throne | Standard Bearer Revenant: 475; 980–1,350; 1,750–2,450 | Royal Master Chef Krakenet: 521; 1,159–1,456; 2,040–2,856 | Memory of the Sunken King: 570; 1,350–1,570; 2,350–3,290 |
| Nexus | Contradiction Leviathan: 565; 1,350–1,850; 2,300–3,220 | Nothing Bloom Mantis: 621; 1,591–1,956; 2,734–3,828 | Heart of the Nexus: 680; 1,850–2,070; 3,200–4,480 |

Moonlit boss 1 is an outlier: its payout is below many ordinary Moonlit enemies. A Wishpocket payout that feels exciting relative to the *regional pool* will exceed this one early boss. In the other regions, the conservative ranges below stay broadly near or below first-boss rewards; generous Candy ranges may exceed a first boss on a lucky roll but are gated behind a rare encounter and escape risk.

## 4. Adventure completion economy

There is no separate fixed XP, Star Candy, item, or Berry grant merely for setting an Adventure to complete. The boss victory awards its normal combat XP/Candies, may roll the ordinary region combat Berry chance, records `completedAdventures`, and unlocks the next authored Adventure/encounter. Non-boss fights en route pay normal combat rewards. Noncombat room choices also award XP (`ADVENTURE_CHOICE_XP_BY_LEVEL` based on normal enemy level), treasure choices may award their authored Candy range, and some empty choices award an authored Berry. Thus a completed Adventure has a valuable *bundle* of route rewards and boss rewards, plus progression access; it is not just a completion jackpot. Routes can differ in number of fights and treasure choices. `/battle` is infinitely repeatable and cannot complete Adventures, so Wishpocket should primarily add an occasional Candy event, not replace boss and room progression with huge XP.

## 5–6. Damage and a four-action HP window

Production basic attack uses a d20 tier: 1→0, 2–5→5, 6–10→10, 11–15→15, 16–19→20, 20→30 damage. Its exact unbuffed mean is **12.75**; each Strength rank adds 1 on 19/20 nonmiss rolls, making the mean `12.75 + 0.95 × Strength`. Four zero-Strength basic attacks average 51 damage, with substantial variance. Stat points earn one per level after Level 1, but a player may allocate none or put them into survival.

At zero Strength and without a class, exact mean weapon attacks are: Sword and Shield 22.25, Spear 25.75, Daggers 26.10, Bow 27.46, Hammer 31.00, Axe 31.00. Strength adds on successful attacks; class damage adds only when an applicable class and weapon are active. Every permanent weapon costs **20,000 Star Candies**, so weapon ownership is not safe to assume at Levels 1 or 5. These are pre-defense means and include misses. Daggers and Bow roll twice; Daggers' Strength is applied once to the combined hit.

Representative offensive spells: Star Spark (Level 2, 10 Mana) averages **7** base damage; Moonbeam (Level 5, 20 Mana) averages **21.06** from the higher of 2d20 plus 1d6; Falling Star (Level 15, 30 Mana) averages about **15.03** base damage before roll bonuses or mastery but has a high critical burst; Tidal Wave (Level 40, 30 Mana) averages **52.5** base damage from its 3d12 tier table. Moonbeam and Tidal Wave are strong references, but four consecutive casts cost 80 and 120 Mana respectively: a baseline 100-Mana player cannot cast four Tidal Waves without a recovery effect. Charge, offensive roll bonuses, masteries, class effects, and protection interactions can raise or lower realized damage.

| Unlock checkpoint | Representative four-action arithmetic, before defense | Proposed four-action HP interpretation |
| --- | --- | --- |
| Moonlit L1 | Basic 51 at Strength 0. No offensive spell or assumed purchased weapon. | 20 or less is trivial for many paths; **30–40** allows some misses or a nonoffensive action but rewards prompt attacks; 55+ asks for above-average rolls from an unarmed new player. |
| Starfall L5 | Basic 51 at Strength 0, about 59 at Strength 2, about 66 at Strength 4; four Moonbeams about 84 at 80 Mana; an owned Sword and Shield about 89 at Strength 0. | 35–45 is easy even with basic attacks; **55–70** rewards Moonbeam/weapon use; 90+ makes an unarmed or Mana-poor entry player unlikely. |
| Kelp L10 | Basic 51 at Strength 0, about 62 at Strength 3; four Moonbeams about 84; four unclassed Spear attacks about 103. | 55–65 allows weak attacks; **75–90** rewards spells or a weapon; 115+ pressures players into a stronger build. |
| Wake L20 | Basic about 70 at Strength 5; four unclassed Spear attacks about 122 with Strength 5; Moonbeam 84; Falling Star is variable and bursty. | 75–85 barely tests weapon use; **95–110** rewards an equipped weapon or mixed burst; 145+ can require optimized damage. |
| Throne L30 | Basic about 74 at Strength 6; four unclassed Spear attacks about 126; later Moonbeam mastery may improve spell output; class bonuses add several points per hit. | 90–100 is easy for equipped players; **110–130** is a short focused damage check; 160+ is too demanding for modest builds. |
| Nexus L40 | Basic about 81 at Strength 8; four unclassed Spear attacks about 133; three Tidal Waves average 157.5 at 90 Mana, leaving a fourth action; a fourth Tidal Wave needs resource help. | 100–115 is trivial to strong casters; **140–160** fits a three-cast burst or strong weapon sequence; 200+ begins to resemble a demanding normal fight. |

The desired HP ranges are intentionally far below normal-enemy medians. They cannot make every build equally likely to succeed: a player with no Strength, no weapon, and no usable Mana has only roughly 51 expected damage in four basic attacks even at Level 40. This is why the recommendation favors region-scaled HP and clearly telegraphed urgency rather than a fixed global HP value or level-scaled HP that punishes an overleveled player for returning to an earlier region. All estimates are sensitive to the exact escape timing (whether a lethal fourth action wins before escape), attack misses, available Mana, and whether defensive/regional effects apply.

## 7. Escape timer and action accounting

The current action architecture has no single already-shared counter for every meaningful combat command. `/attack` and most offensive/support `/cast` actions enter `resolvePlayerCombatAction`, which processes an enemy response after successful action resolution. Stim also consumes a combat turn through this path. Some abilities, notably Evocation, have special turn handling; Evocation skips its own casting turn in the current combat rules. `/eat berry` is a successful mutating combat command that restores up to 25 HP/Mana, does **not** consume a combat turn, and is limited to two successful uses in standalone `/battle`. Failed casts, invalid attacks, exhausted Berry attempts, `/help`, `/stats`, and other read-only requests do not commit a combat action.

Recommendation: define one **successful, committed player action** for Wishpocket's timer, covering attack, every successful spell including Evocation and healing/support spells, Stim, and successful `/eat berry`. Check the timer only after the command's validation and successful state mutation, in the same staged command persistence view, so rejected or read-only commands never spend it. A lethal fourth action should resolve victory before escape. Merely counting enemy responses (option B) would let Berry use and Evocation avoid the deadline; only counting offensive actions (option C) would let support loop indefinitely. Counting every incoming command (option A) would punish invalid input and information requests. The implementation will need a small shared committed-action hook or explicit coverage for action paths; no such hook was added in this audit.

## 8–10. Candidate reward bands and economy sensitivity

Each range below is an *authored-style integer roll proposal*, not live content. “Conservative” aims near 1–1.5 ordinary regional enemies; “generous” emphasizes visible Candy payouts. Recommended initial rollout uses **conservative XP** and **generous Candy**, subject to playtesting. All means are range midpoints and exclude Luck, jackpot, and escape failures.

| Region | Conservative XP | Generous XP | Conservative Candy | Generous Candy | Recommended mean XP / Candy |
| --- | ---: | ---: | ---: | ---: | ---: |
| Moonlit | 40–70 | 70–110 | 180–300 | 300–500 | 55 / 400 |
| Starfall | 300–450 | 450–650 | 550–850 | 850–1,300 | 375 / 1,075 |
| Kelp | 420–600 | 600–850 | 800–1,200 | 1,200–1,800 | 510 / 1,500 |
| Wake | 560–800 | 800–1,100 | 1,100–1,650 | 1,650–2,400 | 680 / 2,025 |
| Throne | 730–1,000 | 1,000–1,350 | 1,500–2,200 | 2,200–3,200 | 865 / 2,700 |
| Nexus | 950–1,300 | 1,300–1,750 | 2,050–3,000 | 3,000–4,400 | 1,125 / 3,700 |

At 5% encounter chance and an **illustrative, unmeasured 75% kill rate**, expected gross Candy contribution per `/battle` from the recommended Wishpocket range is `0.05 × 0.75 × mean Wishpocket Candy`:

| Region | Gross Candy per `/battle` | Net versus displaced 5% Common slot | Gross XP per `/battle` | Recommended mean XP as share of next level |
| --- | ---: | ---: | ---: | ---: |
| Moonlit | 15.00 | +6.76 | 2.06 | 11.0% |
| Starfall | 40.31 | +18.19 | 14.06 | 28.8% |
| Kelp | 56.25 | +25.13 | 19.13 | 22.2% |
| Wake | 75.94 | +34.56 | 25.50 | 15.8% |
| Throne | 101.25 | +46.00 | 32.44 | 13.7% |
| Nexus | 138.75 | +62.50 | 42.19 | 13.6% |

Net Candy uses `0.05 × (0.75 × Wishpocket mean − regional normal mean)` because the proposed 5% category displaces 5 points of current Common encounters; the 50% Uncommon weight stays fixed. These are *per-attempt* expectations, not a payout every encounter. The generous Candy means are roughly 2.3–2.5 times average normal Candy and can exceed a first boss on a high roll. This is a bounded occasional bonus, but unlimited `/battle` attempts make actual kills/hour and action time important to measure before approval.

XP thresholds use the production formula `100 × (level − 1)^2 + 400 × (level − 1)`. The relevant next-level gaps are:

| Level | Total XP to reach level | XP to next level | Normal enemy mean XP / gap | First boss mean XP / gap | Recommended Wishpocket mean XP / gap |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | 500 | 64.47 / 12.9% | 22.5 / 4.5% | 55 / 11.0% |
| 5 | 3,200 | 1,300 | 327.5 / 25.2% | 460 / 35.4% | 375 / 28.8% |
| 10 | 11,700 | 2,300 | 462.5 / 20.1% | 640 / 27.8% | 510 / 22.2% |
| 20 | 43,700 | 4,300 | 622.5 / 14.5% | 860 / 20.0% | 680 / 15.8% |
| 30 | 95,700 | 6,300 | 827.5 / 13.1% | 1,165 / 18.5% | 865 / 13.7% |
| 40 | 167,700 | 8,300 | 1,142.5 / 13.8% | 1,600 / 19.3% | 1,125 / 13.6% |

The proposed XP ranges do not skip a full level from these checkpoints. The highest recommended roll is 70/500 (14%) at Level 1, 450/1,300 (34.6%) at Level 5, 600/2,300 (26.1%) at Level 10, 800/4,300 (18.6%) at Level 20, 1,000/6,300 (15.9%) at Level 30, and 1,300/8,300 (15.7%) at Level 40. Starfall XP is the tightest relative constraint. At a player already near a threshold, any reward can cross into the next level, but the proposed roll cannot skip multiple entire levels at these checkpoints. Generous XP proposals are considerably more aggressive at Levels 5–10 and should not be the default without human throughput testing.

### Possible jackpot inside successful Wishpocket defeats

Keep XP unchanged. If 5% of successful Wishpockets replace their normal Candy payout with a **3×** Candy payout, the average successful payout becomes `1.10 × base mean`; a **5×** jackpot makes it `1.20 × base mean`. With 5% Wishpocket chance and illustrative 75% kill rate, the internal jackpot occurs on **0.1875% of all `/battle` uses** (about 1 in 533), versus 0.25% before escapes. The additional expected Candy per `/battle` is `0.00375 × base mean` for 3× or `0.0075 × base mean` for 5×:

| Region | 3× jackpot payout on recommended Candy band | Added Candy per `/battle` at 3× / 5× |
| --- | ---: | ---: |
| Moonlit | 900–1,500 | +1.50 / +3.00 |
| Starfall | 2,550–3,900 | +4.03 / +8.06 |
| Kelp | 3,600–5,400 | +5.63 / +11.25 |
| Wake | 4,950–7,200 | +7.59 / +15.19 |
| Throne | 6,600–9,600 | +10.13 / +20.25 |
| Nexus | 9,000–13,200 | +13.88 / +27.75 |

The 3× model is the safer starting candidate. A 5× model is still modest in *mean* contribution but has a much larger visible payout, especially in Nexus. Avoid an XP jackpot: it adds progression volatility without improving the Candy-centered fantasy. Preserve the distinction between chance per successful Wishpocket and chance per all `/battle` uses.

## 11. RNG and deterministic testing path

Current `/battle` chooses one eligible normal enemy with `randomChoice`, uses `Math.random() < BATTLE_UNCOMMON_CHANCE` (currently `0.50`) for rarity, and selects an Uncommon variant and Fae blessing via `randomChoice`. `randomChoice` uses uniform `randomInteger`, which is `Math.floor(Math.random() × inclusiveRange) + minimum`. Victory rolls XP and Candy using `randomInteger` from the enemy's authored ranges; Luck and any Uncommon multiplier then apply. Existing offline fixtures inject deterministic `Math.random`, override `randomInteger`, and run the real Worker in memory. A future 5% Wishpocket branch could test exact boundaries (for example 0.049999 vs 0.05), each remaining Common/Uncommon boundary, all variant branches, the zero-reward escape path, and both jackpot outcomes by controlling the roll queue. No statistical/flaky test is necessary. Exact branch order will determine those boundary values; keep probabilities centralized and document them.

## 12. Compact recommended design table

These are **review candidates only**. Four-action damage is a rough attainable range for an attentive player using currently unlocked resources; it is not a simulated win rate. The XP/Candy ranges use the conservative XP and generous Candy bands above.

| Region | Unlock | Normal HP min–max / median | Representative 4-action damage | Wish HP band → single start | Wish XP | Wish Candy | 3× jackpot Candy | Concern |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| Moonlit Reef | 1 | 20–145 / 87 | Basic ~51 | 30–40 → **35** | 40–70 | 300–500 | 900–1,500 | No weapon/spell assumed; avoid early unavoidable escapes. |
| Starfall Trench | 5 | 150–220 / 185 | Basic ~51–66; Moonbeam ~84 | 55–70 → **60** | 300–450 | 850–1,300 | 2,550–3,900 | Empty Mana makes even 60 HP meaningful. |
| Whispering Kelp Forest | 10 | 215–285 / 250 | Moonbeam ~84; weapon ~100–115 | 75–90 → **80** | 420–600 | 1,200–1,800 | 3,600–5,400 | Weapon purchase is possible, not guaranteed. |
| Leviathan's Wake | 20 | 280–350 / 315 | Basic ~70; weapon ~120–140 | 95–110 → **100** | 560–800 | 1,650–2,400 | 4,950–7,200 | Falling Star has high roll variance. |
| Sunken King's Throne | 30 | 345–430 / 387.5 | Basic ~74; weapon ~125–145 | 110–130 → **120** | 730–1,000 | 2,200–3,200 | 6,600–9,600 | Keep regional guard/tax off Wishpocket. |
| Astral Nexus | 40 | 425–510 / 467.5 | 3 Tidal Waves ~157.5; weapon ~130–155 | 140–160 → **150** | 950–1,300 | 3,000–4,400 | 9,000–13,200 | Four Tidal Waves need extra Mana; no Nexus perk. |

### Recommendation and open decisions

- **5% encounter chance:** economically plausible with the candidate Candy values. At 75% illustrative kill rate, replacing 5% Common yields roughly +7 to +63 Candy per `/battle` across regions before jackpot. It is still grindable without a cooldown; verify actual fight time, kill rate, and rewards/hour in a later prototype before approval.
- **Four successful player actions:** a good initial escape window if the fourth action may kill Wishpocket before it escapes. Count successful recovery/support actions, including Berry and Evocation, to prevent stalling. Failed and read-only commands must not count. Test low-Mana Level 5 and no-weapon Level 1 explicitly.
- **Scaling:** use current traveled **region**, not player level, for initial HP and reward tables. This matches `/battle`'s region pool, is easy to explain, and lets an overleveled player find an easy Wishpocket in an earlier region. Avoid inheriting a normal enemy's HP or stat package.
- **Enemy response:** prefer a non-damaging or trivial-damage escape-pressure action. Zero damage is easiest to understand, but avoid giving unlimited free support turns; the action timer must advance independently of enemy damage. Decide exact escape presentation and fourth-action ordering before implementation.
- **Regional perks:** do **not** inherit them. The current regional perk engine keys off region and may make a nominally easy rare encounter unexpectedly dangerous or defensive. A unique Wishpocket needs an explicit opt-out and test in each region.
- **Architecture:** 45% Common / 50% Uncommon / 5% Wishpocket is clean as an exclusive three-way roll, with Wishpocket selection before regional-normal enemy loading. It requires explicit battle-local identity, timer, and rewards; it must bypass Uncommon modifier selection, Adventure progression, boss phases, and regional normal-enemy perks. None of this is present yet.

No implementation, source/data/test/artifact change, deployment, remote registration, commit, push, or live player-data operation was performed for this audit.
