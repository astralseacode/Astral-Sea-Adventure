// Run: node scripts/test-shizukis-presence.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = "lvl 48 Mastery 🌿 Shizuki's Presence: When two different Fae abilities activate during the same battle, Shizuki's Presence awakens once per battle, restoring 30 HP and 40 Mana and empowering your next offensive spell with +3 to its offensive roll and +15 damage. Casting Evocation below 25% Mana causes it to overflow your Mana to 150% of its maximum.";

(async () => {
  const gated = await fixture(47);
  assert.equal((await gated.c.formatLevelUpUnlocks(47, 48)).join('\n'), unlock);
  assert(!(await gated.c.getActiveMasteries(47)).some(m => m.id === 'shizukis-presence'));
  await gated.editProgress(p => { p.mana = 0; });
  gated.rolls.push(1);
  await gated.cast('evocation');
  assert.equal((await gated.progress()).mana, 100);

  for (const [mana, expected] of [[0, 150], [24, 150], [25, 100], [26, 100]]) {
    const f = await fixture(48);
    await f.editProgress(p => { p.mana = mana; });
    f.rolls.push(1);
    const beforeRound = (await f.state()).round;
    const result = await f.cast('evocation');
    assert.equal((await f.progress()).mana, expected);
    assert.equal((await f.progress()).evocationCooldownTurns, 7);
    assert.equal((await f.state()).round, beforeRound + 1);
    assert.equal(result.message.includes('Evocation cast below 25% Mana!'), mana < 25);
  }

  const scaled = await fixture(48);
  await scaled.editProgress(p => { p.stats.focus = 10; p.mana = 49; });
  scaled.rolls.push(1);
  assert.match((await scaled.cast('evocation')).message, /Mana: 49 → 300/);
  assert.equal((await scaled.progress()).mana, 300);
  assert.equal(gated.c.getPlayerResourceCaps(await scaled.progress()).mana, 200);

  const convergence = await fixture(48);
  await convergence.editState(s => { s.playerHp = 40; });
  await convergence.editProgress(p => { p.hp = 40; p.mana = 50; });
  await convergence.cast('elf blessing');
  assert.deepEqual(Array.from((await convergence.state()).shizukiFaeSources), ['elf-blessing']);
  await convergence.cast('elf blessing');
  assert.deepEqual(Array.from((await convergence.state()).shizukiFaeSources), ['elf-blessing']);
  convergence.rolls.push(6);
  const berry = await convergence.cast('berry');
  assert.match(berry.message, /Elf Blessing and Fae Berry have activated Shizuki's Presence!/);
  let state = await convergence.state();
  assert.equal(state.playerHp, 70);
  assert.equal((await convergence.progress()).mana, 60);
  assert.deepEqual(Array.from(state.shizukiFaeSources), ['elf-blessing', 'fae-berry']);
  assert.deepEqual(JSON.parse(JSON.stringify(state.shizukisPresence)),
    { offensiveRollModifier: 3, bonusDamage: 15 });

  const mendExcluded = await fixture(48);
  await mendExcluded.editState(s => { s.shizukiFaeSources = ['elf-blessing']; });
  mendExcluded.rolls.push(1, 1);
  await mendExcluded.cast('mend');
  assert.deepEqual(Array.from((await mendExcluded.state()).shizukiFaeSources),
    ['elf-blessing']);

  const aid = await fixture(48);
  await aid.editState(s => { s.playerHp = 1; s.shizukiFaeSources = ['elf-blessing']; });
  await aid.editProgress(p => { p.hp = 1; });
  aid.rolls.push(2, 1);
  assert.match((await aid.attack()).message,
    /Elf Blessing and Fae Aid have activated Shizuki's Presence!/);

  const intervention = await fixture(48);
  await intervention.editState(s => {
    s.playerHp = 1;
    s.shizukiFaeSources = ['elf-blessing'];
    s.perkUses = { 'fae-aid': 1 };
  });
  await intervention.editProgress(p => { p.hp = 1; });
  intervention.rolls.push(2, 20);
  assert.match((await intervention.attack()).message,
    /Elf Blessing and Fae Intervention have activated Shizuki's Presence!/);

  const opinion = await fixture(48);
  await opinion.editState(s => { s.shizukiFaeSources = ['elf-blessing']; });
  opinion.rolls.push(1, 3, 5, 1, 1);
  assert.match((await opinion.cast('falling star')).message,
    /Elf Blessing and Fae Second Opinion have activated Shizuki's Presence!/);

  const mischief = await fixture(48);
  await mischief.editState(s => { s.shizukiFaeSources = ['elf-blessing']; });
  mischief.rolls.push(2, 2, 6, 1);
  assert.match((await mischief.cast('jelly')).message,
    /Elf Blessing and Fae Mischief have activated Shizuki's Presence!/);

  const snail = await fixture(48);
  await snail.editState(s => {
    s.shizukiFaeSources = ['elf-blessing'];
    s.familiarSerial = 1;
    s.familiar = { id: 'fae-snail', total: 2, actions: 0, serial: 1 };
  });
  snail.rolls.push(2, 1);
  assert.match((await snail.attack()).message,
    /Elf Blessing and Fae Snail have activated Shizuki's Presence!/);

  await convergence.cast('bubble');
  assert((await convergence.state()).shizukisPresence, 'support must preserve buff');
  convergence.rolls.push(5, 1);
  const empowered = await convergence.cast('star');
  assert.match(empowered.message, /\+3 Shizuki's Presence/);
  assert.match(empowered.message, /\+15 damage/);
  assert.equal((await convergence.state()).shizukisPresence, undefined);

  const naturalOnly = await fixture(48);
  await naturalOnly.editState(s => {
    s.shizukiFaeSources = ['elf-blessing', 'fae-aid'];
    s.shizukisPresenceUsed = true;
    s.shizukisPresence = { offensiveRollModifier: 3, bonusDamage: 15 };
    s.perkUses = { ...(s.perkUses || {}), 'fae-mischief': 1 };
  });
  naturalOnly.rolls.push(7, 5, 7, 1);
  const jelly = await naturalOnly.cast('jelly');
  assert(!jelly.message.includes('Perfect Jellyfish!'));
  assert(!jelly.message.includes('Curiosity activates! All three dice'));

  const falling = await fixture(48);
  await falling.editState(s => {
    s.shizukisPresence = { offensiveRollModifier: 3, bonusDamage: 15 };
  });
  falling.rolls.push(1, 3, 5, 7, 1);
  const star = await falling.cast('falling star');
  assert.match(star.message, /Power 9 \(1\+3\+5\)/);
  assert.match(star.message, /Accuracy 10 \(7\+3 Shizuki's Presence\)/);

  const gun = await fixture(48);
  await gun.editState(s => {
    s.shizukisPresence = { offensiveRollModifier: 3, bonusDamage: 15 };
  });
  gun.rolls.push(...Array(140).fill(1), 1);
  const gunResult = await gun.cast('conjure gun');
  assert.match(gunResult.message, /140 Hits!/);
  assert.match(gunResult.message, /Total Damage: 155/);
  assert.equal((await gun.state()).shizukisPresence, undefined);

  assert.equal(gun.c.restoreManaToNormalCap(240, 20, 200), 240);
  assert.equal(gun.c.restoreManaToNormalCap(190, 20, 200), 200);
  assert.equal(gun.c.restoreManaToNormalCap(180, 10, 200), 190);

  const independent = await fixture(48);
  await independent.editState(s => { s.playerHp = 40; });
  await independent.editProgress(p => { p.hp = 40; p.mana = 50; });
  await independent.cast('elf blessing');
  independent.rolls.push(6);
  await independent.cast('berry');
  await independent.editProgress(p => { p.mana = 0; });
  independent.rolls.push(1);
  await independent.cast('evocation');
  state = await independent.state();
  assert.equal((await independent.progress()).mana, 150);
  assert.equal(state.shizukisPresenceUsed, true);
  assert(state.shizukisPresence, 'Evocation must not consume convergence buff');
  assert.deepEqual(Array.from(state.shizukiFaeSources), ['elf-blessing', 'fae-berry']);

  await independent.c.startCombatEncounter(independent.env, independent.key,
    independent.c.getRegionById('moonlit-reef'), 1, independent.enemy,
    independent.platform);
  state = await independent.state();
  assert.equal(state.shizukiFaeSources, undefined);
  assert.equal(state.shizukisPresenceUsed, undefined);
  assert.equal(state.shizukisPresence, undefined);

  console.log("Shizuki's Presence regressions passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
