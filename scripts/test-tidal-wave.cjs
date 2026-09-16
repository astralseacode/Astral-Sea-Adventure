// Run: node scripts/test-tidal-wave.cjs. Uses local data and in-memory KV only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = 'lvl 40 Spell 🌊 Tidal Wave: Cast Tidal Wave for 30 Mana and roll 3d12. Add the dice together and apply offensive roll bonuses to determine the strength of the wave. Rolls 3-14 deal 40 damage, 15-19 deal 50 damage, 20-24 deal 55 damage, and 25+ critically hits for 65 damage.';

async function cast(f, dice = [1, 1, 1], alias = 'tidal') {
  f.rolls.push(...dice, 1);
  return f.cast(alias);
}

(async () => {
  const locked = await fixture(39);
  const before = [...locked.values];
  assert.match((await locked.cast('tidal')).message, /Reach Level 40/);
  assert.deepEqual([...locked.values], before);
  const spell = await locked.c.getSpellDefinition('tidal-wave');
  assert.equal(spell.levelUpLine, unlock);
  assert.equal((await locked.c.formatLevelUpUnlocks(39, 40)).join('\n'), "lvl 40 Spell 🌊 Tidal Wave: Cast Tidal Wave for 30 Mana and roll 3d12. Add the dice together and apply offensive roll bonuses to determine the strength of the wave. Rolls 3-14 deal 40 damage, 15-19 deal 50 damage, 20-24 deal 55 damage, and 25+ is a critical hit for 65 damage.");
  assert.equal(spell.manaCost, 30);
  assert.equal(spell.damage.dice, 3);
  assert.equal(spell.damage.sides, 12);
  assert.equal(spell.criticalThreshold, 25);
  assert.deepEqual(JSON.parse(JSON.stringify(spell.damageTiers.map(t =>
    [t.displayName, t.baseDamage, t.scenes.length]))), [
    ['Rising Tide', 40, 5], ['Surging Tide', 50, 2],
    ['Astral Tide', 55, 3], ['Critical Tidal Wave', 65, 4],
  ]);
  assert(spell.damageTiers[0].scenes.some(scene =>
    scene.includes('They are definitely not Shizuki.')));
  const allFlavor = spell.damageTiers.flatMap(t => t.scenes.flat()).join('\n');
  assert(!allFlavor.includes('White hair briefly drifts beneath the rising water'));
  assert(!allFlavor.includes('Glimmer'));
  assert(!/elf-like|star-like|star-shaped|[🌊🌙✨]/u.test(allFlavor));
  const source = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');
  assert.equal((source.match(/\{ name: "Tidal Wave", value: "tidal-wave" \}/g) || []).length, 1);
  assert(!source.includes('case "progression"'));

  for (const [dice, tier, base, final] of [
    [[1, 1, 1], 'Rising Tide', 40, 3],
    [[12, 1, 1], 'Rising Tide', 40, 14],
    [[12, 2, 1], 'Surging Tide', 50, 15],
    [[12, 6, 1], 'Surging Tide', 50, 19],
    [[12, 7, 1], 'Astral Tide', 55, 20],
    [[12, 11, 1], 'Astral Tide', 55, 24],
    [[12, 12, 1], 'Critical Tidal Wave', 65, 25],
    [[12, 12, 12], 'Critical Tidal Wave', 65, 36],
  ]) {
    const f = await fixture(40);
    const result = await cast(f, dice);
    assert.match(result.message, new RegExp(tier));
    assert.match(result.message, new RegExp(`= ${final}`));
    assert.match(result.message, new RegExp(`${base} base dmg`));
    const curiosityMana = dice[0] === dice[1] && dice[1] === dice[2] ? 10 : 0;
    assert.equal((await f.progress()).mana, 70 + curiosityMana);
    const aftershock = final >= 25 ? 5 : 0;
    assert.equal((await f.state()).enemy.hp, 1000 - base - aftershock);
    assert(!/[🌊🌙✨]/u.test(result.message));
  }

  const tooPoor = await fixture(40);
  await tooPoor.editProgress(p => { p.mana = 29; });
  const poorState = JSON.stringify(await tooPoor.state());
  assert.match((await tooPoor.cast('tidal')).message, /enough Mana/);
  assert.equal((await tooPoor.progress()).mana, 29);
  assert.equal(JSON.stringify(await tooPoor.state()), poorState);

  for (const [dice, expected] of [
    [[12, 1, 1], 50], [[12, 6, 1], 55], [[12, 11, 1], 65],
  ]) {
    const f = await fixture(40);
    await f.editProgress(p => { p.stats.fae = 1; });
    const result = await cast(f, dice);
    assert.match(result.message, /\+1 Fae/);
    assert.match(result.message, new RegExp(`${expected} base dmg`));
    assert.equal((await f.state()).enemy.hp, 1000 - expected -
      (expected === 65 ? 5 : 0));
  }

  const patience = await fixture(40);
  await patience.editState(s => { s.lunarPatience = { offensiveRollModifier: 1 }; });
  const wave = await cast(patience, [12, 12, 1]);
  assert(!wave.message.includes('Lunar Patience'));
  assert.equal((await patience.state()).lunarPatience.offensiveRollModifier, 1);

  const strength = await fixture(40);
  await strength.editProgress(p => { p.stats.strength = 4; });
  const strongWave = await cast(strength, [12, 2, 1]);
  assert.match(strongWave.message, /50 base dmg \+ 4 Strength = 54 dmg/);
  assert.equal((await strength.state()).enemy.hp, 946);

  const blessing = await fixture(40);
  const blessingSpell = await blessing.c.getSpellDefinition('elf_blessing');
  await blessing.editProgress(p => {
    p.statusEffects = blessing.c.addStatusEffect(p,
      blessing.c.createElfBlessingEffect(blessingSpell));
  });
  const blessedWave = await cast(blessing, [12, 6, 1]);
  assert.match(blessedWave.message, /\+3 Elf Blessing → 22/);
  assert.match(blessedWave.message, /Astral Tide → 55 base dmg/);

  const harmony = await fixture(40);
  await harmony.editProgress(p => { p.stats.fae = 1; });
  await harmony.editState(s => {
    s.astralRebound = { offensiveRollModifier: 2 };
    s.astralPatience = { offensiveRollModifier: 2 };
  });
  assert.match((await cast(harmony, [12, 2, 1])).message,
    /Harmony\nRestored 15 Mana/);

  const charged = await fixture(40);
  await charged.editState(s => { s.enemy.astralCharge = {
    manaReduction: 0.5, damageIncrease: 0.15,
    remainingDamageUses: 1, manaDiscountAvailable: true,
  }; });
  const chargedWave = await cast(charged, [12, 2, 1]);
  assert.match(chargedWave.message, /Charge bursts!/);
  assert.equal((await charged.progress()).mana, 85);
  assert.equal((await charged.state()).enemy.hp, 922); // 58 wave + 20 Charge Mastery II.

  const echoed = await fixture(40);
  await echoed.editState(s => { s.astralEcho = {
    naturalRoll: 1, tierId: 'faint', displayName: 'Faint', damagePercent: 0.5,
  }; });
  assert.match((await cast(echoed, [12, 2, 1])).message, /Echo/);
  assert.equal((await echoed.state()).enemy.hp, 925);

  const expedition = await fixture(40);
  const initialRolls = (await expedition.progress()).astralExpeditionRolls;
  await cast(expedition, [12, 2, 1]);
  assert.equal((await expedition.progress()).astralExpeditionRolls,
    initialRolls + 1);

  const victory = await fixture(40);
  await victory.editState(s => { s.enemy.hp = 40; });
  const win = await cast(victory, [1, 1, 1]);
  assert.match(win.message, /Victory|defeated|Defeated/i);
  assert.equal(await victory.state(), null);

  const high = await fixture(50, 'twitch');
  assert.match((await cast(high, [12, 12, 1])).message, /Critical Tidal Wave/);
  assert.equal((await high.progress()).mana, 70);
  const discord = await fixture(40, 'discord');
  const twitch = await fixture(40, 'twitch');
  assert.match((await cast(discord, [12, 2, 1])).message, /Surging Tide/);
  assert.match((await cast(twitch, [12, 2, 1])).message, /Surging Tide/);

  console.log('Tidal Wave regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
