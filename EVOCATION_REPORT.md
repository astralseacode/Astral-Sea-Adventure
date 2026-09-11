# Evocation implementation

Created `data/spells/evocation.json`, `scripts/test-evocation.cjs`, and this report. Modified `worker.js` only. Existing content files are unchanged.

- Spell ID: `evocation`; aliases: `evo`, `evocate`. The resolver also accepts the ID itself, case-insensitively.
- Level 5, zero Mana, utility/Mana recovery. Added to the shared content loader, content validation, local Discord cast choices, both platforms' progression/help text, and cast discovery messages. Moonbeam remains Level 5 and Star Spark Mastery I remains Level 6. No existing reward moved. No Evocation Mastery implemented.
- Restoration uses `getPlayerResourceCaps(progress).mana`, the same current cap used by the combat HUD and existing Mana restoration effects. This includes Focus and an existing legitimate rest buffer; Evocation creates no buffer or additional capacity.
- `evocationCooldownTurns` is a normalized player-progress integer, defaulting to zero for old/new players. Successful Evocation stores seven. It persists through normal progress reads/writes, encounter replacement, victory, defeat, and subsequent encounters; it is not tied to elapsed time or encounter state.
- Each subsequent validated Attack or turn-consuming offensive cast (including casting Wake) decrements the counter once at the existing turn-start hook. A qualifying turn on which an already pending Wake wins also counts. Evocation skips decrementing on its own casting turn. After seven subsequent turns the counter is zero and casting is available again if Mana is below its cap.
- Information, invalid/unknown/empty cast requests, level/Mana rejection, duplicate Wake, Evocation rejection, and pre-action support do not decrement the counter. Leaving combat neither resets nor advances it. Evocation requires combat.
- Exactly full Mana takes rejection precedence, using the approved text verbatim. Otherwise a cooldown rejection reports remaining combat turns. Both reject before random flavor selection, resource changes, turn advancement, retaliation, or Wake advancement.
- Successful Evocation selects exactly one of the 26 approved lines and reports full Mana numerically. Both platforms retain the entire line. Direct comparison against the supplied request passed, including punctuation and capitalization. All four rejected lines are absent. A fixed digest protects the approved pool in the offline test.
- A zero-damage action enters `resolvePlayerCombatAction`, preserving the established enemy roll, Armor, Bubble/mastery, Sleepy Guard, HP loss, Fae Intervention, defeat, Resilience, and Mend pipeline. No attack roll, offensive modifier consumption, Charge/Echo consumption, Aftershock, or Momentum is attached to Evocation. Defensive effects may still trigger normally during retaliation.
- Evocation restores Mana and starts cooldown, then advances pending Wake once through the existing helper. If arrival kills the enemy, normal victory completes with the restoration/cooldown retained; the dead enemy does not retaliate. Otherwise the normal zero-damage action and enemy turn proceed. Full-Mana and cooldown rejections leave Wake unchanged.

## Offline verification

- Evocation suite passed: both platforms; level gates; 0/1/149 Mana; exact 150/200/current-buffer caps; full and cooldown rejection snapshots; no rejection randomness; seven-turn boundaries; repeated command spam and information; all 26 flavors reachable; aliases; modifiers; support; Bubble/Mend; Wake stages; offensive killing blows; encounter replacement; defeat; Wake victory; persistence.
- Existing Leviathan's Wake suite: 13 groups passed.
- Existing Jellyfish Mastery II/mastery/passive/combat suite: 12 groups passed.
- Existing development-level suite: passed.
- Expansion validator: passed; all 592 data JSON files parsed successfully.
- Native Node syntax checks: worker and all four test scripts passed.
- `git diff --check`: passed.
- Existing data preservation: no changes to any tracked data file.
- Historical `validate-narrative-formatting.cjs`: incompatible with feature additions. It stops because Evocation did not exist in its fixed pre-cleanup baseline; it also explicitly requires the entire worker to differ from that baseline only by two reviewed compound-word edits. Left this historical validator unchanged instead of weakening its assertions. Its failure is not reported as a passing check.

Node was available through the bundled local runtime rather than PATH. Tests used disk content and in-memory KV with network disabled. No deployment, commit, push, remote command registration, or live player/KV mutation was performed.
