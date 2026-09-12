// Run: node scripts/test-astral-patience.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function main() {
  const low = await fixture(21);
  assert(!(await low.c.getActivePerks(21)).some(p => p.id === 'astral-patience'));
  const f = await fixture(22);
  assert((await f.c.getActivePerks(22)).some(p => p.id === 'astral-patience'));
  await f.editProgress(p => { p.hp = 50; });
  await f.editState(s => { s.playerHp = 50; });
  const stim = await f.c.performStim(f.env, f.key, 'discord');
  assert.match(stim.message, /Astral Patience settles over you/);
  assert.equal((await f.state()).astralPatience.offensiveRollModifier, 2);

  // A second qualifying turn keeps the same single charge and omits repeated feedback.
  await f.editProgress(p => { p.mana = 0; });
  const evocation = await f.c.performCastUnlocked(f.env, f.key, 'evocation', 'discord');
  assert.doesNotMatch(evocation.message, /Astral Patience settles over you/);
  assert.equal((await f.state()).astralPatience.offensiveRollModifier, 2);
  const rejected = await f.c.performCastUnlocked(f.env, f.key, 'evocation', 'discord');
  assert.doesNotMatch(rejected.message, /Astral Patience settles over you/);

  // All offensive actions use this shared consumption path, including Wake Turn 1.
  const combat = await f.state();
  for (const natural of [1, 13]) {
    combat.astralPatience = { offensiveRollModifier: 2 };
    const roll = f.c.consumeTriggeredStatusEffects(await f.progress(),
      'next_offensive_d20', natural, combat);
    assert.equal(roll.modifierDetails.find(m => m.name === 'Astral Patience').value, 2);
    assert.equal(combat.astralPatience, undefined);
  }

  await f.editState(s => { s.astralPatience = { offensiveRollModifier: 2 }; });
  f.rolls.push(1, 1);
  const attack = await f.attack();
  assert.match(attack.message, /Critical Miss/);
  assert.match(attack.message, /Astral Patience/);
  assert.equal((await f.state()).astralPatience, undefined);

  const wake = await fixture(22);
  await wake.editState(s => { s.astralPatience = { offensiveRollModifier: 2 }; });
  wake.rolls.push(13, 1);
  const wakeCast = await wake.c.performCastUnlocked(wake.env, wake.key,
    'leviathans-wake', 'discord');
  assert.match(wakeCast.message, /\+2 Astral Patience/);
  assert.equal((await wake.state()).astralPatience, undefined);
  const savedWakeRoll = (await wake.state()).leviathansWake.finalRoll;
  await wake.editProgress(p => { p.hp = 30; });
  await wake.editState(s => { s.playerHp = 30; });
  await wake.c.performStim(wake.env, wake.key, 'discord');
  assert.equal((await wake.state()).astralPatience.offensiveRollModifier, 2);
  assert.equal((await wake.state()).leviathansWake.finalRoll, savedWakeRoll);

  const fresh = await fixture(22);
  assert.equal((await fresh.state()).astralPatience, undefined);
  console.log('Astral Patience regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
