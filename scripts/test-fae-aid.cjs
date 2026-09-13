// Run: node scripts/test-fae-aid.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const line = 'Fae Aid activates! Restored 5 HP.';
async function player(level, hp, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => { p.hp = hp; });
  await f.editState(s => { s.playerHp = hp; });
  return f;
}
async function hit(f, enemyRoll = 1) {
  f.rolls.push(2, enemyRoll);
  return f.attack();
}

(async () => {
  for (const [level, aid, intervention] of [
    [16, false, false], [17, true, false],
    [42, true, false], [43, true, true],
  ]) {
    const f = await player(level, 14);
    const perks = await f.c.getActivePerks(level);
    assert.equal(perks.some(p => p.id === 'fae-aid'), aid);
    assert.equal(perks.some(p => p.id === 'fae-intervention'), intervention);
  }

  for (const platform of ['discord', 'twitch']) {
    for (const [hp, fires] of [[25, false], [15, false], [14, true]]) {
      const f = await player(17, hp, platform);
      const result = await hit(f);
      assert.equal(result.message.includes(line), fires);
      assert.equal((await f.state()).playerHp, hp + (fires ? 5 : 0));
      assert.equal((await f.state()).perkUses?.['fae-aid'], fires ? 1 : undefined);
      assert.equal((await f.progress()).mana, 100);
      if (fires) {
        assert.equal(result.message.split(line).length - 1, 1);
        assert.doesNotMatch(line, /\p{Extended_Pictographic}/u);
        await f.editState(s => { s.playerHp = 14; });
        assert.doesNotMatch((await hit(f)).message, /Fae Aid activates/);
        assert.equal((await f.state()).playerHp, 14);
        await f.c.startCombatEncounter(f.env, f.key,
          f.c.getRegionById('moonlit-reef'), 1, f.enemy, platform);
        await f.editState(s => { s.playerHp = 14; });
        assert.match((await hit(f)).message, /Fae Aid activates/);
      }
    }
  }

  for (const [maxHp, hp, fires] of [
    [150, 23, false], [150, 22, true],
    [175, 27, false], [175, 26, true],
  ]) {
    const f = await player(17, hp);
    await f.editProgress(p => {
      p.stats.vitality = 5;
      if (maxHp === 175) {
        p.stats.focus = 5;
        p.restBufferType = 'short'; p.hp = hp; p.mana = 175;
      }
    });
    await f.editState(s => { s.playerHp = hp; s.playerMaxHp = maxHp; });
    assert.equal(f.c.getPlayerResourceCaps(await f.progress()).hp, maxHp);
    assert.equal((await hit(f)).message.includes(line), fires);
    assert.equal((await f.state()).playerHp, hp + (fires ? 5 : 0));
  }

  const lethal = await player(17, 1);
  assert.doesNotMatch((await hit(lethal, 20)).message, /Fae Aid activates/);
  assert.equal(await lethal.state(), null);

  const blocked = await player(17, 25);
  await blocked.editState(s => { s.berryEffects = { protection: 20 }; });
  assert.doesNotMatch((await hit(blocked, 6)).message, /Fae Aid activates/);
  const partial = await player(17, 20);
  await partial.editState(s => { s.berryEffects = { protection: 20 }; });
  assert.match((await hit(partial, 20)).message, /Fae Aid activates/);

  const berry = await player(17, 14);
  await berry.editProgress(p => { p.berries = 1; });
  await berry.c.performEat(berry.env, berry.key, 'Explorer', 'berry', 'discord');
  assert.equal((await berry.state()).perkUses?.['fae-aid'], undefined);
  const stim = await player(17, 14);
  stim.rolls.push(0, 1); // Stim scene, then a zero-damage enemy attack.
  await stim.c.performStim(stim.env, stim.key, 'discord');
  assert.equal((await stim.state()).perkUses?.['fae-aid'], undefined);

  const harvest = await player(17, 14);
  await harvest.editState(s => { s.enemy.hp = 1; s.enemy.maxHp = 1; });
  harvest.rolls.push(20);
  const victory = await harvest.attack();
  assert.equal(victory.won, true);
  assert.doesNotMatch(victory.message, /Fae Aid activates/);

  for (const platform of ['discord', 'twitch']) {
    const combo = await player(43, 1, platform);
    const result = await hit(combo, 20);
    assert.match(result.message, /Fae Intervention activates/);
    assert.match(result.message, /Fae Aid activates! Restored 5 HP\./);
    assert(result.message.indexOf('Fae Intervention activates') <
      result.message.indexOf(line));
    assert.equal((await combo.state()).playerHp, 6);
    assert.equal((await combo.state()).perkUses['fae-intervention'], 1);
    assert.equal((await combo.state()).perkUses['fae-aid'], 1);
    assert.doesNotMatch((await hit(combo, 20)).message, /Fae Aid activates|Fae Intervention activates/);
    assert.equal(await combo.state(), null);
  }
  console.log('Fae Aid and Fae Intervention unlock regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
