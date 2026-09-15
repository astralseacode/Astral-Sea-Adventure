// Run: node scripts/test-starspark-mastery-2.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

async function charge(f, uses = 2) {
  await f.editState(s => {
    s.enemy.astralCharge = {
      manaReduction: 0.5, damageIncrease: 0.15,
      remainingDamageUses: uses, manaDiscountAvailable: uses === 2,
    };
  });
}

async function main() {
  const lower = await fixture(25);
  const upper = await fixture(26);
  assert(!(await lower.c.getActiveMasteries(25)).some(m => m.id === 'starspark-mastery-2'));
  const mastery = (await upper.c.getActiveMasteries(26))
    .find(m => m.id === 'starspark-mastery-2');
  assert.equal(mastery.effect.damage, 20);
  assert.equal(mastery.flavor.length, 6);

  const created = await fixture(26);
  created.rolls.push(12, 1);
  await created.cast('star');
  assert.equal((await created.state()).enemy.astralCharge.remainingDamageUses, 2);
  assert.equal((await created.state()).enemy.astralCharge.manaDiscountAvailable, true);

  for (const level of [25, 26]) {
    const f = await fixture(level);
    await charge(f);
    f.rolls.push(2, 1);
    const first = await f.cast('star');
    assert.doesNotMatch(first.message, /Charge detonates/);
    assert.equal((await f.progress()).mana, 95);
    assert.equal((await f.state()).enemy.astralCharge.remainingDamageUses, 1);
    assert.equal((await f.state()).enemy.astralCharge.manaDiscountAvailable, false);
    const hpBefore = (await f.state()).enemy.hp;
    f.rolls.push(...(level === 26 ? [2, 0, 1] : [2, 1]));
    const second = await f.cast('star');
    const damage = hpBefore - (await f.state()).enemy.hp;
    assert.equal((await f.progress()).mana, 85);
    assert.equal((await f.state()).enemy.astralCharge, undefined);
    if (level === 26) {
      assert.match(second.message, /Charge detonates → 20 dmg/);
      assert.equal(second.message.split('Charge detonates → 20 dmg').length - 1, 1);
      assert.equal(damage, 22); // 2 base +15% rounds to 2, then fixed 20.
    } else {
      assert.doesNotMatch(second.message, /Charge detonates/);
      assert.equal(damage, 2);
    }
  }

  for (let index = 0; index < 6; index++) {
    const f = await fixture(26, index % 2 ? 'twitch' : 'discord');
    await charge(f, 1);
    f.rolls.push(2, index, 1);
    const result = await f.cast('star');
    assert(result.message.includes(mastery.flavor[index]));
    assert.equal(mastery.flavor.filter(line => result.message.includes(line)).length, 1);
    assert.equal(result.message.split('Charge detonates → 20 dmg').length - 1, 1);
  }

  const refreshed = await fixture(26);
  await charge(refreshed, 1);
  refreshed.rolls.push(12, 0, 1);
  const refresh = await refreshed.cast('star');
  assert.match(refresh.message, /Charge detonates → 20 dmg/);
  assert.equal((await refreshed.state()).enemy.astralCharge.remainingDamageUses, 2);
  assert.equal((await refreshed.state()).enemy.astralCharge.manaDiscountAvailable, true);

  const echoed = await fixture(26);
  await charge(echoed, 1);
  await echoed.editState(s => {
    s.astralEcho = { naturalRoll: 1, tierId: 'faint',
      displayName: 'Faint', damagePercent: 0.5 };
  });
  echoed.rolls.push(2, 0, 1);
  await echoed.cast('star');
  assert.equal((await echoed.state()).enemy.hp, 977); // 2 primary + 1 Echo + 20 fixed.

  const spellKill = await fixture(26);
  await charge(spellKill, 1);
  await spellKill.editState(s => { s.enemy.hp = 2; s.enemy.maxHp = 2; });
  spellKill.rolls.push(2);
  const directVictory = await spellKill.cast('star');
  assert.equal(directVictory.won, true);
  assert.doesNotMatch(directVictory.message, /Charge detonates/);

  const lethal = await fixture(26);
  await charge(lethal, 1);
  await lethal.editState(s => { s.enemy.hp = 20; s.enemy.maxHp = 20; });
  lethal.rolls.push(2, 0);
  const victory = await lethal.cast('star');
  assert.equal(victory.won, true);
  assert.equal(await lethal.state(), null);
  assert.equal(victory.message.split('Charge detonates → 20 dmg').length - 1, 1);

  const cleanup = await fixture(26);
  await charge(cleanup, 1);
  cleanup.rolls.push(20);
  await cleanup.attack();
  assert.equal((await cleanup.state()).enemy.astralCharge.remainingDamageUses, 1);
  console.log('Star Spark Mastery II regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
