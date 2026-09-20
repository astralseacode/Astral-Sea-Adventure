# Boss phase A/B audit with four Adventure Berries

## Summary

This follow-up repeated the **same 72 configurations and 100 deterministic seeds per configuration** as the zero-Berry audit: **7,200 matched OFF/ON pairs, 14,400 real-runtime battles**. Each battle began with four inventory Berries and an active Adventure at **0/4 Berry uses**, representing a player reaching that boss with all four uses still available. Both arms kept the same boss, level, stats, class, weapon, strategy, initial state, and RNG seed. OFF suppressed only the new boss phase package; normal regional perks stayed active. The original zero-Berry results were loaded for comparison and were not rerun or overwritten.

Four Berries improved survival substantially in many configurations. Starfall Level 10 improved from **25.5%→65.5% OFF** and **23.2%→63.7% ON**, while the new phase delta remained modest at **−1.8 percentage points**. Starfall Level 5 remained difficult: 0%/0% without Berries and 1.0%/0.8% with them. Kelp Level 20 rose from 2.7%/2.0% to 51.2%/42.2%; longer survival also exposed players to more Kelp Recovery, widening its measured phase delta to −9.0 points. There were **zero 80-command action caps**. These are deterministic policy outcomes, **not human player win rates**.

## Exact method and Berry policy

The simulation uses the existing `dist/worker.js` in isolated VMs with in-memory KV. It calls the canonical `performEat` path used by `/eat berry`. There is no simulated healing shortcut. For every successful use the harness checks the returned HP/Mana amounts against saved state, decremented inventory, Adventure `berriesEaten`, the four-use cap, and unchanged combat round. The actual runtime enforces 25 HP and 25 Mana maximum recovery, resource caps, no use when both resources are full, no combat-turn consumption, and the Adventure limit. Berry Mana recovery also runs the real regional recovery hooks, including Deepwater Hunger and Mana Fracture.

The player uses the prior audit's Stim rule first when HP is at or below the greater of 40 HP and 35% maximum HP. This avoids spending a Berry solely for HP immediately before a full-heal Stim. Otherwise, before selecting the normal action, the policy may eat one Berry when:

1. HP is at or below 50% maximum and at least 15 HP is missing;
2. the intended level-available spell is unaffordable, +25 Mana would make it affordable, and at least 15 Mana is missing; or
3. both HP and Mana are missing at least 20.

The policy labels a use **both** when both resources are at least 20 below their caps; otherwise it labels the affordability trigger **Mana** or the low-HP trigger **HP**. It never reads future rolls or hidden state. It uses no more than four successful Berries. After a non-turn-consuming Berry, the normal strategy proceeds with the updated resources. Stim, Evocation, and support choices otherwise follow the original audit. The **80-command cap counts normal/turn actions, not Berry uses**.

The previous and new output have identical 72 configuration keys and seed keys; all **7,200 OFF/ON pairs** and all **14,400 zero-versus-four comparison rows** matched. RNG streams start identically within each pair; different fight paths can consume different later draws. Classless levels remain 1/5, six class families are included from Level 10, and the same lower/median/higher authored bosses and stratified strategy assignments are used. See `BOSS_PHASE_AB_BALANCE_AUDIT.md` for the boss roster, stat allocation, and strategy details.

## Berry use and actual recovery

Across **14,400 battles**, players consumed **53,898 Berries**: mean **3.743**, median **4** per battle. Distribution by battle: **0: 133; 1: 389; 2: 626; 3: 751; 4: 12,501**. Of the all-four battles, **5,874 won** and **6,627 died**. Mean Berries remaining from the *initial four* were **0.474 on wins** and **0.004 on deaths**; post-victory loot is excluded from this remaining-use measure.

The real runtime restored **1,338,556 HP** and **845,918 Mana** after capping. Potential recovery not obtained was **8,894 HP** and **501,532 Mana** (25 minus actual restoration per consumed Berry). Classification of uses: **20,497 HP-triggered**, **0 Mana-only**, **33,401 both-resource**. Mana-only was zero because affordability events in this sample also had at least 20 missing HP; the policy therefore classified them as both. High Mana waste mainly reflects Berries that were valuable for HP while Mana was close to its cap.

## Zero versus four Berries: win rates and phase deltas

Every cell uses 600 matched seeds per region/level and phase state. Improvements are four-Berry minus zero-Berry win rate; phase delta is ON minus OFF, in percentage points.

| Region | Level | 0 Berry OFF | 0 Berry ON | 4 Berry OFF | 4 Berry ON | Berry gain OFF | Berry gain ON | Phase delta 0→4 Berries |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Moonlit Reef | 1 | 49.2% | 45.2% | 90.2% | 86.7% | +41.0 pp | +41.5 pp | −4.0→−3.5 pp |
| Moonlit Reef | 5 | 78.0% | 72.0% | 99.5% | 99.3% | +21.5 pp | +27.3 pp | −6.0→−0.2 pp |
| Starfall Trench | 5 | 0.0% | 0.0% | 1.0% | 0.8% | +1.0 pp | +0.8 pp | 0.0→−0.2 pp |
| Starfall Trench | 10 | 25.5% | 23.2% | 65.5% | 63.7% | +40.0 pp | +40.5 pp | −2.3→−1.8 pp |
| Whispering Kelp Forest | 10 | 0.7% | 0.3% | 10.7% | 7.2% | +10.0 pp | +6.9 pp | −0.4→−3.5 pp |
| Whispering Kelp Forest | 20 | 2.7% | 2.0% | 51.2% | 42.2% | +48.5 pp | +40.2 pp | −0.7→−9.0 pp |
| Leviathan's Wake | 20 | 0.5% | 0.3% | 18.5% | 11.2% | +18.0 pp | +10.9 pp | −0.2→−7.3 pp |
| Leviathan's Wake | 30 | 43.0% | 37.7% | 70.2% | 63.5% | +27.2 pp | +25.8 pp | −5.3→−6.7 pp |
| Sunken King's Throne | 30 | 28.8% | 26.8% | 55.5% | 52.5% | +26.7 pp | +25.7 pp | −2.0→−3.0 pp |
| Sunken King's Throne | 40 | 58.2% | 51.5% | 93.8% | 90.2% | +35.6 pp | +38.7 pp | −6.7→−3.6 pp |
| Astral Nexus | 40 | 1.7% | 1.0% | 19.3% | 13.5% | +17.6 pp | +12.5 pp | −0.7→−5.8 pp |
| Astral Nexus | 50 | 85.8% | 83.7% | 93.8% | 92.5% | +8.0 pp | +8.8 pp | −2.1→−1.3 pp |

Raw and aggregate JSON includes wins/losses, mean and median actions/responses, HP/Mana remaining on wins, Berry distribution and recovery, Stim/Evocation/Fae use, phase actions/reach, regional receipts, and cap outcomes per region, level, boss, class, and strategy. The comparison uses the preserved zero-Berry result file directly.

## Regional investigation

**Starfall priority.** At Level 5, all four Berries were consumed in every paired run. They restored **37,085/37,825 Mana OFF/ON**, yet wins were only **6/600 OFF and 5/600 ON**. Phase 3 appeared in 61/600 ON fights, versus none without Berries. Pressure drain rose to **10,370/21,620 Mana OFF/ON** because players survived longer and ON pressure was stronger. ON Level 5 had 35 zero-Mana actions, 11 low-Mana attack fallbacks, and 17 deaths at zero Mana, but **479 deaths with at least 50 Mana**. Four Berries did not resolve the entry-level baseline difficulty under these policies.

At Level 10, Berries restored **40,345/43,115 Mana OFF/ON**. ON pressure drained **32,845 Mana**, versus 18,645 in the zero-Berry ON audit; the longer battles exposed players to more triggers. ON zero-Mana actions were **106**, actions below 20 Mana **376**, low-Mana attack fallbacks **93**, and Evocations **321**. ON deaths numbered 25 at zero Mana and 116 with at least 50 Mana. Wins improved by about **40 points** in both arms, while the phase delta stayed modest at **−1.8 pp**. The additional drain remains noticeable without being the only cause of death in this sample.

**Kelp priority.** Level 10 ON boss healing rose from **11,346 without Berries to 19,450 HP** with Berries; Level 20 rose from **15,375 to 24,680 HP**. Berry-enabled ON fights averaged **13.77 actions** at Level 10 and **14.57** at Level 20, versus 10.19 and 11.38 without Berries. The longest was **21/22 actions** at Levels 10/20; **zero reached 80**. Extra player sustain let more Kelp Recovery occur and widened the Level 20 phase delta to −9.0 pp, but did not create a regeneration stalemate in this matrix.

**Moonlit Reef.** Entry ON wins rose 45.2%→86.7%, while the phase delta stayed near −4 pp. Mature ON wins reached 99.3%, a ceiling that hides phase effects. Nominal ON Gentle Current bonus rose from 10,550 to **13,354** at Level 1 with longer survival; at Level 5 it was **11,950** versus 11,495 without Berries. Stim use fell overall as Berry healing provided an earlier recovery cushion.

**Leviathan's Wake.** Level 20 ON wins rose 0.3%→11.2%, but the phase delta widened from −0.2 to **−7.3 pp** as more fights reached later phases (317/600 reached phase 3 with Berries, versus 24/600 without). Level 30 ON wins rose 37.7%→63.5%; phase delta was −6.7 pp. Nominal ON Crushing Wake bonus at Level 30 rose from 38,414 to **44,218** with longer fights. The Berry cushion did not erase the late-phase threat.

**Sunken King's Throne.** Level 30 ON wins rose 26.8%→52.5%, with a −3.0 pp phase delta. Level 40 ON wins rose 51.5%→90.2%, with a smaller −3.6 pp delta than the zero-Berry −6.7 pp. At Level 40, ON Royal Guard prevented **30,739** damage, King's Tax collected **10,141 Mana**, and Resolve granted **17,940 Protection**, all above zero-Berry ON totals because more turns/thresholds occurred. Berries improved survival despite continued layered mechanics.

**Astral Nexus.** Level 40 ON wins rose 1.0%→13.5%; its phase delta widened to **−5.8 pp** as Berry-supported fights reached the shell phases more often. ON Shell formations rose **668→1,260** versus zero-Berry ON. At Level 50, ON wins rose 83.7%→92.5% and the phase delta narrowed to −1.3 pp; Shell formations were 1,228 versus 1,171 without Berries. Fae Intervention activations across both arms fell from **247 to 116** as Berry healing reduced lethal-hit exposure. The policy did not intentionally repeat successful spells, so Reality Echo remained untested as a stress case.

## Stim, Evocation, caps, and limits

Across all 14,400 battles, Stim uses fell **14,065→11,971** and Evocation uses fell **4,127→2,537** relative to zero Berries. The exact policy checks Stim first at critical HP, then considers a Berry; it does not intentionally eat an HP-only Berry immediately before Stim. Berry Mana recovery can defer Evocation, while longer survival can create additional later opportunities; region-level totals are in the JSON. There were **zero action-cap events**. No simulated fight is labeled an ordinary loss because it hit the cap.

The four-Berry scenario is deliberately favorable: a real player may have spent some of the four Adventure uses before reaching a boss. Zero and four Berries represent low-consumable and full-recovery scenarios, **not exact statistical bounds** for real human play. The stratified matrix is not fully crossed by boss, class, and policy. RNG streams can diverge after combat outcomes diverge. Berry decisions use fixed visible thresholds rather than human judgment. The results do not justify a gameplay value change on their own.

## Validation and production safety

The harness asserts canonical per-use HP/Mana changes, inventory decrement, unchanged combat round, and Adventure use count no greater than four. Existing `test-eat-berry-adventure.cjs` separately verifies that a fifth Adventure Berry is rejected. The run verified the original configuration and seed keys, all **7,200 OFF/ON pairs**, 100 seeds per configuration, result JSON parsing, and zero caps. Berry, boss-phase, regional-perk, combat-receipt, Stim, Leviathan's Wake, and runtime-reliability tests passed. Audit syntax, deterministic build freshness, and `git diff --check` passed. The unrelated Evocation approved-text SHA failure remains; Evocation content was not edited.

Only `scripts/audit-boss-phases-ab-berries.cjs`, `boss-phase-ab-berry-results.json`, and this report were added for this audit. `worker.js` and `dist/worker.js` retained their pre-audit SHA-256 hashes (`015fe3b3494f227ba8f992984d5c353a20a238e7eec54c7933024e57ec9cfa0d` and `04a461bb603dc9411a1d376d21ceec3d9e1b71220d663610f41deadd7f71affe`). No gameplay or balance values changed. Nothing was deployed, committed, pushed, remotely registered, or written to live KV or Cloudflare.
