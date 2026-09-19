// Offline combat receipt regressions; real resolution, in-memory KV, no network.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function nexus() {
  const f = await fixture(49);
  f.c.randomChoice = choices => choices[0];
  await f.editProgress(p => { p.stats.armor = 10; p.mana = 200; });
  const startingMana = (await f.progress()).mana;
  await f.editState(s => {
    s.regionId = 'astral-nexus';
    s.enemy.hp = 800; s.enemy.maxHp = 1000; s.enemy.damageBonus = 15;
    const regional = f.c.getRegionalEnemyState(s);
    regional.actions = 2;
    f.c.recordRegionalManaRecovery(s, 100);
    assert.equal(regional.fracture, 25);
    assert.deepEqual(Array.from(f.c.takeRegionalEnemyReceipts(s)), []);
  });
  f.rolls.push(9);
  const s = await f.state();
  const result = await f.c.resolvePlayerCombatAction(f.env, f.key, s,
    { damage: 100, message: 'Player spell result', regionalSpell: 'moonbeam' }, 'discord');
  const message = result.message;
  assert(message.indexOf('Player spell result') < message.indexOf('Enemy Turn'));
  assert(message.indexOf('The First Page') < message.indexOf('Enemy Turn'));
  assert(!message.includes('THE FIRST PAGE'));
  assert(!message.includes('Mana fractured'));
  assert.equal(message.split('Nexus Adaptation').length - 1, 1);
  assert.equal(message.split('Mana Fracture — Drained 25 Mana').length - 1, 1);
  assert.match(message, /Enemy Turn\n/);
  assert.match(message, /Enemy 9 → \d+ dmg\nArmor -10\nYou take \d+ dmg/);
  assert(!message.includes(' | Enemy'));
  assert.match(message, /\n\nHP \d+\/\d+ · MP \d+\/\d+ · Enemy 700\/1000$/);
  assert.equal((await f.state()).regionalEnemy.fracture, 0);
  assert.equal((await f.progress()).mana, startingMana - 25);
  const next = await f.state();
  f.rolls.push(9);
  const nextResult = await f.c.resolvePlayerCombatAction(f.env, f.key, next,
    { damage: 0, message: 'Support action', regionalAction: 'support' }, 'discord');
  assert(!nextResult.message.includes('Nexus Adaptation'));
  assert(!nextResult.message.includes('Mana Fracture'));
  await f.editState(state => {
    const regional = f.c.getRegionalEnemyState(state);
    regional.actions = 5;
    regional.adaptation = 5;
  });
  f.rolls.push(9);
  const increased = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
    { damage: 1, message: 'Player attack', regionalAction: 'attack' }, 'discord');
  assert.equal(increased.message.split('Nexus Adaptation — Increased to +10 damage.').length - 1, 1);
  f.rolls.push(9);
  const steady = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
    { damage: 0, message: 'Support action', regionalAction: 'support' }, 'discord');
  assert(!steady.message.includes('Nexus Adaptation'));
}

async function pendingMiss() {
  const f = await fixture(49);
  await f.editProgress(p => { p.mana = 100; });
  await f.editState(s => {
    s.regionId = 'astral-nexus';
    f.c.recordRegionalManaRecovery(s, 100);
  });
  f.rolls.push(1);
  const miss = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
    { damage: 0, message: 'Support action', regionalAction: 'support' }, 'discord');
  assert(!miss.message.includes('Mana Fracture'));
  assert.equal((await f.state()).regionalEnemy.fracture, 25);
  f.rolls.push(9);
  const hit = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
    { damage: 0, message: 'Support action', regionalAction: 'support' }, 'discord');
  assert.equal(hit.message.split('Mana Fracture — Drained 25 Mana').length - 1, 1);
  assert.equal((await f.state()).regionalEnemy.fracture, 0);
  assert.equal((await f.progress()).mana, 75);
}

async function defenses() {
  const protectedPlayer = await fixture(1);
  await protectedPlayer.editState(s => {
    s.bubble = { naturalRoll: 1, tierId: 'weak', displayName: 'Bubble',
      protection: 5, maxProtection: 5 };
  });
  protectedPlayer.rolls.push(9);
  const protection = await protectedPlayer.c.resolvePlayerCombatAction(
    protectedPlayer.env, protectedPlayer.key, await protectedPlayer.state(),
    { damage: 0, message: 'Player action', regionalAction: 'support' }, 'discord');
  assert.match(protection.message, /Enemy Turn\nEnemy 9 → \d+ dmg/);
  assert.match(protection.message, /Bubble/);
  assert(protection.message.indexOf('Bubble') < protection.message.indexOf('You take 5 dmg'));
  assert.equal((await protectedPlayer.state()).playerHp, 95);

  const fae = await fixture(43);
  await fae.editProgress(p => { p.hp = 1; });
  await fae.editState(s => { s.playerHp = 1; });
  fae.rolls.push(20);
  const saved = await fae.c.resolvePlayerCombatAction(fae.env, fae.key, await fae.state(),
    { damage: 0, message: 'Player action', regionalAction: 'support' }, 'discord');
  assert.match(saved.message, /Enemy Turn\nEnemy 20 →/);
  assert.match(saved.message, /Fae/);
  assert((await fae.state()).playerHp > 0);
  assert.equal((await fae.state()).perkUses['fae-intervention'], 1);
}

async function evocationSupport() {
  const f = await fixture(50);
  await f.editProgress(p => { p.stats.focus = 10; p.mana = 23; });
  await f.editState(s => {
    s.regionId = 'astral-nexus';
    s.enemy.hp = 770; s.enemy.maxHp = 1000;
  });
  f.rolls.push(1, 9);
  const result = await f.cast('evocation');
  assert.match(result.message, /Evocation/);
  assert(result.message.indexOf('Evocation') < result.message.indexOf('Enemy Turn'));
  assert(!result.message.includes(' | Enemy'));
}

async function longDelivery() {
  const f = await fixture(49);
  f.c.Response = Response;
  f.c.setTimeout = setTimeout;
  const calls = [];
  f.c.fetch = async (url, options) => {
    calls.push(JSON.parse(options.body));
    return { ok: true, status: 200 };
  };
  let resolved = 0, intended = '';
  f.c.handleDiscordInteractionCore = async () => {
    resolved++;
    f.rolls.push(1);
    const result = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
      { damage: 0, message: 'Player action\n\n' + 'Long receipt line. '.repeat(180),
        regionalAction: 'support' }, 'discord');
    intended = result.message;
    return f.c.discordMessage(intended);
  };
  const request = new Request('https://offline.invalid/discord/interactions', {
    method: 'POST', body: JSON.stringify({ type: 2, application_id: '123456789', token: 'offline-token' }),
  });
  const pending = [];
  const response = await f.c.handleDiscordInteraction(request, f.env,
    { waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
  const initial = await response.json();
  assert(calls.length > 0);
  assert.equal(initial.data.content + calls.map(call => call.content).join(''), intended);
  assert.equal(resolved, 1);
  assert.equal((await f.state()).round, 2);
}

async function victoryReceipt() {
  const f = await fixture(1);
  await f.editState(s => { s.enemy.hp = 1; });
  const result = await f.c.resolvePlayerCombatAction(f.env, f.key, await f.state(),
    { damage: 1, message: 'Player finishing blow', regionalAction: 'attack' }, 'discord');
  assert.equal(result.won, true);
  assert(result.message.includes('Player finishing blow'), result.message);
  assert(!result.message.includes(' | '));
  assert.match(result.message, /HP \d+\/\d+ · MP \d+\/\d+ · Enemy 0\/1000$/);
}

(async () => {
  await nexus();
  await pendingMiss();
  await defenses();
  await evocationSupport();
  await longDelivery();
  await victoryReceipt();
  console.log('Combat receipts: Nexus, Storyteller, Evocation, Armor, Protection, Fae Intervention, Fracture, Adaptation, and long delivery passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
