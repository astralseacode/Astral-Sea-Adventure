# Astral Sea Adventure: pre-1.0 combat balance audit

## Executive summary

This is a read-only audit of the six-region, Level 1–50 implementation. The complete 360-enemy roster and all 16 spell definitions are in the companion JSON files. The current fight is a damage race: enemies use the same 1d20 damage table throughout the game, with regional flat damage bonuses, and have no enemy-specific combat ability in the inspected enemy definitions. Player offense gains spells, masteries, recovery, and safety nets; basic `/attack` gains only Strength and offensive-roll modifiers. Late spells have a large action advantage. These are findings for design discussion, not proposed changes.

## Method and limits

Source data are `data/enemies/**`, `data/spells/**`, `data/perks/**`, `data/masteries/**`. Runtime rules were checked in `worker.js`, especially `performAttackUnlocked`, `resolveSpellRoll`, `resolvePlayerCombatAction`, `resolveEnemyCombatResponse`, `advanceLeviathansWake`, and `getCombatRollResult`. The companion script enumerates every enemy file and small spell dice pools; it does not mutate source content. Values below labeled *base* exclude Strength, Fae, Charge, Echo, familiars, conditional passives, enemy armor (none found), overkill, and caps unless stated. Encounter estimates are expected-damage quotients, not exact turn distributions or a seeded combat simulation. They must not be read as win probabilities.

## Enemy stat curve and boss balance

Enemy attacks roll 1d20: natural 1 = 0; 2–5 = 5; 6–10 = 10; 11–15 = 15; 16–19 = 20; 20 = 30. A hit adds the enemy's `damageBonus`; a natural 1 stays zero. Thus unmodified expected enemy damage is **12.75**, and a flat bonus contributes **0.95 × bonus**. The raw JSON records every enemy's exact bonus, HP, rewards, and source path. It has no per-enemy spell/status behavior. Moonlit Reef includes a few exceptional bonuses; later regions use a smooth generated curve.

| Region | Normal HP min/mean/median/max | Boss HP min/mean/median/max | Normal expected hit min/mean/max | Boss expected hit min/mean/max | Mean boss HP / normal HP |
|---|---:|---:|---:|---:|---:|
| Moonlit Reef | 20/86.2/87/145 | 23/125.6/126.5/240 | 12.75/12.91/17.50 | 14.65/15.73/17.50 | 1.46× |
| Starfall Trench | 150/185/185/220 | 260/300/300/340 | 18.45/19.40/20.35 | 21.30/22.25/23.20 | 1.62× |
| Whispering Kelp Forest | 215/250/250/285 | 325/367.5/367.5/410 | 20.35/21.30/22.25 | 23.20/24.15/25.10 | 1.47× |
| Leviathan's Wake | 280/315/315/350 | 400/442.5/442.5/485 | 22.25/23.20/24.15 | 25.10/26.05/27.00 | 1.40× |
| Sunken King's Throne | 345/387.5/387.5/430 | 475/522.5/522.5/570 | 24.15/25.10/26.05 | 27.00/28.43/29.85 | 1.35× |
| Astral Nexus | 425/467.5/467.5/510 | 565/622.5/622.5/680 | 26.05/27.95/29.85 | 29.85/31.75/33.65 | 1.33× |

Each region has 30 normal enemies and 30 bosses. Bosses are substantially tougher in HP, while their mean attack advantage over normal enemies is only about 2.8–3.8 HP per enemy turn after the first region. The boss HP ratio declines across progression. The Moonlit Reef 20–240 HP span is a progression range, not a single-level outlier test. Relative jumps worth review: the move from Moonlit Reef mean normal 86.2 HP to Starfall 185 (+115%), while mean attack rises from 12.91 to 19.40 (+50%); the move from Starfall boss 300 mean HP to Kelp boss 367.5 (+22.5%) is gentler. Within later regions, HP progression is close to monotone. The early `coral-button-crab` has 58 HP despite being Level 1; compare the 20 HP `bubble-nibbler` before treating Level 1 as uniform difficulty. No boss-specific attack pattern is encoded in the enemy files.

## Player stat curve and `/attack`

The player starts at **100 HP, 100 Mana, 0 Strength**. Level grants one stat point per level after Level 1; spending is player choice. Vitality and Focus each add 10 to their resource cap per rank (10 ranks each). Strength adds 1 damage per rank (10 ranks). Armor reduces a landed enemy hit by 1 per rank, leaving at least 1 raw-damage hit; Fae adds 1 offensive **spell** roll per rank (5 ranks). Level alone never sets HP, Mana, or Strength. Long/short rest can temporarily increase resource caps. At Level 50, a player can have 100–200 permanent HP and Mana independently, subject to point allocation, and 0–10 Strength. The cited 150/200/+9 build is plausible but is one allocation, not a Level 50 default.

Basic `/attack` rolls 1d20 against the table above. Natural 1 misses despite roll bonuses. Strength is added only to a damaging hit, so expected damage is **12.75 + 0.95 × Strength**, range **0 to 30 + Strength**, with a natural-20 5% critical. At +9 Strength that is **21.3 expected**, range 0–39. It costs no Mana. Offensive-roll status modifiers, Elf Blessing, Patience, Momentum eligibility, and Familiar assistance can affect it; spell-only Fae, Charge, Echo, Aftershock, Rhythm, Rising Power, and spell masteries do not directly make the basic roll itself a spell. Familiar and other shared follow-up effects should be counted separately from the basic attack's own 21.3.

| Level | Permanent HP | Permanent Mana | Strength | Basic expected | Basic range | Relevant unlocked systems |
|---:|---|---|---|---|---|---|
| 1 | 100 | 100 | 0 | 12.75 | 0–30 | Starting kit |
| 5 | 100–140 | 100–140 | 0–4 | 12.75–16.55 | 0–34 | Mend, Moonbeam, Evocation |
| 10 | 100–190 | 100–190 | 0–9 | 12.75–21.30 | 0–39 | Bubble, Momentum, Jellyfish Mastery I |
| 15 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Echo, Aftershock, Falling Star |
| 20 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Fae Aid, Leviathan's Wake |
| 25 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Berries, Awakening |
| 30 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Lunar Alignment, Familiar |
| 35 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Rhythm, All or Nothing |
| 40 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Wake mastery, Tidal Wave |
| 45 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Meteor Alignment, Fae Intervention, Conjure Gun |
| 50 | 100–200 | 100–200 | 0–10 | 12.75–22.25 | 0–40 | Legacy, Storyteller, Shizuki's Presence, Help! |

Ranges above are independent bounds; a player cannot max every stat at once, and unspent points can leave stats at zero. At Level 5 there are four earned points, for example. This is why a single `Level 30 HP` number would be invented.

## Spell power curve

The table is unmodified base damage, before Strength and conditional effects. Exact small-pool enumeration is in `scripts/audit-combat-balance.cjs` and `balance-audit-spells.json`.

| Spell | Unlock | Mana | Base expected damage | Base expected / Mana | Core roll and risk |
|---|---:|---:|---:|---:|---|
| Star Spark | 2 | 10 | 7.00 | 0.70 | d12; 12 crits for 18; 1/12 Charge |
| Jellyfish | 3 | 10 | 13.52 | 1.35 | 3d8; triple 8 crits for 35; mood depends on sum |
| Moonbeam | 5 | 20 | 21.06 | 1.05 | 2d20 keep highest; 20 crits for 40; plus d6 |
| Falling Star | 15 | 30 | 15.03 | 0.50 | 3d10 Power plus independent d20 Accuracy; natural 1 misses |
| Leviathan's Wake | 20 | 30 | 30.95 | 1.03 | d20 creature tier; damage delayed |
| All or Nothing | 35 | 20 | 12.50 first use | 0.625 | d2; half fail; successes stack +25 |
| Tidal Wave | 40 | 30 | 52.50 | 1.75 | 3d12: 40/50/55/65 tier damage |
| Conjure Gun | 45 | 35 | 70.00 | 2.00 | 140 independent binary shots; binomial SD ≈5.92 |
| Help! | 50 | 50% current Mana | 25% of current enemy HP | variable | Requires ≥150 current Mana; 50% success; once per battle |

**Strength matters on spells.** Runtime adds Strength to a successful Falling Star or All or Nothing, and adds it even when other spells have zero base damage unless those two special miss rules apply. The base table deliberately omits it. At +9 Strength, Conjure Gun averages **79** damage, Tidal Wave **61.5**, Moonbeam **30.06** before mastery and passives, and the basic attack **21.3**. Moonbeam's unmodified critical probability is 39/400 = **9.75%**. At Level 27, 2d6 Moonlight averages 7 rather than 3.5; matching dice or sum 7 occurs in 12/36 = **33.33%** of pairs, giving an alignment bonus of 5 normally or 20 on a critical. This lifts its no-Strength mean from **21.0625 to 26.7167**. At Level 46, twin natural 20s add 75 damage at probability 1/400, an unconditional **0.1875 expected damage** per cast, lifting that mean to **26.9042**, with a rare large burst.

Star Spark's natural critical chance is **8.33%**. Charge discounts the next offensive spell's Mana 50% and increases its damage 15%; Mastery I extends damage empowerment to two casts, and Mastery II adds 20 detonation on final consumption if the target lives. Legacy's 10 Mana refund requires a critical that actually creates Charge on a surviving enemy. Jellyfish's perfect natural match has probability 8/512 = **1.5625%**; Legacy then adds 20 damage and restores 20 HP/Mana, capped by missing resources. Jellyfish Mastery II mood probabilities (sad/sleepy/curious/confident/dedicated) are **0.78%/10.16%/39.06%/33.59%/16.41%**. Its damage bonuses lift no-Strength mean damage from **13.5215 to 18.1777**; other moods recover 20 Mana, 20 HP and 5 guard, or a Berry. Falling Star's unmodified Accuracy odds are miss 5%, glance 40%, direct 50%, critical 5%; average Power is 16.5. Meteor Alignment adds Power for pairs/triples and sum 7, subject to the same Accuracy risk, lifting no-Strength expected damage from **15.031 to 17.9938**. Tidal Wave's tier counts from 1,728 equiprobable triples are **364/500/500/364**, or **21.06%/28.94%/28.94%/21.06%**, for 40/50/55/65 damage. All or Nothing averages 12.5 before streak and Strength on an initial cast; a continuing streak raises conditional success damage by 25 each time but a failure resets it. A repeated independent sequence has expected success-run length 1; high streaks are rare, not a reliable rotation.

Leviathan's Wake does **zero immediate damage** on cast. The next valid turn-consuming action gives the warning (stage 1→2); the following one triggers arrival. Thus its 30.95 base expected damage is spread across at least three player actions including cast, and the player can face enemy replies in between. Wake Mastery I adds creature-specific fixed damage/protection/Mana on arrival. Echo and Charge are snapped at cast but their damage manifests at arrival. Help! removes half of the **current**, not maximum, enemy HP on success, giving expected removal of one quarter of current HP before an enemy attack; payment happens on success or failure.

## Mana economy and support spells

From 100 Mana with no recovery or discounts: 10 Star Spark/Jellyfish, 5 Moonbeam, 3 Falling Star/Wake/Tidal Wave, or 2 Conjure Gun casts. At 200 Mana: 20, 10, 6, or 5 respectively. Support spends include Mend 20, Bubble 15, Echo 25, Berries 20, Familiar 30, Elf Blessing 30; Evocation costs a combat turn instead of Mana. Help! requires ≥150 and pays half current Mana. Charge's discount and Storyteller's first chapter reduce costs. Two simultaneous 50% discount sources use the larger discount; they do not create a 75% discount.

Evocation refills to the current cap, requires a turn, and starts a **7 combat-turn cooldown**. The first Evocation in a long fight is therefore powerful, but the player takes an enemy response and cannot spam it each turn. Star Spark Legacy can refund 10 on qualifying criticals; Momentum refunds 10 once per battle on a natural 20 basic attack or Moonbeam; Jellyfish moods, Bubble Mastery I, Echo Mastery, Harmony, Kinship, Wake Mastery, Harvest, Resilience, Awakening, Defiance, Reprieve, Berries, and Shizuki's Presence provide conditional returns. Each is gated by its event and cap; summing every listed return as guaranteed would exaggerate sustain. At 200 Mana, five unmodified Conjure Gun casts already represent ~395 expected damage with +9 Strength, before Evocation; an Evocation may fund another five, but costs one exposed turn. For a 577 HP boss, that is significant yet not infinite. The exact effect of Shizuki overflow depends on triggering Presence; it cannot be assumed in every battle.

| Recovery source | Level | Maximum stated return and trigger |
|---|---:|---|
| Resilience | 7 | 10 Mana, once/battle after surviving below 25% HP |
| Momentum | 9 | 10 Mana, once/battle natural 20 attack or Moonbeam |
| Harvest | 11 | 15 HP + 20 Mana on victory |
| Bubble Mastery I | 16 | 10 Mana when Bubble pops after absorbing damage |
| Jellyfish Mastery II | 21 | Sad 20 Mana; Confident 5 Mana, according to mood probabilities above |
| Awakening | 25 | 25 HP + 25 Mana after five survived attacks, once/battle |
| Harmony | 28 | 15 Mana, once/battle with three distinct roll-bonus sources |
| Kinship | 31 | 15 Mana after Familiar completes all five assists |
| Echo Mastery I | 34 | Echo cost falls to 20; original d4 can refund 5 or 10 after resolution |
| Wake Mastery I | 37 | 5 or 10 Mana for selected creatures on delayed arrival |
| Reprieve | 38 | 30 Mana on victory without Stim |
| Defiance | 36 | 20 HP + 20 Mana on victory at/below 25% HP |
| Legacy | 46 | 10 Mana for qualifying Star Spark Charge; 20 HP/Mana on Perfect Jellyfish |
| Shizuki's Presence | 48 | 30 HP + 40 Mana once/battle after two different Fae activations; low-Mana Evocation may refill to 150% cap |

Victory-only rewards improve **between-encounter** endurance and do not save the current fight. Awakening's five-hit gate and Kinship's five assists matter much more in boss fights than short normal fights. Jellyfish's Sad mood probability is only 0.78%, so its 20 Mana is not a dependable refill plan.

## Survivability and representative encounters

Mend's three surviving-hit triggers heal by roll tier (5/8/10/15 each), so its total nominal healing is **15–45**, bounded by lost HP and survival. Bubble's 1d12 protection tiers (5/10/15/25) average **11.67** protection; it does not end the normal action. Bubble Mastery I gives 10 Mana and +2 roll when protection breaks; Mastery II retaliates. Armor reduces each landed hit, which scales especially well in long fights. Fae Aid, Awakening, Defiance, Fae Intervention, Stim, Familiar variants, Berries, Shizuki's Presence and rest buffers provide additional conditional layers. Fae Intervention is one lethal-hit conversion to 1 HP per battle; it does not restore a full health bar. Awakening requires five **survived** enemy attacks and gives 25 HP/Mana, so quick victories may never trigger it.

| Survival layer | Quantified current effect | Timing limitation |
|---|---|---|
| Vitality | 100–200 permanent HP | Requires allocated points |
| Armor | Up to 10 less per landed hit, minimum 1 | Requires allocated points |
| Mend | 15–45 nominal total; Mastery I changes per-trigger tiers to 7/10/12/18 | Only after three surviving enemy hits; HP cap applies |
| Bubble | 5/10/15/25 protection; mean 11.25 | Spent by incoming damage; Mastery II adds 15 retaliation on break |
| Fae Aid | +5 HP once | Must survive and fall below 15% HP |
| Awakening | +25 HP/Mana, +2 next roll | Five survived attacks, once/battle |
| Fae Intervention | Prevent one lethal enemy hit, leaving 1 HP | Once/battle; subsequent hit can kill |
| Shizuki's Presence | +30 HP/+40 Mana, +3 roll/+15 damage next spell | Two different Fae triggers, once/battle |

Mend's unmastered average healing is `3 × (3×5 + 4×8 + 4×10 + 1×15)/12 = 25.5` HP before capping; mastered 2d12 keep-highest increases both tier quality and per-trigger healing. Bubble's exact average is `(3×5 + 4×10 + 4×15 + 1×25)/12 = 11.67`. These support actions are valuable because they also enable survival long enough for Awakening and a second Evocation window. A 150-HP player facing Horizonfold's expected 29.85 damage can withstand roughly five average unmitigated responses if starting full; one Bubble adds about 0.39 average-hit equivalents, and Mend can add about 0.85, before Armor and other triggers. Their timing means the effects are not simply extra maximum HP.

For the six progression checkpoints below, the displayed HP/Mana/Strength are explicit example allocations, not automatic level stats. Opponents are upper-end normal enemies in the appropriate region, then the named Level 50 boss. The spell column assumes repeated straightforward casting, no passives or recovery. `ceil(HP/mean damage)` is a throughput approximation; death, overkill, random hit variation, and limited Mana invalidate a literal rotation at several points. That failure is itself informative: unassisted repeated casting cannot be the full battle plan.

| Level | Example HP/Mana/STR | Target HP / expected hit | Basic expected / actions | Spell expected / actions | Naive spell Mana needed / share of pool | Raw expected enemy damage before spell victory |
|---:|---:|---:|---:|---:|---:|---:|
| 5 | 100/100/0 | Starfall normal 150 / 18.45 | 12.75 / 12 | Moonbeam 21.06 / 8 | 160 / 160% | 129 |
| 10 | 110/120/2 | Starfall normal 220 / 20.35 | 14.65 / 16 | Moonbeam 23.06 / 10 | 200 / 167% | 183 |
| 20 | 130/140/4 | Kelp normal 285 / 22.25 | 16.55 / 18 | Moonbeam 25.06 / 12 | 240 / 171% | 245 |
| 30 | 140/160/6 | Wake normal 350 / 24.15 | 18.45 / 19 | mastered Moonbeam ~32.72 / 11 | 220 / 138% | ~242 |
| 40 | 150/180/8 | Throne normal 430 / 26.05 | 20.35 / 22 | Tidal Wave 60.5 / 8 | 240 / 133% | 182 |
| 50 | 150/200/9 | Horizonfold Ray 577 / 29.85 | 21.3 / 28 | Conjure Gun 79 / 8 | 280 / 140% | 209 |

Approximate enemy damage exceeds each example's unprotected HP; healing, Armor, Bubble, Evocation, and offensive boosts change the outcome materially. Enemy misses are already represented in attack expectation. The Level 50 Horizonfold number is exact for its 577 HP and +18 damage bonus; `12.75 + .95×18 = 29.85` enemy damage per response. The example 150/200/+9 build cannot also have high Armor without additional remaining stat points, so an optimized fight needs a real allocation and conditional effects. `/attack` only is slower still and usually dies in this unprotected calculation. A reasonable optimized line may open with Bubble/Familiar if affordable, alternate offensive spells for Rhythm/Rising Power, use Evocation when its turn cost is survivable, and reserve Help! for high current boss HP; its expected results cannot be represented by simply assuming all procs activate.

The following cross-region benchmark uses a **150 HP / 200 Mana / +9 Strength** player with zero Armor and no conditional procs, solely to hold player stats constant while comparing regions. It is not a level-specific build forecast. Enemy actions received are roughly `ceil(HP / expected action damage) − 1`; expected incoming damage is that count times mean attack. The same player at early levels is an impossible allocation; use only the Level 50 row as a literal build benchmark.

| Target | HP | Expected enemy hit | `/attack` actions at 21.3 | Conjure Gun actions at 79 | Approx enemy hits before gun victory | Raw damage before gun victory |
|---|---:|---:|---:|---:|---:|---:|
| Moonlit normal mean | 86.2 | 12.91 | 5 | 2 | 1 | 12.91 |
| Starfall normal mean | 185 | 19.40 | 9 | 3 | 2 | 38.8 |
| Kelp normal mean | 250 | 21.30 | 12 | 4 | 3 | 63.9 |
| Wake normal mean | 315 | 23.20 | 15 | 4 | 3 | 69.6 |
| Throne normal mean | 387.5 | 25.10 | 19 | 5 | 4 | 100.4 |
| Nexus normal mean | 467.5 | 27.95 | 22 | 6 | 5 | 139.75 |
| Nexus boss mean | 622.5 | 31.75 | 30 | 8 | 7 | 222.25 |

Actual Level 5 combat instead has 100–140 HP, 100–140 Mana, 0–4 Strength, and Moonbeam/Jellyfish. At 0 Strength, a Starfall 150 HP normal takes ~12 attacks or ~8 Moonbeams, while a Moonlit 86 HP mean takes ~7 attacks or ~5 Moonbeams; Jellyfish is ~7 casts for that Moonlit mean at only 10 Mana each. At Level 10, Moonbeam remains a reliable 20-Mana option; at Level 20, Wake adds delayed damage but Moonbeam remains competitive on immediate action timing. By Level 40 Tidal Wave's 52.5 base makes a 387.5 HP Throne normal ~8 casts before Strength; at Level 45 Conjure Gun's 70 base makes it ~6. At Level 50 with +9 Strength, six gun casts cost 210 Mana, requiring a discount/refund/Evocation from a 200 pool. The Horizonfold Ray's 577 HP implies ~8 gun casts at 79 expected, versus ~28 basic attacks at 21.3; expected raw boss attack is determined from its own JSON bonus. The reported 62 HP/30 Mana finish is plausible only with healing, mitigation, better offense, or other procs than this simple gun-only model. That one anecdote cannot establish a typical outcome; no distributional simulation was completed in this audit.

## `/attack` viability, synergy, and design benchmarks

Basic attack remains useful at Level 1, as a free finisher, for preserving Mana, and to trigger eligible on-hit mechanics. Its mean is only **12.75–22.25** across all possible Strength builds; it does not scale automatically with level. At +9 Strength, Tidal Wave is ~2.89× its expected damage and Conjure Gun ~3.71×, before their spell-only synergies. In high-HP late regions, `/attack` is primarily a no-Mana fallback. Its one strategic resource advantage is real, especially while Evocation is on cooldown, but it is generally not a damage-competitive action.

Charge's 15% damage is applied after Strength and most spell-base bonuses; Echo then duplicates a percentage of the boosted damage, and Aftershock adds separate fixed critical damage. Rhythm and Rising Power reward alternating successful damaging spells; repeating one resets the latter chain. Storyteller's chapters are exclusive and progress with enemy HP: first 20% Mana-cost reduction, then +2 offensive roll, then +10 final damage and +12% critical damage. A charged +9 Strength Conjure Gun has roughly `round(79 × 1.15) = 91` expected damage before Echo/Familiar, an ordinary strong synergy. A charged critical Moonbeam with Lunar Alignment, Full Moon, and final chapter is an extreme high roll, with multiple independent rare gates; it should not set the baseline weapon budget. The largest common action spike is Conjure Gun's **70 + Strength** versus Tidal Wave's **52.5 + Strength**, while the largest proportional boss opener can be Help! at **25% of current HP expected** for half current Mana. On a fresh 577 HP boss, Help!'s expected immediate removal is **144.25 HP**, but it succeeds only half the time and costs at least 75 Mana at the minimum cast threshold.

Preliminary weapon benchmarks for a modified `/attack` at late game, **expected damage per action including +9 Strength**, are 25–35 for a defensive option, 35–45 balanced, 45–60 high-risk, 35–50 multi-hit aggregate, and 30–40 reliable/precision. These are discussion bands, not final weapon stats. They come from a 21.3 basic baseline, 30–61.5 common Moonbeam/Tidal spell baselines, and 79 gun burst. A defensive attack can stay below common spell damage if mitigation is meaningful; a high-risk attack needs to reach Tidal-range payoff to justify volatility while remaining below Conjure Gun's 79 average. Multi-hit must count aggregate damage, and precision should be compared by miss probability and variance, not peak alone. Early-game weapon access at 20,000 Candies has not been modeled from economy data, so these bands should not be applied uniformly at Level 5.

## Regional pressure gaps and concerns

Damage bonuses rise from about +0 in Moonlit Reef to +14–22 at the Nexus, but the enemy decision loop remains a single 1d20 attack. Mechanical pressure gaps supported by that code are Mana disruption that forces action selection, temporary protection interaction, telegraphed high-damage turns, incentives to vary actions, and counterplay to repetitive spell casting. These are types to investigate after weapons, not effect designs. The strongest balance concerns to review are the late action gap between `/attack` and spells, the many conditional recovery sources layered on top of full-cap Evocation, and boss attack values that add only a few expected damage over normal enemies despite much larger boss HP. The early concern is the wide Moonlit HP spread, especially within the same level; the middle concern is that rising HP can make low-damage attacks very slow; the late concern is spell power and recovery outrunning mechanically simple enemies.

## Wording and implementation discrepancies

Momentum eligibility is narrow in current data/runtime: natural 20 **basic attack or Moonbeam**, once per battle. Generic wording about a perfect hit should not be read as every spell. Leviathan's Wake's short description says the wake arrives “after your next action,” while runtime advances from cast to warning on the next valid action and damages on the **second** subsequent valid action. Evocation's description says a seven-turn cooldown; runtime decrements on valid turn-consuming actions, and Shizuki-related overflow has its own path. Storyteller chapters replace each other rather than accumulating. No wording was edited.

## Raw data and reproducibility

- `balance-audit-enemies.json`: all 360 enemies with region, adventure order, class, HP, source, rewards, natural 1–20 damage distribution, expected attack and damage range. Adventure order comes from the adventure manifest.
- `balance-audit-spells.json`: all 16 source spell objects plus base enumerated outcomes; support spells carry null direct-damage values.
- `scripts/audit-combat-balance.cjs`: local, read-only source parser and exact base-dice enumerator. Its only writes are the two audit JSON outputs when deliberately run.

No gameplay, canonical content, runtime code, or generated deployment artifact was changed for this audit. No deployment, commit, push, remote command registration, or live player-data write was performed.

## Validation

`scripts/validate-expansion.ps1` passed (180 adventures, 180 normal enemies, 180 bosses, 621 JSON). Independent parsing passed for all 621 source JSON files. Syntax checks passed for root `worker.js` and the audit script. `scripts/build-worker.cjs --check` found the existing artifact fresh; no rebuild was run. Deployment-artifact smoke passed (48 sequence commands, all six regions, 621/621 source documents). Free-tier checks passed (27 cold paths, zero content fetches, at most one write per key). `git diff --check` passed. A full seeded encounter simulation and the broader individual spell regression suite were **not run**; the encounter table is an expected-value approximation with the limits stated above.
