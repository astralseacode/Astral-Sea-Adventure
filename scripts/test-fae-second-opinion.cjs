// Run: node scripts/test-fae-second-opinion.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function main() {
  const lower = await fixture(28);
  assert(!(await lower.c.getActivePerks(28)).some(p => p.id === 'fae-second-opinion'));
  lower.rolls.push(1, 1);
  assert.doesNotMatch((await lower.attack()).message, /Fae Second Opinion Activates/);

  const f = await fixture(29);
  const perk = await f.c.getPerkDefinition('fae-second-opinion');
  assert((await f.c.getActivePerks(29)).some(p => p.id === perk.id));
  assert.equal(perk.flavor.length, 15);
  f.rolls.push(1, 0, 1); // Failed Attack, first scene, enemy miss.
  const failed = await f.attack();
  assert.match(failed.message, /Critical Miss/);
  assert.match(failed.message, /Roll 1 \(1\) → 0 dmg/);
  assert(failed.message.includes(perk.activationLine + '\n\n' + perk.flavor[0] +
    '\n\n' + perk.endingLine));
  assert.equal((await f.state()).enemy.hp, 1000);
  assert.equal((await f.state()).faeSecondOpinion.offensiveRollModifier, 3);
  assert.equal((await f.state()).perkUses['fae-second-opinion'], 1);
  assert.equal((await f.state()).perkUses?.['astral-harmony'], undefined);
  f.rolls.push(10, 1);
  assert.match((await f.attack()).message, /\+3 Fae Second Opinion/);
  assert.equal((await f.state()).faeSecondOpinion, undefined);
  f.rolls.push(1, 1);
  assert.doesNotMatch((await f.attack()).message, /Fae Second Opinion Activates/);
  assert.equal((await f.state()).faeSecondOpinion, undefined);

  const harmony = await fixture(29);
  harmony.rolls.push(1, 0, 1);
  await harmony.attack();
  await harmony.editProgress(p => { p.mana = 50; });
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  harmony.rolls.push(10, 1);
  const combined = await harmony.attack();
  assert.match(combined.message, /\+3 Fae Second Opinion/);
  assert.match(combined.message, /Harmony\nRestored 15 Mana/);
  assert.equal((await harmony.progress()).mana, 65);

  const falling = await fixture(29);
  falling.rolls.push(1, 2, 3, 1, 0, 1);
  const missedStar = await falling.cast('falling-star');
  assert.match(missedStar.message, /Miss/);
  assert.match(missedStar.message, /Fae Second Opinion Activates/);
  assert.equal((await falling.progress()).mana, 70);
  assert.equal((await falling.state()).faeSecondOpinion.offensiveRollModifier, 3);

  for (const [spell, rolls] of [
    ['star', [1, 1]],
    ['jelly', [1, 1, 1, 1]],
    ['moonbeam', [1, 1, 1, 1, 1]],
    ['berry', [1]],
  ]) {
    const other = await fixture(29);
    other.rolls.push(...rolls);
    assert.doesNotMatch((await other.cast(spell)).message,
      /Fae Second Opinion Activates/, spell);
    assert.equal((await other.state()).faeSecondOpinion, undefined);
  }

  for (const platform of ['discord', 'twitch']) {
    for (let index = 0; index < 15; index++) {
      const scene = await fixture(29, platform);
      scene.rolls.push(1, index, 1);
      const result = await scene.attack();
      assert(result.message.includes(perk.flavor[index]));
      assert.equal(perk.flavor.filter(line => result.message.includes(line)).length, 1);
      assert.equal(result.message.split(perk.activationLine).length - 1, 1);
      assert.equal(result.message.split(perk.endingLine).length - 1, 1);
    }
  }
  assert(!perk.flavor.some(line => line.includes('Glimmer')));
  assert([1, 7, 13].every(index =>
    perk.flavor[index].includes("who's definitely not Shizuki")));

  const fresh = await fixture(29);
  assert.equal((await fresh.state()).faeSecondOpinion, undefined);
  console.log('Fae Second Opinion regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
