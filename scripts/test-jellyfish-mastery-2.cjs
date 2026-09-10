// Run with: node scripts/test-jellyfish-mastery-2.cjs
// Uses the shared offline fixture: local JSON content, in-memory KV, no network.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0;

async function setup(level = 21, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => { p.mana = 50; p.hp = 50; });
  await f.editState(s => {
    s.playerHp = 50;
    // Isolate mood rewards from double rewards; Triple checks explicitly enable them.
    s.perkUses = { 'astral-curiosity': 1 };
  });
  const resolve = f.c.resolvePlayerCombatAction;
  f.actions = [];
  f.c.resolvePlayerCombatAction = async (...args) => {
    f.actions.push(plain(args[3]));
    return resolve(...args);
  };
  f.jelly = (dice, enemyRoll = 1) => {
    f.rolls.push(...dice, enemyRoll);
    return f.cast('jelly');
  };
  return f;
}

async function test(name, run) {
  await run(); passed++; console.log(`PASS ${name}`);
}

async function main() {
  await test('automatic level 21/50 qualification, unlock text, and all five tier I/II rewards', async () => {
    const cases = [
      { id: 'sad', dice: [1, 1, 2], mana: 60, hp: 50, damage: [4, 4] },
      { id: 'sleepy', dice: [1, 2, 3], mana: 40, hp: 70, damage: [6, 6] },
      { id: 'curious', dice: [1, 3, 6], mana: 40, hp: 50, damage: [10, 10] },
      { id: 'confident', dice: [4, 5, 6], mana: [40, 45], hp: 50, damage: [20, 23] },
      { id: 'dedicated', dice: [6, 7, 8], mana: 40, hp: 50, damage: [29, 33] },
    ];
    for (const level of [20, 21, 50]) {
      for (const row of cases) {
        const f = await setup(level); const upgraded = level >= 21;
        const masteries = await f.c.getActiveMasteries(level);
        assert.equal(masteries.some(m => m.id === 'jellyfish-mastery-2'), upgraded);
        const result = await f.jelly(row.dice);
        const s = await f.state(); const p = await f.progress();
        assert.equal(f.actions[0].jellyfishMasteryEffect.id, row.id);
        assert.equal(f.actions[0].damage, row.damage[upgraded ? 1 : 0]);
        assert.equal(s.enemy.hp, 1000 - f.actions[0].damage);
        assert.equal(p.mana, Array.isArray(row.mana) ? row.mana[upgraded ? 1 : 0] : row.mana);
        assert.equal(s.playerHp, row.hp);
        assert.equal(await f.c.getBackpackTotal(f.env, f.key), row.id === 'curious' ? 50 : 0);
        assert.equal(p.berries, upgraded && row.id === 'curious' ? 1 : 0);
        assert.equal(s.jellyfishResolve?.offensiveRollModifier, upgraded && row.id === 'sad' ? 1 : undefined);
        assert.equal(s.jellyfishSleepyGuard?.damageReduction, upgraded && row.id === 'sleepy' ? 5 : undefined);
        assert.equal(result.message.includes('Jellyfish Mastery II activates!'), upgraded);
      }
    }
    const f = await setup();
    assert((await f.c.formatMasteryUnlocks(20, 21)).some(line => line.includes('Jellyfish Mastery II')));
  });

  await test('every natural total keeps its mood under Fae/Blessing/Rebound/Curiosity/Resolve modifiers', async () => {
    for (let total = 3; total <= 24; total++) {
      const f = await setup();
      const dice = [1, 1, 1]; let extra = total - 3;
      for (let i = 0; i < 3; i++) { const amount = Math.min(7, extra); dice[i] += amount; extra -= amount; }
      const blessing = await f.c.getSpellDefinition('elf_blessing');
      await f.editProgress(p => {
        p.stats.fae = 5; p.stats.strength = 3;
        p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing));
      });
      await f.editState(s => {
        s.astralRebound = { offensiveRollModifier: 2 };
        s.astralCuriosity = { offensiveRollModifier: 1 };
        s.jellyfishResolve = { offensiveRollModifier: 1 };
      });
      await f.jelly(dice);
      const action = f.actions[0];
      const mood = total <= 4 ? 'sad' : total <= 8 ? 'sleepy' : total <= 13 ? 'curious' : total <= 17 ? 'confident' : 'dedicated';
      assert.equal(action.jellyfishMasteryEffect.id, mood);
      assert.equal(action.roll, total + 12);
      assert.equal(action.damage, (total + 12 >= 24 ? 35 : total) + 3 + (mood === 'confident' ? 8 : mood === 'dedicated' ? 12 : 0));
    }
  });

  await test('Sad does not self-buff; prior Resolve is consumed and refreshed to exactly one +1', async () => {
    const f = await setup();
    await f.jelly([1, 1, 2]);
    assert.equal(f.actions[0].roll, 4);
    assert.equal((await f.state()).jellyfishResolve.offensiveRollModifier, 1);
    await f.jelly([1, 1, 2]);
    assert.equal(f.actions[1].roll, 5);
    assert.deepEqual(plain((await f.state()).jellyfishResolve), { offensiveRollModifier: 1 });
    await f.jelly([1, 3, 6]);
    assert.equal(f.actions[2].roll, 11);
    assert.equal((await f.state()).jellyfishResolve, undefined);
  });

  await test('Resolve qualifies for Attack and all offensive spells, only Falling Star Accuracy and Wake cast roll', async () => {
    const cases = [
      ['attack', [2, 1], 3], ['star-spark', [2, 1], 3], ['jelly', [1, 3, 6, 1], 11],
      ['moonbeam', [2, 3, 1, 1], 4], ['falling-star', [1, 2, 3, 4, 1], 5], ['wake', [14, 1], 15],
    ];
    for (const [spell, dice, expected] of cases) {
      const f = await setup();
      await f.editState(s => { s.jellyfishResolve = { offensiveRollModifier: 1 }; });
      f.rolls.push(...dice);
      const result = spell === 'attack' ? await f.attack() : await f.cast(spell);
      assert.equal(f.actions[0].roll, expected, spell);
      assert.equal((await f.state()).jellyfishResolve, undefined, spell);
      assert(result.message.includes('Jellyfish Resolve'), spell);
      if (spell === 'falling-star') assert.deepEqual(f.actions[0].curiosityDice, [1, 2, 3]);
      if (spell === 'wake') {
        assert.equal((await f.state()).leviathansWake.naturalRoll, 14);
        assert.equal((await f.state()).leviathansWake.creatureId, 'leviathan');
      }
    }
    for (const spell of ['mend', 'bubble', 'astral echo', 'elf blessing', 'invalid']) {
      const f = await setup();
      await f.editState(s => { s.jellyfishResolve = { offensiveRollModifier: 1 }; });
      await f.cast(spell);
      assert.equal((await f.state()).jellyfishResolve.offensiveRollModifier, 1, spell);
    }
  });

  await test('Sleepy Guard survives misses, applies once after Armor/Bubble, and preserves minimum one damage', async () => {
    const f = await setup(); await f.jelly([1, 2, 3]);
    assert.equal((await f.state()).jellyfishSleepyGuard.damageReduction, 5);
    await f.editProgress(p => { p.stats.armor = 3; });
    await f.cast('bubble');
    await f.editState(s => { s.enemy.damageBonus = 20; });
    const before = await f.state();
    const raw = f.c.getCombatRollResult(15).damage + 20;
    const afterArmor = Math.max(1, raw - 3);
    const afterBubble = Math.max(1, afterArmor - before.bubble.protection);
    f.rolls.push(1, 15); const result = await f.attack();
    let s = await f.state();
    assert.equal(s.playerHp, before.playerHp - Math.max(1, afterBubble - 5));
    assert.equal(s.jellyfishSleepyGuard, undefined);
    assert.equal(s.bubble, undefined);
    assert.equal(s.astralRebound.offensiveRollModifier, 2);
    assert(result.message.includes('Bubble Mastery activates!'));
    assert(result.message.includes('Jellyfish Sleepy Guard'));
    f.rolls.push(1, 2); const second = await f.attack();
    assert(!second.message.includes('Jellyfish Sleepy Guard'));

    const g = await setup();
    await g.cast('bubble');
    await g.editState(s => { s.jellyfishSleepyGuard = { damageReduction: 5 }; });
    const hp = (await g.state()).playerHp;
    g.rolls.push(1, 2); await g.attack();
    assert.equal((await g.state()).playerHp, hp - 1);
    assert.equal((await g.state()).jellyfishSleepyGuard, undefined);
  });

  await test('Guard applies before Fae Intervention, Resilience, and Mend without changing those hooks', async () => {
    const f = await setup(); await f.cast('mend');
    await f.editState(s => { s.playerHp = 2; s.jellyfishSleepyGuard = { damageReduction: 5 }; });
    f.rolls.push(1, 20); const result = await f.attack(); const s = await f.state();
    assert.equal(s.playerHp, 8); // Fae leaves 1; mastered weak Mend restores 7.
    assert.equal(s.perkUses['fae-intervention'], 1);
    assert.equal(s.perkUses['astral-resilience'], 1);
    assert.equal(s.mend.remainingTriggers, 2);
    assert(result.message.includes('Jellyfish Sleepy Guard'));
  });

  await test('Curious guarantees exactly 50 Candies and one Berry immediately, independent of Luck/RNG', async () => {
    const f = await setup();
    await f.editProgress(p => { p.stats.luck = 15; p.berries = 3; });
    const result = await f.jelly([1, 3, 6]);
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), 50);
    assert.equal((await f.progress()).berries, 4);
    assert.equal((await f.state()).enemy.hp, 990);
    assert.deepEqual(f.randomCalls, [[1, 8], [1, 8], [1, 8], [1, 20]], 'Only spell and enemy dice');
    const mastery = await f.c.getMasteryDefinition('jellyfish-mastery-2');
    assert(result.message.includes(mastery.effect.moods[2].activationLine));
  });

  await test('critical Dedicated Triple: base 35, Strength, +12, Charge, Echo, Aftershock, independent Curiosity', async () => {
    const f = await setup();
    await f.editProgress(p => { p.stats.fae = 5; p.stats.strength = 3; });
    await f.editState(s => {
      s.jellyfishResolve = { offensiveRollModifier: 1 };
      s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: true };
      s.astralEcho = { naturalRoll: 2, tierId: 'test', displayName: 'Test Echo', damagePercent: 0.5 };
    });
    await f.jelly([6, 6, 6]);
    const a = f.actions[0]; const s = await f.state(); const p = await f.progress();
    assert.equal(a.jellyfishMasteryEffect.id, 'dedicated');
    assert.equal(a.roll, 24);
    assert.equal(a.damage, 58); // (35 + 3 + 12) * 1.15 = 57.5, half-up.
    assert.equal(a.echoDamage, 29);
    assert.equal(a.aftershockDamage, 5);
    assert.equal(s.enemy.hp, 908);
    assert.equal(s.playerHp, 60);
    assert.equal(p.mana, 55);
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), 100);
    assert.equal(p.berries, 0);
    assert.equal(s.astralCuriosity.offensiveRollModifier, 1);
    assert.equal(s.enemy.astralCharge, undefined);
    assert.equal(s.astralEcho, undefined);
  });

  await test('Confident Mana is restored before a killing blow completes victory and Harvest', async () => {
    const f = await setup(); await f.editState(s => { s.enemy.hp = 1; });
    f.rolls.push(4, 5, 6); const result = await f.cast('jelly');
    assert.equal(result.won, true);
    assert.equal(f.actions[0].damage, 23);
    assert.equal((await f.progress()).mana, 65); // 50 - 10 + 5 + 20 Harvest.
    assert(result.message.includes('+8 damage and you recover 5 Mana.'));
  });

  await test('dynamic caps and truthful partial/full resource lines retain secondary benefits on both platforms', async () => {
    for (const platform of ['discord', 'twitch']) {
      for (const [id, missing] of [['sad', 7], ['sad', 0], ['sleepy', 7], ['sleepy', 0], ['confident', 3], ['confident', 0]]) {
        const f = await setup(21, platform);
        await f.editProgress(p => { p.stats.focus = 5; p.stats.vitality = 5; p.mana = 150 - missing; });
        await f.editState(s => { s.playerMaxHp = 150; s.playerHp = 150 - missing; });
        const s = await f.state();
        const mastery = await f.c.getMasteryDefinition('jellyfish-mastery-2');
        const effect = mastery.effect.moods.find(m => m.id === id);
        const result = await f.c.resolvePlayerCombatAction(f.env, f.key, s, {
          damage: 0, roll: 1, message: 'resource boundary test', jellyfishMasteryEffect: effect,
        }, platform);
        assert(result.message.includes(missing ? `recover ${missing} ${id === 'sleepy' ? 'HP' : 'Mana'}` : `${id === 'sleepy' ? 'HP' : 'Mana'} is already full`));
        assert.equal(id === 'sleepy' ? (await f.state()).playerHp : (await f.progress()).mana, 150);
        if (id === 'sad') assert.equal((await f.state()).jellyfishResolve.offensiveRollModifier, 1);
        if (id === 'sleepy') assert.equal((await f.state()).jellyfishSleepyGuard.damageReduction, 5);
      }
    }
  });

  await test('Resolve and Guard clear with victory/defeat and do not carry into new encounters', async () => {
    for (const defeat of [false, true]) {
      const f = await setup();
      await f.editState(s => {
        s.jellyfishResolve = { offensiveRollModifier: 1 };
        s.jellyfishSleepyGuard = { damageReduction: 5 };
        if (defeat) { s.playerHp = 1; s.perkUses['fae-intervention'] = 1; }
        else s.enemy.hp = 1;
      });
      f.rolls.push(defeat ? 1 : 2, ...(defeat ? [20] : []));
      await f.attack(); assert.equal(await f.state(), null);
      await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, f.platform);
      const s = await f.state();
      assert.equal(s.jellyfishResolve, undefined); assert.equal(s.jellyfishSleepyGuard, undefined);
    }
  });

  await test('new content/state validation rejects invalid upgrade values', async () => {
    const f = await setup(); const mastery = await f.c.getMasteryDefinition('jellyfish-mastery-2');
    const invalid = plain(mastery); invalid.effect.moods[3].amount = 13;
    assert.throws(() => f.c.validateMasteryDefinition(invalid, invalid.id), /Invalid mastery effect/);
    for (const field of ['jellyfishResolve', 'jellyfishSleepyGuard']) {
      const s = await f.state(); s[field] = field === 'jellyfishResolve' ? { offensiveRollModifier: 2 } : { damageReduction: 10 };
      assert.equal(f.c.isValidCombatState(s), false);
    }
  });
  console.log(`${passed} Jellyfish Mastery II test groups passed (offline only).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
