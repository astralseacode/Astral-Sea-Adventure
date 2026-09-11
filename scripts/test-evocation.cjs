// Offline: local content, in-memory KV, no network.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');
const content = require('../data/spells/evocation.json');
const plain = value => JSON.parse(JSON.stringify(value));
async function main() {
  assert.equal(content.successLines.length, 26);
  assert.equal(new Set(content.successLines).size, 26);
  // Digest of the exact 26 approved lines, independently extracted from the request.
  assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(content.successLines)).digest('hex'),
    '768327e4b9b348cf8e71232dd1f10f87e23f59a1805abfb5d34bdac340f508ac');
  assert.equal(content.fullManaLine, 'You reach for the feelings and memories of Shizuki. The Astral light answers, takes one look at your completely full Mana, and quietly fades away.');
  assert.equal(content.manaCost, 0);
  for (const platform of ['discord', 'twitch']) {
    const low = await fixture(4, platform);
    const before = [...low.values];
    assert.match((await low.cast('evocation')).message, /Reach Level 5/);
    assert.deepEqual([...low.values], before);
    for (const mana of [0, 1, 149]) {
      const f = await fixture(5, platform);
      await f.editProgress(p => { p.stats.focus = 5; p.mana = mana; });
      const result = await f.cast('evocation');
      assert.equal((await f.progress()).mana, 150);
      assert.equal((await f.progress()).evocationCooldownTurns, 7);
      assert.equal((await f.state()).round, 2);
      assert.equal((await f.state()).enemy.hp, 1000);
      assert.match(result.message, /Mana fully restored: 150\/150/);
      assert.match(result.message, /Enemy 1/);
      assert.deepEqual(f.randomCalls, [[0, 25], [1, 20]], 'Flavor selection and enemy roll only');
      const fullBefore = [...f.values]; const calls = f.randomCalls.length;
      assert.equal((await f.cast('evocation')).message, content.fullManaLine);
      assert.deepEqual([...f.values], fullBefore);
      assert.equal(f.randomCalls.length, calls);
      await f.editProgress(p => { p.mana = 0; });
      for (let i = 0; i < 10; i++) {
        const snapshot = [...f.values]; const count = f.randomCalls.length;
        assert.match((await f.cast('evo')).message, /7 combat turns remaining/);
        await f.cast('invalid'); await f.cast(''); await f.cast('moonbeam');
        for (const fn of ['performStats', 'performBackpack', 'performJournal']) await f.c[fn](f.env, f.key, platform);
        assert.deepEqual([...f.values], snapshot);
        assert.equal(f.randomCalls.length, count);
      }
      for (let i = 1; i <= 7; i++) {
        await f.attack();
        assert.equal((await f.progress()).evocationCooldownTurns, 7 - i);
        if (i < 7) assert.match((await f.cast('evocate')).message, new RegExp((7-i)+' combat turns remaining'));
      }
      await f.cast('evocate');
      assert.equal((await f.progress()).evocationCooldownTurns, 7);
    }
    const full = await fixture(5, platform);
    const snapshot = [...full.values];
    assert.equal((await full.cast('evocation')).message, content.fullManaLine);
    assert.deepEqual([...full.values], snapshot);
    assert.equal(full.randomCalls.length, 0);
  }
  for (let i = 0; i < 26; i++) {
    const f = await fixture(5);
    await f.editProgress(p => { p.mana = 0; });
    f.rolls.push(i, 1);
    assert((await f.cast('evocation')).message.includes(content.successLines[i]));
  }
  const f = await fixture(21);
  await f.editProgress(p => { p.mana = 1; p.stats.focus = 10; p.stats.strength = 10; p.stats.fae = 10; });
  const blessing = await f.c.getSpellDefinition('elf_blessing');
  await f.editProgress(p => { p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing)); });
  await f.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralCuriosity = { offensiveRollModifier: 1 };
    s.astralEcho = { naturalRoll: 1, tierId: 'faint', displayName: 'Faint Echo', damagePercent: 0.3 };
    s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.5, remainingDamageUses: 2, manaDiscountAvailable: true };
  });
  const state = plain(await f.state()); const effects = plain((await f.progress()).statusEffects);
  await f.cast('evocation');
  assert.equal((await f.progress()).mana, 200);
  assert.deepEqual(plain((await f.progress()).statusEffects), effects);
  for (const key of ['astralRebound', 'astralCuriosity', 'astralEcho', 'perkUses']) assert.deepEqual(plain((await f.state())[key] ?? null), state[key] ?? null);
  assert.deepEqual(plain((await f.state()).enemy), state.enemy);
  for (const spell of ['bubble', 'mend', 'astral echo']) {
    await f.cast(spell);
    assert.equal((await f.progress()).evocationCooldownTurns, 7);
  }
  // Encounter replacement and defeat retain the player-level cooldown.
  await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, 'discord');
  assert.equal((await f.progress()).evocationCooldownTurns, 7);
  await f.editState(s => { s.playerHp = 1; s.perkUses = { 'fae-intervention': 1 }; });
  f.rolls.push(1, 20); await f.attack();
  assert.equal(await f.state(), null);
  assert.equal((await f.progress()).evocationCooldownTurns, 6);
  await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, 'discord');
  assert.equal((await f.progress()).evocationCooldownTurns, 6);
  for (const stage of [1, 2]) {
    const w = await fixture(20);
    w.rolls.push(1, 1); await w.cast('wake');
    if (stage === 2) await w.attack();
    await w.cast('evocation');
    assert.equal((await w.state()).leviathansWake?.stage, stage === 1 ? 2 : undefined);
    assert.equal((await w.progress()).evocationCooldownTurns, 7);
    const snapshot = [...w.values];
    await w.cast('evocation'); assert.deepEqual([...w.values], snapshot);
    await w.editProgress(p => { p.mana = 0; });
    const snapshot2 = [...w.values];
    await w.cast('evocation'); assert.deepEqual([...w.values], snapshot2);
  }
  const defense = await fixture(5);
  await defense.cast('bubble'); await defense.cast('mend');
  await defense.editState(s => { s.playerHp = 50; });
  defense.rolls.push(0, 10);
  await defense.cast('evocation');
  assert.equal((await defense.state()).bubble, undefined);
  assert.equal((await defense.state()).mend.remainingTriggers, 2);
  assert.equal((await defense.state()).round, 2);
  // Wake arrival can win on Evocation's turn; refill and cooldown survive victory.
  const winner = await fixture(20);
  winner.rolls.push(1, 1); await winner.cast('wake'); await winner.attack();
  await winner.editState(s => { s.enemy.hp = 1; });
  assert.match((await winner.cast('evocation')).message, /Mana fully restored/);
  assert.equal(await winner.state(), null);
  assert.equal((await winner.progress()).evocationCooldownTurns, 7);
  // A qualifying offensive cast also ticks once, including a killing blow.
  await winner.c.startCombatEncounter(winner.env, winner.key, winner.c.getRegionById('moonlit-reef'), 1, winner.enemy, 'discord');
  await winner.editState(s => { s.enemy.hp = 1; });
  winner.rolls.push(6); await winner.cast('star');
  assert.equal((await winner.progress()).evocationCooldownTurns, 6);
  assert.equal(await winner.state(), null);
  const buffer = await fixture(5);
  await buffer.editProgress(p => { p.restBufferType = 'long'; p.mana = 0; });
  const cap = buffer.c.getPlayerResourceCaps(await buffer.progress()).mana;
  await buffer.cast('evocation');
  assert.equal((await buffer.progress()).mana, cap);
  const spells = await defense.c.getSpellDefinitions();
  assert.equal(spells.find(s => s.id === 'moonbeam').requiredLevel, 5);
  for (const alias of ['evocation', ...content.aliases]) assert.equal(spells.filter(s => s.id === alias || s.aliases.includes(alias)).length, 1);
  console.log('Evocation offline checks passed.');
}
module.exports = { main };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
