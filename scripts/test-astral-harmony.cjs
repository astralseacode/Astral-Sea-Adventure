// Run: node scripts/test-astral-harmony.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function prepare(level, sources, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => {
    p.mana = 50;
    if (sources.includes('Fae')) p.stats.fae = 5;
  });
  await f.editState(s => {
    if (sources.includes('Rebound')) s.astralRebound = { offensiveRollModifier: 2 };
    if (sources.includes('Patience')) s.astralPatience = { offensiveRollModifier: 2 };
    if (sources.includes('Awakening')) s.astralAwakening = { offensiveRollModifier: 2 };
    if (sources.includes('Berry')) s.berryEffects = { rollBonuses: { 'Bouncy Berry': 2 } };
  });
  return f;
}

async function attack(f, natural = 10) {
  f.rolls.push(natural, 1);
  return f.attack();
}

async function main() {
  const low = await prepare(27, ['Rebound', 'Patience', 'Awakening']);
  assert(!(await low.c.getActivePerks(27)).some(p => p.id === 'astral-harmony'));
  assert.doesNotMatch((await attack(low)).message, /Astral Harmony/);
  assert.equal((await low.progress()).mana, 50);

  for (const sources of [[], ['Fae'], ['Rebound', 'Patience']]) {
    const f = await prepare(28, sources);
    assert((await f.c.getActivePerks(28)).some(p => p.id === 'astral-harmony'));
    assert.doesNotMatch((await attack(f)).message, /Astral Harmony/);
    assert.equal((await f.progress()).mana, 50);
    assert.equal((await f.state()).perkUses?.['astral-harmony'], undefined);
  }

  for (const platform of ['discord', 'twitch']) {
    const f = await prepare(28, ['Rebound', 'Patience', 'Awakening'], platform);
    const result = await attack(f);
    assert(result.message.includes('Astral Harmony\nRestored 15 Mana'));
    assert.equal(result.message.split('Astral Harmony\nRestored 15 Mana').length - 1, 1);
    assert.equal((await f.progress()).mana, 65);
    assert.equal((await f.state()).perkUses['astral-harmony'], 1);
    await f.editState(s => {
      s.astralRebound = { offensiveRollModifier: 2 };
      s.astralPatience = { offensiveRollModifier: 2 };
      s.astralAwakening = { offensiveRollModifier: 2 };
    });
    assert.doesNotMatch((await attack(f)).message, /Astral Harmony/);
    assert.equal((await f.progress()).mana, 65);
  }

  const four = await prepare(28, ['Fae', 'Rebound', 'Patience', 'Berry']);
  assert.match((await attack(four)).message, /Astral Harmony/);
  assert.equal((await four.progress()).mana, 65);

  const missed = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  assert.doesNotMatch((await attack(missed, 1)).message, /Astral Harmony/);
  assert.equal((await missed.progress()).mana, 50);
  assert.equal((await missed.state()).perkUses?.['astral-harmony'], undefined);

  const spell = await prepare(28, ['Fae', 'Rebound', 'Patience']);
  spell.rolls.push(2, 1);
  assert.match((await spell.cast('star')).message, /Astral Harmony/);
  assert.equal((await spell.progress()).mana, 55); // 50 - 10 + 15.

  const moonbeam = await prepare(28, ['Fae', 'Rebound', 'Patience']);
  moonbeam.rolls.push(10, 3, 3, 4, 1);
  const moonbeamCast = await moonbeam.cast('moonbeam');
  assert.match(moonbeamCast.message, /Astral Harmony/);
  assert.match(moonbeamCast.message, /Lunar Alignment:/);
  assert.equal((await moonbeam.progress()).mana, 45); // 50 - 20 + 15.

  const fallingMiss = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  fallingMiss.rolls.push(1, 1, 1, 1, 1);
  assert.doesNotMatch((await fallingMiss.cast('falling-star')).message, /Astral Harmony/);
  assert.equal((await fallingMiss.state()).perkUses?.['astral-harmony'], undefined);

  const berry = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  berry.rolls.push(1);
  assert.doesNotMatch((await berry.cast('berry')).message, /Astral Harmony/);
  assert.equal((await berry.state()).perkUses?.['astral-harmony'], undefined);

  const full = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  await full.editProgress(p => { p.mana = 100; });
  await attack(full);
  assert.equal((await full.progress()).mana, 100);
  assert.equal((await full.state()).perkUses['astral-harmony'], 1);

  const buffered = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  await buffered.editProgress(p => {
    p.stats.focus = 5; p.restBufferType = 'short'; p.mana = 160;
  });
  await attack(buffered);
  assert.equal((await buffered.progress()).mana, 175);

  const lethal = await prepare(28, ['Rebound', 'Patience', 'Awakening']);
  await lethal.editState(s => { s.enemy.hp = 1; s.enemy.maxHp = 1; });
  lethal.rolls.push(10);
  const victory = await lethal.attack();
  assert.equal(victory.won, true);
  assert.equal(await lethal.state(), null);
  assert.match(victory.message, /Astral Harmony/);

  const fresh = await fixture(28);
  assert.equal((await fresh.state()).perkUses?.['astral-harmony'], undefined);
  console.log('Astral Harmony regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
