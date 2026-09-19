// Run: node scripts/test-astral-expedition.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const line = 'Astral Expedition\n\n' +
  'Faintly you hear "for those who come after" behind a bush.\n\n' +
  '33 offensive rolls reached.\n\n' +
  '33 Star Candies gained | Next offensive roll +3';
async function attack(f, natural = 10) {
  f.rolls.push(natural);
  return f.attack();
}
async function cast(f, name, dice) {
  f.rolls.push(...dice);
  return f.cast(name);
}
async function count(f) {
  return (await f.progress()).astralExpeditionRolls;
}

(async () => {
  const low = await fixture(32);
  assert(!(await low.c.getActivePerks(32)).some(p => p.id === 'astral-expedition'));
  await attack(low);
  assert.equal(await count(low), 0);
  const f = await fixture(33);
  assert((await f.c.getActivePerks(33)).some(p => p.id === 'astral-expedition'));
  assert.equal(await count(f), 0);
  assert.equal((await f.c.getPerkDefinition('astral-expedition')).activationLine, line);
  const firstThirtyTwo = await fixture(33);
  for (let n = 1; n <= 32; n++) {
    assert.doesNotMatch((await attack(firstThirtyTwo, 10)).message,
      /33 offensive rolls reached\./);
    assert.equal(await count(firstThirtyTwo), n);
  }
  await attack(f, 1);
  assert.equal(await count(f), 0);
  await attack(f, 10);
  assert.equal(await count(f), 1);
  await cast(f, 'star', [1]);
  assert.equal(await count(f), 2);
  await cast(f, 'jelly', [1, 1, 1]);
  assert.equal(await count(f), 3);
  await cast(f, 'moonbeam', [4, 5, 2, 3]);
  assert.equal(await count(f), 4);
  await cast(f, 'falling star', [3, 3, 3, 12]);
  assert.equal(await count(f), 5);
  await cast(f, 'falling star', [3, 3, 3, 1]);
  assert.equal(await count(f), 5);

  const wake = await fixture(33);
  await cast(wake, 'wake', [1]);
  assert.equal(await count(wake), 1);
  await attack(wake, 1); // warning
  await attack(wake, 1); // automatic arrival, then forced-miss Attack
  assert.equal(await count(wake), 1);

  for (const platform of ['discord', 'twitch']) {
    const player = await fixture(33, platform);
    await player.editProgress(p => { p.astralExpeditionRolls = 32; });
    const before = await player.c.getBackpackTotal(player.env, player.key);
    const milestone = await attack(player, 10);
    assert.equal(await count(player), 33);
    assert.equal((await player.c.getBackpackTotal(player.env, player.key)) - before, 33);
    assert.equal(milestone.message.split(platform === 'discord'
      ? line.replaceAll(' | ', '\n') : line).length - 1, 1);
    assert.doesNotMatch(line, /successful|\p{Extended_Pictographic}/u);
    assert.doesNotMatch(milestone.message, /\+3 Astral Expedition/);
    assert.equal((await player.progress()).statusEffects.astral_expedition.remainingCharges, 1);
    await player.c.startCombatEncounter(player.env, player.key,
      player.c.getRegionById('moonlit-reef'), 1, player.enemy, platform);
    assert.equal(await count(player), 33);
    const next = await attack(player, 10);
    assert.match(next.message, /\+3 Astral Expedition/);
    assert.equal(await count(player), 34);
    assert.equal((await player.progress()).statusEffects.astral_expedition, undefined);
  }

  for (const milestone of [66, 99]) {
    const player = await fixture(33);
    await player.editProgress(p => { p.astralExpeditionRolls = milestone - 1; });
    const before = await player.c.getBackpackTotal(player.env, player.key);
    assert.match((await attack(player, 10)).message, /33 offensive rolls reached\./);
    assert.equal(await count(player), milestone);
    assert.equal((await player.c.getBackpackTotal(player.env, player.key)) - before, 33);
  }

  const overlapping = await fixture(33);
  await overlapping.editProgress(p => {
    p.astralExpeditionRolls = 65;
    p.statusEffects = overlapping.c.addStatusEffect(p, {
      id: 'astral_expedition', displayName: 'Astral Expedition',
      durationType: 'charges', remainingCharges: 1,
      trigger: 'next_offensive_d20', modifiers: { attackRoll: 3 },
    });
  });
  await attack(overlapping, 10);
  assert.equal(await count(overlapping), 66);
  assert.equal((await overlapping.progress()).statusEffects.astral_expedition.remainingCharges, 1);

  const harmony = await fixture(33);
  await harmony.editProgress(p => { p.astralExpeditionRolls = 32; });
  await attack(harmony, 10);
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  const harmonyRoll = await attack(harmony, 10);
  assert.match(harmonyRoll.message, /\+3 Astral Expedition/);
  assert.equal((await harmony.state()).perkUses['astral-harmony'], 1);

  const forcedMiss = await fixture(33);
  await forcedMiss.editProgress(p => { p.astralExpeditionRolls = 32; });
  await attack(forcedMiss, 10);
  const miss = await attack(forcedMiss, 1);
  assert.match(miss.message, /Critical Miss/);
  assert.equal(await count(forcedMiss), 33);
  assert.equal((await forcedMiss.progress()).statusEffects.astral_expedition, undefined);
  assert.equal((await forcedMiss.state()).perkUses['fae-second-opinion'], 1);

  const old = await fixture(33);
  const progressKey = old.c.getProgressKey(old.key);
  const saved = JSON.parse(old.values.get(progressKey));
  delete saved.astralExpeditionRolls;
  old.values.set(progressKey, JSON.stringify(saved));
  assert.equal(await count(old), 0);

  const victory = await fixture(33);
  await attack(victory, 10);
  await victory.editState(s => { s.enemy.hp = 1; s.enemy.maxHp = 1; });
  assert.equal((await attack(victory, 10)).won, true);
  assert.equal(await victory.state(), null);
  assert.equal(await count(victory), 2);

  const defeat = await fixture(33);
  await attack(defeat, 10);
  await defeat.editState(s => { s.playerHp = 1; s.enemy.damageBonus = 100; });
  defeat.rolls.push(10, 20);
  await defeat.attack();
  assert.equal(await defeat.state(), null);
  assert.equal(await count(defeat), 2);
  console.log('Astral Expedition regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
