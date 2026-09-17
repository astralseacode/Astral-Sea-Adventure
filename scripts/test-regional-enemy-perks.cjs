// Deterministic local combat tests. In-memory KV; network forbidden by fixture.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');
let passed = 0;
async function test(name, run) {
  await run();
  console.log(`PASS ${name}`);
  passed++;
}
async function setup(region, level = 1, artifact = null) {
  const f = await fixture(level, 'discord', artifact);
  f.c.randomChoice = values => values[0]; // Cosmetic choices do not consume mechanical dice.
  await f.editProgress(p => { p.stats.vitality = 10; p.stats.focus = 10; p.hp = 200; p.mana = 200; });
  await f.editState(s => { s.regionId = region; s.playerHp = 200; s.playerMaxHp = 200; });
  f.action = async (kind = 'spell', spell = 'moonbeam', damage = 10, roll = 1, extra = {}) => {
    const s = await f.state();
    f.rolls.push(roll);
    return f.c.resolvePlayerCombatAction(f.env, f.key, s, {
      damage, message: 'Test action',
      ...(kind === 'spell' ? { regionalSpell: spell } : { regionalAction: kind }),
      ...extra,
    }, 'discord');
  };
  f.regional = async () => (await f.state()).regionalEnemy;
  return f;
}
async function arm(f, fn) {
  await f.editState(s => fn(f.c.getRegionalEnemyState(s), s));
}

async function main() {
  await test('Moonlit: three damaging actions, failures/support excluded, missed and blocked hits preserve +5', async () => {
    const f = await setup('moonlit-reef');
    await f.action('attack'); await f.action();
    await f.action('support', null, 0); await f.action('spell', 'moonbeam', 0);
    assert.equal((await f.regional()).actions, 2);
    await f.action();
    assert.equal((await f.regional()).gentle, true);
    await f.editState(s => { s.bubble = { naturalRoll: 12, tierId: 'perfect', displayName: 'Bubble', protection: 25, maxProtection: 25 }; });
    await f.action('support', null, 0, 2);
    assert.equal((await f.regional()).gentle, true);
    await f.editState(s => { delete s.bubble; });
    const before = (await f.state()).playerHp;
    const hit = await f.action('support', null, 0, 2);
    assert.equal((await f.state()).playerHp, before - 10);
    assert.match(hit.message, /Gentle Current/);
    assert.equal((await f.regional()).gentle, false);
  });
  await test('Starfall: fourth spell arms, attacks/support/misses excluded, drain caps and miss persistence', async () => {
    const f = await setup('starfall-trench');
    await f.action('attack'); await f.action('support', null, 0); await f.action('spell', 'moonbeam', 0);
    assert.equal((await f.regional()).spells, 0);
    for (let i = 0; i < 4; i++) await f.action();
    assert.equal((await f.regional()).pressure, true);
    await f.action(); assert.equal((await f.regional()).pressure, true);
    await f.editProgress(p => { p.mana = 7; });
    const hit = await f.action('attack', null, 1, 2);
    assert.equal((await f.progress()).mana, 0);
    assert.equal((await f.regional()).spells, 0);
    assert.equal((await f.regional()).pressure, false);
    assert.match(hit.message, /Starfall Pressure.*Drained 7/);
  });
  await test('Kelp: protection at response start, armor and natural miss', async () => {
    for (const pool of ['none', 'bubble', 'berry', 'wake', 'familiar']) {
      const f = await setup('whispering-kelp-forest');
      await f.editProgress(p => { p.stats.armor = 2; });
      await f.editState(s => {
        if (pool === 'bubble') s.bubble = { naturalRoll: 1, tierId: 'weak', displayName: 'Bubble', protection: 1, maxProtection: 5 };
        if (pool === 'berry') s.berryEffects = { protection: 1 };
        if (pool === 'wake') s.wakeMantaProtection = 1;
        if (pool === 'familiar') { s.familiarSerial = 1; s.familiarProtection = [{ serial: 1, amount: 1, max: 25 }]; }
      });
      const result = await f.action('attack', null, 1, 2);
      assert.equal((await f.state()).playerHp, pool === 'none' ? 192 : 198, pool);
      assert.equal(result.message.includes('Tangling Kelp'), pool === 'none');
    }
    const miss = await setup('whispering-kelp-forest');
    await miss.action(); assert.equal((await miss.state()).playerHp, 200);
  });
  await test('Kelp: fourth actual response heals 10, capped, never revives', async () => {
    const f = await setup('whispering-kelp-forest');
    for (let i = 0; i < 3; i++) await f.action();
    assert.equal((await f.state()).enemy.hp, 970);
    const result = await f.action();
    assert.equal((await f.state()).enemy.hp, 970);
    assert.match(result.message, /Kelp Recovery.*10/);
    const s = await f.state(); s.enemy.hp = 997; s.regionalEnemy.responses = 0;
    f.c.finishRegionalEnemyResponse(s); assert.equal(s.enemy.hp, 1000);
    s.enemy.hp = 0; f.c.finishRegionalEnemyResponse(s); assert.equal(s.enemy.hp, 0);
    const killed = await setup('whispering-kelp-forest');
    await arm(killed, r => { r.responses = 3; });
    await killed.action('attack', null, 1000);
    assert.equal(await killed.state(), null);
  });
  await test('Wake: every third response, announced even on a natural miss, no carry-over bonus', async () => {
    const f = await setup('leviathans-wake');
    await f.action(); await f.action();
    const hit = await f.action('attack', null, 1, 2);
    assert.equal((await f.state()).playerHp, 180);
    assert.match(hit.message, /Crushing Wake.*Incoming/);
    await f.action(); await f.action();
    const miss = await f.action();
    assert.match(miss.message, /Crushing Wake/);
    assert.equal((await f.state()).playerHp, 180);
    await f.action('attack', null, 1, 2);
    assert.equal((await f.state()).playerHp, 175);
  });
  await test('Wake: individual actual recovery >=20; nonstacking; smaller events do not aggregate', async () => {
    const f = await setup('leviathans-wake');
    const s = await f.state();
    for (const n of [5,10,15,19]) f.c.recordRegionalManaRecovery(s, n);
    assert.equal(f.c.getRegionalEnemyState(s).hunger, false);
    assert.equal(f.c.restoreManaToNormalCap(190, 100, 200, s), 200);
    assert.equal(s.regionalEnemy.hunger, false);
    f.c.recordRegionalManaRecovery(s, 20); f.c.recordRegionalManaRecovery(s, 100);
    assert.equal(s.regionalEnemy.hunger, true);
    await f.c.saveCombatState(f.env, f.key, s);
    await f.action(); assert.equal((await f.regional()).hunger, true);
    await f.action('attack', null, 1, 2);
    assert.equal((await f.progress()).mana, 190);
    assert.equal((await f.regional()).hunger, false);
  });
  await test('Wake: Evocation uses actual delta, including near-cap exclusion', async () => {
    for (const [start, expected] of [[185, false], [180, true]]) {
      const f = await setup('leviathans-wake', 20);
      await f.editProgress(p => { p.mana = start; });
      f.rolls.push(1); await f.cast('evocation');
      assert.equal((await f.regional()).hunger, expected);
    }
  });
  await test('Throne: spell streak, support preservation, successful attack breaks, guard primary only', async () => {
    const f = await setup('sunken-kings-throne');
    await f.action(); await f.action('support', null, 0); await f.action('spell', 'moonbeam', 0);
    assert.equal((await f.regional()).streak, 1);
    await f.action(); assert.equal((await f.regional()).guard, true);
    await f.action('spell', 'moonbeam', 0); assert.equal((await f.regional()).guard, true);
    const before = (await f.state()).enemy.hp;
    const result = await f.action('spell', 'moonbeam', 10, 1, { consumeAstralEcho: true, echoDamage: 20, aftershockDamage: 5 });
    assert.equal((await f.state()).enemy.hp, before - 25);
    assert.equal((await f.regional()).guard, false);
    assert.match(result.message, /Royal Guard.*reduced by 10/);
    await f.action(); await f.action('attack');
    assert.equal((await f.regional()).streak, 0);
  });
  await test('Throne: tax is prevalidated, flat after Charge and Storyteller discounts, failed cast keeps eligibility', async () => {
    const f = await setup('sunken-kings-throne', 40);
    await arm(f, r => { r.spells = 2; });
    await f.editProgress(p => { p.mana = 34; });
    const before = JSON.stringify([...f.values]);
    assert.match((await f.cast('tidal')).message, /King's Tax/);
    assert.equal(JSON.stringify([...f.values]), before);
    await f.editState(s => { s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15 }; s.storytellerChapter = 1; });
    await f.editProgress(p => { p.mana = 17; }); // 30*.8*.5 + 5 = 17
    f.rolls.push(1,2,3,1);
    const result = await f.cast('tidal');
    assert.match(result.message, /King's Tax.*5 Mana paid/);
    assert.equal((await f.progress()).mana, 0);
    assert.equal((await f.regional()).spells, 0);
    const miss = await setup('sunken-kings-throne', 15);
    await arm(miss, r => { r.spells = 2; });
    miss.rolls.push(2,3,4,1,1); await miss.cast('falling');
    assert.equal((await miss.regional()).spells, 2);
    assert.equal((await miss.progress()).mana, 170, 'failed roll pays normal cost, reserved tax is not charged');
  });
  await test('Throne: threshold crossing once, no retroactive grant or death activation, shield shared by follow-ups', async () => {
    const f = await setup('sunken-kings-throne');
    await f.editState(s => { s.enemy.hp = 260; });
    await f.action('attack', null, 20);
    assert.equal((await f.state()).enemy.protection, 20);
    await f.action('attack', null, 10);
    assert.equal((await f.state()).enemy.hp, 240);
    assert.equal((await f.state()).enemy.protection, 10);
    await f.action('support', null, 0, 1, { aftershockDamage: 15 });
    assert.equal((await f.state()).enemy.hp, 235);
    assert.equal((await f.state()).enemy.protection, 0);
    await f.editState(s => { s.enemy.hp = 260; });
    await f.action('attack', null, 30);
    assert.equal((await f.state()).enemy.protection, 0);
    const old = await setup('sunken-kings-throne');
    await old.editState(s => { s.enemy.hp = 200; });
    await old.action(); assert.equal((await old.state()).enemy.protection, undefined);
    const dead = await setup('sunken-kings-throne');
    const s = await dead.state(); s.enemy.hp = 0;
    dead.c.finishRegionalEnemyDamage(s, 300); assert.equal(s.enemy.protection, undefined);
  });
  await test('Nexus: repeat identity, support and failure preserve, different spell and successful attack break', async () => {
    for (const [middleKind, middleSpell, middleDamage, punished] of [
      ['support', null, 0, true], ['spell', 'tidal-wave', 0, true],
      ['spell', 'tidal-wave', 10, false], ['attack', null, 10, false],
      ['attack', null, 0, true],
    ]) {
      const f = await setup('astral-nexus');
      await f.action(); await f.action(middleKind, middleSpell, middleDamage);
      const result = await f.action('spell', 'moonbeam', 10, 2);
      assert.equal(result.message.includes('Reality Echo'), punished);
    }
    const f = await setup('astral-nexus');
    await f.action();
    assert.match((await f.action('spell', 'moonbeam', 10, 2)).message, /Reality Echo.*50/);
    assert.match((await f.action('spell', 'moonbeam', 10, 2)).message, /Reality Echo.*50/);
    assert.equal((await f.state()).playerHp, 85); // 55, then 60 with adaptation
  });
  await test('Nexus: repetition expires on miss; defenses process the combined event once; full blocks preserve Mana fracture', async () => {
    const f = await setup('astral-nexus');
    await f.action(); await f.action();
    assert.equal((await f.state()).playerHp, 200);
    await f.action('support', null, 0, 2);
    assert.equal((await f.state()).playerHp, 195);
    await f.editProgress(p => { p.stats.armor = 10; });
    await f.editState(s => { s.bubble = { naturalRoll: 12, tierId: 'perfect', displayName: 'Bubble', protection: 60, maxProtection: 60 }; });
    await arm(f, r => { r.fracture = 10; });
    await f.action('spell', 'moonbeam', 10, 2);
    assert.equal((await f.state()).playerHp, 195);
    assert.equal((await f.regional()).fracture, 10);
    assert.equal((await f.progress()).mana, 200);
  });
  await test('Nexus: Fae Intervention handles +50 through normal lethal-hit pipeline', async () => {
    const f = await setup('astral-nexus', 50);
    await f.editState(s => { s.playerHp = 10; });
    await arm(f, r => { r.lastSpell = 'moonbeam'; });
    const result = await f.action('spell', 'moonbeam', 10, 2);
    const s = await f.state();
    assert(s.playerHp > 0);
    assert.equal(s.perkUses['fae-intervention'], 1);
    assert.match(result.message, /Reality Echo/);
  });
  await test('Nexus: 25 actual Mana threshold, rounding, largest pending only, miss persistence and drain floor', async () => {
    const f = await setup('astral-nexus');
    const s = await f.state();
    for (const n of [10,15,24]) f.c.recordRegionalManaRecovery(s, n);
    assert.equal(f.c.getRegionalEnemyState(s).fracture, 0);
    f.c.recordRegionalManaRecovery(s, 25); assert.equal(s.regionalEnemy.fracture, 6);
    f.c.recordRegionalManaRecovery(s, 26); assert.equal(s.regionalEnemy.fracture, 7);
    f.c.recordRegionalManaRecovery(s, 120); assert.equal(s.regionalEnemy.fracture, 30);
    f.c.recordRegionalManaRecovery(s, 40); assert.equal(s.regionalEnemy.fracture, 30);
    await f.c.saveCombatState(f.env, f.key, s);
    await f.action(); assert.equal((await f.regional()).fracture, 30);
    await f.editProgress(p => { p.mana = 12; });
    await f.action('attack', null, 1, 2);
    assert.equal((await f.progress()).mana, 0);
    assert.equal((await f.regional()).fracture, 0);
  });
  await test('Nexus: actual Evocation and overflow arm the fracture before this response', async () => {
    for (const [start, after, fracture] of [[80,170,30], [20,230,70]]) {
      const f = await setup('astral-nexus', 50);
      await f.editProgress(p => { p.mana = start; });
      f.rolls.push(2);
      const result = await f.cast('evocation');
      assert.equal((await f.progress()).mana, after);
      assert.match(result.message, new RegExp(`Mana Fracture.*${fracture}`));
    }
  });
  await test('Nexus: adaptation at 3 and 6, caps +10, attack counts, follow-ups do not inflate counters', async () => {
    const f = await setup('astral-nexus');
    for (let i = 1; i <= 9; i++) {
      await f.action('attack', null, 1, 1, { consumeAstralEcho: true, echoDamage: 3, aftershockDamage: 5 });
      assert.equal((await f.regional()).actions, Math.min(i,6));
      assert.equal((await f.regional()).adaptation, i >= 6 ? 10 : i >= 3 ? 5 : 0);
    }
    await f.action('attack', null, 1, 2);
    assert.equal((await f.state()).playerHp, 185);
  });
  await test('Nexus: real Conjure Gun counts once with Familiar, repeat triggers once', async () => {
    const f = await setup('astral-nexus', 50);
    f.rolls.push(2,3); await f.cast('familiar');
    f.rolls.push(...Array(140).fill(1), 1); await f.cast('gun');
    assert.equal((await f.regional()).actions, 1);
    assert.equal((await f.regional()).lastSpell, 'conjure-gun');
    f.rolls.push(...Array(140).fill(1), 2);
    const result = await f.cast('gun');
    assert.equal((await f.regional()).actions, 2);
    assert.equal((result.message.match(/Reality Echo/g) || []).length, 1);
  });
  await test('Help isolated; Wake counts only committed summon, retains identity and snapshots guard', async () => {
    const help = await setup('astral-nexus', 50);
    await arm(help, r => { r.lastSpell = 'moonbeam'; });
    help.rolls.push(11,1); await help.cast('help');
    assert.equal((await help.regional()).lastSpell, 'moonbeam');
    assert.equal((await help.regional()).actions, 0);
    const wake = await setup('astral-nexus', 20);
    wake.rolls.push(2,1); await wake.cast('wake');
    assert.equal((await wake.regional()).actions, 1);
    assert.equal((await wake.regional()).lastSpell, 'leviathans-wake');
    wake.rolls.push(1,1); await wake.attack();
    wake.rolls.push(1,1); await wake.attack();
    assert.equal((await wake.regional()).actions, 1);
    const guard = await setup('sunken-kings-throne', 20);
    await arm(guard, r => { r.guard = true; });
    guard.rolls.push(2,1); await guard.cast('wake');
    assert.equal((await guard.state()).leviathansWake.regionalGuardReduction, 15);
    guard.rolls.push(1,1); await guard.attack();
    guard.rolls.push(1,1); await guard.attack();
    assert.equal((await guard.state()).enemy.hp, 993); // 22 - 15
  });
  await test('Nexus: repetition, adaptation and fracture on one response', async () => {
    const f = await setup('astral-nexus');
    await arm(f, r => { r.actions = 2; r.lastSpell = 'moonbeam'; r.fracture = 10; });
    const result = await f.action('spell', 'moonbeam', 10, 2);
    assert.equal((await f.state()).playerHp, 140);
    assert.equal((await f.progress()).mana, 190);
    for (const name of ['Reality Echo', 'Mana Fracture', 'Nexus Adaptation']) assert(result.message.includes(name));
  });
  await test('Recovery events: Awakening, Shizuki plus Resilience, and Berries use separate actual amounts', async () => {
    const awakening = await setup('astral-nexus', 25);
    await awakening.editProgress(p => { p.mana = 100; });
    await awakening.editState(s => { s.astralAwakeningSurvived = 4; });
    await awakening.action('attack', null, 1, 2);
    assert.equal((await awakening.progress()).mana, 125);
    assert.equal((await awakening.regional()).fracture, 6, 'post-hit recovery waits for a later hit');
    const shizuki = await setup('astral-nexus', 50);
    await shizuki.editProgress(p => { p.mana = 50; });
    await shizuki.editState(s => { s.playerHp = 10; s.shizukiFaeSources = ['elf-blessing']; });
    await arm(shizuki, r => { r.lastSpell = 'moonbeam'; });
    await shizuki.action('spell', 'moonbeam', 10, 2);
    assert.equal((await shizuki.progress()).mana, 100, '40 Presence + 10 Resilience both survive persistence');
    assert.equal((await shizuki.regional()).fracture, 10, 'separate 40 and 10 events, not aggregated 50');
    const berries = await setup('astral-nexus', 24);
    await berries.editProgress(p => { p.mana = 190; });
    berries.rolls.push(20); await berries.cast('berries');
    assert.equal((await berries.progress()).mana, 200);
    assert.equal((await berries.regional()).fracture, 8, 'only 30 actual after the 20-Mana cast cost');
    assert.equal((await berries.regional()).actions, 0);
    const nearCap = await setup('astral-nexus', 50);
    const s = await nearCap.state(); const p = await nearCap.progress(); p.mana = 190;
    s.shizukiFaeSources = ['elf-blessing'];
    const mastery = await nearCap.c.getMasteryDefinition('shizukis-presence');
    nearCap.c.activateShizukisPresence(s, p, mastery, 'fae-aid');
    assert.equal(nearCap.c.getRegionalEnemyState(s).fracture, 0);
  });
  await test('Real incoming hit: Armor reduces HP but not Mana loss; simultaneous Wake hunger/crush', async () => {
    const f = await setup('leviathans-wake');
    await f.editProgress(p => { p.stats.armor = 10; });
    await arm(f, r => { r.responses = 2; r.hunger = true; });
    const result = await f.action('attack', null, 1, 2);
    assert.equal((await f.state()).playerHp, 190); // 5 +15 -10
    assert.equal((await f.progress()).mana, 190);
    assert.match(result.message, /Crushing Wake/); assert.match(result.message, /Deepwater Hunger/);
  });
  await test('Death clears regional combat state; shield never rescues a dead enemy', async () => {
    const f = await setup('astral-nexus');
    await f.editState(s => { s.playerHp = 1; });
    await arm(f, r => { r.lastSpell = 'moonbeam'; r.fracture = 30; r.actions = 5; });
    await f.action('spell', 'moonbeam', 10, 2);
    assert.equal(await f.state(), null);
    await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('astral-nexus'), 1, f.enemy, 'discord');
    assert.equal((await f.state()).regionalEnemy, undefined);
    assert.equal((await f.state()).enemy.protection, undefined);
  });
  await test('Generated real command entry: combined Nexus effects retain staged-KV budgets and failure discard', async () => {
    const { renderWorker } = require('./build-worker.cjs');
    const { runtime, spellOptions, fallback } = require('./test-free-tier.cjs');
    for (const reject of [false,true]) {
      const f = await runtime(renderWorker());
      f.c.randomChoice = values => values[0];
      await f.editState(s => {
        s.regionId = 'astral-nexus';
        const r = f.c.getRegionalEnemyState(s);
        r.actions = 2; r.lastSpell = 'conjure-gun'; r.fracture = 10;
      });
      const before = JSON.stringify([...f.values]);
      f.rolls.push(...Array(140).fill(1),2);
      if (reject) f.limitWrites(() => { throw Error('Regional test first-write failure'); });
      const result = await f.run('cast', spellOptions('gun'));
      assert.equal(result.counts.content, 0);
      for (const n of Object.values(result.counts.writes)) assert(n <= 1);
      if (reject) {
        assert(result.content.includes(fallback));
        assert.equal(JSON.stringify([...f.values]), before);
      } else {
        for (const name of ['Reality Echo','Mana Fracture','Nexus Adaptation']) assert(result.content.includes(name));
        assert.equal((await f.state()).regionalEnemy.actions, 3);
      }
    }
  });
  await test('All regions: normal/boss parity, combat reset and persisted validation', async () => {
    for (const region of ['moonlit-reef','starfall-trench','whispering-kelp-forest','leviathans-wake','sunken-kings-throne','astral-nexus']) {
      const f = await setup(region);
      await f.action();
      const normal = JSON.stringify(await f.regional());
      await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById(region), 1, {...f.enemy, isBoss:true}, 'discord');
      assert.equal((await f.state()).regionalEnemy, undefined);
      await f.action(); assert.equal(JSON.stringify(await f.regional()), normal);
      const s = await f.state(); s.regionalEnemy.fracture = -1;
      assert.equal(f.c.isValidCombatState(s), false);
      await f.c.deleteCombatState(f.env, f.key); assert.equal(await f.state(), null);
    }
  });
  console.log(`Regional enemy perks: ${passed} scenario groups passed.`);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { setup, main };
