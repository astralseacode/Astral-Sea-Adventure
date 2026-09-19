// Run: node scripts/test-leviathans-wake-mastery-1.cjs. In-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const cases = [
  [1, 'wakefin', 12, 0, 5, 0, "Leviathan's Wake Mastery I: Restored 5 Mana"],
  [2, 'astral-manta', 22, 0, 0, 5, "Leviathan's Wake Mastery I: Gained 5 protection"],
  [8, 'deepwake-serpent', 30, 5, 0, 0, "Leviathan's Wake Mastery I: +5 damage"],
  [14, 'leviathan', 40, 10, 5, 0, "Leviathan's Wake Mastery I: +10 damage | Restored 5 Mana"],
  [20, 'ancient-one', 55, 20, 10, 0, "Leviathan's Wake Mastery I: +20 damage | Restored 10 Mana"],
];

async function run(level, natural, platform = 'discord') {
  const f = await fixture(level, platform);
  f.rolls.push(natural, 1);
  const cast = await f.cast();
  const pending = await f.state();
  f.rolls.push(1, 1);
  const warning = await f.attack();
  f.rolls.push(1, 1);
  const arrival = await f.attack();
  return { f, cast, pending, warning, arrival, state: await f.state(),
    progress: await f.progress() };
}

(async () => {
  const probe = await fixture(37);
  const mastery = await probe.c.getMasteryDefinition('leviathans-wake-mastery-1');
  assert.equal(mastery.effect.creatures.length, 5);
  assert(!(await probe.c.getActiveMasteries(36)).some(m => m.id === mastery.id));
  assert((await probe.c.getActiveMasteries(37)).some(m => m.id === mastery.id));

  const capped = await fixture(37);
  capped.rolls.push(1, 1);
  await capped.cast();
  capped.rolls.push(1, 1);
  await capped.attack();
  await capped.editProgress(p => { p.mana = 98; });
  capped.rolls.push(1, 1);
  await capped.attack();
  assert.equal((await capped.progress()).mana, 100);

  const buffered = await fixture(37);
  buffered.rolls.push(1, 1);
  await buffered.cast();
  buffered.rolls.push(1, 1);
  await buffered.attack();
  await buffered.editProgress(p => { p.restBufferType = 'short'; p.mana = 120; });
  buffered.rolls.push(1, 1);
  await buffered.attack();
  assert.equal((await buffered.progress()).mana, 125);

  for (const [natural, id, base, bonus, mana, protection, line] of cases) {
    const low = await run(36, natural);
    const high = await run(37, natural);
    assert.equal(high.pending.leviathansWake.creatureId, id);
    assert.equal(high.pending.leviathansWake.baseDamage, base);
    assert.doesNotMatch(high.cast.message + high.warning.message,
      /Leviathan's Wake Mastery I:/);
    assert.doesNotMatch(low.arrival.message, /Leviathan's Wake Mastery I:/);
    assert(high.arrival.message.includes(line.replaceAll(' | ', '\n')));
    assert.equal(low.state.enemy.hp - high.state.enemy.hp, bonus);
    assert.equal(high.progress.mana - low.progress.mana, mana);
    assert.equal(high.state.wakeMantaProtection || 0, protection);
    assert.equal(high.f.randomCalls.length, low.f.randomCalls.length);
  }

  const manta = await run(37, 2);
  manta.f.rolls.push(1, 10);
  const beforeHp = (await manta.f.state()).playerHp;
  await manta.f.attack();
  assert((await manta.f.state()).playerHp >= beforeHp -
    manta.f.c.getCombatRollResult(10).damage);
  assert((await manta.f.state()).wakeMantaProtection < 5 ||
    (await manta.f.state()).wakeMantaProtection === undefined);

  const twitch = await run(37, 14, 'twitch');
  assert(twitch.arrival.message.includes(cases[3][6]));

  const lethal = await fixture(38);
  lethal.rolls.push(8, 1);
  await lethal.cast();
  lethal.rolls.push(1, 1);
  await lethal.attack();
  await lethal.editState(s => { s.enemy.hp = 35; });
  const win = await lethal.attack();
  assert.equal(win.message.split('Test Enemy defeated!').length - 1, 1);
  assert(win.message.includes(cases[2][6]));
  assert.equal(await lethal.state(), null);
  console.log("Leviathan's Wake Mastery I focused regressions passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
