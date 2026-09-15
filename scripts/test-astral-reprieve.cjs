// Run: node scripts/test-astral-reprieve.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const activation = 'No Stims Used - Reprieve +30 Mana';
const unlock = 'lvl 38 Passive ✨ Reprieve: Defeating an enemy without using Stim during the battle restores 30 Mana.';

async function victory(level, mana = 0, hp = 100, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => { p.mana = mana; });
  await f.editState(s => { s.enemy.hp = 1; s.playerHp = hp; });
  f.rolls.push(2);
  return { f, result: await f.attack(), progress: await f.progress() };
}

(async () => {
  const data = await (await fixture(38)).c.getPerkDefinition('astral-reprieve');
  assert.equal(data.levelUpLine, unlock);
  assert.equal(data.activationLine, activation);
  const low = await victory(37);
  assert.doesNotMatch(low.result.message, /Reprieve/);
  assert.equal(low.progress.mana, 20);
  const normal = await victory(38);
  assert.equal(normal.result.message.split(activation).length - 1, 1);
  assert.match(normal.result.message, /Harvest activates!/);
  assert.equal(normal.progress.mana, 50);
  assert.equal(await normal.f.state(), null);
  const high = await victory(39);
  assert.match(high.result.message, /No Stims Used - Reprieve \+30 Mana/);
  const spell = await fixture(38);
  await spell.editProgress(p => { p.mana = 100; });
  await spell.editState(s => { s.enemy.hp = 25; });
  spell.rolls.push(2);
  const spellWin = await spell.cast('all or nothing');
  assert.match(spellWin.message, /No Stims Used - Reprieve \+30 Mana/);
  assert.equal(await spell.state(), null);

  const stacked = await victory(38, 0, 20);
  assert.match(stacked.result.message, /Defiance activates!/);
  assert.equal(stacked.progress.hp, 55);
  assert.equal(stacked.progress.mana, 70);
  const capped = await victory(38, 90);
  assert.equal(capped.progress.mana, 100);
  assert.match(capped.result.message, /No Stims Used - Reprieve \+30 Mana/);
  const full = await victory(38, 100);
  assert.equal(full.progress.mana, 100);
  assert.match(full.result.message, /No Stims Used - Reprieve \+30 Mana/);

  const rejected = await fixture(38);
  await rejected.editProgress(p => { p.mana = 0; });
  assert.match((await rejected.c.performStim(rejected.env, rejected.key, 'discord')).message,
    /already at full HP/);
  assert.equal((await rejected.state()).stimUses, 0);
  await rejected.editState(s => { s.enemy.hp = 1; });
  rejected.rolls.push(2);
  assert.match((await rejected.attack()).message, /No Stims Used - Reprieve \+30 Mana/);

  const used = await fixture(38);
  await used.editProgress(p => { p.mana = 0; });
  await used.editState(s => { s.playerHp = 50; });
  assert.match((await used.c.performStim(used.env, used.key, 'discord')).message,
    /Stim used for this battle/);
  assert.equal((await used.state()).stimUses, 1);
  assert.match((await used.c.performStim(used.env, used.key, 'discord')).message,
    /already used your Stim/);
  await used.editState(s => { s.enemy.hp = 1; });
  used.rolls.push(2);
  assert.doesNotMatch((await used.attack()).message, /Reprieve/);
  await used.editProgress(p => { p.mana = 0; });
  await used.c.startCombatEncounter(used.env, used.key,
    used.c.getRegionById('moonlit-reef'), 1, used.enemy, 'discord');
  await used.editState(s => { s.enemy.hp = 1; });
  used.rolls.push(2);
  assert.match((await used.attack()).message, /No Stims Used - Reprieve \+30 Mana/);

  const buffered = await fixture(38);
  await buffered.editProgress(p => {
    p.stats.focus = 5;
    p.restBufferType = 'short';
    p.mana = 165;
  });
  await buffered.editState(s => { s.enemy.hp = 1; s.playerMaxHp = 999; });
  buffered.rolls.push(2);
  assert.match((await buffered.attack()).message, /No Stims Used - Reprieve \+30 Mana/);
  assert.equal((await buffered.progress()).mana, 175);

  const twitch = await victory(38, 0, 100, 'twitch');
  assert.match(twitch.result.message, /No Stims Used - Reprieve \+30 Mana/);
  const levelUp = await fixture(37);
  await levelUp.editProgress(p => {
    p.xp = levelUp.c.totalXpForLevel(38) - 1;
  });
  await levelUp.editState(s => { s.enemy.hp = 1; });
  levelUp.rolls.push(2);
  const notice = await levelUp.attack();
  assert(notice.message.includes(unlock));
  assert.doesNotMatch(notice.message, /No Stims Used - Reprieve/);
  assert.equal((await levelUp.c.formatLevelUpUnlocks(37, 38)).join('\n'), unlock);
  console.log('Reprieve regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
