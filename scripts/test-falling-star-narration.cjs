// Offline content and in-memory KV only; the fixture forbids network access.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const spell = require('../data/spells/falling-star.json');
const plain = value => JSON.parse(JSON.stringify(value));
const primary = spell.narrationPools.flatMap(pool => pool.lines);
const allNarration = [...primary, ...spell.naturalTwentyFlavor, spell.highPowerNaturalOneFlavor];
function checkNarration(message, outcome, powerTier) {
  const found = allNarration.filter(line => message.includes(line));
  assert.equal(found.length, 1, message);
  assert.equal(message.split(found[0]).length - 1, 1);
  const allowed = spell.narrationPools.find(pool => pool.outcome === outcome && pool.powerTier === powerTier).lines;
  assert([...allowed, ...(outcome === 'critical' ? spell.naturalTwentyFlavor : []),
    ...(outcome === 'miss' && powerTier === 'high' ? [spell.highPowerNaturalOneFlavor] : [])].includes(found[0]));
}
async function main() {
  // Every power tier, all accuracy boundaries, forced misses despite modifiers,
  // and both sides of the rare-flavor probability on both platforms.
  for (const platform of ['discord', 'twitch']) {
    const f = await fixture(20, platform);
    for (const dice of [[1, 1, 1], [7, 9, 1], [10, 10, 10]]) {
      for (const [natural, final, outcome] of [[1, 1, 'miss'], [1, 30, 'miss'], [2, 2, 'glancing'],
        [9, 9, 'glancing'], [10, 10, 'direct'], [19, 19, 'direct'], [19, 20, 'critical'], [20, 27, 'critical']]) {
        for (const chance of [0, 0.99]) {
          f.math.random = () => chance;
          f.rolls.push(...dice, natural);
          const roll = f.c.rollSpellDamage(spell);
          assert.deepEqual(plain(roll.powerRolls), dice);
          assert.equal(roll.accuracyRoll, natural);
          const power = dice.reduce((sum, n) => sum + n, 0);
          const result = f.c.resolveSpellRoll(spell, roll, final);
          assert.equal(result.outcome, outcome);
          assert.equal(result.isCritical, outcome === 'critical');
          assert.equal(result.damage, outcome === 'miss' ? 0 : outcome === 'glancing' ? Math.max(1, power - 5) : power + (outcome === 'critical' ? 27 : 0));
          const message = f.c.formatSpellCastMessage(spell, result, { modifierDetails: [] }, platform);
          checkNarration(message, outcome, power <= 10 ? 'low' : power <= 18 ? 'medium' : 'high');
          assert(message.includes(`Power ${power} (${dice.join('+')})`));
        }
      }
    }
    // Every approved regular and rare line remains reachable, verbatim.
    for (const pool of spell.narrationPools) {
      for (let index = 0; index < pool.lines.length; index++) {
        f.math.random = () => 0.99;
        f.rolls.push(index);
        const message = f.c.formatFallingStarCastMessage(spell, {
          powerTotal: { low: 3, medium: 17, high: 30 }[pool.powerTier], powerRolls: [1, 1, 1],
          accuracyRoll: pool.outcome === 'miss' ? 1 : 10, finalTotal: 20, outcome: pool.outcome, damage: 0,
        }, { modifierDetails: [] }, platform);
        assert(message.includes(pool.lines[index]));
        checkNarration(message, pool.outcome, pool.powerTier);
      }
    }
    for (let index = 0; index < spell.naturalTwentyFlavor.length; index++) {
      f.math.random = () => 0;
      f.rolls.push(index, 0);
      const message = f.c.formatFallingStarCastMessage(spell, {
        powerTotal: 17, powerRolls: [7, 9, 1], accuracyRoll: 20, finalTotal: 27, outcome: 'critical', damage: 53,
      }, { modifierDetails: [{ name: 'Fae Affinity', value: 5 }, { name: 'Astral Rebound', value: 2 }] }, platform);
      assert(message.includes(spell.naturalTwentyFlavor[index]));
      assert(message.includes('Power 17 (7+9+1) | Accuracy 27 (20+5 Fae+2 Astral Rebound) → Critical Hit | 53 dmg'));
      checkNarration(message, 'critical', 'medium');
    }
  }
  // Differential full-combat check against the original additive formatter.
  // Only narration may differ: all random draws, saved data, action fields,
  // modifiers, numerical output, HUD, and victory behavior must match exactly.
  for (const platform of ['discord', 'twitch']) {
    for (const natural of [1, 9, 20]) {
      for (const victory of [false, true]) {
        const results = [];
        for (const legacy of [false, true]) {
          const f = await fixture(21, platform);
          vm.runInContext('Date.now = () => 1800000000000', f.c);
          f.math.random = () => 0;
          if (legacy) {
            const current = f.c.formatFallingStarCastMessage.toString();
            assert(current.includes('rareFlavor || narration,'));
            vm.runInContext(current.replace('rareFlavor || narration,', 'narration, ...(rareFlavor ? [rareFlavor] : []),'), f.c);
          }
          const blessing = await f.c.getSpellDefinition('elf_blessing');
          await f.editProgress(p => {
            p.stats.fae = 5; p.stats.strength = 9;
            p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing));
          });
          await f.editState(s => {
            s.astralRebound = { offensiveRollModifier: 2 };
            s.astralCuriosity = { offensiveRollModifier: 1 };
            s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: true };
            s.astralEcho = { naturalRoll: 4, tierId: 'perfect', displayName: 'Perfect Echo', damagePercent: 0.5 };
            if (victory) s.enemy.hp = 1;
          });
          let action;
          const resolve = f.c.resolvePlayerCombatAction;
          f.c.resolvePlayerCombatAction = (...args) => { action = plain(args[3]); return resolve(...args); };
          f.rolls.push(10, 10, 10, natural);
          const response = await f.cast('falling-star');
          if (!legacy) checkNarration(response.message, natural === 1 ? 'miss' : 'critical', 'high');
          assert.equal(action.roll, natural + 11); // Fae +5, mastered Blessing +3, Rebound +2, Curiosity +1.
          assert.deepEqual(action.curiosityDice, [10, 10, 10]);
          assert.equal(action.damage, natural === 1 ? 0 : 76); // (30 + 27 + 9) * 1.15, rounded.
          assert.equal(action.echoDamage, natural === 1 ? 0 : 38);
          assert.equal(action.aftershockDamage, natural === 1 ? 0 : 5);
          const progress = await f.progress(); const state = await f.state();
          assert.equal(progress.mana, victory && natural !== 1 ? 100 : 95); // Charge discount, triple-Power Curiosity, then victory Harvest.
          if (state) {
            assert.equal(state.astralRebound, undefined);
            assert.equal(state.enemy.astralCharge, undefined);
            assert.equal(state.astralEcho, undefined);
          }
          const stripNarration = text => allNarration.reduce((s, line) =>
            s.replaceAll(line + '\n\n', '').replaceAll(line + ' | ', '').replaceAll(line, ''), text);
          action.message = stripNarration(action.message);
          action.victoryMessage = stripNarration(action.victoryMessage);
          // Remove timestamps only; each fixture starts independently.
          if (state) { delete state.startedAt; delete state.updatedAt; }
          results.push({ action, progress: plain(progress), state: plain(state), rng: f.randomCalls,
            output: stripNarration(response.message) });
        }
        assert.deepEqual(results[0], results[1]);
      }
    }
  }
  console.log('Falling Star narration, mechanics, RNG, HUD, and platform checks passed.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
