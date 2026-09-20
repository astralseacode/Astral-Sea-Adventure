// Deterministic Wishpocket encounter, timer, reward, and isolation regression.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

const designs = [
  ['moonlit-reef', 30, 40, 70, 300, 500],
  ['starfall-trench', 50, 300, 450, 850, 1300],
  ['whispering-kelp-forest', 70, 420, 600, 1200, 1800],
  ['leviathans-wake', 90, 560, 800, 1650, 2400],
  ['sunken-kings-throne', 110, 730, 1000, 2200, 3200],
  ['astral-nexus', 130, 950, 1300, 3000, 4400],
];

async function player(region = 'moonlit-reef', level = 5) {
  const f = await fixture(level);
  const key = `wish-${region}`;
  const progress = f.c.createEmptyProgress();
  progress.xp = f.c.totalXpForLevel(level);
  progress.currentRegion = region;
  progress.hp = 60;
  progress.mana = 40;
  progress.berries = 5;
  await f.c.savePlayerProgress(f.env, key, progress);
  f.math.random = () => 0.01;
  return { ...f, key };
}

async function start(f) {
  const result = await f.c.performBattle(f.env, f.key);
  assert.match(result.message, /Rare Encounter!/);
  assert.match(result.message, /Wishpocket appeared!/);
  return f.c.getCombatState(f.env, f.key);
}

async function main() {
  const constants = await player();
  assert.equal(vm.runInContext('BATTLE_WISHPOCKET_CHANCE', constants.c), .05);
  assert.equal(vm.runInContext('BATTLE_UNCOMMON_CHANCE', constants.c), .50);
  assert.equal(vm.runInContext('WISHPOCKET_JACKPOT_CHANCE', constants.c), .50);
  for (const [region, hp, xpMin, xpMax, candyMin, candyMax] of designs) {
    const f = await player(region);
    const combat = await start(f);
    assert.equal(combat.enemy.hp, hp);
    assert.equal(combat.enemy.maxHp, hp);
    assert.deepEqual(JSON.parse(JSON.stringify(combat.enemy.reward)), {
      xp: { min: xpMin, max: xpMax },
      candies: { min: candyMin, max: candyMax },
    });
    assert.equal(combat.wanderingBattle.actions, 0);
    assert.equal(combat.wanderingBattle.berryUses, 0);
    assert.equal(combat.enemy.isBoss, false);
    assert.equal(combat.adventureContext, undefined);
    assert.equal(await f.c.getActiveAdventure(f.env, f.key), null);
    f.math.random = () => .99;
    f.rolls.push(xpMin, candyMin);
    combat.enemy.hp = 0;
    const victory = await f.c.resolveCombatVictory(f.env, f.key,
      combat, 20, hp, 'discord');
    assert.equal(victory.xpReward, xpMin);
    assert.equal(victory.candyReward, candyMin);
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).berries, 5);
    assert.equal(await f.c.getCombatState(f.env, f.key), null);
  }
  const jackpot = await player();
  const jackpotCombat = await start(jackpot);
  jackpotCombat.enemy.hp = 0;
  jackpot.rolls.push(70, 500);
  jackpot.math.random = () => .01;
  const prize = await jackpot.c.resolveCombatVictory(jackpot.env, jackpot.key,
    jackpotCombat, 20, 30, 'discord');
  assert.equal(prize.xpReward, 70);
  assert.equal(prize.candyReward, 1500);
  assert.match(prize.message, /Jackpot! 3x Star Candies/);
  const lucky = await player();
  const luckyProgress = await lucky.c.getPlayerProgress(lucky.env, lucky.key);
  luckyProgress.stats.luck = 5;
  await lucky.c.savePlayerProgress(lucky.env, lucky.key, luckyProgress);
  const luckyCombat = await start(lucky);
  luckyCombat.enemy.hp = 0;
  lucky.rolls.push(40, 301);
  lucky.math.random = () => .01;
  const luckyPrize = await lucky.c.resolveCombatVictory(lucky.env, lucky.key,
    luckyCombat, 20, 30, 'discord');
  assert.equal(luckyPrize.xpReward, 40);
  assert.equal(luckyPrize.candyReward, Math.floor(301 * 3 * 1.10));

  const escape = await player();
  await start(escape);
  escape.math.random = () => .99;
  const before = await escape.c.getPlayerProgress(escape.env, escape.key);
  const invalid = await escape.c.performEat(escape.env, escape.key, 'Tester', 'stone', 'discord');
  assert(invalid.message);
  assert.equal((await escape.c.getCombatState(escape.env, escape.key)).wanderingBattle.actions, 0);
  assert.match((await escape.c.performRest(escape.env, escape.key,
    'Tester', 'short', 'discord')).message, /cannot rest while in combat/);
  assert.match((await escape.c.performRest(escape.env, escape.key,
    'Tester', 'long', 'discord')).message, /cannot rest while in combat/);
  assert.equal((await escape.c.getPlayerProgress(escape.env, escape.key)).hp, before.hp);
  assert.equal((await escape.c.getPlayerProgress(escape.env, escape.key)).mana, before.mana);
  for (let action = 1; action <= 4; action++) {
    escape.rolls.push(1);
    const result = await escape.c.performAttack(escape.env, escape.key, 'discord');
    if (action < 4) {
      assert.equal((await escape.c.getCombatState(escape.env, escape.key)).wanderingBattle.actions, action);
      assert.match(result.message, new RegExp(`Escape: ${4 - action} actions remaining`));
    } else {
      assert.match(result.message, /Wishpocket escaped!/);
      assert.equal(await escape.c.getCombatState(escape.env, escape.key), null);
    }
  }
  assert.equal(await escape.c.getBackpackTotal(escape.env, escape.key), 0);
  escape.math.random = () => .01;
  assert.equal((await start(escape)).wanderingBattle.actions, 0);

  const finalHit = await player();
  await start(finalHit);
  finalHit.math.random = () => .99;
  for (let action = 1; action <= 3; action++) {
    finalHit.rolls.push(1);
    await finalHit.c.performAttack(finalHit.env, finalHit.key, 'discord');
  }
  const lastState = await finalHit.c.getCombatState(finalHit.env, finalHit.key);
  lastState.enemy.hp = 1;
  await finalHit.c.saveCombatState(finalHit.env, finalHit.key, lastState);
  finalHit.rolls.push(20, 40, 300);
  const lastVictory = await finalHit.c.performAttack(finalHit.env, finalHit.key, 'discord');
  assert.match(lastVictory.message, /Wishpocket bursts open/);
  assert.equal(await finalHit.c.getCombatState(finalHit.env, finalHit.key), null);

  const oneShot = await player();
  await start(oneShot);
  oneShot.math.random = () => .99;
  oneShot.rolls.push(20, 40, 300);
  assert.match((await oneShot.c.performAttack(oneShot.env, oneShot.key,
    'discord')).message, /Wishpocket bursts open/);

  const berries = await player();
  const berryCombat = await start(berries);
  berryCombat.playerHp = 30;
  await berries.c.saveCombatState(berries.env, berries.key, berryCombat);
  berries.math.random = () => .99;
  assert.match((await berries.c.performEat(berries.env, berries.key,
    'Tester', 'berry', 'discord')).message, /Battle Berry Uses: 1\/2/);
  assert.equal((await berries.c.getCombatState(berries.env, berries.key)).wanderingBattle.actions, 1);
  assert.match((await berries.c.performEat(berries.env, berries.key,
    'Tester', 'berry', 'discord')).message, /Battle Berry Uses: 2\/2/);
  const inventory = (await berries.c.getPlayerProgress(berries.env, berries.key)).berries;
  assert.match((await berries.c.performEat(berries.env, berries.key,
    'Tester', 'berry', 'discord')).message, /already eaten 2 berries/);
  assert.equal((await berries.c.getPlayerProgress(berries.env, berries.key)).berries, inventory);
  assert.equal((await berries.c.getCombatState(berries.env, berries.key)).wanderingBattle.actions, 2);
  const support = await player('moonlit-reef', 10);
  await start(support);
  support.math.random = () => .99;
  const rejected = await support.c.performCast(support.env, support.key,
    'not-a-spell', 'discord');
  assert(rejected.message);
  assert.equal((await support.c.getCombatState(support.env, support.key)).wanderingBattle.actions, 0);
  const bubble = await support.c.performCast(support.env, support.key,
    'bubble', 'discord');
  assert(bubble.message);
  assert.equal((await support.c.getCombatState(support.env, support.key)).wanderingBattle.actions, 1);
  const stimState = await support.c.getCombatState(support.env, support.key);
  stimState.playerHp = 30;
  await support.c.saveCombatState(support.env, support.key, stimState);
  const stim = await support.c.performStim(support.env, support.key, 'discord');
  assert(stim.message);
  assert.equal((await support.c.getCombatState(support.env, support.key)).wanderingBattle.actions, 2);
  const evocation = await support.c.performCast(support.env, support.key,
    'evocation', 'discord');
  assert(evocation.message);
  assert.equal((await support.c.getCombatState(support.env, support.key)).wanderingBattle.actions, 3);
  const finish = await support.c.performCast(support.env, support.key,
    'star', 'discord');
  assert(finish.message);
  assert.equal(await support.c.getCombatState(support.env, support.key), null);
  console.log('PASS Wishpocket regions, reward bounds, jackpot, escape, rest, and Berries');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
