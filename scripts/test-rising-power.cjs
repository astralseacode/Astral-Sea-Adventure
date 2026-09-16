// Run: node scripts/test-rising-power.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');
const fs = require('node:fs');
const path = require('node:path');
const { runtime, spellOptions } = require('./test-free-tier.cjs');

const unlock = 'lvl 42 Passive 🌊 Rising Power: Successfully damaging an enemy with a different offensive spell than your previous damaging spell builds Rising Power. Each step in the chain grants +2 damage to the next different offensive spell, up to +6 damage. Repeating the same offensive spell resets Rising Power.';

async function cast(f, name, rolls) {
  await f.editProgress(p => { p.mana = 100; });
  f.rolls.push(...rolls, 1);
  const result = await f.cast(name);
  assert(!result.message.includes('🌊'), 'Combat receipt must not contain the category emoji');
  return result;
}
const moonbeam = f => cast(f, 'moonbeam', [8, 10, 1, 2]);
const star = f => cast(f, 'falling star', [1, 3, 5, 10]);
const tidal = f => cast(f, 'tidal', [12, 2, 1]);
const spark = f => cast(f, 'star', [10]);

(async () => {
  const low = await fixture(41);
  assert.equal((await low.c.getPerkDefinition('rising-power')).levelUpLine, unlock);
  assert.equal((await low.c.formatLevelUpUnlocks(41, 42)).join('\n'), unlock);
  assert.equal((await low.c.formatPerkUnlocks(41, 42)).join('\n'), unlock);
  assert(!(await low.c.getActivePerks(41)).some(p => p.id === 'rising-power'));
  await moonbeam(low);
  assert.equal((await low.state()).risingPower, undefined);

  const f = await fixture(42);
  const first = await moonbeam(f);
  assert(!first.message.includes('Rising Power:'));
  assert.equal((await f.state()).risingPower.steps, 0);
  const afterFirstHp = (await f.state()).enemy.hp;
  const second = await star(f);
  assert.match(second.message, /Rising Power: \+2 damage/);
  assert.match(second.message, /Rhythm Applied! \+5 damage/);
  assert.equal((await f.state()).risingPower.steps, 1);
  assert.equal(afterFirstHp - (await f.state()).enemy.hp, 16); // 9 Power + 5 Rhythm + 2 Rising.
  const afterSecondHp = (await f.state()).enemy.hp;
  const third = await tidal(f);
  assert.match(third.message, /Rising Power: \+4 damage/);
  assert.equal((await f.state()).risingPower.steps, 2);
  assert.equal(afterSecondHp - (await f.state()).enemy.hp, 54); // 50 base + 4 Rising.
  const fourth = await spark(f);
  assert.match(fourth.message, /Rising Power: \+6 damage/);
  assert.equal((await f.state()).risingPower.steps, 3);
  assert.match((await moonbeam(f)).message, /Rising Power: \+6 damage/);
  assert.equal((await f.state()).risingPower.steps, 3);
  const reset = await moonbeam(f);
  assert.match(reset.message, /Rising Power resets\./);
  assert(!reset.message.includes('Rising Power: +'));
  assert.equal((await f.state()).risingPower.steps, 0);
  assert.match((await star(f)).message, /Rising Power: \+2 damage/);

  const support = await fixture(42);
  await moonbeam(support);
  await support.editState(s => { s.playerHp = 50; });
  await support.editProgress(p => { p.hp = 50; });
  await cast(support, 'mend', [6]);
  assert.equal((await support.state()).risingPower.spellId, 'moonbeam');
  assert.match((await star(support)).message, /Rising Power: \+2 damage/);

  const miss = await fixture(42);
  await moonbeam(miss);
  await cast(miss, 'falling star', [2, 2, 3, 1]);
  assert.equal((await miss.state()).risingPower.spellId, 'moonbeam');
  assert.equal((await miss.state()).risingPower.steps, 0);
  assert.match((await tidal(miss)).message, /Rising Power: \+2 damage/);

  const power = await fixture(42);
  await moonbeam(power);
  const meteor = await cast(power, 'falling star', [2, 2, 3, 10]);
  assert.match(meteor.message, /Adjusted Power 32/);
  assert.match(meteor.message, /Rising Power: \+2 damage/);

  const tide = await fixture(42);
  await moonbeam(tide);
  const wave = await cast(tide, 'tidal', [12, 1, 1]);
  assert.match(wave.message, /Rising Tide → 40 base dmg/);
  assert.match(wave.message, /Rising Power: \+2 damage/);
  const oldTide = await fixture(40);
  assert(!((await tidal(oldTide)).message.includes('Rising Power:')));
  const oldMeteor = await fixture(41);
  assert(!((await star(oldMeteor)).message.includes('Rising Power:')));

  const victory = await fixture(42);
  await moonbeam(victory);
  await victory.editState(s => { s.enemy.hp = 1; });
  await star(victory);
  assert.equal(await victory.state(), null);
  await victory.c.startCombatEncounter(victory.env, victory.key,
    victory.c.getRegionById('moonlit-reef'), 1, victory.enemy, 'discord');
  assert.equal((await victory.state()).risingPower, undefined);

  // Verify actual generated Discord/Twitch receipts, not just source helpers.
  const bundled = fs.readFileSync(path.join(__dirname, '../dist/worker.js'), 'utf8');
  for (const twitch of [false, true]) {
    const artifact = await runtime(bundled);
    await artifact.editProgress(p => { p.xp = artifact.c.totalXpForLevel(42); });
    await artifact.editState(s => { s.risingPower = {spellId:'star-spark',steps:0}; });
    artifact.rolls.push(8, 10, 1, 2, 1);
    const content = twitch
      ? (await artifact.c.performCast(artifact.env,artifact.key,'moonbeam','twitch')).message
      : (await artifact.run('cast',spellOptions('moonbeam'))).content;
    assert.match(content, /Rising Power: \+2 damage/);
    assert(!content.includes('🌊'));
    assert.equal((await artifact.state()).risingPower.steps, 1);
    assert((await artifact.c.getPerkDefinition('rising-power')).levelUpLine.includes('🌊'));
    assert((await artifact.c.formatLevelUpUnlocks(41,42)).join('').includes('🌊 Rising Power'));
  }
  console.log('Rising Power regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
