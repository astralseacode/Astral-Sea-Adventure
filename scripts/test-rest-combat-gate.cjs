// Run: node scripts/test-rest-combat-gate.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const plain = value => JSON.parse(JSON.stringify(value));

async function outside(platform, input, expectedBuffer) {
  const f = await fixture(31, platform);
  await f.c.deleteCombatState(f.env, f.key);
  await f.editProgress(p => { p.hp = 40; p.mana = 30; });
  const result = await f.c.performRest(f.env, f.key, 'rest-test', input, platform);
  const progress = await f.progress();
  assert.equal(progress.restBufferType, expectedBuffer);
  assert.equal(progress.hp, f.c.getPlayerResourceCaps(progress).hp);
  assert.equal(progress.mana, f.c.getPlayerResourceCaps(progress).mana);
  assert(progress.lastRestAt > 0);
  if (expectedBuffer === 'long') assert(progress.lastLongRestAt > 0);
  assert.doesNotMatch(result.message, /cannot rest while in combat/);
}

async function inside(platform, input) {
  const f = await fixture(31, platform);
  await f.cast('wake');
  await f.editProgress(p => { p.hp = 40; p.mana = 30; p.evocationCooldownTurns = 4; });
  await f.editState(s => {
    s.playerHp = 40;
    s.familiarSerial = 1;
    s.familiar = { id: 'sprite', total: 5, actions: 2, serial: 1 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  const progressBefore = plain(await f.progress());
  const stateBefore = plain(await f.state());
  const kvBefore = plain([...f.values]);
  const writesBefore = f.writes.length;
  const rollsBefore = f.randomCalls.length;
  const result = await f.c.performRest(f.env, f.key, 'rest-test', input, platform);
  assert.equal(result.message, 'You cannot rest while in combat.');
  assert.deepEqual(plain(await f.progress()), progressBefore);
  assert.deepEqual(plain(await f.state()), stateBefore);
  assert.deepEqual(plain([...f.values]), kvBefore);
  assert.equal(f.writes.length, writesBefore);
  assert.equal(f.randomCalls.length, rollsBefore);

  // Combat must win over an existing Rest cooldown, with no cooldown reads or writes.
  await f.editProgress(p => { p.lastRestAt = Date.now(); p.lastLongRestAt = Date.now(); });
  const cooldownWrites = f.writes.length;
  assert.equal((await f.c.performRest(f.env, f.key, 'rest-test', input, platform)).message,
    'You cannot rest while in combat.');
  assert.equal(f.writes.length, cooldownWrites);
}

(async () => {
  for (const [platform, input, buffer] of [
    ['discord', 'short', 'short'], ['discord', 'long', 'long'],
    ['twitch', '', 'short'], ['twitch', 'short', 'short'],
    ['twitch', 'long', 'long'],
  ]) await outside(platform, input, buffer);
  for (const [platform, input] of [
    ['discord', 'short'], ['discord', 'long'],
    ['twitch', ''], ['twitch', 'short'], ['twitch', 'long'],
  ]) await inside(platform, input);
  console.log('Rest combat gate regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
