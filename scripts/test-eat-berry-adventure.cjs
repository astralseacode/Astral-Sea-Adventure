// Run: node scripts/test-eat-berry-adventure.cjs. In-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const eat = f => f.c.performEatUnlocked(f.env, f.key, 'Tester', 'berry', f.platform);
async function giveBerries(f) {
  await f.editProgress(p => { p.berries = 20; p.hp = 50; p.mana = 0; });
}
async function startRun(f, number = 1) {
  const now = Date.now();
  await f.c.saveActiveAdventure(f.env, f.key, {
    version: 1, regionId: 'moonlit-reef', adventureNumber: number,
    adventureId: `test-adventure-${number}`, name: 'Test Adventure',
    currentRoomId: 'start', status: 'awaiting-direction',
    visitedRooms: ['start'], completedRooms: [], collectedRewards: [],
    playerHp: 50, playerMaxHp: 100, startedAt: now, updatedAt: now,
  });
}

(async () => {
  const outside = await fixture(24);
  await outside.c.deleteCombatState(outside.env, outside.key);
  await giveBerries(outside);
  for (let i = 0; i < 5; i++) {
    await outside.editProgress(p => { p.hp = 50; p.mana = 0; });
    const result = await eat(outside);
    assert(!result.message.includes('Adventure Berry Uses'));
  }
  assert.equal((await outside.progress()).berries, 15);
  assert.equal(await outside.c.getActiveAdventure(outside.env, outside.key), null);

  await startRun(outside);
  assert.equal((await outside.c.getActiveAdventure(outside.env, outside.key)).berriesEaten ?? 0, 0);
  for (let i = 1; i <= 4; i++) {
    await outside.editProgress(p => { p.hp = 50; p.mana = 0; });
    const result = await eat(outside);
    assert(result.message.includes(`Adventure Berry Uses: ${i}/4`));
    assert.equal((await outside.c.getActiveAdventure(outside.env, outside.key)).berriesEaten, i);
  }
  const before = JSON.stringify([...outside.values]);
  assert.match((await eat(outside)).message, /already eaten 4 berries during this adventure/);
  assert.equal(JSON.stringify([...outside.values]), before);
  await outside.c.clearActiveAdventure(outside.env, outside.key);
  await outside.editProgress(p => { p.hp = 50; p.mana = 0; });
  assert(!((await eat(outside)).message.includes('Adventure Berry Uses')));
  await startRun(outside, 2);
  assert.equal((await outside.c.getActiveAdventure(outside.env, outside.key)).berriesEaten ?? 0, 0);

  const battle = await fixture(24);
  await giveBerries(battle);
  await startRun(battle);
  await battle.editState(s => { s.adventureContext = {
    adventureId: 'test-adventure-1', adventureNumber: 1,
    roomId: 'start', nextRoomId: 'next', isBoss: false,
  }; s.playerHp = 50; });
  for (let i = 1; i <= 4; i++) {
    await battle.editProgress(p => { p.hp = 50; p.mana = 0; });
    assert((await eat(battle)).message.includes(`Adventure Berry Uses: ${i}/4`));
    if (i === 2) {
      await battle.c.deleteCombatState(battle.env, battle.key);
      const adventure = await battle.c.getActiveAdventure(battle.env, battle.key);
      adventure.currentRoomId = 'next';
      adventure.completedRooms.push('start');
      adventure.visitedRooms.push('next');
      adventure.updatedAt = Date.now();
      await battle.c.saveActiveAdventure(battle.env, battle.key, adventure);
      await battle.c.startCombatEncounter(battle.env, battle.key,
        battle.c.getRegionById('moonlit-reef'), 2, battle.enemy, battle.platform);
      await battle.editState(s => { s.adventureContext = {
        adventureId: 'test-adventure-1', adventureNumber: 1,
        roomId: 'next', nextRoomId: 'boss', isBoss: false,
      }; s.playerHp = 50; });
    }
  }
  const battleBefore = JSON.stringify([...battle.values]);
  const round = (await battle.state()).round;
  assert.match((await eat(battle)).message, /already eaten 4 berries/);
  assert.equal(JSON.stringify([...battle.values]), battleBefore);
  assert.equal((await battle.state()).round, round);
  await battle.editProgress(p => { p.mana = 100; });
  battle.rolls.push(1, 1);
  const spell = await battle.cast('berry');
  assert(!spell.message.includes('already eaten 4 berries'));
  assert(!spell.message.includes('enough Mana'));
  assert.equal((await battle.c.getActiveAdventure(battle.env, battle.key)).berriesEaten, 4);

  console.log('Adventure berry consumption regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
