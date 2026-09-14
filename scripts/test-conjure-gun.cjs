// Run: node scripts/test-conjure-gun.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = 'lvl 45 Spell 🔫 Conjure Gun: Cast Conjure Gun for 35 Mana. Conjure an Astral gun and rapidly fire 20 shots. Roll 20d10, with each die dealing damage equal to its roll. Natural 10s are Critical Hits and deal 11 damage instead. Add the damage of all 20 shots together, then add Strength to determine the final damage.';
const example = [2, 8, 7, 1, 10, 6, 3, 9, 4, 8, 10, 5, 7, 7, 2, 9, 6, 3, 8, 10];
const ones = Array(20).fill(1);
async function gun(f, dice = ones, alias = 'gun') {
  f.rolls.push(...dice, 1);
  return f.cast(alias);
}

(async () => {
  const locked = await fixture(44);
  const before = JSON.stringify(await locked.state());
  assert.match((await locked.cast('conjure gun')).message, /Reach Level 45/);
  assert.equal(JSON.stringify(await locked.state()), before);
  const f = await fixture(45);
  const spell = await f.c.getSpellDefinition('conjure-gun');
  assert.equal(spell.name, 'Conjure Gun');
  assert.equal(spell.manaCost, 35);
  assert.equal(spell.levelUpLine, unlock);
  assert.equal((await f.c.formatLevelUpUnlocks(44, 45)).join('\n'), unlock);
  assert.equal(spell.damage.dice, 20);
  assert.equal(spell.damage.sides, 10);
  assert.equal(spell.flavor.length, 15);
  assert.equal(spell.flavor[3],
    'An Astral gun flashes into your hands. You could carefully line up your shot, but you have twenty of them. Spray and pray!');
  assert.deepEqual(JSON.parse(JSON.stringify(spell.aliases)), ['conjure gun', 'gun']);
  assert(!JSON.stringify(spell).includes('Accuracy through quantity!'));
  assert(!spell.flavor.some(scene => /[\"“”]/.test(scene)));

  f.rolls.push(...example);
  const natural = f.c.rollSpellDamage(spell);
  assert.equal(natural.rolls.length, 20);
  assert.equal(natural.total, 125);
  assert.equal(natural.criticalShots, 3);
  const resolved = f.c.resolveSpellRoll(spell, natural, natural.total);
  assert.equal(resolved.baseDamage, 128);
  assert.equal(resolved.damage, 128);
  assert.equal(resolved.isCritical, false); // Critical shots are not spell-level criticals.
  const receipt = f.c.formatSpellCastMessage(spell, resolved,
    { modifierDetails: [] }, 'discord');
  assert(receipt.includes(`Shots: ${example.join(', ')}`));
  assert(receipt.includes('20 Hits!'));
  assert(receipt.includes('3 Critical Hits!'));
  assert(receipt.includes('Total Damage: 128'));
  assert(!/[🔫🌊🌌]/u.test(receipt));
  for (let index = 0; index < spell.flavor.length; index++) {
    f.rolls.push(index);
    const sceneReceipt = f.c.formatSpellCastMessage(spell, resolved,
      { modifierDetails: [] }, 'discord');
    assert(sceneReceipt.includes(spell.flavor[index]));
    assert.equal(spell.flavor.filter(scene => sceneReceipt.includes(scene)).length, 1);
  }

  const noCritical = await fixture(45);
  const zero = await gun(noCritical);
  assert.match(zero.message, /0 Critical Hits!/);
  assert.match(zero.message, /20 Hits!/);
  assert.equal((await noCritical.progress()).mana, 65);
  assert.equal((await noCritical.state()).enemy.hp, 980);

  const oneCritical = await fixture(45);
  const one = await gun(oneCritical, [10, ...Array(19).fill(1)]);
  assert.match(one.message, /1 Critical Hit!/);
  assert.equal((await oneCritical.state()).enemy.hp, 970);

  const allCritical = await fixture(45);
  const twenty = await gun(allCritical, Array(20).fill(10));
  assert.match(twenty.message, /20 Critical Hits!/);
  assert.match(twenty.message, /Base Damage: 220/);
  assert(!twenty.message.includes('Astral Aftershock activates!'));
  assert.equal((await allCritical.state()).enemy.hp, 780);

  const strong = await fixture(45);
  await strong.editProgress(p => { p.stats.strength = 7; });
  const strongCast = await gun(strong, example, 'conjure gun');
  assert.match(strongCast.message, /Base Damage: 128/);
  assert.match(strongCast.message, /Strength: \+7/);
  assert.match(strongCast.message, /Total Damage: 135/);
  assert.equal((await strong.state()).enemy.hp, 865);

  const poor = await fixture(45);
  await poor.editProgress(p => { p.mana = 34; });
  const poorState = JSON.stringify(await poor.state());
  assert.match((await poor.cast('gun')).message, /enough Mana/);
  assert.equal((await poor.progress()).mana, 34);
  assert.equal(JSON.stringify(await poor.state()), poorState);

  const chain = await fixture(45);
  await gun(chain);
  assert.equal((await chain.state()).risingPower.steps, 0);
  await chain.editProgress(p => { p.mana = 100; });
  chain.rolls.push(12, 2, 1, 1);
  const different = await chain.cast('tidal');
  assert.match(different.message, /Rising Power: \+2 damage/);
  assert.match(different.message, /Astral Rhythm Applied! \+5 damage/);
  await chain.editProgress(p => { p.mana = 100; });
  assert.match((await gun(chain)).message, /Rising Power: \+4 damage/);
  await chain.editProgress(p => { p.mana = 100; });
  assert.match((await gun(chain)).message, /Rising Power resets\./);

  const echoed = await fixture(45);
  await echoed.editState(s => { s.astralEcho = {
    naturalRoll: 1, tierId: 'faint', displayName: 'Faint', damagePercent: 0.5,
  }; });
  assert.match((await gun(echoed)).message, /Astral Echo/);
  assert.equal((await echoed.state()).enemy.hp, 970); // 20 barrage + one 10 Echo.

  const harmony = await fixture(45);
  await harmony.editProgress(p => { p.stats.fae = 1; });
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  assert.match((await gun(harmony)).message, /Astral Harmony\nRestored 15 Mana/);
  assert.equal((await harmony.state()).perkUses['astral-harmony'], 1);

  const charged = await fixture(45);
  await charged.editState(s => { s.enemy.astralCharge = {
    manaReduction: 0.5, damageIncrease: 0.15,
    remainingDamageUses: 1, manaDiscountAvailable: true,
  }; });
  const chargedCast = await gun(charged);
  assert.match(chargedCast.message, /Astral Charge bursts!/);
  assert.match(chargedCast.message, /Total Damage: 23/);
  assert.equal((await charged.progress()).mana, 82);
  assert.equal((await charged.state()).enemy.hp, 957); // 23 barrage + one 20 detonation.

  const familiar = await fixture(45);
  familiar.rolls.push(1, 1, 0);
  await familiar.cast('familiar');
  await gun(familiar);
  assert.equal((await familiar.state()).familiar.actions, 1);

  const bond = await fixture(45);
  bond.rolls.push(1, 1, 0);
  await bond.cast('familiar');
  await bond.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  const armingCast = await gun(bond);
  assert.match(armingCast.message, /Astral Bond: Your Familiar's next assistance is empowered!/);
  assert.equal((await bond.state()).familiar.actions, 1);
  assert.equal((await bond.state()).familiar.astralBond, 'armed');
  await bond.editProgress(p => { p.mana = 100; });
  const empoweredCast = await gun(bond);
  assert.match(empoweredCast.message, /Astral Bond empowers your Familiar!/);
  assert.equal((await bond.state()).familiar.actions, 2);
  assert.equal((await bond.state()).familiar.astralBond, 'spent');

  const expedition = await fixture(45);
  const count = (await expedition.progress()).astralExpeditionRolls;
  await gun(expedition);
  assert.equal((await expedition.progress()).astralExpeditionRolls, count + 1);

  const victory = await fixture(45);
  await victory.editState(s => { s.enemy.hp = 20; });
  await gun(victory);
  assert.equal(await victory.state(), null);

  const twitch = await fixture(45, 'twitch');
  assert.match((await gun(twitch, example, 'conjure gun')).message,
    /Shots: 2, 8, 7, 1, 10/);

  console.log('Conjure Gun regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
