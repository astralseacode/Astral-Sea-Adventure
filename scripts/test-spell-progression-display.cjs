// Run: node scripts/test-spell-progression-display.cjs. Local data and KV only.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

const level37 = "lvl 37 Mastery 🌊 Leviathan's Wake Mastery I: The creatures summoned by Leviathan's Wake now leave an additional effect when they arrive. Wakefin restores 5 Mana, Manta grants 5 protection, Serpent deals +5 damage, Leviathan deals +10 damage and restores 5 Mana, and Ancient Leviathan deals +20 damage and restores 10 Mana.";

(async () => {
  const f34 = await fixture(34);
  const f35 = await fixture(35);
  const f36 = await fixture(36);
  const f37 = await fixture(37);
  const f38 = await fixture(38);
  const commands = vm.runInContext('DISCORD_COMMANDS', f35.c);
  const cast = commands.find(command => command.name === 'cast');
  const choices = cast.options[0].choices;
  assert.equal(choices.filter(choice => choice.name === 'All or Nothing').length, 1);
  assert.equal(choices.find(choice => choice.name === 'All or Nothing').value,
    'all-or-nothing');
  assert.equal(commands.filter(command => command.name === 'progression').length, 1);

  assert.match((await f35.cast('')).message, /All or Nothing/);
  assert.match((await f35.cast('allornothing')).message, /Roll [12] →/);
  assert.match((await f34.cast('all or nothing')).message, /Reach Level 35/);
  assert.match((await f35.cast('all or nothing')).message, /Roll [12] →/);
  assert.match((await f36.cast('all or nothing')).message, /Roll [12] →/);

  const show = (f, input = null, platform = 'discord') =>
    f.c.formatProgressionForPlayer(f.env, f.key, input, platform);
  assert.doesNotMatch((await show(f36)).message, /Leviathan's Wake Mastery I/);
  assert.equal((await show(f36, 37)).message, 'Level 37 is not unlocked yet.');
  assert.equal((await show(f37)).message, level37);
  assert.equal((await show(f38)).message, level37);
  assert.equal((await show(f38, 37, 'twitch')).message, level37);
  f37.c.Response = Response;
  await f37.env.Backpack.put(
    f37.c.getProgressKey('backpack:viewer'),
    await f37.env.Backpack.get(f37.c.getProgressKey(f37.key)),
  );
  const progressionRoute = await f37.c.handleTwitchRequest(
    new URL('https://local.test/?user=viewer&action=progression&args=37'),
    f37.env,
  );
  assert.equal(progressionRoute.status, 200);
  assert.equal(await progressionRoute.text(), level37);
  const fallbackRoute = await f37.c.handleTwitchRequest(
    new URL('https://local.test/?user=viewer&action=unknown'), f37.env,
  );
  assert.equal(fallbackRoute.status, 200);
  assert.equal(await fallbackRoute.text(), level37);
  assert.equal((await show(f37, 37)).message.split(level37).length - 1, 1);
  assert.equal((await show(f37, 36)).message.includes('Astral Defiance'), true);
  assert.equal((await show(f37, 35)).message.includes('All or Nothing'), true);
  assert.equal((await show(f37, 34)).message.includes('Astral Echo Mastery I'), true);
  for (let level = 1; level <= 36; level++) {
    const entry = (await show(f37, level)).message;
    assert(entry.length <= 2000, `Level ${level} exceeds Discord's message limit`);
    assert(!entry.includes(level37), `Level 37 leaked into Level ${level}`);
  }
  assert((await f37.c.getActiveMasteries(37)).some(m =>
    m.id === 'leviathans-wake-mastery-1'));
  assert(!(await f36.c.getActiveMasteries(36)).some(m =>
    m.id === 'leviathans-wake-mastery-1'));
  console.log('Spell and progression display regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
