// Run: node scripts/test-berries.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function setup(level = 24, platform = 'discord') {
  const f = await fixture(level, platform);
  f.berry = () => f.c.performCastUnlocked(f.env, f.key, 'berry', platform);
  return f;
}
async function main() {
  const spell = await (await setup()).c.getSpellDefinition('berries');
  assert.equal(spell.outcomes.length, 20);
  assert.deepEqual(Array.from(spell.aliases), ['berry', 'berries']);
  assert(!spell.outcomes.some(outcome => /\p{Extended_Pictographic}/u.test(outcome.text)));
  assert(!spell.outcomes.some(outcome => outcome.text.includes('\n')));
  const low = await setup(23);
  assert.match((await low.berry()).message, /Reach Level 24/);

  for (const platform of ['discord', 'twitch']) {
    for (let roll = 1; roll <= 20; roll++) {
      const f = await setup(24, platform);
      await f.editProgress(p => { p.hp = 50; p.mana = 30; });
      await f.editState(s => { s.playerHp = 50; });
      f.rolls.push(roll);
      const result = await f.berry();
      const outcome = spell.outcomes[roll - 1];
      assert(result.message.startsWith(outcome.text), `Roll ${roll} must use its exact outcome`);
      assert.equal(result.message.split(outcome.text).length - 1, 1);
      assert(!/Critical Miss|Critical Hit/.test(result.message));
      assert.deepEqual(f.randomCalls, [[1, 20]]);
      assert.equal((await f.state()).round, 1);
      assert.equal((await f.state()).berriesCastRound, 1);
      assert.equal((await f.state()).astralPatience, undefined);
      assert.equal((await f.state()).enemy.hp, 1000 - ({ 1: 10, 17: 25 }[roll] || 0));
      assert.equal((await f.state()).playerHp,
        ({ 4: 65, 9: 75, 11: 65, 14: 65, 19: 80, 20: 90 }[roll] || 50));
      assert.equal((await f.progress()).mana,
        ({ 3: 40, 6: 30, 10: 60, 11: 30, 14: 40, 15: 30,
          18: 70, 19: 70, 20: 90 }[roll] || 10));
      const effects = (await f.state()).berryEffects;
      assert.equal(effects.protection,
        ({ 7: 10, 16: 20 }[roll] || undefined));
      assert.equal(effects.sleepyGuard, roll === 2 ? true : undefined);
      assert.equal(effects.sparkDamage, roll === 8 ? true : undefined);
      assert.equal(effects.shimmerDiscount, roll === 15 ? true : undefined);
      const bonus = { 5: ['Bouncy Berry', 2], 6: ['Fae Berry', 1],
        12: ['Giggling Berry', 3], 18: ['Astral Berry', 2],
        20: ["Shizuki's Favorite", 4] }[roll];
      assert.deepEqual(bonus ? Array.from(Object.entries(effects.rollBonuses)[0]) : [],
        bonus || []);
      assert.equal(await f.c.getBackpackTotal(f.env, f.key), roll === 13 ? 75 : 0);
      const before = await f.progress();
      const calls = f.randomCalls.length;
      assert.match((await f.berry()).message, /already conjured a Berry this turn/);
      assert.equal((await f.progress()).mana, before.mana);
      assert.equal(f.randomCalls.length, calls);
    }
  }

  const fresh = await setup();
  fresh.rolls.push(3);
  await fresh.berry();
  assert.equal((await fresh.progress()).mana, 100); // 100 - 20 + 30, capped.
  fresh.rolls.push(1, 1);
  await fresh.attack();
  assert.equal((await fresh.state()).round, 2);
  fresh.rolls.push(1);
  await fresh.berry();
  assert.equal((await fresh.state()).enemy.hp, 990);

  const fae = await setup();
  fae.rolls.push(6);
  await fae.berry();
  assert.equal((await fae.state()).berryEffects.rollBonuses['Fae Berry'], 1);
  fae.rolls.push(1, 1);
  await fae.attack();
  assert.equal((await fae.state()).berryEffects.rollBonuses['Fae Berry'], 1);
  fae.rolls.push(10, 1);
  const faeSpell = await fae.cast('star');
  assert.match(faeSpell.message, /\+1 Fae Berry/);
  assert.equal((await fae.state()).berryEffects.rollBonuses, undefined);

  const bounce = await setup();
  await bounce.editState(s => { s.astralPatience = { offensiveRollModifier: 2 }; });
  bounce.rolls.push(5);
  await bounce.berry();
  assert.equal((await bounce.state()).astralPatience.offensiveRollModifier, 2);
  bounce.rolls.push(1, 1);
  const missedAttack = await bounce.attack();
  assert.match(missedAttack.message, /Critical Miss/);
  assert.match(missedAttack.message, /\+2 Bouncy Berry/);
  assert.match(missedAttack.message, /\+2 Astral Patience/);
  assert.equal((await bounce.state()).berryEffects.rollBonuses, undefined);

  const protectedPlayer = await setup();
  protectedPlayer.rolls.push(7);
  await protectedPlayer.berry();
  assert.equal((await protectedPlayer.state()).bubble, undefined);
  assert.equal((await protectedPlayer.state()).berryEffects.protection, 10);
  protectedPlayer.rolls.push(1, 6);
  await protectedPlayer.attack();
  assert.equal((await protectedPlayer.state()).enemy.hp, 1000);
  assert.equal((await protectedPlayer.state()).astralRebound, undefined);

  const shimmer = await setup();
  shimmer.rolls.push(15);
  await shimmer.berry();
  assert.equal((await shimmer.state()).berryEffects.shimmerDiscount, true);
  shimmer.rolls.push(1, 1);
  await shimmer.attack();
  assert.equal((await shimmer.state()).berryEffects.shimmerDiscount, true);
  shimmer.rolls.push(10, 1);
  await shimmer.cast('star');
  assert.equal((await shimmer.progress()).mana, 95);
  assert.equal((await shimmer.state()).berryEffects.shimmerDiscount, undefined);

  const twoDiscounts = await setup();
  await twoDiscounts.editState(s => {
    s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15,
      remainingDamageUses: 2, manaDiscountAvailable: true };
  });
  twoDiscounts.rolls.push(15);
  await twoDiscounts.berry();
  twoDiscounts.rolls.push(10, 1);
  await twoDiscounts.cast('star');
  assert.equal((await twoDiscounts.progress()).mana, 95);
  assert.equal((await twoDiscounts.state()).berryEffects.shimmerDiscount, undefined);

  const ordinarySpell = await setup();
  ordinarySpell.rolls.push(10, 1);
  await ordinarySpell.cast('star');
  const ordinaryDamage = 1000 - (await ordinarySpell.state()).enemy.hp;
  const sparkling = await setup();
  sparkling.rolls.push(8);
  await sparkling.berry();
  sparkling.rolls.push(10, 1);
  await sparkling.cast('star');
  assert.equal(1000 - (await sparkling.state()).enemy.hp, ordinaryDamage + 8);
  assert.equal((await sparkling.state()).berryEffects.sparkDamage, undefined);

  const sleepy = await setup();
  sleepy.rolls.push(2);
  await sleepy.berry();
  sleepy.rolls.push(1, 6);
  await sleepy.attack();
  assert.equal((await sleepy.state()).playerHp, 95);
  assert.equal((await sleepy.state()).berryEffects.sleepyGuard, undefined);

  const buffered = await setup();
  await buffered.editProgress(p => {
    p.stats.vitality = 5; p.stats.focus = 5;
    p.restBufferType = 'short'; p.hp = 160; p.mana = 160;
  });
  await buffered.editState(s => { s.playerHp = 160; s.playerMaxHp = 175; });
  buffered.rolls.push(20);
  await buffered.berry();
  assert.equal((await buffered.state()).playerHp, 175);
  assert.equal((await buffered.progress()).mana, 175);
  assert.equal((await buffered.progress()).restBufferType, 'short');

  const expiringBuffer = await setup();
  await expiringBuffer.editProgress(p => {
    p.stats.vitality = 5; p.stats.focus = 5;
    p.restBufferType = 'short'; p.hp = 150; p.mana = 160;
  });
  await expiringBuffer.editState(s => { s.playerHp = 150; s.playerMaxHp = 175; });
  expiringBuffer.rolls.push(4);
  await expiringBuffer.berry();
  assert.equal((await expiringBuffer.progress()).restBufferType, null);
  assert.equal((await expiringBuffer.state()).playerMaxHp, 150);
  assert.equal((await expiringBuffer.state()).playerHp, 150);

  const wake = await setup();
  await wake.editProgress(p => { p.evocationCooldownTurns = 4; });
  wake.rolls.push(10, 1);
  await wake.cast('wake');
  const wakeBefore = await wake.state();
  const cooldownBefore = (await wake.progress()).evocationCooldownTurns;
  wake.rolls.push(3);
  await wake.berry();
  assert.equal((await wake.state()).round, wakeBefore.round);
  assert.equal((await wake.state()).leviathansWake.stage, wakeBefore.leviathansWake.stage);
  assert.equal((await wake.progress()).evocationCooldownTurns, cooldownBefore);

  for (const damageRoll of [1, 17]) {
    const f = await setup();
    await f.editState(s => { s.enemy.hp = damageRoll === 1 ? 10 : 25;
      s.enemy.maxHp = s.enemy.hp; });
    f.rolls.push(damageRoll);
    const result = await f.berry();
    assert.equal(result.won, true);
    assert.equal(await f.state(), null);
  }
  console.log('Berries regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
