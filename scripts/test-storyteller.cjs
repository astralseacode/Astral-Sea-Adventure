// Run: node scripts/test-storyteller.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = "lvl 49 Passive ⭐ Storyteller: As an enemy's HP falls, Storyteller progresses through three Chapters. Below 75% HP, THE FIRST PAGE reduces Mana costs by 20%. Below 50% HP, THE TURNING POINT replaces it with +2 to offensive rolls. Below 25% HP, THE FINAL CHAPTER replaces it with +10 final damage and +12% critical damage. Chapters only progress forward and reset when the battle ends.";

(async () => {
  const gated = await fixture(48);
  assert.equal((await gated.c.formatLevelUpUnlocks(48, 49)).join('\n'), unlock);
  assert(!(await gated.c.getActivePerks(48)).some(p => p.id === 'storyteller'));
  assert((await gated.c.getActivePerks(49)).some(p => p.id === 'storyteller'));

  const f = await fixture(49);
  const perks = await f.c.getActivePerks(49);
  const chapterReceipts = [];
  const state = await f.state();
  for (const [hp, expected] of [
    [750, 0], [749, 1], [500, 1], [499, 2], [250, 2], [249, 3],
  ]) {
    state.enemy.hp = hp;
    const message = f.c.advanceStoryteller(state, perks, 'discord');
    if (message) chapterReceipts.push(message);
    assert.equal(state.storytellerChapter || 0, expected);
    if (expected && message) assert.match(message, /Storyteller|Enemy Below/);
  }
  assert.equal(chapterReceipts[0],
    'Storyteller Activated!\n\n' +
    'Enemy Below 75% HP — THE FIRST PAGE\n\n' +
    'Mana Costs Reduced by 20%');
  assert.equal(chapterReceipts[1],
    'Enemy Below 50% HP — THE TURNING POINT\n\n+2 Offensive Rolls');
  assert.equal(chapterReceipts[2],
    'Enemy Below 25% HP — THE FINAL CHAPTER\n\n' +
    '+10 Final Damage\n\n+12% Critical Damage');
  assert(chapterReceipts.every(receipt =>
    !/[\p{Extended_Pictographic}\u2600-\u27BF]/u.test(receipt)));
  state.enemy.maxHp = 101;
  state.storytellerChapter = undefined;
  state.storytellerActivated = undefined;
  state.enemy.hp = 75;
  assert.equal(f.c.getStorytellerChapterForEnemy(state.enemy), 1);
  state.enemy.hp = 50;
  assert.equal(f.c.getStorytellerChapterForEnemy(state.enemy), 2);
  state.enemy.hp = 25;
  assert.equal(f.c.getStorytellerChapterForEnemy(state.enemy), 3);

  const skip = await fixture(49);
  const skipState = await skip.state();
  skipState.enemy.hp = 450;
  let message = skip.c.advanceStoryteller(skipState, await skip.c.getActivePerks(49));
  assert.match(message, /^Storyteller Activated!/);
  assert(!message.includes('⭐'));
  assert.match(message, /THE TURNING POINT/);
  assert(!message.includes('THE FIRST PAGE'));
  skipState.enemy.hp = 200;
  message = skip.c.advanceStoryteller(skipState, await skip.c.getActivePerks(49));
  assert(!message.includes('Storyteller Activated!'));
  assert.match(message, /THE FINAL CHAPTER/);
  skipState.enemy.hp = 700;
  assert.equal(skip.c.advanceStoryteller(skipState,
    await skip.c.getActivePerks(49)), '');
  assert.equal(skipState.storytellerChapter, 3);

  for (const [cost, reduced] of [[10, 8], [15, 12], [20, 16], [25, 20], [30, 24], [35, 28]]) {
    assert.equal(f.c.getStorytellerManaCost(cost, { storytellerChapter: 1 }), reduced);
    assert.equal(f.c.getStorytellerManaCost(cost, { storytellerChapter: 2 }), cost);
    assert.equal(f.c.getStorytellerManaCost(cost, { storytellerChapter: 3 }), cost);
  }

  const first = await fixture(49);
  await first.editState(s => { s.storytellerChapter = 1; s.storytellerActivated = true; });
  await first.editProgress(p => { p.mana = 100; });
  first.rolls.push(...Array(140).fill(1), 1);
  await first.cast('conjure gun');
  assert.equal((await first.progress()).mana, 72);

  const charged = await fixture(49);
  await charged.editState(s => {
    s.storytellerChapter = 1;
    s.storytellerActivated = true;
    s.enemy.astralCharge = {
      manaReduction: 0.5, damageIncrease: 0.15,
      remainingDamageUses: 1, manaDiscountAvailable: true,
    };
  });
  charged.rolls.push(...Array(140).fill(1), 1);
  await charged.cast('conjure gun');
  assert.equal((await charged.progress()).mana, 86, '28 then 50% Charge = 14');

  const turning = await fixture(49);
  await turning.editState(s => {
    s.storytellerChapter = 2; s.storytellerActivated = true;
    s.shizukisPresence = { offensiveRollModifier: 3, bonusDamage: 15 };
  });
  turning.rolls.push(1, 3, 5, 7, 1);
  const falling = await turning.cast('falling star');
  assert.match(falling.message, /Power 9 \(1\+3\+5\)/);
  assert.match(falling.message, /Accuracy 12 \(7\+3 Shizuki's Presence\+2 Storyteller\)/);

  const natural = await fixture(49);
  await natural.editState(s => {
    s.storytellerChapter = 2; s.storytellerActivated = true;
    s.perkUses = { 'fae-mischief': 1 };
  });
  natural.rolls.push(20, 14, 1, 2, 1);
  const moon = await natural.cast('moonbeam');
  assert(!moon.message.includes('FULL MOON'));

  const finalGun = await fixture(49);
  await finalGun.editState(s => { s.storytellerChapter = 3; s.storytellerActivated = true; });
  finalGun.rolls.push(...Array(140).fill(1), 1);
  const gun = await finalGun.cast('conjure gun');
  assert.match(gun.message, /Total Damage: 150/);
  assert.match(gun.message, /THE FINAL CHAPTER: \+10 Final Damage/);
  assert(!gun.message.includes('Critical Damage'));

  const critical = await fixture(49);
  await critical.editState(s => { s.storytellerChapter = 3; s.storytellerActivated = true; });
  critical.rolls.push(12, 1);
  const crit = await critical.cast('star');
  assert.match(crit.message, /\+12% Critical Damage \(\+2\)/);
  assert.equal((await critical.state()).enemy.hp, 965);

  const noncritical = await fixture(49);
  await noncritical.editState(s => { s.storytellerChapter = 3; s.storytellerActivated = true; });
  noncritical.rolls.push(5, 1);
  const normal = await noncritical.cast('star');
  assert.match(normal.message, /THE FINAL CHAPTER: \+10 Final Damage/);
  assert(!normal.message.includes('Critical Damage'));
  assert.equal((await noncritical.state()).enemy.hp, 985);

  for (const [spell, rolls] of [
    ['jelly', [8, 8, 8]],
    ['moonbeam', [20, 19, 1, 2]],
    ['falling star', [1, 3, 5, 20]],
    ['tidal', [12, 12, 12]],
  ]) {
    const criticalSpell = await fixture(49);
    await criticalSpell.editState(s => {
      s.storytellerChapter = 3;
      s.storytellerActivated = true;
      s.perkUses = { 'fae-mischief': 1 };
    });
    criticalSpell.rolls.push(...rolls, 1);
    assert.match((await criticalSpell.cast(spell)).message,
      /THE FINAL CHAPTER: \+10 Final Damage \| \+12% Critical Damage/,
      spell);
  }

  const allOrNothing = await fixture(49);
  await allOrNothing.editState(s => {
    s.storytellerChapter = 3; s.storytellerActivated = true;
  });
  allOrNothing.rolls.push(2, 1);
  const wager = await allOrNothing.cast('all or nothing');
  assert.match(wager.message, /THE FINAL CHAPTER: \+10 Final Damage/);
  assert(!wager.message.includes('Critical Damage'));

  const wake = await fixture(49);
  await wake.editState(s => { s.storytellerChapter = 3; s.storytellerActivated = true; });
  wake.rolls.push(20, 1);
  await wake.cast('wake');
  assert.equal((await wake.state()).leviathansWake.storytellerFinalChapter, true);
  wake.rolls.push(1, 1);
  await wake.attack();
  wake.rolls.push(1, 1);
  const arrival = await wake.attack();
  assert.match(arrival.message,
    /THE FINAL CHAPTER: \+10 Final Damage \| \+12% Critical Damage/);

  const lethal = await fixture(49);
  await lethal.editState(s => { s.enemy.hp = 20; });
  lethal.rolls.push(12);
  const win = await lethal.cast('star');
  assert.equal(win.won, true);
  assert(!win.message.includes('Storyteller Activated!'));

  const reset = await fixture(49);
  await reset.editState(s => { s.storytellerChapter = 3; s.storytellerActivated = true; });
  await reset.c.startCombatEncounter(reset.env, reset.key,
    reset.c.getRegionById('moonlit-reef'), 1, reset.enemy, reset.platform);
  assert.equal((await reset.state()).storytellerChapter, undefined);

  console.log('Storyteller regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
