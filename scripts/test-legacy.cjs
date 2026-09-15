// Run: node scripts/test-legacy.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = "lvl 46 Passive ⭐ Legacy: The spells that began your journey have grown alongside you. Star Spark critical Charges restore 10 Mana. Matching all three natural Jellyfish dice summons a Perfect Jellyfish, dealing +20 bonus damage and restoring 20 HP + 20 Mana. If both of Moonbeam's natural main dice roll 20, a Full Moon forms and deals +75 bonus damage.";

(async () => {
  const low = await fixture(45);
  assert.equal((await low.c.formatLevelUpUnlocks(45, 46)).join('\n'), unlock);
  assert.equal((await low.c.getPerkDefinition('legacy')).name, 'Legacy');

  low.rolls.push(12, 1);
  const lowStar = await low.cast('star');
  assert(!lowStar.message.includes('Legacy:'));
  assert.equal((await low.progress()).mana, 90);
  assert((await low.state()).enemy.astralCharge);

  const star = await fixture(46);
  star.rolls.push(12, 1);
  const starCritical = await star.cast('star');
  assert.match(starCritical.message, /Legacy: Charge restored 10 Mana\./);
  assert.equal((await star.progress()).mana, 100);
  assert.equal((await star.state()).enemy.astralCharge.remainingDamageUses, 2);
  const normalStar = await fixture(46);
  normalStar.rolls.push(11, 1);
  assert(!((await normalStar.cast('star')).message.includes('Legacy:')));
  assert.equal((await normalStar.progress()).mana, 90);
  const lethalStar = await fixture(46);
  await lethalStar.editState(s => { s.enemy.hp = 18; });
  lethalStar.rolls.push(12);
  assert(!((await lethalStar.cast('star')).message.includes('Legacy:')));

  for (const natural of [1, 4, 8]) {
    const jelly = await fixture(46);
    await jelly.editState(s => { s.playerHp = 50; });
    await jelly.editProgress(p => { p.hp = 50; p.mana = 50; });
    jelly.rolls.push(natural, natural, natural, 0, 0, 1);
    const result = await jelly.cast('jelly');
    assert.match(result.message, /Perfect Jellyfish!/);
    assert.match(result.message, /\+20 damage \| Restored 20 HP \+ 20 Mana/);
    assert.equal((await jelly.state()).enemy.hp,
      1000 - (natural === 8 ? 72 : natural * 3 + 20));
    assert.equal((await jelly.state()).playerHp, 80); // Legacy + Curiosity triple.
    assert.equal((await jelly.progress()).mana, natural === 1 ? 90 : 70);
  }
  const ordinaryJelly = await fixture(46);
  ordinaryJelly.rolls.push(1, 1, 2, 1);
  assert(!((await ordinaryJelly.cast('jelly')).message.includes('Perfect Jellyfish!')));
  const modifiedJelly = await fixture(46);
  await modifiedJelly.editState(s => { s.astralRebound = { offensiveRollModifier: 2 }; });
  modifiedJelly.rolls.push(1, 1, 2, 1);
  assert(!((await modifiedJelly.cast('jelly')).message.includes('Perfect Jellyfish!')));

  const lowJelly = await fixture(45);
  lowJelly.rolls.push(4, 4, 4, 0, 1);
  await lowJelly.cast('jelly');
  const highJelly = await fixture(46);
  highJelly.rolls.push(4, 4, 4, 0, 0, 1);
  await highJelly.cast('jelly');
  assert.equal((await lowJelly.state()).enemy.hp - (await highJelly.state()).enemy.hp, 20);

  const jellySpell = await star.c.getSpellDefinition('jelly');
  assert.equal(jellySpell.legacy.perfectJellyfishScenes.length, 2);
  assert(jellySpell.legacy.perfectJellyfishScenes.every(scene => !/[\p{Extended_Pictographic}]/u.test(scene)));
  for (let scene = 0; scene < 2; scene++) {
    const jelly = await fixture(46);
    jelly.rolls.push(4, 4, 4, scene, 0, 1);
    const result = await jelly.cast('jelly');
    assert(result.message.includes(jellySpell.legacy.perfectJellyfishScenes[scene]));
  }
  const cappedJelly = await fixture(46);
  await cappedJelly.editState(s => { s.playerHp = 95; });
  cappedJelly.rolls.push(4, 4, 4, 0, 0, 1);
  assert.match((await cappedJelly.cast('jelly')).message,
    /Restored 5 HP \+ 10 Mana/);

  const lowMoon = await fixture(45);
  lowMoon.rolls.push(20, 20, 1, 1, 0, 1);
  const lowMoonResult = await lowMoon.cast('moonbeam');
  assert(!lowMoonResult.message.includes('FULL MOON'));
  const lowMoonHp = (await lowMoon.state()).enemy.hp;
  const moonSpell = await star.c.getSpellDefinition('moonbeam');
  assert.equal(moonSpell.legacy.fullMoonScenes.length, 3);
  assert(moonSpell.legacy.fullMoonScenes.every(scene => !/[\p{Extended_Pictographic}]/u.test(scene)));
  for (let scene = 0; scene < 3; scene++) {
    const moon = await fixture(46);
    moon.rolls.push(20, 20, 1, 1, scene, 0, 1);
    const result = await moon.cast('moonbeam');
    assert.match(result.message, /FULL MOON/);
    assert.match(result.message, /\+75 Full Moon Damage/);
    assert(result.message.includes(moonSpell.legacy.fullMoonScenes[scene]));
    assert.match(result.message, /Critical Hit!/);
    if (scene === 0) {
      assert.equal(lowMoonHp - (await moon.state()).enemy.hp, 75);
    }
  }
  for (const dice of [[20, 19], [19, 20]]) {
    const moon = await fixture(46);
    moon.rolls.push(...dice, 1, 1, 1);
    assert(!((await moon.cast('moonbeam')).message.includes('FULL MOON')));
  }
  const modifiedMoon = await fixture(46);
  await modifiedMoon.editState(s => { s.astralRebound = { offensiveRollModifier: 2 }; });
  modifiedMoon.rolls.push(19, 20, 1, 1, 1);
  assert(!((await modifiedMoon.cast('moonbeam')).message.includes('FULL MOON')));

  const jellyVictory = await fixture(46);
  await jellyVictory.editState(s => { s.enemy.hp = 20; });
  jellyVictory.rolls.push(1, 1, 1, 0, 0);
  const jellyWin = await jellyVictory.cast('jelly');
  assert.equal(jellyWin.won, true);
  assert.equal(await jellyVictory.state(), null);
  const moonVictory = await fixture(46);
  await moonVictory.editState(s => { s.enemy.hp = 100; });
  moonVictory.rolls.push(20, 20, 1, 1, 0, 0);
  const moonWin = await moonVictory.cast('moonbeam');
  assert.equal(moonWin.won, true);
  assert.equal(await moonVictory.state(), null);

  console.log('Legacy regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
