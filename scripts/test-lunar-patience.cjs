// Run: node scripts/test-lunar-patience.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');

const unlock = 'lvl 39 Passive 🌙 Lunar Patience: When Moonbeam fails to critically hit, your next Moonbeam in the same battle gains +1 to its main offensive roll. Lunar Patience does not stack and resets when Moonbeam critically hits or the battle ends.';
async function moonbeam(f, kept = 12, low = 10, moonlight = [1, 2], enemy = 1) {
  f.rolls.push(low, kept, ...moonlight, enemy);
  return f.cast('moonbeam');
}

(async () => {
  const locked = await fixture(38);
  await moonbeam(locked);
  assert.equal((await locked.state()).lunarPatience, undefined);
  const f = await fixture(39);
  assert.equal((await f.c.getPerkDefinition('lunar-patience')).levelUpLine, unlock);
  assert.equal((await f.c.formatLevelUpUnlocks(38, 39)).join('\n'), unlock);
  const first = await moonbeam(f);
  assert.doesNotMatch(first.message, /Lunar Patience activates!|Next Moonbeam \+1/);
  assert.equal((await f.state()).lunarPatience.offensiveRollModifier, 1);
  const second = await moonbeam(f);
  assert.match(second.message, /Lunar Patience:\n\+1/);
  assert.match(second.message, /Final Roll:\n13/);
  assert.equal((await f.state()).lunarPatience.offensiveRollModifier, 1);
  const third = await moonbeam(f);
  assert.match(third.message, /Final Roll:\n13/);
  assert.equal((await f.state()).lunarPatience.offensiveRollModifier, 1);
  await f.editProgress(p => { p.mana = 100; });
  const critical = await moonbeam(f, 19, 10, [3, 3]);
  assert.match(critical.message, /Final Roll:\n20/);
  assert.match(critical.message, /Lunar Alignment:\n\+20/);
  assert.match(critical.message, /Moonlight Rolls:\n3 and 3/);
  assert.equal((await f.state()).lunarPatience, undefined);
  const afterReset = await moonbeam(f);
  assert.doesNotMatch(afterReset.message, /Lunar Patience:\n\+1/);
  assert.equal((await f.state()).lunarPatience.offensiveRollModifier, 1);

  const naturalCritical = await fixture(39);
  await moonbeam(naturalCritical, 20);
  assert.equal((await naturalCritical.state()).lunarPatience, undefined);

  for (const action of ['attack', 'star', 'falling star', 'bubble', 'berries',
    'familiar', 'astral echo', 'stim']) {
    const other = await fixture(39);
    await other.editState(s => { s.lunarPatience = { offensiveRollModifier: 1 };
      if (action === 'stim') s.playerHp = 50; });
    if (action === 'attack') { other.rolls.push(2, 1); await other.attack(); }
    else if (action === 'star') { other.rolls.push(3, 1); await other.cast('star'); }
    else if (action === 'falling star') {
      other.rolls.push(1, 1, 1, 2, 1); await other.cast('falling star');
    }
    else if (action === 'bubble') { other.rolls.push(1); await other.cast('bubble'); }
    else if (action === 'berries') { other.rolls.push(1); await other.cast('berries'); }
    else if (action === 'familiar') { other.rolls.push(1, 1); await other.cast('familiar'); }
    else if (action === 'astral echo') { other.rolls.push(1); await other.cast('astral echo'); }
    else await other.c.performStim(other.env, other.key, 'discord');
    assert.equal((await other.state()).lunarPatience.offensiveRollModifier, 1, action);
  }

  const harmony = await fixture(39);
  const blessing = await harmony.c.getSpellDefinition('elf_blessing');
  await harmony.editProgress(p => {
    p.stats.fae = 1;
    p.statusEffects = harmony.c.addStatusEffect(p,
      harmony.c.createElfBlessingEffect(blessing));
  });
  await harmony.editState(s => { s.lunarPatience = { offensiveRollModifier: 1 }; });
  const combined = await moonbeam(harmony, 12);
  assert.match(combined.message, /Lunar Patience:\n\+1/);
  assert.match(combined.message, /Fae Affinity:\n\+1/);
  assert.match(combined.message, /Elf Blessing:\n\+3/);
  assert.match(combined.message, /Astral Harmony/);

  const otherCritical = await fixture(39);
  await otherCritical.editProgress(p => {
    p.statusEffects = otherCritical.c.addStatusEffect(p,
      otherCritical.c.createElfBlessingEffect(blessing));
  });
  await otherCritical.editState(s => {
    s.lunarPatience = { offensiveRollModifier: 1 };
    s.faeSecondOpinion = { offensiveRollModifier: 3 };
  });
  const buffed = await moonbeam(otherCritical, 16);
  assert.match(buffed.message, /Lunar Patience:\n\+1/);
  assert.match(buffed.message, /Fae Second Opinion:\n\+3/);
  assert.match(buffed.message, /\*\*Critical Hit!\*\*/);
  assert.equal((await otherCritical.state()).lunarPatience, undefined);

  const lethal = await fixture(39);
  await lethal.editState(s => { s.enemy.hp = 1; });
  const win = await moonbeam(lethal);
  assert.doesNotMatch(win.message, /Lunar Patience activates!/);
  assert.equal(await lethal.state(), null);
  await lethal.c.startCombatEncounter(lethal.env, lethal.key,
    lethal.c.getRegionById('moonlit-reef'), 1, lethal.enemy, 'discord');
  assert.equal((await lethal.state()).lunarPatience, undefined);

  const defeated = await fixture(39);
  await defeated.editState(s => { s.playerHp = 1; s.enemy.damageBonus = 50; });
  await moonbeam(defeated, 12, 10, [1, 2], 20);
  assert.equal(await defeated.state(), null);

  const levelUp = await fixture(38);
  await levelUp.editProgress(p => { p.xp = levelUp.c.totalXpForLevel(39) - 1; });
  await levelUp.editState(s => { s.enemy.hp = 1; });
  levelUp.rolls.push(2);
  assert((await levelUp.attack()).message.includes(unlock));

  const twitch = await fixture(40, 'twitch');
  await moonbeam(twitch);
  assert.match((await moonbeam(twitch)).message, /\+1 Lunar Patience/);
  assert(!fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8')
    .includes('case "progression"'));
  console.log('Lunar Patience regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
