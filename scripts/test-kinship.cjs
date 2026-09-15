// Run: node scripts/test-kinship.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture: baseFixture } = require('./test-leviathans-wake.cjs');

async function fixture(level, platform) {
  const f = await baseFixture(level, platform);
  // Isolate Kinship's Mana from Awakening's fifth-survived-hit reward.
  await f.editState(s => { s.perkUses = { 'astral-awakening': 1 }; });
  return f;
}

async function summon(f, dice = [1, 1]) {
  f.rolls.push(...dice, 0);
  return f.cast('familiar');
}
async function attack(f, natural = 10) {
  f.rolls.push(natural, 1);
  return f.attack();
}

async function main() {
  const lower = await fixture(30);
  assert(!(await lower.c.getActivePerks(30)).some(p => p.id === 'kinship'));
  await summon(lower);
  for (let n = 0; n < 5; n++) {
    assert.doesNotMatch((await attack(lower)).message, /Kinship/);
  }
  assert.equal((await lower.progress()).mana, 70);
  assert.equal((await lower.state()).familiar, undefined);

  for (const platform of ['discord', 'twitch']) {
    const f = await fixture(31, platform);
    const kinship = await f.c.getPerkDefinition('kinship');
    assert((await f.c.getActivePerks(31)).some(p => p.id === 'kinship'));
    await summon(f);
    assert.equal((await f.progress()).mana, 70);
    assert.equal((await f.state()).familiar.actions, 0);
    for (let n = 1; n <= 4; n++) {
      const action = await attack(f);
      assert.doesNotMatch(action.message, /Kinship/);
      assert.equal((await f.state()).familiar.actions, n);
      assert.equal((await f.progress()).mana, 70);
    }
    const fifth = await attack(f);
    const outro = (await f.c.getSpellDefinition('familiar')).familiars[0].outro;
    assert(fifth.message.includes(outro + '\n\n' + kinship.activationLine));
    assert.equal(fifth.message.split(kinship.activationLine).length - 1, 1);
    assert.equal((await f.progress()).mana, 85);
    assert.equal((await f.state()).familiar, undefined);
    assert.equal((await f.state()).round, 6);
    assert.doesNotMatch((await attack(f)).message, /Kinship/);
    assert.equal((await f.progress()).mana, 85);
  }

  const capped = await fixture(31);
  await summon(capped, [1, 4]); // Moonlit Bird restores Mana on each action.
  await capped.editProgress(p => { p.mana = 100; });
  for (let n = 0; n < 4; n++) await attack(capped);
  const full = await attack(capped);
  assert.match(full.message, /Kinship\n\nAs your Familiar leaves/);
  assert.equal((await capped.progress()).mana, 100);

  const buffered = await fixture(31);
  await summon(buffered);
  for (let n = 0; n < 4; n++) await attack(buffered);
  await buffered.editProgress(p => {
    p.stats.focus = 5; p.restBufferType = 'short'; p.mana = 160;
  });
  await attack(buffered);
  assert.equal((await buffered.progress()).mana, 175);

  for (let completed = 0; completed <= 4; completed++) {
    const early = await fixture(31);
    await summon(early);
    for (let n = 0; n < completed; n++) await attack(early);
    await early.editState(s => { s.enemy.hp = 1; s.enemy.maxHp = 1; });
    early.rolls.push(10);
    const victory = await early.attack();
    assert.equal(victory.won, true);
    assert.doesNotMatch(victory.message, /Kinship/);
    assert.equal(await early.state(), null);
  }

  const familiarKill = await fixture(31);
  await summon(familiarKill);
  for (let n = 0; n < 4; n++) await attack(familiarKill);
  await familiarKill.editState(s => { s.enemy.hp = 10; s.enemy.maxHp = 10; });
  familiarKill.rolls.push(1, 0); // Player misses; Familiar deals the final 10.
  const lethal = await familiarKill.attack();
  assert.equal(lethal.won, true);
  assert.match(lethal.message, /Kinship\n\nAs your Familiar leaves/);
  assert.equal(await familiarKill.state(), null);

  const fresh = await fixture(31);
  assert.equal((await fresh.state()).familiar, undefined);
  console.log('Kinship regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
