# Stim implementation report

## Files

- Modified `worker.js`: approved Stim flavor pool, base use limit, local Discord command definition, Discord/Twitch routes, Level 1 help entry, combat action, encounter initialization, and optional combat-state validation.
- Created `scripts/test-stim.cjs`: 13 focused offline test groups using the existing local-content/in-memory-KV fixture.
- Created `STIM_REPORT.md`: this report.
- No existing content JSON, spell, mastery, or perk definition was modified.

## Behavior and persistence

Stim is available from Level 1 as `/stim` and `!stim`, with no arguments. It is a standalone command, not a spell, inventory item, purchase, or consumable. Existing progression, including Elf Blessing, is unchanged.

The encounter's `stimUses` field records successful uses. `STIM_USES_PER_BATTLE` is exactly 1. Both `startAdventureBattle` and `startCombatEncounter` initialize the count to zero. Older saved encounters without the field treat it as zero. The field is validated as an integer from zero through the base limit and saved with the existing combat record. No use counter is stored in player progress or Adventure state. The numeric count accommodates a future design change without implementing any mastery or extra use now.

Normal victory, defeat, and encounter cleanup delete the combat record. The next battle starts with zero uses, including subsequent enemies in the same Adventure and defeat retries. Information, Adventure resume, invalid requests, and repeated Stim commands do not reset the count. The existing player mutation lock serializes simultaneous attempts so only one succeeds.

Stim reads current HP from combat state and computes the current maximum with `getPlayerResourceCaps(progress).hp`, the same helper used by Berry and encounter creation. This includes Vitality and any existing legitimate rest buffer. Stim creates neither a buffer nor overheal. It updates combat HP, combat maximum HP, and persisted player HP to that cap before normal enemy resolution. The message explicitly reports the full restoration; the normal final HUD reflects any subsequent enemy damage and defensive healing.

Malformed requests, use outside combat, already-used Stim, and exactly full HP reject before success flavor selection, HP changes, action consumption, retaliation, or turn advancement. Already-used rejection takes precedence when the player is both full and has already spent the battle's use. A player one HP below the current cap can use Stim. No Mana, Berry, Star Candy, or offensive modifier is spent.

Successful Stim calls the existing `advanceLeviathansWake` turn-start hook. Pending Wake advances one stage and an active Evocation cooldown decreases by one combat turn. Neither system advances on rejected Stim. Stim and Evocation have separate state; casting Evocation does not spend or refresh Stim. If Wake arrival wins during Stim, the full heal and cooldown decrement are preserved, victory uses the existing cleanup, and the defeated enemy does not retaliate.

Otherwise Stim passes a zero-damage action with no offensive roll/modifier fields to `resolvePlayerCombatAction`. The existing enemy roll and Armor, Bubble/Mastery, Sleepy Guard, HP loss, Fae Intervention, defeat, Resilience, and Mend pipeline runs unchanged. Stim does not consume offensive Blessing, Charge, Echo, Rebound, Curiosity, or Jellyfish Resolve, and does not trigger Aftershock or Momentum. Existing defensive and survival effects can still activate normally after Stim.

Exactly 21 approved successful lines were copied verbatim and directly compared to the supplied request. Tests protect their exact content with a SHA-256 digest and exercise every line on both platforms without shortening Twitch text. No successful or unrelated flavor was rewritten or added. Rejection messages are separate from the successful pool. No Stim Mastery, hidden second use, reserved progression level, or healing rebalance was implemented. Berry remains repeatable +25 HP/+25 Mana; Mend, Bubble, Fae Intervention, and Astral Resilience mechanics are unchanged.

## Verification

- Stim: all 13 test groups passed, covering exact dynamic caps, one-HP deficit, level-one use, no costs or player dice, all flavors and parity, command routing/discovery, full/used/invalid rejection snapshots, command spam, simultaneous attempts, old-state compatibility, modifier preservation, defenses, Fae survival, Berry behavior, Wake stages, Evocation turn counting, victory/defeat/new-encounter reset, actual Adventure resume/room transitions/retries, and rollback after simulated resolution failure.
- Existing Evocation tests: passed.
- Existing Falling Star narration/mechanics tests: passed.
- Existing Leviathan's Wake tests: all 13 groups passed.
- Existing Jellyfish Mastery II/mastery/passive tests: all 12 groups passed.
- Existing development-command tests: passed.
- Expansion validator: passed, including 180 Adventures, 180 normal enemies, and 180 bosses.
- JSON validation: all 592 data JSON files passed.
- JavaScript syntax: all 10 `.js`/`.cjs` files passed native Node `--check`.
- `git diff --check`: passed.

All work and tests were local. Tests used in-memory KV and prohibited network access. Nothing was deployed, committed, pushed, remotely registered, or written to live player/KV data.
