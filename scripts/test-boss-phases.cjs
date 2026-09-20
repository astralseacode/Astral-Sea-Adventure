const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const regions = ['moonlit-reef', 'starfall-trench', 'whispering-kelp-forest',
  'leviathans-wake', 'sunken-kings-throne', 'astral-nexus'];
async function battle(region, boss = true) {
  const f = await fixture(50);
  await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById(region), 1,
    { ...f.enemy, hp: 1000, isBoss: boss }, 'discord');
  return { f, s: await f.state() };
}
function hit(c, s, hp) {
  const before = s.enemy.hp;
  s.enemy.hp = hp;
  c.finishRegionalEnemyDamage(s, before);
  return c.takeRegionalEnemyReceipts(s).join('\n');
}
async function main() {
  const names = ['First Ripple', 'Sinking Pressure', 'Creeping Vines',
    'Distant Tremor', 'Royal Vigil', 'Fractured Shell'];
  for (let i = 0; i < regions.length; i++) {
    const { f, s } = await battle(regions[i]);
    assert.equal(hit(f.c, s, 750), '');
    assert.match(hit(f.c, s, 749), new RegExp(names[i]));
    assert.equal(s.regionalEnemy.phase, 1);
    assert.equal(hit(f.c, s, 500), '');
    assert.equal(s.regionalEnemy.phase, 1);
    assert.match(hit(f.c, s, 499), /Boss Phase Activated:/);
    assert.equal(s.regionalEnemy.phase, 2);
    assert.equal(hit(f.c, s, 250), '');
    assert.match(hit(f.c, s, 249), /Boss Phase Activated:/);
    assert.equal(s.regionalEnemy.phase, 3);
    s.enemy.hp = 700;
    f.c.advanceBossPhase(s);
    assert.equal(s.regionalEnemy.phase, 3);
    assert.equal(f.c.takeRegionalEnemyReceipts(s).length, 0);
    await f.c.saveCombatState(f.env, f.key, s);
    assert.equal((await f.state()).regionalEnemy.phase, 3);
    const normal = await battle(regions[i], false);
    assert.equal(hit(normal.f.c, normal.s, 200).includes('Boss Phase'), false);
    assert.equal(normal.s.regionalEnemy?.phase || 0, 0);
  }
  {
    const { f, s } = await battle('moonlit-reef');
    hit(f.c, s, 749);
    for (let i = 0; i < 3; i++) f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.regionalEnemy.gentle, true);
    assert.equal(f.c.beginRegionalEnemyResponse(s, 10).bonus, 7);
    hit(f.c, s, 499);
    assert.equal(f.c.beginRegionalEnemyResponse(s, 10).bonus, 9);
    hit(f.c, s, 249);
    assert.equal(f.c.beginRegionalEnemyResponse(s, 10).bonus, 12);
  }
  {
    const { f, s } = await battle('starfall-trench');
    hit(f.c, s, 749);
    f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.regionalEnemy.spells, 0);
    for (let i = 0; i < 3; i++) f.c.recordRegionalPlayerAction(s, 'spell', 'moonbeam', true);
    assert.equal(s.regionalEnemy.pressureAmount, 15);
    hit(f.c, s, 499);
    const progress = f.c.createEmptyProgress(); progress.mana = 100;
    f.c.resolveRegionalEnemyHit(s, { pressure: true, hunger: false, fracture: 0 }, 1, progress);
    assert.equal(progress.mana, 85, 'pending drain retains its armed value');
    assert.equal(s.regionalEnemy.spells, 0);
    for (let i = 0; i < 2; i++) f.c.recordRegionalPlayerAction(s, 'spell', 'moonbeam', true);
    assert.equal(s.regionalEnemy.pressureAmount, 20);
    hit(f.c, s, 249);
    f.c.resolveRegionalEnemyHit(s, { pressure: true, hunger: false, fracture: 0 }, 1, progress);
    assert.equal(progress.mana, 65);
    for (let i = 0; i < 2; i++) f.c.recordRegionalPlayerAction(s, 'spell', 'moonbeam', true);
    assert.equal(s.regionalEnemy.pressureAmount, 30);
  }
  {
    const { f, s } = await battle('whispering-kelp-forest');
    hit(f.c, s, 749);
    s.regionalEnemy.responses = 0;
    s.enemy.hp = 700;
    f.c.finishRegionalEnemyResponse(s);
    assert.equal(s.enemy.hp, 712);
    hit(f.c, s, 499);
    s.regionalEnemy.responses = 0;
    f.c.finishRegionalEnemyResponse(s);
    assert.equal(s.enemy.hp, 514);
    assert.equal(s.regionalEnemy.phase, 2);
    hit(f.c, s, 249);
    s.enemy.hp = 995; s.regionalEnemy.responses = 0;
    f.c.finishRegionalEnemyResponse(s);
    assert.equal(s.enemy.hp, 1000);
    assert.equal(s.regionalEnemy.phase, 3);
  }
  {
    const { f, s } = await battle('leviathans-wake');
    for (const [hp, value] of [[749,18],[499,20],[249,25]]) {
      hit(f.c, s, hp);
      s.regionalEnemy.responses = 2;
      assert.equal(f.c.beginRegionalEnemyResponse(s, 10).bonus, value);
      assert.equal(s.regionalEnemy.responses, 0);
    }
  }
  {
    const { f, s } = await battle('sunken-kings-throne');
    hit(f.c, s, 749);
    s.regionalEnemy.guard = true;
    assert.equal(f.c.applyRegionalRoyalGuard(s, 30), 12);
    hit(f.c, s, 499);
    s.regionalEnemy.guard = true;
    assert.equal(f.c.applyRegionalRoyalGuard(s, 30), 10);
    s.regionalEnemy.spells = 2;
    assert.equal(f.c.getRegionalSpellTax(s), 7);
    const receipt = hit(f.c, s, 249);
    assert.match(receipt, /Gained 30 Protection/);
    assert.equal(s.enemy.protection, 30);
    assert.equal(f.c.getRegionalSpellTax(s), 8);
    hit(f.c, s, 200);
    assert.equal(s.enemy.protection, 30);
  }
  {
    const { f, s } = await battle('astral-nexus');
    hit(f.c, s, 749);
    for (let i = 0; i < 4; i++) f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.enemy.protection, 10);
    s.enemy.protection = 5;
    for (let i = 0; i < 4; i++) f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.enemy.protection, 5, 'blocked cycle is consumed');
    s.enemy.protection = 0;
    f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.enemy.protection, 0, 'no banked replacement');
    hit(f.c, s, 499);
    for (let i = 0; i < 3; i++) f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.enemy.protection, 12);
    s.enemy.protection = 0;
    hit(f.c, s, 249);
    for (let i = 0; i < 2; i++) f.c.recordRegionalPlayerAction(s, 'attack', null, true);
    assert.equal(s.enemy.protection, 15);
    assert.equal(s.regionalEnemy.adaptation, 10);
  }
  {
    const { f, s } = await battle('astral-nexus');
    assert.match(hit(f.c, s, 200), /Collapsing Shell/);
    assert.equal(s.regionalEnemy.phase, 3);
    assert.equal((hit(f.c, s, 0)).includes('Boss Phase'), false);
    const next = await battle('astral-nexus');
    assert.equal(next.s.regionalEnemy, undefined);
  }
  {
    const { f, s } = await battle('moonlit-reef');
    s.enemy.hp = 751;
    const action = await f.c.resolvePlayerCombatAction(f.env, f.key, s,
      { damage: 2, message: 'Threshold action', regionalAction: 'attack' }, 'discord');
    assert.equal((action.message.match(/Boss Phase Activated: First Ripple/g)||[]).length, 1);
    const after = await f.state();
    assert.equal(after.enemy.hp, 749);
    assert.equal(after.regionalEnemy.actions, 1);
    assert.equal(after.regionalEnemy.phase, 1);
    const killing = await f.c.resolvePlayerCombatAction(f.env, f.key, after,
      { damage: 1000, message: 'Killing action', regionalAction: 'attack' }, 'discord');
    assert(!killing.message.includes('Boss Phase Activated'));
  }
  console.log('PASS regional boss phase engine and six packages');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
