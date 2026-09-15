// Run: node scripts/test-astral-rhythm.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const line = 'two attacks in a row Rhythm Applied! +5 damage';
const dice = {
  star: [3],
  moonbeam: [4, 5, 2, 3],
  jelly: [4],
  falling: [3, 3, 3, 12],
  missedFalling: [3, 3, 3, 1],
  wake: [1],
  attack: [2],
};
async function use(f, name) {
  f.rolls.push(...dice[name]);
  if (name === 'attack') return f.attack();
  return f.cast(name === 'missedFalling' || name === 'falling'
    ? 'falling star' : name);
}
async function sequence(level, names, platform = 'discord') {
  const f = await fixture(level, platform);
  const messages = [];
  for (const name of names) messages.push((await use(f, name)).message);
  return { f, messages, state: await f.state() };
}

(async () => {
  assert(!(await (await fixture(31)).c.getActivePerks(31))
    .some(p => p.id === 'astral-rhythm'));
  assert((await (await fixture(32)).c.getActivePerks(32))
    .some(p => p.id === 'astral-rhythm'));

  for (const names of [
    ['star', 'moonbeam'], ['moonbeam', 'jelly'], ['jelly', 'falling'],
  ]) {
    const low = await sequence(31, names);
    const high = await sequence(32, names);
    assert.equal(low.state.enemy.hp - high.state.enemy.hp, 5, names.join(' → '));
    assert.equal(high.messages[1].split(line).length - 1, 1);
    assert.equal(high.state.perkUses['astral-rhythm'], 1);
  }

  const repeated = await sequence(32, ['moonbeam', 'moonbeam', 'jelly']);
  assert.doesNotMatch(repeated.messages[1], /Rhythm Applied/);
  assert.match(repeated.messages[2], /Rhythm Applied/);
  const attacks = await sequence(32, ['attack', 'attack', 'moonbeam', 'attack', 'jelly']);
  assert.doesNotMatch(attacks.messages.slice(0, 4).join(' '), /Rhythm Applied/);
  assert.equal(attacks.state.perkUses['astral-rhythm'], 1);
  assert.match(attacks.messages[4], /Rhythm Applied/);

  const missed = await sequence(32, ['star', 'missedFalling', 'moonbeam']);
  assert.doesNotMatch(missed.messages[1], /Rhythm Applied/);
  assert.match(missed.messages[2], /Rhythm Applied/);
  for (const support of ['bubble', 'berries', 'stim']) {
    const f = await fixture(32);
    await use(f, 'star');
    if (support === 'stim') {
      await f.editState(s => { s.playerHp = 50; });
      await f.c.performStim(f.env, f.key, 'discord');
    } else if (support === 'berries') {
      await f.cast('berries');
    } else {
      await f.cast('bubble');
    }
    assert.equal((await f.state()).astralRhythmPreviousSpell, 'star-spark');
    assert.match((await use(f, 'moonbeam')).message, /Rhythm Applied/);
  }
  const once = await sequence(32, ['star', 'moonbeam', 'jelly']);
  assert.doesNotMatch(once.messages[2], /Rhythm Applied/);
  await once.f.c.startCombatEncounter(once.f.env, once.f.key,
    once.f.c.getRegionById('moonlit-reef'), 1, once.f.enemy, 'discord');
  assert.equal((await once.f.state()).astralRhythmPreviousSpell, undefined);
  assert.equal((await once.f.state()).perkUses?.['astral-rhythm'], undefined);

  const wake = await sequence(32, ['star', 'wake']);
  assert.match(wake.messages[1], /Rhythm Applied/);
  assert.equal(wake.state.leviathansWake.rhythmBonus, 5);
  assert.equal(wake.state.astralRhythmPreviousSpell, 'leviathans-wake');
  const beforeArrival = wake.state.enemy.hp;
  await use(wake.f, 'attack'); // warning, no arrival yet
  await use(wake.f, 'attack'); // automatic arrival
  assert.equal((await wake.f.state()).astralRhythmPreviousSpell, 'leviathans-wake');
  assert.equal((await wake.f.state()).perkUses['astral-rhythm'], 1);
  assert((await wake.f.state()).enemy.hp < beforeArrival);
  const wakeAlone = await sequence(32, ['wake']);
  await use(wakeAlone.f, 'attack');
  const arrival = await use(wakeAlone.f, 'attack');
  assert.doesNotMatch(arrival.message, /Rhythm Applied/);
  assert.equal((await wakeAlone.f.state()).astralRhythmPreviousSpell,
    'leviathans-wake');

  for (const platform of ['discord', 'twitch']) {
    const result = await sequence(32, ['star', 'moonbeam'], platform);
    assert.equal(result.messages[1].split(line).length - 1, 1);
    assert.doesNotMatch(line, /\p{Extended_Pictographic}/u);
  }

  const baseline = await fixture(31);
  await use(baseline, 'star');
  const hpBeforeMoonbeam = (await baseline.state()).enemy.hp;
  await use(baseline, 'moonbeam');
  const moonbeamDamage = hpBeforeMoonbeam - (await baseline.state()).enemy.hp;
  const lethal = await fixture(32);
  await use(lethal, 'star');
  await lethal.editState(s => { s.enemy.hp = moonbeamDamage + 5; });
  assert.equal((await use(lethal, 'moonbeam')).won, true);
  assert.equal(await lethal.state(), null);
  console.log('Rhythm regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
