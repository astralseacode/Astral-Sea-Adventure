// Run: node scripts/test-rest-cap-sync.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function run(buffer, bonus) {
  const f = await fixture(1, 'discord');
  await f.editProgress(p => {
    p.stats.vitality = 5;
    p.restBufferType = buffer;
    p.hp = 150 + bonus;
    p.mana = 100 + bonus;
  });
  await f.editState(s => {
    s.playerHp = 150 + bonus;
    s.playerMaxHp = 150 + bonus;
  });
  assert.equal(f.c.getPlayerResourceCaps(await f.progress()).hp, 150 + bonus);
  assert.match(f.c.formatDiscordCombatHud(await f.state(), await f.progress()),
    new RegExp(`HP ${150 + bonus}/${150 + bonus}`));

  // Spending the temporary HP and Mana is the existing Rest-buffer expiration rule.
  await f.editProgress(p => { p.hp = 150; p.mana = 100; });
  const progress = await f.progress();
  assert.equal(progress.restBufferType, null);
  assert.equal(f.c.getPlayerResourceCaps(progress).hp, 150);
  const combat = await f.state();
  assert.equal(combat.playerMaxHp, 150);
  assert.equal(combat.playerHp, 150);
  assert.match(f.c.formatDiscordCombatHud(combat, progress), /HP 150\/150/);

  // A damaged player in that same encounter must remain below the current cap.
  await f.editState(s => { s.playerHp = 24; });
  await f.editProgress(p => { p.hp = 24; });
  assert.match((await f.c.performStim(f.env, f.key, 'discord')).message,
    /HP fully restored: 150\/150/);
  assert.equal((await f.state()).playerMaxHp, 150);

  const ordinary = await f.c.startCombatEncounter(f.env, f.key,
    f.c.getRegionById('moonlit-reef'), 1, f.enemy, 'discord');
  assert.match(ordinary.message, /HP 150\/150/);
  assert.equal((await f.state()).playerMaxHp, 150);

  // A boss battle created from a previously boosted Adventure uses current progress.
  const adventure = {
    regionId: 'moonlit-reef', adventureNumber: 1, adventureId: 'test',
    playerHp: 150, playerMaxHp: 150 + bonus,
  };
  for (const isBoss of [false, true]) {
    const result = await f.c.startAdventureBattle(f.env, f.key, adventure,
      f.enemy, { roomId: 'test-room', isBoss }, 'discord');
    assert.match(result.message, /HP 150\/150/);
    assert.equal((await f.state()).playerMaxHp, 150);
  }
}

(async () => {
  await run('short', 25);
  await run('long', 50);
  console.log('Rest cap synchronization regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
