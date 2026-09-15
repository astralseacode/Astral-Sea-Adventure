// Run: node scripts/test-conjure-gun.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = 'lvl 45 Spell 🔫 Conjure Gun: Cast Conjure Gun for 35 Mana. Conjure an Astral gun and rapidly fire 140 shots. Each shot rolls either 0 or 1. A 1 hits and deals 1 damage, while a 0 misses. Add all successful hits together, then add Strength to determine the final damage.';
const shots = hits => [...Array(hits).fill(1), ...Array(140 - hits).fill(0)];
async function gun(f, dice = shots(70), alias = 'gun') {
  f.rolls.push(...dice, 0);
  return f.cast(alias);
}

(async () => {
  const locked = await fixture(44);
  const before = JSON.stringify(await locked.state());
  assert.match((await locked.cast('conjure gun')).message, /Reach Level 45/);
  assert.equal(JSON.stringify(await locked.state()), before);
  const f = await fixture(45);
  const spell = await f.c.getSpellDefinition('conjure-gun');
  assert.equal(spell.manaCost, 35);
  assert.equal(spell.levelUpLine, unlock);
  assert.equal((await f.c.formatLevelUpUnlocks(44, 45)).join('\n'), unlock);
  assert.equal(spell.damage.dice, 140);
  assert.equal(spell.damage.min, 0);
  assert.equal(spell.damage.max, 1);
  assert.equal(spell.flavor.length, 15);
  assert(spell.flavor.every(scene => !/\btwenty\b|\b20\b/i.test(scene)));
  assert.equal(spell.flavor[3], 'An Astral gun flashes into your hands. You could carefully line up your shot, but you have one hundred and forty of them. Spray and pray!');
  assert.deepEqual(JSON.parse(JSON.stringify(spell.aliases)), ['conjure gun', 'gun']);

  for (const hits of [0, 1, 69, 70, 71, 139, 140]) {
    const dice = shots(hits);
    f.rolls.push(...dice);
    const natural = f.c.rollSpellDamage(spell);
    assert.deepEqual(JSON.parse(JSON.stringify(natural.rolls)), dice);
    assert.equal(natural.total, hits);
    assert(!('criticalShots' in natural));
    const resolved = f.c.resolveSpellRoll(spell, natural, natural.total);
    assert.equal(resolved.baseDamage, hits);
    assert.equal(resolved.damage, hits);
    assert.equal(resolved.isCritical, false);
    f.rolls.push(0);
    const receipt = f.c.formatSpellCastMessage(spell, resolved, { modifierDetails: [] }, 'discord');
    assert(receipt.includes(`Shots: ${dice.join(', ')}`));
    assert(receipt.includes('140 Shots!'));
    assert(receipt.includes(`${hits} ${hits === 1 ? 'Hit' : 'Hits'}!`));
    assert(receipt.includes(`${140 - hits} ${140 - hits === 1 ? 'Miss' : 'Misses'}!`));
    assert(receipt.includes(`Base Damage: ${hits}`));
    assert(receipt.includes(`Total Damage: ${hits}`));
    assert(!/Critical Hit|Aftershock|20 Hits/.test(receipt));
  }
  const natural = { rolls: shots(70), total: 70 };
  const resolved = f.c.resolveSpellRoll(spell, natural, 70);
  for (let index = 0; index < spell.flavor.length; index++) {
    f.rolls.push(index);
    const receipt = f.c.formatSpellCastMessage(spell, resolved, { modifierDetails: [] }, 'discord');
    assert(receipt.includes(spell.flavor[index]));
  }

  const normal = await fixture(45);
  const normalCast = await gun(normal);
  assert.match(normalCast.message, /70 Hits!/);
  assert.match(normalCast.message, /70 Misses!/);
  assert.equal((await normal.progress()).mana, 65);
  assert.equal((await normal.state()).enemy.hp, 930);

  const strong = await fixture(45);
  await strong.editProgress(p => { p.stats.strength = 7; });
  const strongCast = await gun(strong);
  assert.match(strongCast.message, /Base Damage: 70/);
  assert.match(strongCast.message, /Strength: \+7/);
  assert.match(strongCast.message, /Total Damage: 77/);
  assert.equal((await strong.state()).enemy.hp, 923);

  const allMiss = await fixture(45);
  const missCast = await gun(allMiss, shots(0));
  assert.match(missCast.message, /0 Hits!/);
  assert.match(missCast.message, /140 Misses!/);
  assert.match(missCast.message, /Base Damage: 0/);
  assert.equal((await allMiss.state()).enemy.hp, 1000);

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
  const tidalCast = await chain.cast('tidal');
  assert.match(tidalCast.message, /Rising Power: \+2 damage/);
  assert.match(tidalCast.message, /Rhythm Applied! \+5 damage/);
  await chain.editProgress(p => { p.mana = 100; });
  const chainedGun = await gun(chain);
  assert.match(chainedGun.message, /Rising Power: \+4 damage/);
  await chain.editProgress(p => { p.mana = 100; });
  assert.match((await gun(chain)).message, /Rising Power resets\./);

  const echoed = await fixture(45);
  await echoed.editState(s => { s.astralEcho = { naturalRoll: 1, tierId: 'faint', displayName: 'Faint', damagePercent: 0.5 }; });
  assert.match((await gun(echoed)).message, /Echo/);
  assert.equal((await echoed.state()).enemy.hp, 895);

  const charged = await fixture(45);
  await charged.editState(s => { s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: true }; });
  assert.match((await gun(charged)).message, /Charge bursts!/);
  assert.equal((await charged.progress()).mana, 82);

  const familiar = await fixture(45);
  familiar.rolls.push(1, 1, 0);
  await familiar.cast('familiar');
  await gun(familiar);
  assert.equal((await familiar.state()).familiar.actions, 1);

  const bond = await fixture(45);
  bond.rolls.push(1, 1, 0);
  await bond.cast('familiar');
  await bond.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  assert.match((await gun(bond)).message, /Bond: Your Familiar's next assistance is empowered!/);
  assert.equal((await bond.state()).familiar.actions, 1);
  await bond.editProgress(p => { p.mana = 100; });
  assert.match((await gun(bond)).message, /Bond empowers your Familiar!/);
  assert.equal((await bond.state()).familiar.actions, 2);

  const harmony = await fixture(45);
  await harmony.editProgress(p => { p.stats.fae = 1; });
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  assert.match((await gun(harmony)).message, /Harmony\nRestored 15 Mana/);
  assert.equal((await harmony.state()).perkUses['astral-harmony'], 1);

  const expedition = await fixture(45);
  const count = (await expedition.progress()).astralExpeditionRolls;
  await gun(expedition);
  assert.equal((await expedition.progress()).astralExpeditionRolls, count + 1);

  const victory = await fixture(45);
  await victory.editState(s => { s.enemy.hp = 70; });
  await gun(victory);
  assert.equal(await victory.state(), null);

  const twitch = await fixture(45, 'twitch');
  assert.match((await gun(twitch, shots(70), 'conjure gun')).message, /Shots: 1, 1, 1/);

  console.log('Conjure Gun regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
