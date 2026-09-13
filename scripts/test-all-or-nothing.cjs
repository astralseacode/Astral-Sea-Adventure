// Run with: node scripts/test-all-or-nothing.cjs. KV and content are local only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');

async function fixture(level = 35, platform = 'discord') {
  const values = new Map();
  const rolls = [];
  const context = vm.createContext({ console, structuredClone, Math,
    fetch: () => { throw new Error('Network forbidden'); } });
  vm.runInContext(source.replace('export default {', 'const workerExport = {'), context);
  context.fetchCachedJson = async (key, url) => {
    const relative = url.split('/main/data/')[1];
    assert(relative);
    return JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8').replace(/^\uFEFF/, ''));
  };
  context.randomInteger = (min, max) => {
    const value = rolls.length ? rolls.shift() : min;
    assert(value >= min && value <= max, `${value} outside ${min}..${max}`);
    return value;
  };
  const env = { Backpack: {
    get: async key => values.get(key) ?? null,
    put: async (key, value) => values.set(key, value),
    delete: async key => values.delete(key),
  } };
  const key = 'local-test';
  const progress = context.createEmptyProgress();
  progress.xp = context.totalXpForLevel(level);
  progress.mana = 200;
  await context.savePlayerProgress(env, key, progress);
  const enemy = { id: 'test-enemy', name: 'Test Enemy', level: 20, hp: 10000,
    damageBonus: 0, reward: { candies: { min: 1, max: 1 }, xp: { min: 1, max: 1 } },
    defeatCandyLoss: 0 };
  await context.startCombatEncounter(env, key, context.getRegionById('moonlit-reef'), 1, enemy, platform);
  const f = { context, env, key, rolls,
    state: () => context.getCombatState(env, key),
    progress: () => context.getPlayerProgress(env, key),
    cast: (name = 'all or nothing') => context.performCastUnlocked(env, key, name, platform),
    editState: async fn => { const s = await f.state(); fn(s); await context.saveCombatState(env, key, s); },
    editProgress: async fn => { const p = await f.progress(); fn(p); await context.savePlayerProgress(env, key, p); },
  };
  return f;
}

(async () => {
  const locked = await fixture(34);
  const lockedMana = (await locked.progress()).mana;
  assert.match((await locked.cast()).message, /Reach Level 35/);
  assert.equal((await locked.progress()).mana, lockedMana);
  const broke = await fixture();
  await broke.editProgress(p => { p.mana = 19; });
  assert.match((await broke.cast()).message, /enough Mana/);
  assert.equal((await broke.progress()).mana, 19);

  const f = await fixture();
  await f.editProgress(p => { p.mana = 300; p.stats.strength = 4; });
  await f.editState(s => { s.playerHp = 150; s.enemy.hp = 10000; });
  for (let tier = 1; tier <= 6; tier++) {
    await f.editProgress(p => { p.mana = 100; });
    f.rolls.push(2);
    const before = await f.state();
    const mana = (await f.progress()).mana;
    const result = await f.cast();
    assert.match(result.message, new RegExp(`Roll 2 → ${tier * 25 + 4} dmg`));
    assert.equal((await f.state()).allOrNothingStreak, tier);
    if (tier === 1) assert.equal((await f.progress()).mana, mana - 20);
    assert.equal((await f.state()).enemy.hp, before.enemy.hp - tier * 25 - 4);
  }
  f.rolls.push(1);
  const beforeFail = await f.state();
  const fail = await f.cast();
  assert.match(fail.message, /Roll 1 → 0 dmg/);
  assert.equal((await f.state()).allOrNothingStreak, 0);
  assert.equal((await f.state()).enemy.hp, beforeFail.enemy.hp);
  f.rolls.push(2);
  assert.match((await f.cast()).message, /Roll 2 → 29 dmg/);

  const pending = await fixture();
  await pending.editState(s => { s.astralRebound = { offensiveRollModifier: 2 }; });
  pending.rolls.push(1);
  assert.match((await pending.cast()).message, /Roll 1 → 0 dmg/);
  assert.equal((await pending.state()).astralRebound.offensiveRollModifier, 2);
  assert.equal((await pending.state()).faeSecondOpinion.offensiveRollModifier, 3);
  const echo = await fixture();
  await echo.editState(s => { s.astralEcho = { naturalRoll: 4, tierId: 'perfect',
    displayName: 'Perfect Echo', damagePercent: 0.5 }; });
  echo.rolls.push(1);
  assert.match((await echo.cast()).message, /Roll 1 → 0 dmg/);
  assert.equal((await echo.state()).astralEcho.damagePercent, 0.5);
  echo.rolls.push(2);
  assert.match((await echo.cast()).message, /Roll 2 → 25 dmg/);
  assert.equal((await echo.state()).astralEcho, undefined);
  const twitch = await fixture(35, 'twitch');
  twitch.rolls.push(2);
  assert.match((await twitch.cast()).message, /You leave it to chance\.\n\n.*\n\nRoll 2 → 25 dmg/s);
  console.log('PASS All or Nothing: unlock, Mana, six streak tiers, reset, Strength, pending bonuses, Fae, Echo, Twitch narration');
})().catch(error => { console.error(error); process.exitCode = 1; });
