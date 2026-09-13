// Run with: node scripts/test-astral-defiance.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const line = 'Astral Defiance activates!\n\n+20 HP +20 Mana';
async function lethal(level, hp, buffer = null, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => {
    p.stats.vitality = 5;
    p.mana = 0;
    if (buffer) {
      p.restBufferType = buffer;
      p.hp = buffer === 'short' ? 175 : 200;
    }
  });
  await f.editState(s => { s.playerHp = hp; s.enemy.hp = 1; s.playerMaxHp = 999; });
  f.rolls.push(2);
  const result = await f.attack();
  return { f, result, progress: await f.progress() };
}

(async () => {
  const data = await (await fixture(36)).c.getPerkDefinition('astral-defiance');
  assert.equal(data.activationLine, line);
  const low = await lethal(35, 37);
  assert.doesNotMatch(low.result.message, /Astral Defiance activates!/);
  assert.equal(low.progress.hp, 52);
  assert.equal(low.progress.mana, 20);

  const below = await lethal(36, 37);
  assert.match(below.result.message, /Astral Harvest activates!/);
  assert.match(below.result.message, /Astral Defiance activates!\n\n\+20 HP \+20 Mana/);
  assert.equal(below.progress.hp, 72);
  assert.equal(below.progress.mana, 40);
  assert.equal(await below.f.state(), null);

  const above = await lethal(36, 38);
  assert.doesNotMatch(above.result.message, /Astral Defiance activates!/);
  assert.equal(above.progress.hp, 53);

  const capped = await fixture(36);
  await capped.editProgress(p => { p.stats.vitality = 5; p.mana = 90; });
  await capped.editState(s => { s.playerHp = 37; s.enemy.hp = 1; });
  capped.rolls.push(2);
  assert.match((await capped.attack()).message, /Astral Defiance activates!/);
  assert.equal((await capped.progress()).mana, 100);

  const nonlethal = await fixture(36);
  await nonlethal.editState(s => { s.playerHp = 20; });
  nonlethal.rolls.push(2);
  assert.doesNotMatch((await nonlethal.attack()).message, /Astral Defiance activates!/);
  assert(await nonlethal.state());

  const exact = await lethal(37, 43, 'short');
  assert.match(exact.result.message, /Astral Defiance activates!/);
  assert.equal(exact.progress.hp, 78);
  const tooHigh = await lethal(37, 44, 'short');
  assert.doesNotMatch(tooHigh.result.message, /Astral Defiance activates!/);

  const twitch = await lethal(36, 37, null, 'twitch');
  assert.match(twitch.result.message, /Astral Defiance activates!\n\n\+20 HP \+20 Mana/);
  console.log('Astral Defiance focused regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
