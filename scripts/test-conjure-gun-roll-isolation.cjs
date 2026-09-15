// Run: node scripts/test-conjure-gun-roll-isolation.cjs. In-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const shots = hits => [...Array(hits).fill(1), ...Array(140 - hits).fill(0)];
async function gun(f, dice) {
  f.rolls.push(...dice, 0);
  return f.cast('gun');
}
function assertNoRollLeak(message) {
  for (const forbidden of [
    'Fae Second Opinion', 'Curiosity activates!', 'Oddity', 'Aftershock',
    'Momentum', 'Perfect Jellyfish!', 'FULL MOON', 'Meteor Alignment',
    'Lunar Alignment', 'Sad Jellyfish', 'Sleepy Jellyfish',
    'Curious Jellyfish', 'Confident Jellyfish', 'Dedicated Jellyfish',
  ]) assert(!message.includes(forbidden), `Unexpected ${forbidden}`);
}

(async () => {
  const definitionFixture = await fixture(46);
  const spell = await definitionFixture.c.getSpellDefinition('conjure-gun');
  definitionFixture.rolls.push(...shots(75));
  const natural = definitionFixture.c.rollSpellDamage(spell);
  assert.equal(natural.rolls.length, 140);
  assert(natural.rolls.every(roll => roll === 0 || roll === 1));
  assert.equal(natural.total, 75);
  assert.equal(natural.naturalPatternDice, null);

  const realistic = await fixture(46);
  const startingExpedition = (await realistic.progress()).astralExpeditionRolls;
  const realisticResult = await gun(realistic, shots(75));
  assert.match(realisticResult.message, /140 Shots!/);
  assert.match(realisticResult.message, /75 Hits!/);
  assert.match(realisticResult.message, /65 Misses!/);
  assert.match(realisticResult.message, /Base Damage: 75/);
  assertNoRollLeak(realisticResult.message);
  let state = await realistic.state();
  assert.equal(state.faeSecondOpinion, undefined);
  assert.equal(state.astralCuriosity, undefined);
  assert.equal(state.perkUses?.['astral-curiosity'], undefined);
  assert.equal((await realistic.progress()).astralExpeditionRolls,
    startingExpedition + 1);

  const allOnes = await fixture(46);
  await allOnes.editProgress(p => { p.stats.strength = 7; });
  await allOnes.editState(s => {
    s.lunarPatience = { offensiveRollModifier: 1 };
    s.allOrNothingStreak = 3;
  });
  const onesResult = await gun(allOnes, shots(140));
  assert.match(onesResult.message, /Base Damage: 140/);
  assert.match(onesResult.message, /Strength: \+7/);
  assert.match(onesResult.message, /Total Damage: 147/);
  assertNoRollLeak(onesResult.message);
  state = await allOnes.state();
  assert.deepEqual(JSON.parse(JSON.stringify(state.lunarPatience)),
    { offensiveRollModifier: 1 });
  assert.equal(state.allOrNothingStreak, 3);
  assert.equal(state.faeSecondOpinion, undefined);
  assert.equal(state.astralCuriosity, undefined);
  assert.equal((await allOnes.progress()).mana, 65);

  const allZeroes = await fixture(46);
  const zeroExpedition = (await allZeroes.progress()).astralExpeditionRolls;
  const zeroResult = await gun(allZeroes, shots(0));
  assert.match(zeroResult.message, /0 Hits!/);
  assert.match(zeroResult.message, /140 Misses!/);
  assert.match(zeroResult.message, /Base Damage: 0/);
  assertNoRollLeak(zeroResult.message);
  state = await allZeroes.state();
  assert.equal(state.enemy.hp, 1000);
  assert.equal(state.faeSecondOpinion, undefined);
  assert.equal(state.astralCuriosity, undefined);
  assert.equal((await allZeroes.progress()).astralExpeditionRolls,
    zeroExpedition);

  const shared = await fixture(46);
  await shared.editProgress(p => { p.stats.strength = 5; });
  await shared.editState(s => {
    s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15,
      remainingDamageUses: 1, manaDiscountAvailable: true };
    s.astralEcho = { naturalRoll: 1, tierId: 'faint', displayName: 'Faint',
      damagePercent: 0.5 };
  });
  const sharedResult = await gun(shared, shots(70));
  assert.match(sharedResult.message, /Charge bursts!/);
  assert.match(sharedResult.message, /Echo activates!/);
  assertNoRollLeak(sharedResult.message);
  assert.equal((await shared.progress()).astralExpeditionRolls, 1);

  console.log('Conjure Gun roll-isolation regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
