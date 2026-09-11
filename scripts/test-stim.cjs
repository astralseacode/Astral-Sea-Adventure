// Run: node scripts/test-stim.cjs. Local content, in-memory KV, no network.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0;
async function test(name, run) {
  await run(); passed++; console.log(`PASS ${name}`);
}
async function setup(level = 1, platform = 'discord') {
  const f = await fixture(level, platform);
  f.stim = (input = '') => f.c.performStim(f.env, f.key, platform, input);
  f.hurt = async hp => {
    await f.editProgress(p => { p.hp = hp; });
    await f.editState(s => { s.playerHp = hp; });
  };
  f.restart = () => f.c.startCombatEncounter(f.env, f.key,
    f.c.getRegionById('moonlit-reef'), 1, f.enemy, platform);
  f.pool = plain(vm.runInContext('STIM_SUCCESS_MESSAGES', f.c));
  return f;
}
async function rejectsWithoutChange(f, input, pattern) {
  const values = [...f.values]; const calls = f.randomCalls.length;
  assert.match((await f.stim(input)).message, pattern);
  assert.deepEqual([...f.values], values);
  assert.equal(f.randomCalls.length, calls, 'Rejected Stim must not choose flavor or roll');
}
async function main() {
  await test('21 verbatim approved lines, all reachable with full platform parity', async () => {
    const f = await setup();
    assert.equal(f.pool.length, 21);
    assert.equal(new Set(f.pool).size, 21);
    // Digest independently extracted from the approved pool in the request.
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(f.pool)).digest('hex'),
      'a53519576278fb85606702bff84fd3f827a918df671f3135015790dae11e7295');
    for (let index = 0; index < 21; index++) {
      const messages = [];
      for (const platform of ['discord', 'twitch']) {
        const g = await setup(1, platform); await g.hurt(1);
        g.rolls.push(index, 1);
        const result = await g.stim();
        assert(result.message.includes(f.pool[index]));
        assert.equal(f.pool.filter(line => result.message.includes(line)).length, 1);
        assert.equal(result.message.split(f.pool[index]).length - 1, 1);
        messages.push(result.message.replace(/\s+/g, ' ').replace(/\s*\|\s*/g, ' ').trim());
      }
      assert.equal(messages[0], messages[1]);
    }
  });

  await test('Level 1, exact current caps, 1 HP and one missing HP; no cost or player dice', async () => {
    for (const platform of ['discord', 'twitch']) {
      for (const [hp, vitality, buffer, cap] of [[1, 0, null, 100], [7, 5, null, 150],
        [149, 5, null, 150], [23, 10, null, 200], [149, 0, 'long', 150]]) {
        const f = await setup(1, platform);
        await f.editProgress(p => { p.stats.vitality = vitality; p.restBufferType = buffer; p.hp = hp; p.mana = 0; p.berries = 3; });
        // Deliberately leave playerMaxHp stale: Stim must use the current helper.
        await f.editState(s => { s.playerHp = hp; });
        let entry;
        const resolve = f.c.resolvePlayerCombatAction;
        f.c.resolvePlayerCombatAction = (...args) => { entry = plain({ state: args[2], action: args[3] }); return resolve(...args); };
        const message = (await f.stim()).message;
        const state = await f.state(); const progress = await f.progress();
        assert.equal(entry.state.playerHp, cap, 'Heal precedes retaliation');
        assert.equal(entry.state.playerMaxHp, cap);
        assert.equal(entry.action.damage, 0);
        assert.equal(entry.action.roll, undefined);
        assert.equal(state.playerHp, cap); assert.equal(progress.hp, cap);
        assert.equal(state.stimUses, 1); assert.equal(state.round, 2);
        assert.equal(state.enemy.hp, 1000);
        assert.equal(progress.mana, 0); assert.equal(progress.berries, 3);
        assert.equal(await f.c.getBackpackTotal(f.env, f.key), 0);
        assert.deepEqual(f.randomCalls, [[0, 20], [1, 20]], 'Only flavor index and enemy die');
        assert(message.includes(`HP fully restored: ${cap}/${cap}`));
        assert(message.includes(`HP ${cap}/${cap} | MP 0/`));
        assert.match(message, /Enemy 1 → 0 dmg/);
      }
    }
  });

  await test('full, used, malformed, and out-of-battle rejection; information and spam cannot reset uses', async () => {
    for (const platform of ['discord', 'twitch']) {
      const f = await setup(20, platform);
      await f.editProgress(p => { p.evocationCooldownTurns = 7; });
      await rejectsWithoutChange(f, '', /already at full HP/);
      assert.equal((await f.state()).stimUses, 0);
      await rejectsWithoutChange(f, 'again', /without any arguments/);
      await f.hurt(99); await f.stim();
      assert.equal((await f.progress()).evocationCooldownTurns, 6);
      for (let n = 0; n < 10; n++) {
        await rejectsWithoutChange(f, '', /already used your Stim for this battle/);
        await f.c.performStats(f.env, f.key, '', platform);
        await f.c.performBackpack(f.env, f.key, '', platform);
        await f.c.cancelPendingCombat(f.env, f.key, platform);
        assert.equal((await f.state()).stimUses, 1);
      }
      await f.hurt(1);
      await rejectsWithoutChange(f, '', /already used/);
      assert.equal((await f.progress()).evocationCooldownTurns, 6);
      await f.c.deleteCombatState(f.env, f.key);
      await rejectsWithoutChange(f, '', /only be used during a battle/);
      await f.restart(); assert.equal((await f.state()).stimUses, 0);
      await f.stim(); assert.equal((await f.state()).stimUses, 1);
    }
  });

  await test('simultaneous attempts serialize; older battle states remain compatible', async () => {
    const f = await setup(); await f.hurt(1);
    await f.editState(s => { delete s.stimUses; });
    const results = await Promise.all([f.stim(), f.stim(), f.stim()]);
    assert.equal(results.filter(r => /HP fully restored/.test(r.message)).length, 1);
    assert.equal(results.filter(r => /already used/.test(r.message)).length, 2);
    assert.equal((await f.state()).round, 2);
    assert.equal((await f.state()).stimUses, 1);
    const state = await f.state();
    for (const invalid of [-1, 2, 0.5, '1', null, true]) {
      assert.equal(f.c.isValidCombatState({ ...state, stimUses: invalid }), false);
    }
  });

  await test('offensive modifiers, Echo, Charge, Blessing, and perks are untouched', async () => {
    const f = await setup(21); await f.hurt(1);
    const blessing = await f.c.getSpellDefinition('elf_blessing');
    await f.editProgress(p => {
      p.stats.strength = 10; p.stats.fae = 10; p.mana = 0;
      p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing));
    });
    await f.editState(s => {
      s.astralRebound = { offensiveRollModifier: 2 };
      s.astralCuriosity = { offensiveRollModifier: 1 };
      s.jellyfishResolve = { offensiveRollModifier: 1 };
      s.astralEcho = { naturalRoll: 4, tierId: 'perfect', displayName: 'Perfect Echo', damagePercent: 0.5 };
      s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 2, manaDiscountAvailable: true };
    });
    const before = plain(await f.state()); const progress = plain(await f.progress());
    const result = await f.stim(); const after = plain(await f.state());
    for (const key of ['astralRebound', 'astralCuriosity', 'jellyfishResolve', 'astralEcho', 'enemy', 'perkUses']) {
      assert.deepEqual(after[key], before[key]);
    }
    assert.deepEqual(plain((await f.progress()).statusEffects), progress.statusEffects);
    assert.equal((await f.progress()).mana, 0);
    assert(!/Aftershock|Momentum|Roll:/.test(result.message));
  });

  await test('Armor, Bubble Mastery, Sleepy Guard, and Mend retain the shared damage/heal order', async () => {
    for (const platform of ['discord', 'twitch']) {
      const f = await setup(21, platform); await f.hurt(1);
      await f.editProgress(p => { p.stats.armor = 2; p.mana = 0; });
      await f.editState(s => {
        s.bubble = { naturalRoll: 1, tierId: 'weak', displayName: 'Weak Bubble', protection: 5 };
        s.jellyfishSleepyGuard = { damageReduction: 5 };
        s.mend = { naturalRoll: 1, tierId: 'weak', displayName: 'Weak Mend', healingPerTrigger: 5, remainingTriggers: 3 };
      });
      f.rolls.push(0, 20); const result = await f.stim(); const state = await f.state();
      assert.equal(state.playerHp, 87); // 100 - (30 - 2 Armor - 5 Bubble - 5 Guard) + 5 Mend.
      assert.equal(state.bubble, undefined); assert.equal(state.jellyfishSleepyGuard, undefined);
      assert.equal(state.mend.remainingTriggers, 2);
      assert.equal(state.astralRebound.offensiveRollModifier, 2);
      assert.equal((await f.progress()).mana, 10);
      assert.match(result.message, /Mend restores 5 HP/);
      assert.equal(state.stimUses, 1);
    }
  });

  await test('Stim after Fae Intervention, and normal Intervention/Resilience after Stim', async () => {
    const saved = await setup(21); await saved.hurt(1);
    await saved.editProgress(p => { p.mana = 0; });
    saved.rolls.push(1, 20); await saved.attack();
    assert.equal((await saved.state()).playerHp, 1);
    assert.equal((await saved.state()).perkUses['fae-intervention'], 1);
    await saved.stim();
    assert.equal((await saved.state()).playerHp, 100);
    assert.equal((await saved.state()).perkUses['fae-intervention'], 1);
    const f = await setup(21); await f.hurt(1);
    await f.editProgress(p => { p.mana = 0; });
    await f.editState(s => { s.enemy.damageBonus = 100; });
    f.rolls.push(0, 20); await f.stim();
    assert.equal((await f.state()).playerHp, 1);
    assert.equal((await f.state()).stimUses, 1);
    assert.equal((await f.state()).perkUses['fae-intervention'], 1);
    assert.equal((await f.state()).perkUses['astral-resilience'], 1);
    assert.equal((await f.progress()).mana, 10);
  });

  await test('Berry remains repeatable +25 HP/+25 Mana and does not spend or reset Stim', async () => {
    const f = await setup(); await f.hurt(1);
    await f.editProgress(p => { p.berries = 3; p.mana = 0; });
    for (let n = 1; n <= 2; n++) {
      await f.c.performEat(f.env, f.key, 'Explorer', 'berry', 'discord');
      assert.equal((await f.state()).playerHp, 1 + 25 * n);
      assert.equal((await f.progress()).mana, 25 * n);
      assert.equal((await f.state()).stimUses, 0);
      assert.equal((await f.state()).round, 1);
    }
    await f.stim(); await f.hurt(50);
    await f.c.performEat(f.env, f.key, 'Explorer', 'berry', 'discord');
    assert.equal((await f.state()).playerHp, 75);
    assert.equal((await f.progress()).mana, 75);
    assert.equal((await f.progress()).berries, 0);
    assert.equal((await f.state()).stimUses, 1);
  });

  await test('Wake warning/arrival and Evocation tick on successful Stim only', async () => {
    for (const stage of [1, 2]) {
      const f = await setup(20);
      f.rolls.push(1, 1); await f.cast('wake');
      if (stage === 2) await f.attack();
      await f.editProgress(p => { p.evocationCooldownTurns = 7; });
      await rejectsWithoutChange(f, '', /already at full HP/);
      await rejectsWithoutChange(f, 'invalid', /without any arguments/);
      await f.hurt(1); const round = (await f.state()).round;
      const result = await f.stim();
      assert.equal((await f.state()).round, round + 1);
      assert.equal((await f.state()).leviathansWake?.stage, stage === 1 ? 2 : undefined);
      assert.equal((await f.progress()).evocationCooldownTurns, 6);
      const wake = await f.c.getSpellDefinition('leviathans-wake');
      assert(result.message.includes(wake.creatureTiers[0][stage === 1 ? 'warning' : 'arrival']));
      await f.hurt(1);
      await rejectsWithoutChange(f, '', /already used/);
    }
    const f = await setup(20); await f.hurt(1);
    await f.editProgress(p => { p.mana = 0; });
    await f.cast('evocation'); assert.equal((await f.progress()).evocationCooldownTurns, 7);
    assert.equal((await f.state()).stimUses, 0);
    await f.stim(); assert.equal((await f.progress()).evocationCooldownTurns, 6);
    for (let turn = 0; turn < 6; turn++) await f.attack();
    assert.equal((await f.progress()).evocationCooldownTurns, 0);
    await f.editProgress(p => { p.mana = 0; });
    await f.cast('evocation'); assert.equal((await f.state()).stimUses, 1);
  });

  await test('victory, defeat, and Wake-arrival victory clear battle use; each new enemy allows Stim', async () => {
    for (const ending of ['victory', 'defeat', 'wake']) {
      const f = await setup(ending === 'wake' ? 20 : 1);
      if (ending === 'wake') {
        f.rolls.push(1, 1); await f.cast('wake'); await f.attack();
        await f.editState(s => { s.enemy.hp = 1; });
        await f.editProgress(p => { p.evocationCooldownTurns = 7; });
      }
      await f.hurt(1);
      if (ending === 'defeat') await f.editState(s => { s.enemy.damageBonus = 100; });
      f.rolls.push(0, ending === 'defeat' ? 20 : 1);
      const result = await f.stim();
      if (ending === 'victory') {
        await f.editState(s => { s.enemy.hp = 1; });
        f.rolls.push(20); await f.attack();
      }
      if (ending === 'wake') {
        assert.match(result.message, /HP fully restored: 100\/100/);
        assert(!/Enemy \d+ →/.test(result.message), 'Dead enemy cannot retaliate');
        assert.equal((await f.progress()).evocationCooldownTurns, 6);
      }
      assert.equal(await f.state(), null);
      assert.equal((await f.progress()).stimUses, undefined);
      await f.restart(); assert.equal((await f.state()).stimUses, 0);
      await f.hurt(1); f.rolls.length = 0; await f.stim();
      assert.equal((await f.state()).stimUses, 1);
    }
  });

  await test('Adventure resume cannot reset Stim; later rooms and defeat retries get a new use', async () => {
    const f = await setup();
    vm.runInContext('globalThis.testNow = 1800000000000; Date.now = () => testNow;', f.c);
    await f.c.deleteCombatState(f.env, f.key);
    await f.editProgress(p => { p.hp = 1; });
    await f.c.performAdventure(f.env, f.key, '1', 'discord');
    const direction = name => f.c.performAdventureDirection(f.env, f.key, name, 'discord');
    await direction('right'); assert.equal((await f.state()).stimUses, 0);
    await f.stim();
    const used = [...f.values];
    await f.c.performAdventure(f.env, f.key, '1', 'discord');
    await direction('right');
    assert.deepEqual([...f.values], used);
    await f.editState(s => { s.enemy.hp = 1; });
    f.rolls.push(20); await f.attack();
    assert.equal(await f.state(), null);
    assert.equal((await f.c.getActiveAdventure(f.env, f.key)).currentRoomId, 'inner-crossing');
    vm.runInContext('testNow += 3000', f.c);
    await direction('left'); assert.equal((await f.state()).stimUses, 0);
    await f.hurt(1); await f.stim();
    await f.editState(s => { s.enemy.damageBonus = 100; });
    f.rolls.push(1, 20); await f.attack();
    assert.equal(await f.state(), null);
    vm.runInContext('testNow += 3000', f.c);
    await direction('left'); assert.equal((await f.state()).stimUses, 0);
    await f.hurt(1); await f.stim();
    assert.equal((await f.state()).stimUses, 1);
  });

  await test('failed resolution rolls back HP, Stim use, Wake stage, and Evocation counter', async () => {
    const f = await setup(20); f.rolls.push(1, 1); await f.cast('wake');
    await f.hurt(1); await f.editProgress(p => { p.evocationCooldownTurns = 7; });
    const before = [...f.values];
    const resolve = f.c.resolvePlayerCombatAction;
    f.c.resolvePlayerCombatAction = async () => { throw new Error('offline failure'); };
    await assert.rejects(f.stim(), /offline failure/);
    assert.deepEqual([...f.values], before);
    f.c.resolvePlayerCombatAction = resolve;
    await f.stim(); assert.equal((await f.state()).stimUses, 1);
  });

  await test('real Twitch and Discord dispatch, no arguments, Level 1 discovery and local definition', async () => {
    for (const platform of ['discord', 'twitch']) {
      const f = await setup(1, platform); f.c.Response = Response;
      f.c.verifyDiscordRequest = async () => true;
      const key = platform === 'discord' ? 'backpack:discord:123456789' : 'backpack:stimtest';
      await f.c.savePlayerProgress(f.env, key, { ...f.c.createEmptyProgress(), hp: 1 });
      await f.c.startCombatEncounter(f.env, key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, platform);
      const invoke = async (command, invalid = false) => {
        if (platform === 'twitch') {
          return (await f.c.handleTwitchRequest(new URL(`https://offline.invalid/?user=stimtest&action=${command}&args=${invalid ? 'extra' : ''}`), f.env)).text();
        }
        const request = new Request('https://offline.invalid/discord/interactions', {
          method: 'POST', headers: { 'X-Signature-Ed25519': 'mock', 'X-Signature-Timestamp': 'mock' },
          body: JSON.stringify({ type: 2, user: { id: '123456789', username: 'stimtest' },
            data: { name: command, ...(invalid ? { options: [{ name: 'extra', type: 3, value: 'extra' }] } : {}) } }),
        });
        return (await (await f.c.handleDiscordInteraction(request, { ...f.env, DISCORD_PUBLIC_KEY: 'mock' })).json()).data.content;
      };
      const before = [...f.values];
      assert.match(await invoke('stim', true), /without any arguments/);
      assert.deepEqual([...f.values], before);
      assert.match(await invoke('help'), /Level 1 — Stim/);
      assert.match(await invoke('stim'), /HP fully restored: 100\/100/);
      assert.equal((await f.c.getCombatState(f.env, key)).stimUses, 1);
      const commands = plain(vm.runInContext('DISCORD_COMMANDS', f.c));
      assert.equal(commands.filter(c => c.name === 'stim').length, 1);
      assert.equal(commands.find(c => c.name === 'stim').options, undefined);
      assert(!commands.find(c => c.name === 'cast').options[0].choices.some(c => c.value === 'stim'));
    }
  });
  console.log(`${passed} Stim test groups passed (offline only).`);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
