// Run: node scripts/test-astral-bond.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = "lvl 44 Mastery 🌌 Astral Bond: While a Familiar is active, reaching maximum Rising Power empowers the Familiar's next assistance, doubling its effects. Activates once per Familiar.";
const pair = total => total <= 7 ? [1, total - 1] : [total - 6, 6];

async function summon(f, total) {
  f.rolls.push(...pair(total), 0);
  return f.cast('familiar');
}
async function tidal(f) {
  await f.editProgress(p => { p.mana = 100; });
  f.rolls.push(12, 2, 1, 1);
  return f.cast('tidal');
}
async function attack(f) {
  f.rolls.push(10, 1);
  return f.attack();
}

(async () => {
  const low = await fixture(43);
  assert(!(await low.c.getActiveMasteries(43)).some(m => m.id === 'familiar-mastery-1'));
  assert.equal((await low.c.formatLevelUpUnlocks(43, 44)).join('\n'), unlock);
  const high = await fixture(44);
  assert((await high.c.getActiveMasteries(44)).some(m => m.id === 'familiar-mastery-1'));

  const spell = await high.c.getSpellDefinition('familiar');
  for (const creature of spell.familiars) {
    const f = await fixture(44);
    await f.editProgress(p => { p.hp = 40; p.mana = 40; });
    await f.editState(s => { s.playerHp = 40; });
    await summon(f, creature.total);
    await f.editState(s => {
      s.risingPower = { spellId: 'moonbeam', steps: 2 };
    });
    const armedMessage = await tidal(f);
    assert.match(armedMessage.message,
      /🌌 Astral Bond: Your Familiar's next assistance is empowered!/);
    assert(!armedMessage.message.includes('Astral Bond empowers your Familiar!'));
    assert.equal((await f.state()).familiar.astralBond, 'armed');
    assert.equal((await f.state()).familiar.actions, 1);
    const before = await f.state();
    const beforeProgress = await f.progress();
    const empowered = await attack(f);
    assert.match(empowered.message, /🌌 Astral Bond empowers your Familiar!/);
    const after = await f.state();
    const afterProgress = await f.progress();
    assert.equal(after.familiar.astralBond, 'spent');
    assert.equal(after.familiar.actions, 2);
    assert.equal(before.enemy.hp - after.enemy.hp, 10 + (creature.effect.damage || 0) * 2,
      creature.name);
    assert.equal(after.playerHp - before.playerHp,
      Math.min((creature.effect.hp || 0) * 2, after.playerMaxHp - before.playerHp),
      creature.name);
    assert.equal(afterProgress.mana - beforeProgress.mana,
      Math.min((creature.effect.mana || 0) * 2,
        f.c.getPlayerResourceCaps(beforeProgress).mana - beforeProgress.mana),
      creature.name);
    const poolBefore = (before.familiarProtection || [])
      .find(pool => pool.serial === before.familiar.serial)?.amount || 0;
    const poolAfter = (after.familiarProtection || [])
      .find(pool => pool.serial === after.familiar.serial)?.amount || 0;
    assert.equal(poolAfter - poolBefore, (creature.effect.protection || 0) * 2,
      creature.name);
    assert.equal(after.risingPower.steps, 3);
    await f.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
    const noRearm = await tidal(f);
    assert(!noRearm.message.includes("Familiar's next assistance is empowered"));
    assert.equal((await f.state()).familiar.astralBond, 'spent');
  }

  const late = await fixture(44);
  await summon(late, 2);
  await late.editState(s => {
    s.familiar.actions = 3;
    s.risingPower = { spellId: 'moonbeam', steps: 2 };
  });
  await tidal(late);
  assert.equal((await late.state()).familiar.actions, 4);
  assert.equal((await late.state()).familiar.astralBond, 'armed');

  const protectedFinal = await fixture(44);
  await summon(protectedFinal, 3); // Star Crab.
  await protectedFinal.editState(s => {
    s.familiar.actions = 3;
    s.familiarProtection = [{ serial: s.familiar.serial, amount: 15, max: 25 }];
    s.risingPower = { spellId: 'moonbeam', steps: 2 };
  });
  await tidal(protectedFinal);
  await attack(protectedFinal);
  assert.equal((await protectedFinal.state()).familiarProtection[0].amount, 30);
  assert.equal((await protectedFinal.state()).familiarProtection[0].max, 30);

  const final = await attack(late);
  assert.match(final.message, /Astral Bond empowers your Familiar!/);
  assert.match(final.message, /Kinship/);
  assert(final.message.includes(spell.familiars[0].outro));
  assert.equal((await late.state()).familiar, undefined);
  await summon(late, 2);
  assert.equal((await late.state()).familiar.astralBond, undefined);
  await late.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  await tidal(late);
  assert.equal((await late.state()).familiar.astralBond, 'armed');

  const alreadyCapped = await fixture(44);
  await alreadyCapped.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 3 }; });
  await summon(alreadyCapped, 2);
  await tidal(alreadyCapped);
  assert.equal((await alreadyCapped.state()).familiar.astralBond, undefined);

  const oldFamiliar = await fixture(43);
  await summon(oldFamiliar, 2);
  await oldFamiliar.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  await tidal(oldFamiliar);
  assert.equal((await oldFamiliar.state()).familiar.astralBond, undefined);

  const capped = await fixture(44);
  await summon(capped, 4); // Fae Snail.
  await capped.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  await tidal(capped);
  await capped.editState(s => { s.playerHp = s.playerMaxHp - 5; });
  const cappedResult = await attack(capped);
  assert.match(cappedResult.message, /restores 5 HP/);
  assert.equal((await capped.state()).playerHp, (await capped.state()).playerMaxHp);

  const familiarVictory = await fixture(44);
  await summon(familiarVictory, 2);
  await familiarVictory.editState(s => { s.risingPower = { spellId: 'moonbeam', steps: 2 }; });
  await tidal(familiarVictory);
  await familiarVictory.editState(s => { s.enemy.hp = 11; });
  const victory = await attack(familiarVictory);
  assert.match(victory.message, /Astral Bond empowers your Familiar!/);
  assert.equal(await familiarVictory.state(), null);

  console.log('Astral Bond regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
