# Weapon balance audit

## Exact attack table expectations

Computed by enumerating all 20 rolls, or all 400 ordered pairs for Daggers and Bow. Damage includes Strength once on a successful attack.

| Weapon | Strength 0 | Strength +5 | Strength +9 | Miss | Other utility |
| --- | ---: | ---: | ---: | ---: | --- |
| Sword and Shield | 22.25 | 27.00 | 30.80 | 5.00% | 7.5 Protection per attack on average |
| Daggers | 26.10 | 31.09 | 35.08 | 0.25% | Two independent hits, one action |
| Axe | 31.00 | 34.75 | 37.75 | 25.00% | 25% natural miss range |
| Spear | 25.75 | 30.50 | 34.30 | 5.00% | Pierces up to 10 enemy Protection on a hit |
| Hammer | 31.00 | 35.25 | 38.65 | 15.00% | 1.75 pending Stagger reduction per attack on average |
| Bow | 27.46 | 32.45 | 36.44 | 0.25% | Higher of two natural rolls |

At +9 Strength, default /attack was previously estimated at about 21.3 expected damage. The earlier audit targets for Moonbeam, Tidal Wave, and Conjure Gun were about 30, 61.5, and 79 respectively. Weapon expectations are higher than default /attack and lower than the two stronger spells. These comparisons use the prior published estimates, not a new spell rebalance.

## Seeded representative damage scenarios

Seed: 20260919. Each cell below is mean player actions over 200 trials. The examples use median-HP normal and boss definitions from each region. Strength is +9. Sunken King’s Throne grants one 20 Protection shield below 25% HP, matching the regional perk threshold; Spear uses its piercing rule. Spell actions use the prior approximate damage figures, so these are directional damage comparisons. They do not simulate Mana costs, enemy turns, survival, spell rolls, Familiar, or all regional effects.

| Region / enemy | HP | Rotation | No weapon* | Sword | Daggers | Axe | Spear | Hammer | Bow |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| sunken-kings-throne normal: Regal Fang Moray | 389 | spell-heavy | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 |
| sunken-kings-throne normal: Regal Fang Moray | 389 | varied | 12.0 | 10.9 | 10.5 | 10.3 | 10.4 | 10.3 | 10.3 |
| sunken-kings-throne normal: Regal Fang Moray | 389 | weapon-heavy | 18.0 | 13.9 | 12.7 | 12.3 | 12.7 | 11.9 | 12.4 |
| sunken-kings-throne normal: Regal Fang Moray | 389 | resource-starved | 20.0 | 13.9 | 12.2 | 11.5 | 12.1 | 11.2 | 11.7 |
| sunken-kings-throne boss: Crown Fang Moray | 524 | spell-heavy | 10.0 | 10.0 | 10.0 | 10.0 | 10.0 | 10.0 | 10.0 |
| sunken-kings-throne boss: Crown Fang Moray | 524 | varied | 15.0 | 14.3 | 13.7 | 13.6 | 13.6 | 13.2 | 13.6 |
| sunken-kings-throne boss: Crown Fang Moray | 524 | weapon-heavy | 23.0 | 18.5 | 16.8 | 16.4 | 16.7 | 15.5 | 16.3 |
| sunken-kings-throne boss: Crown Fang Moray | 524 | resource-starved | 26.0 | 18.1 | 16.0 | 15.3 | 16.0 | 14.7 | 15.3 |
| astral-nexus normal: Convergence Elemental | 469 | spell-heavy | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 | 9.0 |
| astral-nexus normal: Convergence Elemental | 469 | varied | 13.0 | 12.2 | 12.0 | 11.6 | 12.0 | 11.6 | 11.9 |
| astral-nexus normal: Convergence Elemental | 469 | weapon-heavy | 20.0 | 15.9 | 14.5 | 14.2 | 14.7 | 13.6 | 14.0 |
| astral-nexus normal: Convergence Elemental | 469 | resource-starved | 23.0 | 15.7 | 13.9 | 13.2 | 14.4 | 12.7 | 13.4 |
| astral-nexus boss: Sixfold Tideheart | 624 | spell-heavy | 12.0 | 12.0 | 12.0 | 12.0 | 12.0 | 12.0 | 12.0 |
| astral-nexus boss: Sixfold Tideheart | 624 | varied | 18.0 | 16.0 | 15.3 | 15.3 | 15.4 | 15.2 | 15.1 |
| astral-nexus boss: Sixfold Tideheart | 624 | weapon-heavy | 27.0 | 20.9 | 19.2 | 18.3 | 19.4 | 17.6 | 18.7 |
| astral-nexus boss: Sixfold Tideheart | 624 | resource-starved | 30.0 | 20.6 | 18.3 | 17.1 | 18.7 | 16.6 | 17.5 |

*The no-weapon column is a coarse expected-damage baseline for mixed rotations; the weapon columns use seeded natural rolls. In spell-heavy rows, all columns are the same rotation.

## Findings and limits

- Hammer has the highest raw expected damage at +9 Strength (38.65); Axe is close (37.75) but misses 25% of the time. Both remain below the cited Tidal Wave and Conjure Gun estimates.
- Daggers and Bow almost never miss (0.25%). Bow has slightly higher expected damage; Daggers keep the two-hit identity while counting as one player action.
- Sword and Shield has the lowest weapon damage but adds Protection. Spear is modest against unshielded enemies and gains its intended role against Throne Protection.
- No approved weapon table was rebalanced. The seeded model is not a complete combat simulation and cannot establish survival or Mana-efficiency rankings. No weapon is clearly useless or dominant from raw damage alone.
- Weapon tiers use natural dice results. Existing basic-attack roll status effects still trigger once, but their numerical roll modifiers do not move the weapon’s natural damage or miss bracket. The default unarmed /attack keeps its original modifier behavior.
