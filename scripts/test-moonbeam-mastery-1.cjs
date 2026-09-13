// Run: node scripts/test-moonbeam-mastery-1.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function moonbeam(level, main, moonlight, platform = 'discord') {
  const f = await fixture(level, platform);
  f.rolls.push(...main, ...moonlight, 1);
  const result = await f.cast('moonbeam');
  return { f, result };
}

async function main() {
  const low = await moonbeam(26, [10, 3], [4]);
  assert(!(await low.f.c.getActiveMasteries(26)).some(m => m.id === 'moonbeam-mastery-1'));
  assert.deepEqual(low.f.randomCalls, [[1, 20], [1, 20], [1, 6], [1, 20]]);
  assert.match(low.result.message, /Moonlight Bonus:\n\+4/);
  assert.doesNotMatch(low.result.message, /Moonlight Rolls:|Lunar Alignment:/);
  assert.equal((await low.f.state()).enemy.hp, 986); // 10 main + 4 Moonlight.

  for (const platform of ['discord', 'twitch']) {
    for (const pair of [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6],
      [1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1]]) {
      const { f, result } = await moonbeam(27, [10, 3], pair, platform);
      const total = pair[0] + pair[1];
      assert((await f.c.getActiveMasteries(27)).some(m => m.id === 'moonbeam-mastery-1'));
      assert.deepEqual(f.randomCalls, [[1, 20], [1, 20], [1, 6], [1, 6], [1, 20]]);
      const labelSeparator = platform === 'discord' ? '\n' : ' ';
      assert(result.message.includes(`Moonlight Rolls:${labelSeparator}${pair[0]} and ${pair[1]}`));
      assert(result.message.includes(`Moonlight Bonus:${labelSeparator}+${total}`));
      assert(result.message.includes(`Lunar Alignment:${labelSeparator}+5`));
      assert.equal(result.message.split('Lunar Alignment:').length - 1, 1);
      assert.equal((await f.state()).enemy.hp, 1000 - 10 - total - 5);
    }
  }

  const unaligned = await moonbeam(27, [10, 3], [3, 5]);
  assert.doesNotMatch(unaligned.result.message, /Lunar Alignment:/);
  assert.equal((await unaligned.f.state()).enemy.hp, 982);

  const critical = await moonbeam(27, [20, 3], [5, 5]);
  assert.match(critical.result.message, /Critical Base Damage:\n40/);
  assert.match(critical.result.message, /Lunar Alignment:\n\+20/);
  assert.doesNotMatch(critical.result.message, /Lunar Alignment:\n\+5/);
  assert.match(critical.result.message, /Total Damage:\n70/);
  assert.equal((await critical.f.state()).enemy.hp, 925); // 40 + 10 + 20 + Aftershock 5.

  const modified = await fixture(27);
  await modified.editProgress(p => { p.stats.fae = 5; p.stats.strength = 9; });
  modified.rolls.push(10, 3, 3, 4, 1);
  const modifiedCast = await modified.cast('moonbeam');
  assert.match(modifiedCast.message, /Fae Affinity:\n\+5/);
  assert.match(modifiedCast.message, /Moonlight Rolls:\n3 and 4/);
  assert.match(modifiedCast.message, /Lunar Alignment:\n\+5/);
  assert.match(modifiedCast.message, /Total Damage:\n36/);

  const echoed = await fixture(27);
  await echoed.editState(s => {
    s.astralEcho = { naturalRoll: 1, tierId: 'faint',
      displayName: 'Faint', damagePercent: 0.5 };
  });
  echoed.rolls.push(10, 3, 3, 4, 1);
  await echoed.cast('moonbeam');
  assert.equal((await echoed.state()).enemy.hp, 967); // 22 primary + 11 Echo.

  const lethal = await fixture(27);
  await lethal.editState(s => { s.enemy.hp = 22; s.enemy.maxHp = 22; });
  lethal.rolls.push(10, 3, 3, 4);
  assert.equal((await lethal.cast('moonbeam')).won, true);
  assert.equal(await lethal.state(), null);
  console.log('Moonbeam Mastery I regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
