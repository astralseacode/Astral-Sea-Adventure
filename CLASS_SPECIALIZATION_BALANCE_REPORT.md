# Class specialization balance audit

Exact means enumerate all ordered natural roll outcomes at +9 Strength. Class damage is added once to the matching weapon primary attack after base damage and Strength, before enemy Protection. Side effects are separate.

| Region | Class title | No class dmg | Class dmg | Added | Avg Protection / action | Stagger / proc | Piercing |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| moonlit-reef | Wayward Knight | 30.80 | 32.70 | +1.90 | 9.40 | — | — |
| moonlit-reef | Cutpurse | 35.08 | 37.07 | +1.99 | — | — | — |
| moonlit-reef | Raider | 37.75 | 40.00 | +2.25 | — | — | — |
| moonlit-reef | Spearhand | 34.30 | 36.20 | +1.90 | — | — | 10 |
| moonlit-reef | Bruiser | 38.65 | 40.35 | +1.70 | — | 5 on 15–19; 10 on 20 | — |
| moonlit-reef | Scout | 36.44 | 38.44 | +2.00 | — | — | — |
| starfall-trench | Shieldbearer | 30.80 | 33.65 | +2.85 | 10.35 | — | — |
| starfall-trench | Twinblade | 35.08 | 38.07 | +2.99 | — | — | — |
| starfall-trench | Marauder | 37.75 | 40.75 | +3.00 | — | — | — |
| starfall-trench | Lancer | 34.30 | 37.15 | +2.85 | — | — | 10 |
| starfall-trench | Breaker | 38.65 | 41.20 | +2.55 | — | 5 on 15–19; 10 on 20 | — |
| starfall-trench | Marksman | 36.44 | 39.43 | +2.99 | — | — | — |
| whispering-kelp-forest | Warden | 30.80 | 34.60 | +3.80 | 10.35 | — | — |
| whispering-kelp-forest | Shadowblade | 35.08 | 39.88 | +4.80 | — | — | — |
| whispering-kelp-forest | Reaver | 37.75 | 41.50 | +3.75 | — | — | — |
| whispering-kelp-forest | Dragoon | 34.30 | 37.15 | +2.85 | — | — | 12 |
| whispering-kelp-forest | Mauler | 38.65 | 41.20 | +2.55 | — | 6 on 15–19; 11 on 20 | — |
| whispering-kelp-forest | Sharpshooter | 36.44 | 40.43 | +3.99 | — | — | — |
| leviathans-wake | Bulwark | 30.80 | 34.60 | +3.80 | 11.30 | — | — |
| leviathans-wake | Nightstalker | 35.08 | 40.87 | +5.80 | — | — | — |
| leviathans-wake | Ravager | 37.75 | 41.90 | +4.15 | — | — | — |
| leviathans-wake | Wavepiercer | 34.30 | 38.10 | +3.80 | — | — | 12 |
| leviathans-wake | Juggernaut | 38.65 | 42.05 | +3.40 | — | 6 on 15–19; 11 on 20 | — |
| leviathans-wake | Deadeye | 36.44 | 40.79 | +4.35 | — | — | — |
| sunken-kings-throne | Crown Guardian | 30.80 | 35.55 | +4.75 | 11.30 | — | — |
| sunken-kings-throne | Kingsbane | 35.08 | 42.68 | +7.60 | — | — | — |
| sunken-kings-throne | Warbringer | 37.75 | 41.90 | +4.15 | — | — | — |
| sunken-kings-throne | Crownlance | 34.30 | 38.10 | +3.80 | — | — | 15 |
| sunken-kings-throne | Siegebreaker | 38.65 | 42.05 | +3.40 | — | 7 on 15–19; 12 on 20 | — |
| sunken-kings-throne | Royal Huntsman | 36.44 | 41.79 | +5.35 | — | — | — |
| astral-nexus | Nexus Paladin | 30.80 | 35.55 | +4.75 | 12.25 | — | — |
| astral-nexus | Nexus Phantom | 35.08 | 43.22 | +8.14 | — | — | — |
| astral-nexus | Worldbreaker | 37.75 | 42.25 | +4.50 | — | — | — |
| astral-nexus | Horizon Dragoon | 34.30 | 42.85 | +8.55 | — | — | 15 |
| astral-nexus | Titan Vanguard | 38.65 | 42.05 | +3.40 | — | 7 on 15–19; 12 on 20 | — |
| astral-nexus | Horizon Hunter | 36.44 | 42.16 | +5.73 | — | — | — |

## Endgame effects

- Nexus Paladin: +5 damage and +5 Protection on successful Sword and Shield attacks; restores up to 3 HP once per successful attack (95% natural hit chance), even if enemy Protection absorbs damage.
- Nexus Phantom: +4 base damage, +4 when both Daggers hit (90.25% probability), and +6 when both natural dice are 15+ (9% probability).
- Worldbreaker: +5 base damage, +15 on natural 20 (5% probability), and one pending +5 Warbringer Fury after a miss; Fury is stateful and omitted from the static mean.
- Horizon Dragoon: +4 base damage, 15 Piercing, and +5 when enemy Protection exists at attack start; the table assumes 20 starting Protection.
- Titan Vanguard: +4 base damage, Stagger of 7 or 12 on natural 15–19 or 20; after a Stagger is consumed, gain 5 Protection.
- Horizon Hunter: +5 base damage, +8 when both dice are 15+ except double 20 grants +15 instead. Double 20 probability is 0.25%.

## Seeded representative damage scenarios

Seed: 20260919, 200 trials per cell. Median-HP normal and boss definitions in Sunken King's Throne and Astral Nexus. Each turn uses a natural weapon roll or fixed approximate spell damage (Moonbeam 30, Tidal Wave 61.5, Conjure Gun 79). The Throne model grants 20 enemy Protection below 25% HP. It models attack damage and Spear Piercing, but omits enemy turns, Mana, survival, Familiar, and the full regional perk state machine. The combat regression tests cover regional action classification.

| Region / enemy | HP | Rotation | Unclassed actions | Matched class actions |
| --- | ---: | --- | ---: | ---: |
| sunken-kings-throne normal: Regal Fang Moray / Knight | 389 | varied | 10.9 | 10.4 |
| sunken-kings-throne normal: Regal Fang Moray / Knight | 389 | heavy | 14.0 | 12.6 |
| sunken-kings-throne normal: Regal Fang Moray / Knight | 389 | starved | 13.7 | 12.0 |
| sunken-kings-throne normal: Regal Fang Moray / Rogue | 389 | varied | 10.5 | 9.7 |
| sunken-kings-throne normal: Regal Fang Moray / Rogue | 389 | heavy | 12.7 | 11.0 |
| sunken-kings-throne normal: Regal Fang Moray / Rogue | 389 | starved | 12.2 | 10.1 |
| sunken-kings-throne normal: Regal Fang Moray / Berserker | 389 | varied | 10.3 | 9.9 |
| sunken-kings-throne normal: Regal Fang Moray / Berserker | 389 | heavy | 12.1 | 11.3 |
| sunken-kings-throne normal: Regal Fang Moray / Berserker | 389 | starved | 11.6 | 10.3 |
| sunken-kings-throne normal: Regal Fang Moray / Lancer | 389 | varied | 10.5 | 9.9 |
| sunken-kings-throne normal: Regal Fang Moray / Lancer | 389 | heavy | 12.7 | 11.8 |
| sunken-kings-throne normal: Regal Fang Moray / Lancer | 389 | starved | 12.0 | 10.8 |
| sunken-kings-throne normal: Regal Fang Moray / Vanguard | 389 | varied | 10.3 | 9.9 |
| sunken-kings-throne normal: Regal Fang Moray / Vanguard | 389 | heavy | 12.0 | 11.1 |
| sunken-kings-throne normal: Regal Fang Moray / Vanguard | 389 | starved | 11.4 | 10.4 |
| sunken-kings-throne normal: Regal Fang Moray / Ranger | 389 | varied | 10.2 | 9.8 |
| sunken-kings-throne normal: Regal Fang Moray / Ranger | 389 | heavy | 12.4 | 11.2 |
| sunken-kings-throne normal: Regal Fang Moray / Ranger | 389 | starved | 11.7 | 10.2 |
| sunken-kings-throne boss: Crown Fang Moray / Knight | 524 | varied | 14.3 | 13.7 |
| sunken-kings-throne boss: Crown Fang Moray / Knight | 524 | heavy | 18.3 | 16.6 |
| sunken-kings-throne boss: Crown Fang Moray / Knight | 524 | starved | 18.1 | 15.7 |
| sunken-kings-throne boss: Crown Fang Moray / Rogue | 524 | varied | 13.7 | 12.6 |
| sunken-kings-throne boss: Crown Fang Moray / Rogue | 524 | heavy | 16.7 | 14.4 |
| sunken-kings-throne boss: Crown Fang Moray / Rogue | 524 | starved | 16.1 | 13.3 |
| sunken-kings-throne boss: Crown Fang Moray / Berserker | 524 | varied | 13.4 | 13.0 |
| sunken-kings-throne boss: Crown Fang Moray / Berserker | 524 | heavy | 15.9 | 15.3 |
| sunken-kings-throne boss: Crown Fang Moray / Berserker | 524 | starved | 15.1 | 13.9 |
| sunken-kings-throne boss: Crown Fang Moray / Lancer | 524 | varied | 13.6 | 13.2 |
| sunken-kings-throne boss: Crown Fang Moray / Lancer | 524 | heavy | 16.9 | 15.7 |
| sunken-kings-throne boss: Crown Fang Moray / Lancer | 524 | starved | 16.1 | 14.3 |
| sunken-kings-throne boss: Crown Fang Moray / Vanguard | 524 | varied | 13.2 | 13.1 |
| sunken-kings-throne boss: Crown Fang Moray / Vanguard | 524 | heavy | 15.8 | 14.7 |
| sunken-kings-throne boss: Crown Fang Moray / Vanguard | 524 | starved | 14.6 | 13.7 |
| sunken-kings-throne boss: Crown Fang Moray / Ranger | 524 | varied | 13.6 | 12.9 |
| sunken-kings-throne boss: Crown Fang Moray / Ranger | 524 | heavy | 16.2 | 14.6 |
| sunken-kings-throne boss: Crown Fang Moray / Ranger | 524 | starved | 15.4 | 13.5 |
| astral-nexus normal: Convergence Elemental / Knight | 469 | varied | 12.2 | 12.0 |
| astral-nexus normal: Convergence Elemental / Knight | 469 | heavy | 15.8 | 14.4 |
| astral-nexus normal: Convergence Elemental / Knight | 469 | starved | 15.6 | 13.8 |
| astral-nexus normal: Convergence Elemental / Rogue | 469 | varied | 12.0 | 11.3 |
| astral-nexus normal: Convergence Elemental / Rogue | 469 | heavy | 14.4 | 12.4 |
| astral-nexus normal: Convergence Elemental / Rogue | 469 | starved | 13.9 | 11.3 |
| astral-nexus normal: Convergence Elemental / Berserker | 469 | varied | 11.7 | 11.5 |
| astral-nexus normal: Convergence Elemental / Berserker | 469 | heavy | 13.8 | 12.9 |
| astral-nexus normal: Convergence Elemental / Berserker | 469 | starved | 12.9 | 11.7 |
| astral-nexus normal: Convergence Elemental / Lancer | 469 | varied | 12.1 | 11.8 |
| astral-nexus normal: Convergence Elemental / Lancer | 469 | heavy | 14.6 | 13.7 |
| astral-nexus normal: Convergence Elemental / Lancer | 469 | starved | 14.3 | 12.9 |
| astral-nexus normal: Convergence Elemental / Vanguard | 469 | varied | 11.7 | 11.5 |
| astral-nexus normal: Convergence Elemental / Vanguard | 469 | heavy | 13.6 | 12.8 |
| astral-nexus normal: Convergence Elemental / Vanguard | 469 | starved | 12.9 | 11.7 |
| astral-nexus normal: Convergence Elemental / Ranger | 469 | varied | 11.9 | 11.4 |
| astral-nexus normal: Convergence Elemental / Ranger | 469 | heavy | 14.0 | 12.7 |
| astral-nexus normal: Convergence Elemental / Ranger | 469 | starved | 13.3 | 11.7 |
| astral-nexus boss: Sixfold Tideheart / Knight | 624 | varied | 15.9 | 15.3 |
| astral-nexus boss: Sixfold Tideheart / Knight | 624 | heavy | 20.9 | 19.0 |
| astral-nexus boss: Sixfold Tideheart / Knight | 624 | starved | 20.8 | 18.1 |
| astral-nexus boss: Sixfold Tideheart / Rogue | 624 | varied | 15.3 | 14.8 |
| astral-nexus boss: Sixfold Tideheart / Rogue | 624 | heavy | 19.2 | 16.5 |
| astral-nexus boss: Sixfold Tideheart / Rogue | 624 | starved | 18.4 | 15.0 |
| astral-nexus boss: Sixfold Tideheart / Berserker | 624 | varied | 15.3 | 14.8 |
| astral-nexus boss: Sixfold Tideheart / Berserker | 624 | heavy | 18.2 | 17.0 |
| astral-nexus boss: Sixfold Tideheart / Berserker | 624 | starved | 17.3 | 15.7 |
| astral-nexus boss: Sixfold Tideheart / Lancer | 624 | varied | 15.5 | 15.2 |
| astral-nexus boss: Sixfold Tideheart / Lancer | 624 | heavy | 19.5 | 18.1 |
| astral-nexus boss: Sixfold Tideheart / Lancer | 624 | starved | 18.9 | 16.8 |
| astral-nexus boss: Sixfold Tideheart / Vanguard | 624 | varied | 15.1 | 14.9 |
| astral-nexus boss: Sixfold Tideheart / Vanguard | 624 | heavy | 18.0 | 17.0 |
| astral-nexus boss: Sixfold Tideheart / Vanguard | 624 | starved | 16.6 | 15.6 |
| astral-nexus boss: Sixfold Tideheart / Ranger | 624 | varied | 15.1 | 14.9 |
| astral-nexus boss: Sixfold Tideheart / Ranger | 624 | heavy | 18.7 | 16.9 |
| astral-nexus boss: Sixfold Tideheart / Ranger | 624 | starved | 17.7 | 15.3 |

## Economy and interpretation

Class Change costs 50,000 Candies, 2.5 times one 20,000-Candy weapon and about 42% of all six weapons combined (120,000). It is a substantial repeatable late-game sink. This audit does not model Candy earnings, so it cannot establish how quickly repeated swaps become affordable.

All six classes improve matching attacks. Worldbreaker and Titan Vanguard have the highest damage potential while Knight and Lancer trade some damage for defense or anti-Protection utility. The fixed class tables do not suggest a clearly useless class. Spell-heavy rotations remain faster in this damage model; no class or spell values were rebalanced.
