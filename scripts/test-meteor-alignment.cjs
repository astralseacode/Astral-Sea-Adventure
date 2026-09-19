// Run: node scripts/test-meteor-alignment.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = "lvl 41 Mastery ☄️ Meteor Alignment: Falling Star's Power dice can form a Meteor Alignment. If two Power dice match, add +10 Power. If all three Power dice match, add +20 Power instead. If the three Power dice total exactly 7, add +15 Power.";

async function star(f, dice, accuracy) {
  f.rolls.push(...dice, accuracy, 1);
  return f.cast('falling star');
}

(async () => {
  const f = await fixture(41);
  const mastery = (await f.c.getActiveMasteries(41))
    .find(entry => entry.id === 'falling-star-mastery-1');
  assert(mastery);
  assert.equal(mastery.levelUpLine, unlock);
  assert.equal((await f.c.formatLevelUpUnlocks(40, 41)).join('\n'), unlock);
  assert(!(await f.c.getActiveMasteries(40)).some(entry =>
    entry.id === 'falling-star-mastery-1'));
  const spell = await f.c.getSpellDefinition('falling-star');

  for (const [dice, adjusted, label, glance, direct, critical] of [
    [[1, 3, 5], 9, null, 4, 9, 36],
    [[2, 2, 6], 20, 'Matching pair +10 Power', 15, 20, 47],
    [[4, 4, 4], 32, 'Triples +20 Power', 27, 32, 59],
    [[1, 2, 4], 22, 'Total of 7 +15 Power', 17, 22, 49],
    [[2, 2, 3], 32, 'Matching pair +10 Power | Total of 7 +15 Power', 27, 32, 59],
  ]) {
    for (const [accuracy, final, damage] of [
      [2, 2, glance], [10, 10, direct], [20, 20, critical],
    ]) {
      f.rolls.push(...dice, accuracy);
      const natural = f.c.rollSpellDamage(spell);
      const result = f.c.resolveSpellRoll(spell, natural, final, null, 0, mastery);
      assert.equal(result.powerTotal, dice.reduce((a, b) => a + b, 0));
      assert.equal(result.adjustedPower, adjusted);
      assert.equal(result.damage, damage);
      const message = f.c.formatSpellCastMessage(spell, result,
        { modifierDetails: [] }, 'discord');
      assert.equal(message.includes('Meteor Alignment:'), Boolean(label));
      if (label) assert(message.includes(label));
      assert(message.includes(`Power ${natural.powerTotal} (${dice.join('+')})`));
    }
  }

  f.rolls.push(2, 2, 3, 1);
  const forcedMiss = f.c.resolveSpellRoll(spell,
    f.c.rollSpellDamage(spell), 30, null, 0, mastery);
  assert.equal(forcedMiss.outcome, 'miss');
  assert.equal(forcedMiss.damage, 0);
  assert.equal(forcedMiss.adjustedPower, 32);

  const old = await fixture(40);
  const oldCast = await star(old, [2, 2, 3], 10);
  assert(!oldCast.message.includes('Meteor Alignment:'));
  assert.match(oldCast.message, /Power 7 \(2\+2\+3\)/);
  assert.equal((await old.state()).enemy.hp, 993);

  const active = await fixture(41);
  await active.editProgress(p => { p.stats.strength = 4; });
  const cast = await star(active, [2, 2, 3], 10);
  assert.match(cast.message, /Meteor Alignment: Matching pair \+10 Power\nTotal of 7 \+15 Power\nAdjusted Power 32/);
  assert.match(cast.message, /Power 7 \(2\+2\+3\)\nAccuracy 10/);
  assert.match(cast.message, /36 dmg/);
  assert.equal((await active.state()).enemy.hp, 964);

  const accuracyBonus = await fixture(41);
  await accuracyBonus.editProgress(p => { p.stats.fae = 1; });
  const modified = await star(accuracyBonus, [2, 2, 6], 19);
  assert.match(modified.message, /Power 10 \(2\+2\+6\)/);
  assert.match(modified.message, /Accuracy 20 \(19\+1 Fae\)/);
  assert.match(modified.message, /47 dmg/);

  const tidal = await fixture(41);
  tidal.rolls.push(12, 2, 1, 1);
  const wave = await tidal.cast('tidal');
  assert.match(wave.message, /Surging Tide → 50 base dmg/);
  assert(!wave.message.includes('Meteor Alignment:'));

  console.log('Meteor Alignment regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
