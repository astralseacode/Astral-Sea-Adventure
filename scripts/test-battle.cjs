// Offline standalone wandering battle, rarity, reward, rest, and Berry regression.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));

async function player(region = 'moonlit-reef') {
  const f = await fixture(5);
  f.math.random = () => 0.10;
  const key = `battle-${region}`;
  const progress = f.c.createEmptyProgress();
  progress.xp = f.c.totalXpForLevel(5);
  progress.currentRegion = region;
  progress.hp = 60;
  progress.mana = 40;
  progress.berries = 5;
  await f.c.savePlayerProgress(f.env, key, progress);
  return { ...f, key };
}

async function variantTest(index, blessingIndex = 0) {
  const f = await player();
  const canonical = plain(await f.c.getEnemyDefinition('bubble-nibbler'));
  f.math.random = () => 0.75;
  f.rolls.push(0, index);
  if (index === 2) f.rolls.push(blessingIndex);
  const started = await f.c.performBattle(f.env, f.key);
  assert.deepEqual(f.randomCalls.slice(1),
    index === 2 ? [[0, 2], [0, 2]] : [[0, 2]]);
  const combat = await f.c.getCombatState(f.env, f.key);
  const variant = ['Armored', 'Frenzied', 'Fae Touched'][index];
  assert.match(started.message, new RegExp(`Uncommon Encounter! (An|A) ${variant} Bubble Nibbler`));
  assert(started.message.includes('Moonlit Reef'));
  assert.equal(combat.wanderingBattle.variant, variant);
  assert.equal(combat.wanderingBattle.berryUses, 0);
  assert.equal(combat.playerHp, 60);
  assert.equal((await f.c.getPlayerProgress(f.env, f.key)).mana, 40);
  assert.equal(combat.adventureContext, undefined);
  assert.equal(await f.c.getActiveAdventure(f.env, f.key), null);
  assert.equal(combat.enemy.isBoss, false);
  assert.deepEqual(plain(await f.c.getEnemyDefinition('bubble-nibbler')), canonical);
  const expectedHp = canonical.hp + (index === 2
    ? Math.floor(canonical.hp * 0.1) * (blessingIndex === 2 ? 2 : 1) : 0);
  assert.equal(combat.enemy.hp, expectedHp);
  assert.equal(combat.enemy.maxHp, expectedHp);
  assert.equal(combat.enemy.protection || 0, index === 0 || (index === 2 && blessingIndex === 1)
    ? (index === 0 ? 20 : 10) : 0);
  assert.equal(combat.enemy.damageBonus, canonical.damageBonus +
    (index === 1 ? 3 : index === 2 && blessingIndex === 0 ? 2 : 0));
  assert.deepEqual(plain(combat.enemy.reward), canonical.reward);
  const repeated = await f.c.performBattle(f.env, f.key);
  assert.match(repeated.message, /Finish the current fight/);
  assert.deepEqual(plain(await f.c.getCombatState(f.env, f.key)), plain(combat));
  return { f, combat, canonical };
}

async function main() {
  const chance = await player();
  assert.equal(vm.runInContext('BATTLE_UNCOMMON_CHANCE', chance.c), 0.50);
  assert.equal(vm.runInContext('BATTLE_WISHPOCKET_CHANCE', chance.c), 0.05);
  assert.deepEqual(Array.from(vm.runInContext('BATTLE_VARIANTS', chance.c)),
    ['Armored', 'Frenzied', 'Fae Touched']);
  chance.math.random = () => 0.049999;
  await chance.c.performBattle(chance.env, chance.key);
  assert.equal((await chance.c.getCombatState(chance.env, chance.key)).wanderingBattle.variant, 'Wishpocket');
  await chance.c.deleteCombatState(chance.env, chance.key);
  chance.math.random = () => 0.05;
  await chance.c.performBattle(chance.env, chance.key);
  assert.equal((await chance.c.getCombatState(chance.env, chance.key)).wanderingBattle.variant, 'Common');
  await chance.c.deleteCombatState(chance.env, chance.key);
  chance.math.random = () => 0.499999;
  await chance.c.performBattle(chance.env, chance.key);
  assert.equal((await chance.c.getCombatState(chance.env, chance.key)).wanderingBattle.variant, 'Common');
  await chance.c.deleteCombatState(chance.env, chance.key);
  chance.math.random = () => 0.50;
  chance.rolls.push(0, 0);
  await chance.c.performBattle(chance.env, chance.key);
  assert.equal((await chance.c.getCombatState(chance.env, chance.key)).wanderingBattle.variant, 'Armored');
  await chance.c.deleteCombatState(chance.env, chance.key);
  const dispatcher = await player();
  dispatcher.c.Response = Response;
  dispatcher.c.verifyDiscordRequest = async () => true;
  const definitions = vm.runInContext('DISCORD_COMMANDS', dispatcher.c);
  assert.equal(definitions.filter(command => command.name === 'battle').length, 1);
  assert(vm.runInContext('DISCORD_HELP_TEXT', dispatcher.c).includes(
    '/battle: Battle a random enemy from your current region. That enemy may come with modifiers. You might even encounter something special'));
  const request = new Request('https://offline.invalid/discord/interactions', {
    method: 'POST',
    headers: { 'X-Signature-Ed25519': 'mock', 'X-Signature-Timestamp': 'mock' },
    body: JSON.stringify({ type: 2, data: { name: 'battle' },
      member: { user: { id: '777777777777777777', username: 'tester' } } }),
  });
  const dispatched = await (await dispatcher.c.handleDiscordInteractionCore(request,
    { ...dispatcher.env, DISCORD_PUBLIC_KEY: 'mock' })).json();
  assert.match(dispatched.data.content, /Enemy fight begins!/);
  const common = await player();
  const original = plain(await common.c.getEnemyDefinition('bubble-nibbler'));
  const opening = await common.c.performBattle(common.env, common.key);
  assert.equal(opening.message.split('\n')[0],
    'Enemy fight begins! A Bubble Nibbler drifts into your path as you travel through Moonlit Reef. Use /attack or /cast to strike.');
  const commonCombat = await common.c.getCombatState(common.env, common.key);
  assert.equal(commonCombat.wanderingBattle.variant, 'Common');
  assert.equal(commonCombat.enemy.hp, original.hp);
  assert.equal(commonCombat.enemy.damageBonus, original.damageBonus);
  assert.deepEqual(plain(commonCombat.enemy.reward), original.reward);
  assert.equal(commonCombat.playerHp, 60);
  assert.equal((await common.c.getPlayerProgress(common.env, common.key)).mana, 40);
  const normalReward = await player();
  await normalReward.c.performBattle(normalReward.env, normalReward.key);
  const normalCombat = await normalReward.c.getCombatState(normalReward.env, normalReward.key);
  normalCombat.enemy.hp = 0;
  normalReward.math.random = () => 0.99;
  const normalVictory = await normalReward.c.resolveCombatVictory(
    normalReward.env, normalReward.key, normalCombat, 20, normalCombat.enemy.maxHp, 'discord');
  assert.equal(normalVictory.xpReward, original.reward.xp.min);
  assert.equal(normalVictory.candyReward, original.reward.candies.min);
  assert.equal(await normalReward.c.getCombatState(normalReward.env, normalReward.key), null);
  assert.equal((await common.c.performRest(common.env, common.key, 'tester', 'short', 'discord')).message,
    'You cannot rest while in combat.');
  assert.equal((await common.c.performRest(common.env, common.key, 'tester', 'long', 'discord')).message,
    'You cannot rest while in combat.');
  assert.equal((await common.c.getPlayerProgress(common.env, common.key)).hp, 60);
  assert.equal((await common.c.getPlayerProgress(common.env, common.key)).mana, 40);
  const invalidBerry = await common.c.performEat(common.env, common.key, 'Tester', 'stone', 'discord');
  assert.match(invalidBerry.message, /Berry option/);
  assert.equal((await common.c.getCombatState(common.env, common.key)).wanderingBattle.berryUses, 0);
  const noBerry = await common.c.performEat(common.env, common.key, 'Tester', 'berry', 'discord');
  assert.match(noBerry.message, /Battle Berry Uses: 1\/2/);
  assert.equal((await common.c.getCombatState(common.env, common.key)).wanderingBattle.berryUses, 1);
  const second = await common.c.performEat(common.env, common.key, 'Tester', 'berry', 'discord');
  assert.match(second.message, /Battle Berry Uses: 2\/2/);
  const beforeThird = await common.c.getPlayerProgress(common.env, common.key);
  const third = await common.c.performEat(common.env, common.key, 'Tester', 'berry', 'discord');
  assert.equal(third.message,
    "You've already eaten 2 berries during this battle. You'll have to save the rest for later.");
  assert.equal((await common.c.getPlayerProgress(common.env, common.key)).berries, beforeThird.berries);
  assert.equal((await common.c.getCombatState(common.env, common.key)).wanderingBattle.berryUses, 2);
  assert.equal(await common.c.getActiveAdventure(common.env, common.key), null);
  await common.c.deleteCombatState(common.env, common.key);
  const rested = await common.c.performRest(common.env, common.key, 'tester', 'short', 'discord');
  assert(!rested.message.includes('cannot rest while in combat'));
  const another = await common.c.performBattle(common.env, common.key);
  assert.match(another.message, /Enemy fight begins!/);
  assert.equal((await common.c.getCombatState(common.env, common.key)).wanderingBattle.berryUses, 0);

  const armored = await variantTest(0);
  const frenzied = await variantTest(1);
  const fae = [];
  for (const blessing of [0, 1, 2]) fae.push(await variantTest(2, blessing));
  assert.equal(armored.combat.enemy.protection, 20);
  const protectedEnemy = plain(armored.combat);
  assert.equal(armored.f.c.damageCombatEnemy(protectedEnemy, 15), 0);
  assert.equal(protectedEnemy.enemy.protection, 5);
  assert.equal(armored.f.c.damageCombatEnemy(protectedEnemy, 10, 5), 10);
  assert.equal(protectedEnemy.enemy.protection, 0);
  assert.equal(frenzied.combat.enemy.damageBonus, frenzied.canonical.damageBonus + 3);
  for (const [test, xpRate, candyRate] of [[armored, 1.10, 1], [frenzied, 1.10, 1.10], [fae[0], 1.10, 1.10]]) {
    const { f, combat, canonical } = test;
    const startingXp = (await f.c.getPlayerProgress(f.env, f.key)).xp;
    f.math.random = () => 0.99;
    combat.enemy.hp = 0;
    const victory = await f.c.resolveCombatVictory(f.env, f.key, combat, 20, combat.enemy.maxHp, 'discord');
    assert.equal(victory.xpReward, Math.floor(canonical.reward.xp.min * xpRate));
    assert.equal(victory.candyReward, Math.floor(canonical.reward.candies.min * candyRate));
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).xp, startingXp + victory.xpReward);
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).hp, 60);
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).mana, 40);
    assert.equal(await f.c.getCombatState(f.env, f.key), null);
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).combatProgress['moonlit-reef'], undefined);
    f.math.random = () => 0.10;
    await f.c.performBattle(f.env, f.key);
    const nextCombat = await f.c.getCombatState(f.env, f.key);
    assert.equal(nextCombat.wanderingBattle.variant, 'Common');
    assert.equal(nextCombat.wanderingBattle.berryUses, 0);
    assert.equal(nextCombat.enemy.protection || 0, 0);
    assert.equal(nextCombat.enemy.damageBonus, canonical.damageBonus);
  }
  for (const variantIndex of [0, 1, 2]) {
    const { f } = await variantTest(variantIndex);
    for (const count of [1, 2]) {
      assert.match((await f.c.performEat(f.env, f.key, 'Tester', 'berry', 'discord')).message,
        new RegExp(`Battle Berry Uses: ${count}/2`));
    }
    const inventory = (await f.c.getPlayerProgress(f.env, f.key)).berries;
    assert.match((await f.c.performEat(f.env, f.key, 'Tester', 'berry', 'discord')).message,
      /already eaten 2 berries during this battle/);
    assert.equal((await f.c.getPlayerProgress(f.env, f.key)).berries, inventory);
  }
  const full = await player();
  const fullProgress = await full.c.getPlayerProgress(full.env, full.key);
  fullProgress.hp = 100;
  fullProgress.mana = 100;
  await full.c.savePlayerProgress(full.env, full.key, fullProgress);
  await full.c.performBattle(full.env, full.key);
  assert.match((await full.c.performEat(full.env, full.key, 'Tester', 'berry', 'discord')).message,
    /already feeling great/);
  assert.equal((await full.c.getCombatState(full.env, full.key)).wanderingBattle.berryUses, 0);
  const starfall = await player('starfall-trench');
  const regionEnemyIds = new Set((await starfall.c.getRegionCombatEntries('starfall-trench')).map(e => e.enemy));
  await starfall.c.performBattle(starfall.env, starfall.key);
  assert(regionEnemyIds.has((await starfall.c.getCombatState(starfall.env, starfall.key)).enemy.id));
  assert.equal((await starfall.c.getCombatState(starfall.env, starfall.key)).enemy.isBoss, false);
  await starfall.c.deleteCombatState(starfall.env, starfall.key);
  await starfall.c.performAdventure(starfall.env, starfall.key, 1, 'discord');
  assert.match((await starfall.c.performBattle(starfall.env, starfall.key)).message,
    /Finish your current Adventure/);
  const adventure = await starfall.c.getActiveAdventure(starfall.env, starfall.key);
  assert.equal(adventure.berriesEaten, 0);
  const adventureEnemy = await starfall.c.getEnemyDefinition('starstone-lanternfish');
  assert.equal(adventureEnemy.hp, 150);
  assert.equal(adventureEnemy.damageBonus, 6);
  const defeated = await player();
  await defeated.c.performBattle(defeated.env, defeated.key);
  const lostCombat = await defeated.c.getCombatState(defeated.env, defeated.key);
  await defeated.c.resolveCombatDefeat(defeated.env, defeated.key, lostCombat);
  assert.equal((await defeated.c.getPlayerProgress(defeated.env, defeated.key)).hp, 0);
  assert.equal((await defeated.c.getPlayerProgress(defeated.env, defeated.key)).mana, 40);
  assert.equal(await defeated.c.getCombatState(defeated.env, defeated.key), null);
  assert.match((await defeated.c.performBattle(defeated.env, defeated.key)).message, /Rest before/);
  const invalid = await player();
  invalid.values.set(`progress:${invalid.key}`, '{invalid');
  assert.match((await invalid.c.performBattle(invalid.env, invalid.key)).message,
    /player state is unavailable/);
  assert.equal(await invalid.c.getCombatState(invalid.env, invalid.key), null);
  const invalidRegion = await player();
  invalidRegion.values.set(`progress:${invalidRegion.key}`,
    JSON.stringify({ ...invalidRegion.c.createEmptyProgress(), currentRegion: 'nowhere' }));
  assert.match((await invalidRegion.c.performBattle(invalidRegion.env, invalidRegion.key)).message,
    /current region is unavailable/);
  assert.equal(await invalidRegion.c.getCombatState(invalidRegion.env, invalidRegion.key), null);
  const emptyRegion = await player();
  emptyRegion.c.getRegionCombatEntries = async () => [];
  assert.match((await emptyRegion.c.performBattle(emptyRegion.env, emptyRegion.key)).message,
    /No wandering enemies/);
  assert.equal(await emptyRegion.c.getCombatState(emptyRegion.env, emptyRegion.key), null);
  const boss = JSON.parse(fs.readFileSync(path.join(root, 'data/enemies/bosses/starfall-trench/meteor-lure-angler-boss.json')));
  assert.equal(boss.hp, 260);
  assert.equal(boss.damageBonus, 9);
  console.log('PASS /battle common, variants/blessings, rewards, rest, Berry limit, region, and Adventure isolation');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
