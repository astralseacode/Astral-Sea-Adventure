// Run: node scripts/test-astral-awakening.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');

async function hit(f, enemyRoll = 2) {
  f.rolls.push(1, enemyRoll); // Player misses; enemy attack resolves.
  return f.attack();
}

async function main() {
  const low = await fixture(24);
  assert(!(await low.c.getActivePerks(24)).some(p => p.id === 'astral-awakening'));
  await hit(low);
  assert.equal((await low.state()).astralAwakeningSurvived, undefined);

  const f = await fixture(25);
  const perk = await f.c.getPerkDefinition('astral-awakening');
  assert((await f.c.getActivePerks(25)).some(p => p.id === perk.id));
  const activation = '5 enemy attacks survived. Awakening activates!\n\n' +
    'Restored 25 HP + 25 Mana | Next offensive roll +2';
  assert.equal(perk.activationLine, activation);
  const spec = fs.readFileSync(path.join(__dirname, '..', 'data', 'perks',
    'astral-awakening.json'), 'utf8');
  assert.equal(JSON.parse(spec).memories, undefined);
  assert.equal(JSON.parse(spec).ending, undefined);
  await f.editProgress(p => { p.hp = 50; p.mana = 50; });
  await f.editState(s => { s.playerHp = 50; });
  for (let n = 1; n <= 4; n++) {
    const result = await hit(f, 1); // A legitimate zero-damage enemy attack.
    assert.equal((await f.state()).astralAwakeningSurvived, n);
    assert.doesNotMatch(result.message, /Restored 25 HP \+ 25 Mana/);
  }
  const fifth = await hit(f, 1);
  assert.equal((await f.state()).astralAwakeningSurvived, 5);
  assert.equal((await f.state()).playerHp, 75);
  assert.equal((await f.progress()).mana, 75);
  assert.equal((await f.state()).astralAwakening.offensiveRollModifier, 2);
  assert.equal((await f.state()).perkUses['astral-awakening'], 1);
  assert.equal(fifth.message.split(activation).length - 1, 1);
  await hit(f, 1);
  assert.equal((await f.state()).astralAwakeningSurvived, 5);
  assert.equal((await f.progress()).mana, 75);
  f.rolls.push(1, 1);
  const miss = await f.attack();
  assert.match(miss.message, /Critical Miss/);
  assert.equal((await f.state()).astralAwakening, undefined);

  const bonus = await fixture(25);
  await bonus.editState(s => { s.astralAwakening = { offensiveRollModifier: 2 }; });
  bonus.rolls.push(10, 1);
  assert.match((await bonus.attack()).message, /\+2 Awakening/);
  assert.equal((await bonus.state()).astralAwakening, undefined);

  const cap = await fixture(25);
  await cap.editProgress(p => {
    p.stats.vitality = 5; p.stats.focus = 5;
    p.restBufferType = 'short'; p.hp = 165; p.mana = 165;
  });
  await cap.editState(s => {
    s.playerHp = 165; s.playerMaxHp = 175;
    s.astralAwakeningSurvived = 4;
  });
  await hit(cap, 1);
  assert.equal((await cap.state()).playerHp, 175);
  assert.equal((await cap.progress()).mana, 175);

  const protectedPlayer = await fixture(25);
  await protectedPlayer.editState(s => {
    s.astralAwakeningSurvived = 4;
    s.berryEffects = { protection: 20 };
  });
  const protectedHit = await hit(protectedPlayer, 6);
  assert.match(protectedHit.message, /Berry protection absorbs/);
  assert.match(protectedHit.message, /Restored 25 HP \+ 25 Mana/);
  assert.equal((await protectedPlayer.state()).astralAwakeningSurvived, 5);

  const fae = await fixture(43);
  await fae.editProgress(p => { p.hp = 1; p.mana = 50; });
  await fae.editState(s => {
    s.playerHp = 1; s.astralAwakeningSurvived = 4;
    s.perkUses = { 'fae-aid': 1 };
  });
  fae.rolls.push(2, 20);
  const saved = await fae.attack();
  assert.match(saved.message, /Restored 25 HP \+ 25 Mana/);
  assert.equal((await fae.state()).playerHp, 26);
  assert.equal((await fae.state()).perkUses['fae-intervention'], 1);

  const lethal = await fixture(25);
  await lethal.editProgress(p => { p.hp = 1; });
  await lethal.editState(s => {
    s.playerHp = 1; s.astralAwakeningSurvived = 4;
    s.perkUses = { 'fae-intervention': 1 };
  });
  const defeat = await hit(lethal, 20);
  assert.doesNotMatch(defeat.message, /Restored 25 HP \+ 25 Mana/);
  assert.equal(await lethal.state(), null);

  for (const platform of ['discord', 'twitch']) {
    const player = await fixture(25, platform);
    await player.editState(s => { s.astralAwakeningSurvived = 4; });
    let flavorSelections = 0;
    player.math.random = () => { flavorSelections++; return 0.99; };
    player.rolls.push(1, 1);
    const result = await player.attack();
    assert.equal(result.message.split(activation).length - 1, 1);
    assert.equal(flavorSelections, 0, 'Awakening must not select a random memory');
    assert.doesNotMatch(result.message, /supervising leaf|mustache|memories of your journey|Shizuki/i);
    assert.doesNotMatch(activation, /\p{Extended_Pictographic}/u);
  }

  const fresh = await fixture(25);
  assert.equal((await fresh.state()).astralAwakeningSurvived, undefined);

  const victory = await fixture(25);
  await victory.editState(s => {
    s.astralAwakeningSurvived = 4;
    s.enemy.hp = 1; s.enemy.maxHp = 1;
  });
  victory.rolls.push(20);
  assert.equal((await victory.attack()).won, true);
  assert.equal(await victory.state(), null);
  console.log('Awakening regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
