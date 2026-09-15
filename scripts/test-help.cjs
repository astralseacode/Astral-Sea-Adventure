// Run: node scripts/test-help.cjs. Local content, in-memory KV, no network.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));

async function ready(mana = 200, level = 50, platform = 'discord') {
  const f = await fixture(level, platform);
  await f.editProgress(p => { p.stats.focus = 10; p.mana = mana; });
  return f;
}

async function main() {
  const gated = await ready(200, 49);
  let before = [...gated.values];
  assert.match((await gated.cast('Help!')).message, /Reach Level 50/);
  assert.deepEqual([...gated.values], before);
  const unlocked = await ready();
  const definition = await unlocked.c.getSpellDefinition('help');
  assert.equal(definition.type, 'ultimate');
  assert.deepEqual(Array.from(await unlocked.c.formatLevelUpUnlocks(49, 50)), [definition.levelUpLine]);
  assert.equal(definition.opening.length, 18);
  assert.equal(definition.successLines.length, 7);
  assert.equal(definition.failureLines.length, 16);

  for (const mana of [0, 149]) {
    const f = await ready(mana);
    before = [...f.values];
    assert.match((await f.cast('help')).message, /150 current Mana/);
    assert.deepEqual([...f.values], before);
    assert.equal(f.randomCalls.length, 0);
    assert.equal((await f.state()).helpUsed, undefined);
  }
  for (const [mana, cost] of [[150,75],[151,76],[200,100],[240,120],[300,150]]) {
    const f = await ready(mana);
    assert.equal((await f.progress()).mana, mana);
    f.rolls.push(11, 1);
    const result = await f.cast('help!');
    assert.equal((await f.progress()).mana, mana - cost);
    assert.match(result.message, new RegExp(`Mana taken: ${cost} \\| Mana remaining: ${mana-cost}`));
  }

  // Every face, both platforms: one Ultimate die plus the normal enemy die.
  for (const platform of ['discord', 'twitch']) {
    for (let natural = 1; natural <= 20; natural++) {
      const f = await ready(200, 50, platform);
      f.rolls.push(natural, 1);
      const { message } = await f.cast(platform === 'discord' ? 'Help!' : 'help');
      const s = await f.state();
      const success = natural >= 11;
      assert.equal(s.enemy.hp, success ? 500 : 1000);
      assert.equal(s.helpUsed, true);
      assert.equal(s.round, 2);
      assert.equal((await f.progress()).mana, 100);
      assert.deepEqual(f.randomCalls, [[1,20],[1,20]]);
      assert(message.includes(success ? 'WIN 50/50' : 'LOST 50/50'));
      assert(message.includes(`Help! | Natural d20: ${natural} | ${success ? 'SUCCESS' : 'FAILURE'} | Enemy HP removed: ${success ? 500 : 0} | Enemy HP remaining: ${success ? 500 : 1000} | Mana taken: 100 | Mana remaining: 100`));
      for (const line of [...definition.opening, ...(success ? definition.successLines : definition.failureLines)]) assert(message.includes(line));
      assert(!/[\p{Extended_Pictographic}\u2600-\u27BF]/u.test(message));
      for (const term of ['Momentum', 'Fae Second Opinion', 'Fae Mischief', 'Oddity', 'Aftershock', 'Curiosity activates', 'FULL MOON', 'Perfect Jellyfish']) assert(!message.includes(term));
      assert(!message.split('Enemy 1')[0].includes('Critical'));
      assert.equal(s.perkUses?.['astral-momentum'], undefined);
      assert.equal(s.perkUses?.['astral-curiosity'], undefined);
      assert.equal(s.faeSecondOpinion, undefined);
      assert.equal(s.astralPatience, undefined);
      await f.editProgress(p => { p.mana = 200; });
      before = [...f.values];
      assert.match((await f.cast('help!')).message, /already cast/);
      assert.deepEqual([...f.values], before);
      assert.equal(f.randomCalls.length, 2);
      await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, platform);
      assert.equal((await f.state()).helpUsed, undefined);
      f.rolls.push(11, 1);
      await f.cast('help!');
      assert.equal((await f.state()).helpUsed, true);
    }
  }
  for (const [hp, removed] of [[600,300],[300,150],[100,50],[301,150],[3,1],[2,1],[1,0]]) {
    const f = await ready();
    await f.editState(s => { s.enemy.hp = hp; });
    f.rolls.push(20, 1);
    const result = await f.cast('help');
    assert.equal((await f.state()).enemy.hp, hp - removed);
    assert(result.message.includes(`Enemy HP removed: ${removed} | Enemy HP remaining: ${hp-removed}`));
  }

  // Loaded modifiers must be preserved, not merely ignored for this result.
  for (const chapter of [1,2,3]) for (const natural of [1,10,11,20]) {
    const f = await ready();
    const blessing = await f.c.getSpellDefinition('elf_blessing');
    await f.editProgress(p => {
      p.stats.strength = 20; p.stats.fae = 10;
      p.statusEffects = f.c.addStatusEffect(p, f.c.createElfBlessingEffect(blessing));
    });
    await f.editState(s => {
      s.storytellerChapter = chapter; s.storytellerActivated = true;
      s.shizukisPresence = { offensiveRollModifier: 3, bonusDamage: 15 };
      s.risingPower = { spellId: 'moonbeam', steps: 3 };
      s.astralRhythmPreviousSpell = 'moonbeam';
      s.faeSecondOpinion = { offensiveRollModifier: 3 };
      s.astralCuriosity = { offensiveRollModifier: 1 };
      s.enemy.astralCharge = { manaReduction: 0.5, damageIncrease: 0.15, remainingDamageUses: 1, manaDiscountAvailable: true };
      s.berryEffects = { shimmerDiscount: true };
      s.astralEcho = { naturalRoll: 1, tierId: 'faint', displayName: 'Faint', damagePercent: 0.5 };
      s.familiar = { id: 'astral-dragonling', total: 2, actions: 0, serial: 1, astralBond: 'armed' };
      s.familiarSerial = 1;
    });
    const original = await f.state();
    const originalProgress = await f.progress();
    assert(original, 'Modifier fixture must survive validation');
    // Tripwires also protect against future changes to shared offensive pipelines.
    for (const name of ['resolvePlayerCombatAction', 'resolveOffensiveRoll', 'rollSpellDamage', 'resolveAstralCuriosity', 'applyFamiliarAction']) {
      f.c[name] = () => { throw new Error(`Help entered ${name}`); };
    }
    f.rolls.push(natural, 1);
    const result = await f.cast('help');
    const s = await f.state();
    assert.equal(s.enemy.hp, natural >= 11 ? 500 : 1000);
    assert.equal((await f.progress()).mana, 100);
    for (const key of ['shizukisPresence','risingPower','astralRhythmPreviousSpell','faeSecondOpinion','astralCuriosity','berryEffects','astralEcho','familiar']) assert.deepEqual(plain(s[key]), plain(original[key]), key);
    assert.deepEqual(plain(s.enemy.astralCharge), plain(original.enemy.astralCharge));
    assert.deepEqual(plain((await f.progress()).statusEffects), plain(originalProgress.statusEffects));
    assert.equal((await f.progress()).astralExpeditionRolls, originalProgress.astralExpeditionRolls);
    assert.deepEqual(f.randomCalls, [[1,20],[1,20]]);
    assert(result.message.includes(`Natural d20: ${natural}`));
  }

  const hit = await ready();
  hit.rolls.push(10, 10);
  await hit.cast('help');
  assert((await hit.state()).playerHp < 100, 'Normal enemy hit still applies');
  const outside = await ready();
  await outside.c.deleteCombatState(outside.env, outside.key);
  before = [...outside.values];
  assert.match((await outside.cast('help')).message, /during a fight/);
  assert.deepEqual([...outside.values], before);

  // Existing pending spells advance only after Help passes validation.
  const wake = await ready(300);
  wake.rolls.push(1, 1);
  await wake.cast('wake');
  await wake.editProgress(p => { p.mana = 149; });
  before = [...wake.values];
  await wake.cast('help');
  assert.deepEqual([...wake.values], before);
  await wake.editProgress(p => { p.mana = 200; });
  wake.rolls.push(11, 1);
  await wake.cast('help');
  assert.equal((await wake.state()).leviathansWake.stage, 2);

  // Twitch's endpoint receives action=cast and args=help/help! from !cast.
  // Standalone action=help retains its existing unknown-action response.
  const routing = await ready();
  routing.c.Response = Response;
  const captured = [];
  routing.c.performCast = async (_env, _key, name, platform) => {
    captured.push([name, platform]); return { message: 'routed' };
  };
  for (const name of ['help','help!']) {
    const response = await routing.c.handleTwitchRequest(new URL(`https://local.invalid/?user=test&action=cast&args=${name}`), routing.env);
    assert.equal(await response.text(), 'routed');
  }
  assert.deepEqual(captured, [['help','twitch'],['help!','twitch']]);
  const standalone = await routing.c.handleTwitchRequest(new URL('https://local.invalid/?user=test&action=help'), routing.env);
  assert.equal(captured.length, 2);
  assert.match(await standalone.text(), /Unknown command/);
  const choices = vm.runInContext('DISCORD_COMMANDS.find(c => c.name === "cast").options[0].choices', routing.c);
  assert(choices.some(choice => choice.name === 'Help!' && choice.value === 'help'));
  routing.c.verifyDiscordRequest = async () => true;
  const discord = await routing.c.handleDiscordInteractionCore(new Request('https://local.invalid/discord', {
    method: 'POST',
    headers: { 'X-Signature-Ed25519': 'offline', 'X-Signature-Timestamp': '1' },
    body: JSON.stringify({ type: 2, user: { id: '123456789' }, data: {
      name: 'cast', options: [{ name: 'spell', value: 'Help!' }],
    } }),
  }), { ...routing.env, DISCORD_PUBLIC_KEY: 'offline' });
  assert.equal((await discord.json()).data.content, 'routed');
  assert.deepEqual(captured[2], ['Help!', 'discord']);
  console.log('Help!: progression, all 20 faces on both platforms, thresholds, overflow, rounding, reset, modifier isolation, flavor, receipts, and enemy response passed.');
}

module.exports = { main };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
