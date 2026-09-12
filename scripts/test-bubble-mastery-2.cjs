// Run: node scripts/test-bubble-mastery-2.cjs. Local content and in-memory KV only.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const bubble = protection => ({ naturalRoll: 1, tierId: 'suspicious',
  displayName: 'Suspicious Bubble', protection });
async function setup(level = 23, platform = 'discord', protection = 5) {
  const f = await fixture(level, platform);
  await f.editProgress(p => { p.mana = 0; });
  await f.editState(s => { s.bubble = bubble(protection); });
  return f;
}
async function hit(f, enemyRoll, flavorIndex = 0) {
  f.rolls.push(1, enemyRoll, flavorIndex);
  return f.attack();
}
async function main() {
  for (const platform of ['discord', 'twitch']) {
    const low = await setup(22, platform);
    await hit(low, 2);
    assert.equal((await low.state()).enemy.hp, 1000);

    const f = await setup(23, platform, 15);
    const first = await hit(f, 6);
    assert.equal((await f.state()).bubble.protection, 5);
    assert.equal((await f.state()).bubble.maxProtection, 15);
    assert.equal((await f.state()).enemy.hp, 1000);
    assert.doesNotMatch(first.message, /Bubble retaliates/);
    assert.match(first.message, /Bubble absorbs 10 damage \| Protection 5\/15/);
    const second = await hit(f, 6);
    assert.equal((await f.state()).bubble, undefined);
    assert.equal((await f.state()).enemy.hp, 985);
    assert.equal((await f.progress()).mana, 10);
    assert.equal((await f.state()).astralRebound.offensiveRollModifier, 2);
    assert.match(second.message, /Bubble retaliates → 15 dmg/);
    assert.equal((await f.state()).round, 3);

    const passive = await setup(23, platform);
    await passive.editProgress(p => { p.hp = 50; });
    await passive.editState(s => {
      s.playerHp = 50;
      s.astralCuriosity = { offensiveRollModifier: 1 };
      s.astralPatience = { offensiveRollModifier: 2 };
    });
    passive.rolls.push(0, 2, 0);
    await passive.c.performStim(passive.env, passive.key, platform);
    assert.equal((await passive.state()).enemy.hp, 985);
    assert.equal((await passive.state()).astralCuriosity.offensiveRollModifier, 1);
    assert.equal((await passive.state()).astralPatience.offensiveRollModifier, 2);
    assert.equal((await passive.state()).astralRebound.offensiveRollModifier, 2);

    const missed = await setup(23, platform);
    await hit(missed, 1);
    assert.equal((await missed.state()).enemy.hp, 1000);
    assert.equal((await missed.state()).bubble.protection, 5);

    const winning = await setup(23, platform);
    await winning.editState(s => { s.enemy.hp = 15; s.enemy.maxHp = 15; });
    const result = await hit(winning, 2);
    assert.equal(result.won, true);
    assert.equal(await winning.state(), null);
    assert.match(result.message, /Bubble retaliates → 15 dmg/);
  }

  const content = await fixture(23);
  const lines = (await content.c.getMasteryDefinition('bubble-mastery-2')).flavor;
  const survivalLines = (await content.c.getSpellDefinition('bubble')).survivalLines;
  assert.deepEqual(Array.from(lines), [
    'Your Bubble finally pops.\n\nThere is a brief, deeply offended silence.\n\nThen the remaining Astral energy launches directly back at your foe.',
    'Your Bubble bursts with an indignant *BOING!* and fires the last of its magic directly at your foe.\n\nApparently this was personal.',
    'Your Bubble breaks.\n\nIt has had enough.',
  ]);
  assert.deepEqual(Array.from(survivalLines), [
    'The attack slams into your Bubble. It wobbles violently, gives an offended *boing*, and somehow holds together.',
    'Your Bubble squishes inward from the impact, pauses for a moment, then stubbornly pops back into shape.',
    'The attack crashes into your Bubble. It trembles indignantly but refuses to pop.',
    'Your Bubble absorbs the hit and gives your foe a deeply offended *boing*. Apparently that was rude.',
    "The Bubble wobbles dangerously.\n\nIt survives.\n\nIt seems almost disappointed that it didn't get to be dramatic about this.",
    'Your Bubble takes the hit, stretches to a concerning degree, and snaps back into place.\n\nNobody should tell it how close that was.',
  ]);
  for (let index = 0; index < lines.length; index++) {
    const outputs = [];
    for (const platform of ['discord', 'twitch']) {
      const f = await setup(23, platform);
      const result = await hit(f, 2, index);
      assert(result.message.includes(lines[index]));
      assert(!survivalLines.some(line => result.message.includes(line)));
      assert(!Array.from((await f.c.getSpellDefinition('bubble')).activationLines)
        .some(line => result.message.includes(line.replace('{absorbedDamage}', '5'))));
      outputs.push(result.message.includes(lines[index]));
    }
    assert.deepEqual(outputs, [true, true]);
  }
  for (let index = 0; index < survivalLines.length; index++) {
    for (const platform of ['discord', 'twitch']) {
      const f = await setup(23, platform, 10);
      const result = await hit(f, 2, index);
      assert(result.message.includes(survivalLines[index]));
      assert.equal(survivalLines.filter(line => result.message.includes(line)).length, 1);
      assert(!lines.some(line => result.message.includes(line)));
      assert.match(result.message, /Bubble absorbs 5 damage \| Protection 5\/10/);
      assert.equal((await f.state()).bubble.maxProtection, 10);
      assert.equal((await f.state()).bubble.protection, 5);
    }
  }
  const rolled = await fixture(23);
  rolled.rolls.push(12);
  await rolled.cast('bubble');
  assert.equal((await rolled.state()).bubble.maxProtection, 25);
  rolled.rolls.push(1, 6, 0);
  const held = await rolled.attack();
  assert.match(held.message, /Bubble absorbs 10 damage \| Protection 15\/25/);
  assert.equal((await rolled.state()).bubble.maxProtection, 25);
  console.log('Bubble Mastery II regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
