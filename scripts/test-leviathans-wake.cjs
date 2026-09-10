// Run with: node scripts/test-leviathans-wake.cjs
// All content comes from disk; KV is an in-memory Map and network is disabled.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0;

async function fixture(level = 20, platform = 'discord') {
  const values = new Map();
  const writes = [];
  const rolls = [];
  const randomCalls = [];
  const math = Object.create(Math);
  math.random = () => 0.99;
  const c = vm.createContext({ console, structuredClone, Math: math,
    fetch: () => { throw new Error('Network is forbidden in this test'); } });
  vm.runInContext(source.replace('export default {', 'const workerExport = {'), c);
  c.fetchCachedJson = async (key, url) => {
    const relative = url.split('/main/data/')[1];
    assert(relative, `Unexpected content URL: ${url}`);
    return JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8'));
  };
  c.randomInteger = (min, max) => {
    randomCalls.push([min, max]);
    const result = rolls.length ? rolls.shift() : min;
    assert(result >= min && result <= max, `Invalid test roll ${result} for ${min}..${max}`);
    return result;
  };
  const env = { Backpack: {
    get: async key => values.get(key) ?? null,
    put: async (key, value) => { writes.push(['put', key]); values.set(key, value); },
    delete: async key => { writes.push(['delete', key]); values.delete(key); },
  } };
  const key = 'local-test';
  const progress = c.createEmptyProgress();
  progress.xp = c.totalXpForLevel(level);
  progress.mana = 100;
  await c.savePlayerProgress(env, key, progress);
  const enemy = { id: 'test-enemy', name: 'Test Enemy', level: 20, hp: 1000,
    damageBonus: 0, reward: { candies: { min: 1, max: 1 }, xp: { min: 1, max: 1 } },
    defeatCandyLoss: 0 };
  await c.startCombatEncounter(env, key, c.getRegionById('moonlit-reef'), 1, enemy, platform);
  const f = { c, env, key, values, writes, rolls, randomCalls, math, enemy, platform,
    state: () => c.getCombatState(env, key),
    progress: () => c.getPlayerProgress(env, key),
    cast: (name = 'wake') => c.performCastUnlocked(env, key, name, platform),
    attack: () => c.performAttackUnlocked(env, key, platform),
    editState: async change => { const s = await f.state(); change(s); await c.saveCombatState(env, key, s); },
    editProgress: async change => { const p = await f.progress(); change(p); await c.savePlayerProgress(env, key, p); },
  };
  return f;
}

async function test(name, run) {
  await run();
  passed++;
  console.log(`PASS ${name}`);
}

async function main() {
  await test('content loader, unique aliases, and level/Mana gates', async () => {
    const f = await fixture(19);
    const spells = await f.c.getSpellDefinitions();
    const spell = spells.find(s => s.id === 'leviathans-wake');
    assert.equal(spell.manaCost, 30);
    for (const alias of spell.aliases) {
      assert.equal(spells.filter(s => s.aliases.includes(alias)).length, 1);
    }
    const before = [...f.values];
    assert.match((await f.cast()).message, /Reach Level 20/);
    assert.deepEqual([...f.values], before);
    assert.equal(f.randomCalls.length, 0);
    await f.editProgress(p => { p.xp = f.c.totalXpForLevel(20); p.mana = 29; });
    assert.match((await f.cast()).message, /enough Mana/);
    assert.equal(f.randomCalls.length, 0);
  });

  await test('all 20 natural rolls: creature, base damage, one cast die, full three-turn flow', async () => {
    for (let natural = 1; natural <= 20; natural++) {
      const f = await fixture();
      const spell = await f.c.getSpellDefinition('leviathans-wake');
      const tier = spell.creatureTiers.find(t => natural <= t.naturalMaximum);
      f.rolls.push(natural, 1); // Cast die, enemy miss.
      const cast = await f.cast();
      let s = await f.state();
      assert.equal(s.leviathansWake.creatureId, tier.id);
      assert.equal(s.leviathansWake.baseDamage, tier.baseDamage);
      assert.equal(s.leviathansWake.critical, natural === 20);
      assert.equal(s.round, 2);
      assert.equal(s.enemy.hp, 1000);
      assert.equal((await f.progress()).mana, 70);
      assert.equal(s.perkUses?.['astral-momentum'], undefined);
      assert.equal(s.perkUses?.['astral-curiosity'], undefined);
      assert(cast.message.includes(tier.cast));
      assert.deepEqual(f.randomCalls, [[1, 20], [1, 20]]);
      f.rolls.push(1, 1); // Player miss, enemy miss.
      const warning = await f.attack();
      s = await f.state();
      assert(warning.message.startsWith(tier.warning));
      assert.equal(s.leviathansWake.stage, 2);
      assert.equal(s.enemy.hp, 1000);
      assert.equal(s.round, 3);
      await f.editProgress(p => { p.stats.strength = 3; });
      f.rolls.push(2, 1);
      const arrival = await f.attack();
      s = await f.state();
      const actionDamage = f.c.getCombatRollResult(2).damage + 3;
      assert.equal(s.enemy.hp, 1000 - tier.baseDamage - 3 - (natural === 20 ? 5 : 0) - actionDamage);
      assert.equal(s.round, 4, 'Arrival must not take the normal action');
      assert.equal(s.leviathansWake, undefined);
      assert(arrival.message.startsWith(tier.arrival));
      assert.equal(f.randomCalls.length, 6, 'Wake must not reroll');
    }
  });

  await test('Elf Blessing/Fae/Rebound/Curiosity apply and consume at cast without changing natural tier', async () => {
    for (const natural of [1, 19, 20]) {
      const f = await fixture();
      const blessing = await f.c.getSpellDefinition('elf_blessing');
      await f.editProgress(p => {
        p.stats.fae = 5; p.stats.strength = 3;
        p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing));
      });
      await f.editState(s => {
        s.astralRebound = { offensiveRollModifier: 2 };
        s.astralCuriosity = { offensiveRollModifier: 1 };
      });
      f.rolls.push(natural, 1);
      const result = await f.cast();
      const s = await f.state();
      assert.equal(s.leviathansWake.finalRoll, natural + 11); // Level 13 Blessing mastery upgrades to +3.
      assert.equal(s.leviathansWake.creatureId, natural === 1 ? 'wakefin' : natural === 19 ? 'leviathan' : 'ancient-one');
      assert.equal(s.leviathansWake.critical, natural === 20);
      assert.equal(s.astralRebound, undefined);
      assert.equal(s.astralCuriosity, undefined);
      assert(result.message.includes('Elf Blessing'));
      assert(!result.message.split('Enemy ')[0].includes('Critical Miss'));
    }
  });

  await test('duplicates, invalid/underfunded casts, information and support commands do not advance Wake', async () => {
    const f = await fixture();
    f.rolls.push(14, 1); await f.cast();
    await f.editState(s => { s.astralCuriosity = { offensiveRollModifier: 1 }; });
    for (const name of ["leviathan's wake", 'leviathans wake', 'leviathan', 'wake', 'leviathans-wake', 'invalid', '']) {
      const before = [...f.values]; const count = f.randomCalls.length;
      const result = await f.cast(name);
      assert.deepEqual([...f.values], before);
      assert.equal(f.randomCalls.length, count);
      if (name && name !== 'invalid') assert(result.message.includes("The depths are already answering your call. Maybe don't summon a second enormous sea creature until the first one gets here."));
    }
    for (const fn of ['performStats', 'performBackpack', 'performJournal']) {
      await f.c[fn](f.env, f.key, f.platform);
      assert.equal((await f.state()).leviathansWake.stage, 1);
    }
    for (const name of ['bubble', 'mend', 'astral echo']) {
      await f.cast(name);
      assert.equal((await f.state()).leviathansWake.stage, 1);
      assert.equal((await f.state()).round, 2);
    }
    await f.editProgress(p => { p.mana = 0; });
    const before = [...f.values];
    assert.match((await f.cast('moonbeam')).message, /enough Mana/);
    assert.deepEqual([...f.values], before);
  });

  await test('Charge mastery use and Echo commit on cast; stored charged/Echo damage and Aftershock order', async () => {
    const f = await fixture();
    const echo = (await f.c.getSpellDefinition('astral-echo')).echoTiers[3];
    await f.editState(s => {
      s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 2, manaDiscountAvailable: true };
      s.astralEcho = { naturalRoll: 4, tierId: echo.id, displayName: echo.displayName, damagePercent: echo.damagePercent };
    });
    f.rolls.push(20, 1); await f.cast();
    let s = await f.state();
    assert.equal((await f.progress()).mana, 85);
    assert.equal(s.enemy.hp, 1000);
    assert.equal(s.enemy.astralCharge.remainingDamageUses, 1);
    assert.equal(s.enemy.astralCharge.manaDiscountAvailable, false);
    assert.equal(s.astralEcho, undefined);
    assert.equal(s.leviathansWake.astralEchoSnapshot.damagePercent, echo.damagePercent);
    await f.editState(s => { delete s.enemy.astralCharge; });
    await f.cast('jelly'); // Legitimate Turn 2, and cannot spend the committed Echo.
    s = await f.state();
    assert.equal(s.leviathansWake.stage, 2);
    const hpBefore = s.enemy.hp;
    await f.editProgress(p => { p.stats.strength = 5; });
    const primary = f.c.applyPercentageDamageIncrease(60, 0.15);
    const echoed = f.c.applyPercentageOfDamage(primary, echo.damagePercent);
    const result = await f.c.advanceLeviathansWake(f.env, f.key, s, await f.progress(), f.platform);
    assert.equal(s.enemy.hp, hpBefore - primary - echoed - 5);
    assert(result.message.indexOf('Astral Echo activates!') < result.message.indexOf('Astral Aftershock activates!'));
    assert.equal(s.leviathansWake, undefined);
  });

  await test('later Charge/Echo do not attach to pending Wake and remain available for the normal action', async () => {
    const f = await fixture();
    f.rolls.push(14, 1); await f.cast(); await f.attack();
    const s = await f.state();
    s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: true };
    s.astralEcho = { naturalRoll: 1, tierId: 'faint', displayName: 'Faint', damagePercent: 0.25 };
    const snapshots = plain([s.enemy.astralCharge, s.astralEcho]);
    await f.c.advanceLeviathansWake(f.env, f.key, s, await f.progress(), f.platform);
    assert.equal(s.enemy.hp, 960);
    assert.deepEqual(plain([s.enemy.astralCharge, s.astralEcho]), snapshots);
  });

  await test('arrival victory including Aftershock killing blow runs Harvest once and skips requested cast cost/roll', async () => {
    const f = await fixture();
    f.rolls.push(20, 1); await f.cast(); await f.attack();
    await f.editState(s => { s.enemy.hp = 58; s.playerHp = 50; });
    await f.editProgress(p => { p.hp = 50; });
    const count = f.randomCalls.length;
    const result = await f.cast('falling star');
    assert.equal(result.won, true);
    assert(result.message.includes('Astral Aftershock activates!'));
    assert(result.message.includes('Astral Harvest activates!'));
    assert.equal(await f.state(), null);
    assert.equal((await f.progress()).mana, 90);
    assert.equal((await f.progress()).hp, 65);
    assert.deepEqual(f.randomCalls.slice(count), [[1, 1], [1, 1]], 'Only victory reward rolls');
    assert.equal(f.writes.filter(([op, key]) => op === 'delete' && key === f.c.getCombatKey(f.key)).length, 1);
  });

  await test('early victory/defeat clear pending state, with no refund or carryover', async () => {
    for (const defeat of [false, true]) {
      const f = await fixture();
      f.rolls.push(14, 1); await f.cast();
      await f.editState(s => {
        if (defeat) { s.playerHp = 1; s.perkUses = { 'fae-intervention': 1 }; }
        else s.enemy.hp = 1;
      });
      f.rolls.push(defeat ? 1 : 2, ...(defeat ? [20] : []));
      await f.attack();
      assert.equal(await f.state(), null);
      assert.equal((await f.progress()).mana, defeat ? 70 : 90);
      await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, f.platform);
      assert.equal((await f.state()).leviathansWake, undefined);
    }
  });

  await test('25% cosmetic eggs/Ancient flavor, combined priority, and full Discord/Twitch narration', async () => {
    for (const platform of ['discord', 'twitch']) {
      for (const kind of ['bubble', 'mend', 'combined']) {
        for (const chance of [0.249, 0.25]) {
          const f = await fixture(20, platform);
          const spell = await f.c.getSpellDefinition('leviathans-wake');
          f.rolls.push(20, 1);
          assert((await f.cast()).message.includes(spell.creatureTiers[4].cast));
          assert((await f.attack()).message.startsWith(spell.creatureTiers[4].warning));
          const s = await f.state();
          if (kind !== 'mend') s.bubble = { protection: 10 };
          if (kind !== 'bubble') s.mend = { healingPerTrigger: 10, remainingTriggers: 3 };
          const before = plain([s.bubble ?? null, s.mend ?? null, s.playerHp]);
          let checks = 0;
          f.math.random = () => { checks++; return chance; };
          const result = await f.c.advanceLeviathansWake(f.env, f.key, s, await f.progress(), platform);
          assert(result.message.startsWith(spell.creatureTiers[4].arrival));
          assert.equal(result.message.includes(spell.ancientFlavor), chance < 0.25);
          assert.equal(result.message.includes(spell.easterEggs[kind]), chance < 0.25);
          for (const other of ['bubble', 'mend', 'combined'].filter(k => k !== kind)) assert(!result.message.includes(spell.easterEggs[other]));
          assert.equal(checks, 2, 'One Ancient check and one cosmetic check');
          assert.deepEqual(plain([s.bubble ?? null, s.mend ?? null, s.playerHp]), before);
          assert.equal(s.enemy.hp, 940);
        }
      }
    }
  });

  await test('surviving arrival precedes a normal offensive cast, which still spends Mana and takes its turn', async () => {
    const f = await fixture(); f.rolls.push(14, 1); await f.cast(); await f.attack();
    const spell = await f.c.getSpellDefinition('leviathans-wake');
    const jelly = await f.c.getSpellDefinition('jelly');
    f.rolls.push(1, 2, 3, 1); // No Curiosity match; enemy misses.
    const result = await f.cast('jelly');
    const s = await f.state();
    assert(result.message.startsWith(spell.creatureTiers[3].arrival));
    assert.equal(s.leviathansWake, undefined);
    assert.equal(s.round, 4);
    assert(s.enemy.hp < 960, 'Both the 40-damage Wake and Jellyfish hit');
    // Account for the existing Jellyfish mastery outcome on a natural total of 6.
    const mastery = await f.c.getMasteryDefinition('jellyfish-mastery-1');
    const mood = mastery.effect.moods.find(m => 6 <= m.naturalMaximum);
    assert.equal((await f.progress()).mana, 70 - jelly.manaCost + (mood.effectType === 'restore-mana' ? mood.amount : 0));
  });

  await test('single remaining Charge use is consumed even when its Mana discount was already spent', async () => {
    const f = await fixture();
    await f.editState(s => {
      s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: false };
    });
    await f.cast();
    const s = await f.state();
    assert.equal((await f.progress()).mana, 70);
    assert.equal(s.enemy.astralCharge, undefined);
    assert.equal(s.leviathansWake.astralChargeSnapshot.damageIncrease, 0.15);
  });

  await test('failed action does not persist warning/arrival advancement', async () => {
    for (const stage of [1, 2]) {
      const f = await fixture(); await f.cast();
      if (stage === 2) await f.attack();
      const before = plain(await f.state());
      f.c.getActiveMasteries = async () => { throw new Error('Simulated content failure'); };
      await assert.rejects(f.attack(), /Simulated content failure/);
      assert.deepEqual(plain(await f.state()), before);
    }
  });

  await test('pending state survives KV serialization and rejects invalid stages/snapshots', async () => {
    const f = await fixture(); await f.cast();
    const s = await f.state();
    assert(f.c.isValidCombatState(s));
    for (const change of [w => { w.stage = 3; }, w => { w.naturalRoll = 21; },
      w => { w.critical = true; }, w => { w.astralEchoSnapshot = { damagePercent: 2 }; }]) {
      const invalid = structuredClone(s); change(invalid.leviathansWake);
      assert.equal(f.c.isValidCombatState(invalid), false);
    }
  });
  console.log(`${passed} test groups passed (all local; no network or live KV).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
