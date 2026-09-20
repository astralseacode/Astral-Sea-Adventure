// Run: node scripts/test-fae-mischief.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = 'lvl 47 Passive 🌿 Fae Mischief: Once per battle, when a natural spell roll is one die away from completing a powerful dice pattern, the Fae may change that die after it lands to complete the pattern.';

async function castWith(f, spell, rolls) {
  f.rolls.push(...rolls, 1);
  return f.cast(spell);
}

(async () => {
  const locked = await fixture(46);
  assert.equal((await locked.c.formatLevelUpUnlocks(46, 47)).join('\n'), unlock);
  assert(!(await locked.c.getActivePerks(46)).some(p => p.id === 'fae-mischief'));
  const lockedResult = await castWith(locked, 'jelly', [7, 5, 7]);
  assert(!lockedResult.message.includes('Fae Mischief!'));

  for (const [dice, resolved] of [
    [[7, 5, 7], '7 + 7 + 7'],
    [[2, 2, 6], '2 + 2 + 2'],
    [[4, 8, 8], '8 + 8 + 8'],
  ]) {
    const f = await fixture(47);
    const result = await castWith(f, 'jelly', dice);
    assert.match(result.message, /Fae Mischief!/);
    assert(result.message.includes(`Original Perfect Jellyfish: ${dice.join(' + ')}`));
    assert(result.message.includes(`Resolved Perfect Jellyfish: ${resolved}`));
    assert.match(result.message, /Perfect Jellyfish!/);
    assert.match(result.message, /Curiosity activates! All three dice/);
    assert.equal((await f.state()).perkUses['fae-mischief'], 1);
  }

  const jellyLegacy = await fixture(47);
  await jellyLegacy.editProgress(p => { p.hp = 50; p.mana = 50; });
  await jellyLegacy.editState(s => { s.playerHp = 50; });
  let jellyAction;
  const resolveJellyAction = jellyLegacy.c.resolvePlayerCombatAction;
  jellyLegacy.c.resolvePlayerCombatAction = async (...args) => {
    jellyAction = args[3];
    return resolveJellyAction(...args);
  };
  jellyLegacy.rolls.push(1, 1, 2, 0, 0, 1);
  const jellyLegacyResult = await jellyLegacy.cast('jelly');
  assert.match(jellyLegacyResult.message, /Original Perfect Jellyfish: 1 \+ 1 \+ 2/);
  assert.match(jellyLegacyResult.message, /Resolved Perfect Jellyfish: 1 \+ 1 \+ 1/);
  assert.deepEqual(Array.from(jellyAction.curiosityDice), [1, 1, 1]);
  assert.equal(jellyAction.legacyEffect.type, 'perfect-jellyfish');
  assert.equal(jellyAction.damage - jellyAction.legacyEffect.damage, 3);
  assert.equal(jellyAction.legacyEffect.damage, 20);
  assert.equal(jellyAction.damage, 23);
  assert.match(jellyLegacyResult.message, /\+20 damage\nRestored 20 HP \+ 20 Mana/);
  assert.equal((await jellyLegacy.state()).playerHp, 80);
  assert.equal((await jellyLegacy.progress()).mana, 90);
  assert.equal(await jellyLegacy.c.getBackpackTotal(jellyLegacy.env, jellyLegacy.key), 100);

  for (const dice of [[20, 14], [14, 20]]) {
    const f = await fixture(47);
    const result = await castWith(f, 'moonbeam', [...dice, 1, 2]);
    assert(result.message.includes(`Original Full Moon: ${dice.join(' + ')}`));
    assert(result.message.includes('Resolved Full Moon: 20 + 20'));
    assert.equal((result.message.match(/FULL MOON/g) || []).length, 1);
    assert.equal((result.message.match(/\+75 Full Moon Damage/g) || []).length, 1);
  }
  const noMoon = await fixture(47);
  assert(!((await castWith(noMoon, 'moonbeam', [19, 14, 1, 2])).message
    .includes('Resolved Full Moon')));

  const meteor = await fixture(47);
  const meteorResult = await castWith(meteor, 'falling star', [8, 8, 3, 10]);
  assert.match(meteorResult.message, /Original Meteor Alignment triples: 8 \+ 8 \+ 3/);
  assert.match(meteorResult.message, /Resolved Meteor Alignment triples: 8 \+ 8 \+ 8/);
  assert.match(meteorResult.message, /Triples \+20 Power/);
  assert.match(meteorResult.message, /Accuracy 10/);

  const lunar = await fixture(47);
  const lunarResult = await castWith(lunar, 'moonbeam', [12, 14, 3, 5]);
  assert.match(lunarResult.message, /Original Lunar Alignment: 3 \+ 5/);
  assert.match(lunarResult.message, /Resolved Lunar Alignment: 3 \+ 3/);
  assert.match(lunarResult.message, /Lunar Alignment:/);

  const priority = await fixture(47);
  const priorityResult = await castWith(priority, 'moonbeam', [20, 14, 3, 5]);
  assert.match(priorityResult.message, /Resolved Full Moon: 20 \+ 20/);
  assert(!priorityResult.message.includes('Original Lunar Alignment'));

  const once = await fixture(47);
  await castWith(once, 'jelly', [2, 2, 6]);
  const second = await castWith(once, 'moonbeam', [20, 14, 1, 2]);
  assert(!second.message.includes('Fae Mischief!'));
  assert(!second.message.includes('FULL MOON'));
  await once.c.startCombatEncounter(once.env, once.key,
    once.c.getRegionById('moonlit-reef'), 1, once.enemy, once.platform);
  const reset = await castWith(once, 'jelly', [3, 3, 5]);
  assert.match(reset.message, /Fae Mischief!/);

  for (const [spell, rolls] of [
    ['conjure gun', Array(140).fill(1)],
    ['conjure gun', Array(140).fill(0)],
    ['all or nothing', [1]],
    ['tidal', [4, 4, 6]],
    ['jelly', [1, 2, 4]],
  ]) {
    const f = await fixture(47);
    const result = await castWith(f, spell, rolls);
    assert(!result.message.includes('Fae Mischief!'), spell);
    assert.equal((await f.state()).perkUses?.['fae-mischief'], undefined);
  }

  const unchangedAccuracy = await fixture(47);
  await unchangedAccuracy.editProgress(p => { p.stats.fae = 3; });
  const miss = await castWith(unchangedAccuracy, 'falling star', [8, 8, 3, 1]);
  assert.match(miss.message, /Accuracy 4 \(1\+3 Fae\) → Miss/);

  console.log('Fae Mischief regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
