// Run: node scripts/test-progression-narrative-names.cjs. Local data and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

(async () => {
  const f = await fixture(45);
  const perks = {
    'astral-resilience': 'Resilience',
    'astral-momentum': 'Momentum',
    'astral-harvest': 'Harvest',
    'astral-aftershock': 'Aftershock',
    'astral-curiosity': 'Curiosity',
    'astral-patience': 'Patience',
    'astral-awakening': 'Awakening',
    'astral-harmony': 'Harmony',
    'astral-rhythm': 'Rhythm',
    'astral-defiance': 'Defiance',
    'astral-reprieve': 'Reprieve',
  };
  for (const [id, name] of Object.entries(perks)) {
    const perk = await f.c.getPerkDefinition(id);
    assert.equal(perk.name, name);
    assert(!JSON.stringify(perk).includes(`Astral ${name}`));
  }
  const expedition = await f.c.getPerkDefinition('astral-expedition');
  assert.equal(expedition.name, 'Astral Expedition');
  assert(expedition.activationLine.startsWith('Astral Expedition\n\n'));

  const echo = await f.c.getSpellDefinition('astral-echo');
  assert.equal(echo.name, 'Echo');
  assert.deepEqual(Array.from(echo.aliases), ['astral echo', 'echo']);
  assert.match(echo.activationLine, /^Echo activates!/);
  const echoMastery = await f.c.getMasteryDefinition('astral-echo-mastery-1');
  assert.equal(echoMastery.name, 'Echo Mastery I');
  assert(!JSON.stringify(echoMastery).includes('Astral Echo'));
  const bond = await f.c.getMasteryDefinition('familiar-mastery-1');
  assert.equal(bond.name, 'Bond');
  assert.match(bond.levelUpLine, /Mastery 🌌 Bond:/);

  const starSpark = await f.c.getSpellDefinition('star-spark');
  assert.match(starSpark.description, /leave behind a Charge/);
  assert.equal(starSpark.astralCharge.damageIncrease, 0.15);
  assert.equal((await f.c.getMasteryDefinition('starspark-mastery-1')).effect.damageUses, 2);
  assert.equal((await f.c.getMasteryDefinition('starspark-mastery-2')).effect.damage, 20);

  const gun = await f.c.getSpellDefinition('conjure-gun');
  assert(JSON.stringify(gun).includes('Astral gun'));
  const familiar = await f.c.getSpellDefinition('familiar');
  assert(JSON.stringify(familiar).includes('Astral Dragonling'));
  assert(JSON.stringify(familiar).includes('Astral Wyrmling'));

  console.log('Progression narrative naming regressions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
