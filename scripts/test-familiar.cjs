// Run: node scripts/test-familiar.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

function pair(total) {
  return total <= 7 ? [1, total - 1] : [total - 6, 6];
}
async function summon(f, total, intro = 0) {
  f.rolls.push(...pair(total), intro);
  return f.cast('familiar');
}
async function attack(f, natural = 10) {
  f.rolls.push(natural, 1);
  return f.attack();
}

async function main() {
  const low = await fixture(29);
  assert.match((await low.cast('familiar')).message, /Reach Level 30/);
  const content = await (await fixture(30)).c.getSpellDefinition('familiar');
  assert.equal(content.familiars.length, 11);
  assert(!JSON.stringify(content).includes('Glimmer'));
  for (let total = 2; total <= 12; total++) {
    const f = await fixture(30);
    await f.editProgress(p => { p.hp = 50; });
    await f.editState(s => { s.playerHp = 50; });
    const cast = await summon(f, total);
    const creature = content.familiars[total - 2];
    assert(cast.message.includes(creature.intros[0]));
    assert.equal((await f.state()).familiar.id, creature.id);
    assert.equal((await f.state()).familiar.actions, 0);
    assert.equal((await f.state()).round, 1);
    assert.equal((await f.state()).enemy.hp, 1000);
    assert.equal((await f.progress()).mana, 70);
    assert.deepEqual(f.randomCalls, [[1, 6], [1, 6], [0, 2]]);
    const calls = f.randomCalls.length;
    assert.match((await f.cast('familiar')).message, /already have an active Familiar/);
    assert.equal(f.randomCalls.length, calls);
    assert.equal((await f.progress()).mana, 70);
    assert.equal((await f.state()).familiar.actions, 0);
    const result = await attack(f);
    assert(result.message.includes(creature.name));
    assert.equal((await f.state()).familiar.actions, 1);
    assert.equal((await f.state()).enemy.hp, 990 - (creature.effect.damage || 0));
    assert.equal((await f.state()).playerHp, 50 + (creature.effect.hp || 0));
    assert.equal((await f.progress()).mana, 70 + (creature.effect.mana || 0));
    if (creature.effect.protection) {
      assert.equal((await f.state()).familiarProtection[0].amount,
        creature.effect.protection);
      assert.equal((await f.state()).bubble, undefined);
    }
  }

  const lifecycle = await fixture(30);
  await summon(lifecycle, 7);
  const creature = content.familiars[5];
  for (let action = 1; action <= 5; action++) {
    const result = await attack(lifecycle);
    if (action < 5) assert.equal((await lifecycle.state()).familiar.actions, action);
    else assert.equal((await lifecycle.state()).familiar, undefined);
    const line = { 2: creature.action2, 3: creature.action3,
      4: creature.action4, 5: creature.outro }[action];
    if (line) assert(result.message.includes(line));
    else assert.doesNotMatch(result.message, /The Moon Sprite happily continues/);
  }

  const missed = await fixture(30);
  await summon(missed, 2);
  missed.rolls.push(1, 0, 1); // Fae Second Opinion scene follows the failed Attack.
  const failed = await missed.attack();
  assert.match(failed.message, /Critical Miss/);
  assert.match(failed.message, /Fae Second Opinion Activates/);
  assert.equal((await missed.state()).familiar.actions, 1);
  assert.equal((await missed.state()).enemy.hp, 990);

  const wake = await fixture(30);
  await summon(wake, 7);
  wake.rolls.push(2, 1);
  await wake.cast('wake');
  assert.equal((await wake.state()).familiar.actions, 1);
  assert.equal((await wake.state()).leviathansWake.stage, 1);
  wake.rolls.push(1, 1);
  await wake.attack();
  assert.equal((await wake.state()).familiar.actions, 2);
  wake.rolls.push(1, 1);
  await wake.attack();
  assert.equal((await wake.state()).familiar.actions, 3);

  const missedSpell = await fixture(30);
  await summon(missedSpell, 2);
  missedSpell.rolls.push(1, 2, 3, 1, 0, 1);
  await missedSpell.cast('falling-star');
  assert.equal((await missedSpell.state()).familiar.actions, 1);
  assert.equal((await missedSpell.state()).enemy.hp, 990);

  const support = await fixture(30);
  await summon(support, 7);
  support.rolls.push(1);
  await support.cast('berry');
  assert.equal((await support.state()).familiar.actions, 0);
  support.rolls.push(1, 1);
  await support.cast('bubble');
  assert.equal((await support.state()).familiar.actions, 0);
  await support.c.performStim(support.env, support.key, 'discord');
  assert.equal((await support.state()).familiar.actions, 0);

  const bufferedHp = await fixture(30);
  await summon(bufferedHp, 4);
  await bufferedHp.editProgress(p => {
    p.stats.vitality = 5; p.restBufferType = 'short'; p.hp = 160;
  });
  await bufferedHp.editState(s => { s.playerHp = 160; s.playerMaxHp = 175; });
  await attack(bufferedHp);
  assert.equal((await bufferedHp.state()).playerHp, 168);

  const bufferedMana = await fixture(30);
  await summon(bufferedMana, 5);
  await bufferedMana.editProgress(p => {
    p.stats.focus = 5; p.restBufferType = 'short'; p.mana = 170;
  });
  await attack(bufferedMana);
  assert.equal((await bufferedMana.progress()).mana, 175);

  const protection = await fixture(30);
  await summon(protection, 6);
  await attack(protection);
  assert.equal((await protection.state()).familiarProtection[0].max, 40);
  protection.rolls.push(1, 0, 6);
  await protection.attack();
  assert.equal((await protection.state()).familiarProtection[0].amount <= 40, true);

  const maximumProtection = await fixture(30);
  await summon(maximumProtection, 6);
  for (let action = 0; action < 5; action++) await attack(maximumProtection);
  assert.equal((await maximumProtection.state()).familiarProtection[0].amount, 40);
  assert.equal((await maximumProtection.state()).familiar, undefined);

  const lethal = await fixture(30);
  await summon(lethal, 2);
  await lethal.editState(s => { s.enemy.hp = 10; s.enemy.maxHp = 10; });
  lethal.rolls.push(1, 0);
  const victory = await lethal.attack();
  assert.equal(victory.won, true);
  assert.equal(await lethal.state(), null);

  for (const platform of ['discord', 'twitch']) {
    for (const creature of content.familiars) {
      for (let intro = 0; intro < 3; intro++) {
        const f = await fixture(30, platform);
        const result = await summon(f, creature.total, intro);
        assert(result.message.includes(creature.intros[intro]));
      }
      assert.equal(creature.intros.length, 3);
      assert([creature.action2, creature.action3, creature.action4,
        creature.outro].every(line => typeof line === 'string' && line.length > 0));
    }
  }
  console.log('Familiar regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
