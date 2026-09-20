// Offline sequential Tip Jar behavior; KV cross-worker races are intentionally not modeled as safe.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));

async function main() {
  const f = await fixture(5);
  await f.c.deleteCombatState(f.env, f.key);
  const identity = 'tip-test';
  const key = vm.runInContext('TIP_JAR_STATE_KEY', f.c);
  const flavors = Array.from(vm.runInContext('TIP_JAR_FLAVOR', f.c));
  assert.equal(flavors.length, 100);
  assert.equal(new Set(flavors).size, 100);
  assert(flavors.every(line => typeof line === 'string' && line.length));
  assert.equal(flavors[0], 'A completely reasonable contribution to a completely legitimate business.');
  assert.equal(flavors[13], 'Do not worry. I have a system. The system is the jar.');
  assert.equal(flavors[92], 'Future generations may ask why this jar contains so many Star Candies. I recommend lying to them.');
  assert.equal(flavors[99], 'The jar thanks you. The mustache thanks you. I remain completely uninvolved.');
  assert.match((await f.c.performShop(f.env, f.key, identity, 'discord')).message,
    /Tip Jar: 0 Star Candies/);
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 0);
  await f.c.saveBackpackTotal(f.env, f.key, 50000);
  const originalProgress = plain(await f.c.getPlayerProgress(f.env, f.key));
  for (const input of [null, 0, -1, '1.5', 'bad', 'Infinity', '9007199254740992', 50001]) {
    const balance = await f.c.getBackpackTotal(f.env, f.key);
    const result = await f.c.performBuy(f.env, f.key, 'tip-jar', null,
      identity, 'discord', null, input);
    assert.match(result.message, /Enter|enough Star Candies/);
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), balance);
    assert.equal(await f.env.Backpack.get(key), null);
  }
  const amounts = [1, 67, 69, 420, 1337, 6767, 6969, 10000];
  let expectedBalance = 50000;
  let expectedJar = 0;
  for (let i = 0; i < amounts.length; i++) {
    if (i) await f.env.Backpack.put(key,
      JSON.stringify({ total: expectedJar, cooldownUntil: 0 }));
    f.rolls.push(i);
    const amount = amounts[i];
    const result = await f.c.performBuy(f.env, f.key, 'tip-jar', null,
      identity, 'discord', null, amount);
    expectedBalance -= amount;
    expectedJar += amount;
    assert.match(result.message, new RegExp(`You tipped ${amount.toLocaleString('en-US')} Star Candies`));
    assert(result.message.includes(`"${flavors[i]}"`));
    assert.equal((result.message.match(/"/g) || []).length, 2);
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), expectedBalance);
    assert.equal((await f.c.getTipJarState(f.env)).total, expectedJar);
    const blocked = await f.c.performBuy(f.env, f.key, 'tip-jar', null,
      identity, 'discord', null, 1);
    assert.match(blocked.message, /Tip Jar is busy/);
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), expectedBalance);
  }
  await f.env.Backpack.put(key, JSON.stringify({ total: expectedJar, cooldownUntil: 0 }));
  const all = await f.c.performBuy(f.env, f.key, 'tip-jar', null,
    identity, 'discord', null, expectedBalance);
  assert.match(all.message, /You tipped/);
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 0);
  assert.equal((await f.c.getTipJarState(f.env)).total, 50000);
  assert.deepEqual(plain(await f.c.getPlayerProgress(f.env, f.key)), originalProgress);
  assert.match((await f.c.performShop(f.env, f.key, identity, 'discord')).message,
    /Tip Jar: 50,000 Star Candies/);
  const otherKey = 'other-tip-player';
  await f.c.savePlayerProgress(f.env, otherKey, f.c.createEmptyProgress());
  assert.match((await f.c.performShop(f.env, otherKey, 'other-tip-shop', 'discord')).message,
    /Tip Jar: 50,000 Star Candies/);
  assert.equal(await f.c.getBackpackTotal(f.env, otherKey), 0);
  await f.c.saveBackpackTotal(f.env, otherKey, 2);
  await f.env.Backpack.put(key, JSON.stringify({ total: 50000, cooldownUntil: 0 }));
  const twitchTip = await f.c.performBuy(f.env, otherKey, 'tip-jar', '2',
    'other-tip-shop', 'twitch');
  assert.match(twitchTip.message, /You tipped 2 Star Candies/);
  assert.equal(await f.c.getBackpackTotal(f.env, otherKey), 0);
  assert.equal((await f.c.getTipJarState(f.env)).total, 50002);
  f.c.Response = Response;
  const twitchKey = 'backpack:viewer';
  await f.c.saveBackpackTotal(f.env, twitchKey, 67);
  await f.env.Backpack.put(key, JSON.stringify({ total: 50002, cooldownUntil: 0 }));
  await f.c.handleTwitchRequest(new URL('https://offline.invalid/?user=viewer&action=shop'), f.env);
  const twitchResponse = await f.c.handleTwitchRequest(
    new URL('https://offline.invalid/?user=viewer&action=buy&args=tip-jar%2067'), f.env);
  assert.match(await twitchResponse.text(), /You tipped 67 Star Candies/);
  assert.equal(await f.c.getBackpackTotal(f.env, twitchKey), 0);
  assert.equal((await f.c.getTipJarState(f.env)).total, 50069);
  assert.match(vm.runInContext('DISCORD_HELP_TEXT', f.c), /simultaneous tips may not count correctly/);
  const buy = Array.from(vm.runInContext('DISCORD_COMMANDS', f.c)).find(c => c.name === 'buy');
  assert(buy.options.find(option => option.name === 'item').choices.some(c => c.value === 'tip-jar'));
  assert(buy.options.some(option => option.name === 'amount'));
  for (let i = 0; i < 100; i++) {
    f.rolls.push(i);
    assert.equal(f.c.randomChoice(flavors), flavors[i]);
  }
  await f.env.Backpack.put(key, '{invalid');
  assert.match((await f.c.performShop(f.env, f.key, identity, 'discord')).message,
    /Tip Jar: temporarily unavailable/);
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 0);
  console.log('PASS Tip Jar sequential amounts, validation, cooldown, flavor, state isolation, schema and help');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
