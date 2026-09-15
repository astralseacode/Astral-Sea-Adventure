// Run: node scripts/test-level-up-unlocks.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

const level35 = "lvl 35 Spell 🎲 All or Nothing: Cast All or Nothing for 20 Mana and roll 1d2. Roll 1 to deal no damage. Roll 2 to deal 25 damage + Strength. Each consecutive 2 increases the next All or Nothing's damage by 25. Rolling 1 resets the streak.";
const level36 = 'lvl 36 Passive ⭐ Defiance: Defeating an enemy while at or below 25% HP restores 20 HP and 20 Mana.';
const level37 = "lvl 37 Mastery 🌊 Leviathan's Wake Mastery I: The creatures summoned by Leviathan's Wake now leave an additional effect when they arrive. Wakefin restores 5 Mana, Manta grants 5 protection, Serpent deals +5 damage, Leviathan deals +10 damage and restores 5 Mana, and Ancient Leviathan deals +20 damage and restores 10 Mana.";

(async () => {
  const f = await fixture(37);
  assert.equal((await f.c.formatLevelUpUnlocks(34, 35)).join('\n'), level35);
  assert.equal((await f.c.formatLevelUpUnlocks(35, 36)).join('\n'), level36);
  assert.equal((await f.c.formatLevelUpUnlocks(36, 37)).join('\n'), level37);
  const crossed = await f.c.formatLevelUpUnlocks(34, 37);
  assert.equal(crossed.join('\n'), [level35, level36, level37].join('\n'));
  assert(crossed.join(' | ').length < 2000);
  assert.equal((await f.c.formatLevelUpUnlocks(37, 37)).length, 0);
  for (const [target, expected] of [
    [35, level35], [36, level36], [37, level37],
  ]) {
    const winner = await fixture(target - 1);
    await winner.editProgress(p => {
      p.xp = winner.c.totalXpForLevel(target) - 1;
    });
    await winner.editState(s => { s.enemy.hp = 1; });
    winner.rolls.push(2);
    const victory = await winner.attack();
    assert(victory.message.includes(expected));
    assert.equal(victory.message.split(expected).length - 1, 1);
  }

  f.c.Response = Response;
  f.c.URL = URL;
  const worker = vm.runInContext('workerExport', f.c);
  const response = await worker.fetch(
    new Request('https://local.test/discord/schema'), f.env,
  );
  const schema = await response.json();
  assert.equal(response.status, 200);
  assert.equal(schema.filter(command => command.name === 'progression').length, 0);
  const cast = schema.find(command => command.name === 'cast');
  assert(cast);
  const spell = cast.options.find(option => option.name === 'spell');
  assert(spell);
  assert.equal(spell.choices.length, 15);
  assert.equal(spell.choices.filter(choice => choice.name === 'Conjure Gun').length, 1);
  assert.equal(spell.choices.find(choice => choice.name === 'Conjure Gun').value,
    'conjure-gun');
  assert.equal(spell.choices.filter(choice => choice.name === 'Tidal Wave').length, 1);
  assert.equal(spell.choices.find(choice => choice.name === 'Tidal Wave').value,
    'tidal-wave');
  assert.equal(spell.choices.filter(choice => choice.name === 'All or Nothing').length, 1);
  assert.equal(spell.choices.find(choice => choice.name === 'All or Nothing').value,
    'all-or-nothing');
  for (const name of ['Star Spark', 'Jelly', 'Moonbeam', "Leviathan's Wake", 'Familiar']) {
    assert(spell.choices.some(choice => choice.name === name));
  }
  assert(spell.choices.length <= 25);
  const source = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');
  assert(!source.includes('case "progression"'));
  assert(!source.includes('formatProgressionForPlayer'));
  assert(!source.includes('!progression'));
  const twitch = await f.c.handleTwitchRequest(
    new URL('https://local.test/?user=viewer&action=progression'), f.env,
  );
  assert.equal(twitch.status, 400);
  assert.equal(await twitch.text(), 'Unknown command.');
  console.log('Level-up unlock and Discord schema regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
