// Run: node scripts/test-astral-echo-mastery-1.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const percent = [0, 0.30, 0.35, 0.40, 0.50];
const line = [null,
  'Astral Echo Mastery I: Restored 5 Mana',
  'Astral Echo Mastery I: Restored 10 Mana',
  'Astral Echo Mastery I: Next offensive roll +1',
  'Astral Echo Mastery I: Next offensive roll +2'];
async function cast(f, name, dice) {
  f.rolls.push(...dice);
  return f.cast(name);
}
async function attack(f, natural = 10) {
  f.rolls.push(natural);
  return f.attack();
}

(async () => {
  for (const platform of ['discord', 'twitch']) {
    for (const natural of [1, 2, 3, 4]) {
      const low = await fixture(33, platform);
      const high = await fixture(34, platform);
      assert(!(await low.c.getActiveMasteries(33))
        .some(m => m.id === 'astral-echo-mastery-1'));
      assert((await high.c.getActiveMasteries(34))
        .some(m => m.id === 'astral-echo-mastery-1'));
      const lowRolls = low.randomCalls.length;
      const highRolls = high.randomCalls.length;
      const lowPrep = await cast(low, 'echo', [natural]);
      const highPrep = await cast(high, 'echo', [natural]);
      assert.equal((await low.progress()).mana, 75);
      assert.equal((await high.progress()).mana, 80);
      assert.equal((await low.state()).astralEcho.damagePercent, percent[natural]);
      assert.equal((await high.state()).astralEcho.damagePercent, percent[natural]);
      assert.doesNotMatch(lowPrep.message + highPrep.message,
        /Astral Echo Mastery I:/);
      assert.equal((await high.state()).astralEchoMastery, undefined);
      assert.equal((await high.progress()).astralExpeditionRolls, 0);
      assert.equal((await high.state()).astralRhythmPreviousSpell, undefined);
      const lowHit = await cast(low, 'star', [3]);
      const highHit = await cast(high, 'star', [3]);
      assert.equal((await low.state()).enemy.hp, (await high.state()).enemy.hp);
      assert.doesNotMatch(lowHit.message, /Astral Echo Mastery I:/);
      assert.equal(highHit.message.split(line[natural]).length - 1, 1);
      assert.equal((await high.state()).astralEcho, undefined);
      assert.equal((await high.progress()).astralExpeditionRolls, 1);
      assert.equal((await high.state()).astralRhythmPreviousSpell, 'star-spark');
      assert.equal(low.randomCalls.slice(lowRolls).filter(([a, b]) => a === 1 && b === 4).length, 1);
      assert.equal(high.randomCalls.slice(highRolls).filter(([a, b]) => a === 1 && b === 4).length, 1);
      if (natural <= 2) {
        assert.equal((await high.progress()).mana, natural === 1 ? 75 : 80);
        assert.equal((await high.state()).astralEchoMastery, undefined);
      } else {
        assert.equal((await high.progress()).mana, 70);
        assert.equal((await high.state()).astralEchoMastery.offensiveRollModifier,
          natural - 2);
        assert.doesNotMatch(highHit.message,
          new RegExp(`\\+${natural - 2} Astral Echo Mastery I`));
        const next = await attack(high, 10);
        assert.match(next.message,
          new RegExp(`\\+${natural - 2} Astral Echo Mastery I`));
        assert.equal((await high.state()).astralEchoMastery, undefined);
      }
      assert.doesNotMatch(line[natural], /\p{Extended_Pictographic}/u);
    }
  }

  const higher = await fixture(35);
  await cast(higher, 'echo', [1]);
  assert.equal((await higher.progress()).mana, 80);

  for (const level of [33, 34]) {
    const poor = await fixture(level);
    await poor.editProgress(p => { p.mana = level === 33 ? 24 : 19; });
    const before = await poor.progress();
    const result = await poor.cast('echo');
    assert.match(result.message, /enough Mana/);
    assert.equal((await poor.progress()).mana, before.mana);
    assert.equal((await poor.state()).astralEcho, undefined);
  }

  const miss = await fixture(34);
  await cast(miss, 'echo', [4]);
  const missed = await cast(miss, 'falling star', [3, 3, 3, 1]);
  assert.doesNotMatch(missed.message, /Astral Echo Mastery I:/);
  assert.equal((await miss.state()).astralEchoMastery, undefined);

  const tinySpell = await fixture(34);
  await cast(tinySpell, 'echo', [1]);
  const tinyEcho = await cast(tinySpell, 'star', [1]);
  assert.match(tinyEcho.message, /strikes again for 0 damage/);
  assert.match(tinyEcho.message, /Astral Echo Mastery I: Restored 5 Mana/);

  const harmony = await fixture(34);
  await cast(harmony, 'echo', [3]);
  await cast(harmony, 'star', [3]);
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  await attack(harmony, 10);
  assert.equal((await harmony.state()).perkUses['astral-harmony'], 1);

  const forcedMiss = await fixture(34);
  await cast(forcedMiss, 'echo', [4]);
  await cast(forcedMiss, 'star', [3]);
  const missRoll = await attack(forcedMiss, 1);
  assert.match(missRoll.message, /Critical Miss/);
  assert.equal((await forcedMiss.state()).astralEchoMastery, undefined);
  assert.equal((await forcedMiss.state()).perkUses['fae-second-opinion'], 1);

  const moonbeam = await fixture(34);
  await cast(moonbeam, 'echo', [4]);
  const moonReceipt = await cast(moonbeam, 'moonbeam', [4, 5, 2, 3]);
  assert.match(moonReceipt.message, /Moonbeam/);
  assert.match(moonReceipt.message, /Astral Echo activates!/);
  assert.match(moonReceipt.message, /Astral Echo Mastery I: Next offensive roll \+2/);

  const victory = await fixture(34);
  await cast(victory, 'echo', [1]);
  await victory.editState(s => { s.enemy.hp = 1; s.enemy.maxHp = 1; });
  const finalHit = await cast(victory, 'star', [3]);
  assert.equal(finalHit.won, true);
  assert.equal(finalHit.message.split(line[1]).length - 1, 1);
  assert.equal(await victory.state(), null);

  for (const natural of [1, 2, 3, 4]) {
    const wake = await fixture(34);
    await cast(wake, 'echo', [natural]);
    await cast(wake, 'wake', [1]);
    assert.equal((await wake.state()).leviathansWake.astralEchoSnapshot.naturalRoll,
      natural);
    assert.equal((await wake.state()).astralEchoMastery, undefined);
    await attack(wake, 2); // Wake warning, Echo has not landed.
    assert.equal((await wake.state()).astralEchoMastery, undefined);
    const arrival = await attack(wake, 10);
    assert.equal(arrival.message.split(line[natural]).length - 1, 1);
    assert.equal((await wake.state()).leviathansWake, undefined);
    assert.equal((await wake.progress()).mana,
      natural === 1 ? 55 : natural === 2 ? 60 : 50);
    if (natural >= 3) {
      assert.match(arrival.message,
        new RegExp(`\\+${natural - 2} Astral Echo Mastery I`));
    }
  }

  const capped = await fixture(34);
  await capped.editProgress(p => {
    p.stats.focus = 5;
    p.restBufferType = 'short';
    p.mana = 175;
  });
  const full = await capped.c.applyAstralEchoMastery(
    capped.env, capped.key, await capped.state(), await capped.progress(),
    2, await capped.c.getActiveMasteries(34));
  assert.equal(full.message, line[2]);
  assert.equal((await capped.progress()).mana, 175);
  console.log('Astral Echo Mastery I regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
