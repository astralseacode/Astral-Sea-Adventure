// TEMPORARY DEVELOPMENT COMMAND: delete this file before full release.
// Run: node scripts/test-devlevel.cjs (in-memory KV and local content only).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const DEV_ID = '715083178834133043';

async function main() {
  const f = await fixture(5);
  f.c.Response = Response;
  // Only signature verification is mocked; exercise the actual Discord dispatcher.
  f.c.verifyDiscordRequest = async () => true;
  const key = `backpack:discord:${DEV_ID}`;
  const p = f.c.createEmptyProgress();
  Object.assign(p, {
    xp: f.c.totalXpForLevel(5), berries: 17, hp: 70, mana: 61,
    lastRestAt: 12345, lastLongRestAt: 67890,
    stats: { ...p.stats, strength: 2 }, unspentStatPoints: 2,
    statPointsGrantedThroughLevel: 5,
    discoveries: { 'moonlit-reef': ['MR01'] },
    notes: { 'moonlit-reef-note-01': true },
    combatProgress: { 'moonlit-reef': { highestUnlocked: 4 } },
    completedAdventures: { 'moonlit-reef': [1, 2, 3] },
  });
  await f.c.savePlayerProgress(f.env, key, p);
  // All separate records must remain byte-for-byte unchanged.
  f.values.set(key, '1234'); // Star Candies
  f.values.set(`inventory:${key}`, JSON.stringify({ keepsake: 3 }));
  f.values.set(`shop:discord:${DEV_ID}`, 'shop sentinel');
  f.values.set(`daily:discord:${DEV_ID}`, 'cooldown sentinel');
  const progressKey = f.c.getProgressKey(key);
  const before = new Map(f.values);
  let reads = 0;
  const get = f.env.Backpack.get;
  f.env.Backpack.get = async k => { reads++; return get(k); };
  const invoke = async (user, dm = false) => {
    const interaction = { type: 2, data: { name: 'devlevel' },
      ...(dm ? { user } : { member: { user } }) };
    const request = new Request('https://offline.invalid/discord/interactions', {
      method: 'POST', headers: { 'X-Signature-Ed25519': 'mock', 'X-Signature-Timestamp': 'mock' },
      body: JSON.stringify(interaction),
    });
    return f.c.handleDiscordInteraction(request, { ...f.env, DISCORD_PUBLIC_KEY: 'mock' });
  };
  f.writes.length = 0;
  for (const id of ['123456789012345678', '', undefined, Number(DEV_ID)]) {
    const response = await (await invoke({ id, username: DEV_ID })).json();
    assert.equal(response.data.content, 'This command is only available in development.');
    assert.equal(response.data.flags, 64);
  }
  assert.equal(reads, 0);
  assert.deepEqual(f.writes, []);
  assert.deepEqual(f.values, before);
  console.log('PASS unauthorized IDs and spoofed names: no reads or mutations');

  for (const dm of [false, true]) {
    f.writes.length = 0;
    const response = await (await invoke({ id: DEV_ID }, dm)).json();
    assert.match(response.data.content, /now Level 50 \(259700 XP\)/);
    assert.equal(response.data.flags, 64);
    const saved = JSON.parse(f.values.get(progressKey));
    assert.equal(saved.xp, f.c.totalXpForLevel(50));
    assert.equal(f.c.levelFromXp(saved.xp), 50);
    if (!dm) {
      assert.deepEqual(saved, { ...JSON.parse(before.get(progressKey)), xp: saved.xp });
    }
    assert.deepEqual(f.writes, [['put', progressKey]]);
    for (const [k, v] of before) if (k !== progressKey) assert.equal(f.values.get(k), v);
    const loaded = await f.c.getPlayerProgress(f.env, key);
    assert.equal(loaded.unspentStatPoints, 47); // Normal loader grants 45 newly earned points.
    assert.equal(loaded.statPointsGrantedThroughLevel, 50);
    assert.equal(loaded.stats.strength, 2);
    assert((await f.c.getActiveMasteries(f.c.levelFromXp(loaded.xp))).some(m => m.id === 'jellyfish-mastery-2'));
  }
  console.log('PASS guild/DM identity, canonical XP, preservation, repeat invocation, normal stat/mastery progression');

  const commands = vm.runInContext('DISCORD_COMMANDS', f.c);
  const definition = commands.filter(c => c.name === 'devlevel');
  assert.equal(definition.length, 1);
  assert.equal(definition[0].options, undefined);
  const source = fs.readFileSync(path.join(__dirname, '..', 'worker.js'), 'utf8');
  const twitch = source.slice(source.indexOf('async function handleTwitchRequest'), source.indexOf('async function handleDiscordInteraction'));
  assert(!twitch.includes('devlevel'));
  f.c.verifyDiscordRequest = async () => false;
  f.writes.length = 0;
  assert.equal((await invoke({ id: DEV_ID })).status, 401);
  assert.deepEqual(f.writes, []);
  console.log('PASS local definition, no Twitch alias, invalid signature rejection');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
