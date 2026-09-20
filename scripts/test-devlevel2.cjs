// Offline, account-scoped regression for the temporary Level 5 reset.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

async function main() {
  const f = await fixture(5);
  f.c.Response = Response;
  f.c.verifyDiscordRequest = async () => true;
  const id = '715083178834133043';
  const key = `backpack:discord:${id}`;
  const progressKey = `progress:${key}`;
  const username = 'playtester_1';
  const ownedKeys = [
    `combat:${key}`, `pending-combat:${key}`, `adventure:${key}`,
    `cooldown:discord:daily:${id}`, `shop-session:${username}`,
    `cooldown:rest:${username}`, `cooldown:long-rest:${username}`,
  ];
  const invoke = async (user, name = 'devlevel2') => {
    const request = new Request('https://offline.invalid/discord/interactions', {
      method: 'POST',
      headers: { 'X-Signature-Ed25519': 'mock', 'X-Signature-Timestamp': 'mock' },
      body: JSON.stringify({ type: 2, data: { name }, member: { user } }),
    });
    return (await f.c.handleDiscordInteractionCore(request,
      { ...f.env, DISCORD_PUBLIC_KEY: 'mock' })).json();
  };
  const old = f.c.createEmptyProgress();
  Object.assign(old, {
    xp: f.c.totalXpForLevel(30), berries: 4, hp: 14, mana: 6,
    stats: { ...old.stats, vitality: 3, strength: 2 },
    unspentStatPoints: 9, statPointsGrantedThroughLevel: 30,
    ownedWeapons: ['moonlit-sword'], equippedWeapon: 'moonlit-sword',
    classSystemUnlocked: true, activeClass: 'moonlit-sword',
    discoveries: { 'moonlit-reef': ['MR01'] }, notes: { 'moonlit-reef-note-01': true },
    combatProgress: { 'moonlit-reef': { highestUnlocked: 4 } },
    completedAdventures: { 'moonlit-reef': [1] }, currentRegion: 'starfall-trench',
    lastRestAt: 123, lastLongRestAt: 456, evocationCooldownTurns: 7,
  });
  await f.c.savePlayerProgress(f.env, key, old);
  f.values.set(key, '13');
  for (const stale of ownedKeys) f.values.set(stale, 'stale');
  const otherKey = 'backpack:discord:999999999999999999';
  f.values.set(otherKey, 'other player');
  const before = new Map(f.values);
  f.writes.length = 0;
  for (const unauthorized of [
    { id: '999999999999999999', username },
    { id: '369312325397905418', username },
    { id: 715083178834133043, username },
  ]) {
    const response = await invoke(unauthorized);
    assert.equal(response.data.content, 'This command is only available in development.');
    assert.equal(response.data.flags, 64);
  }
  assert.deepEqual(f.writes, []);
  assert.deepEqual(f.values, before);

  const commands = vm.runInContext('DISCORD_COMMANDS', f.c);
  assert.equal(commands.filter(command => command.name === 'devlevel2').length, 1);
  assert.equal(commands.find(command => command.name === 'devlevel2').options, undefined);
  const response = await invoke({ id, username: 'PlAyTeStEr_1' });
  assert.match(response.data.content, /Development Playtest Reset/);
  assert.equal(response.data.flags, 64);
  const expected = f.c.createEmptyProgress();
  expected.xp = f.c.totalXpForLevel(5);
  expected.unspentStatPoints = 4;
  expected.statPointsGrantedThroughLevel = 5;
  const saved = JSON.parse(f.values.get(progressKey));
  assert.deepEqual(saved, JSON.parse(JSON.stringify(expected)));
  assert.equal(f.c.levelFromXp(saved.xp), 5);
  assert.equal(f.values.get(key), '100000');
  for (const stale of ownedKeys) assert.equal(f.values.has(stale), false, stale);
  assert.equal(f.values.get(otherKey), 'other player');
  assert.deepEqual(f.writes.filter(([kind, target]) => kind === 'delete').map(([, target]) => target), ownedKeys);
  assert.deepEqual(f.writes.filter(([kind]) => kind === 'put'), [['put', progressKey], ['put', key]]);
  const spells = await f.c.getSpellDefinitions();
  assert.deepEqual(Array.from(spells.filter(spell => spell.requiredLevel <= 5).map(spell => spell.name)).sort(),
    ['Elf Blessing', 'Evocation', 'Jellyfish', 'Mend', 'Moonbeam', 'Star Spark'].sort());
  assert(spells.some(spell => spell.requiredLevel > 5));
  assert.equal(f.c.getRegionForLevel(5).id, 'starfall-trench');

  f.writes.length = 0;
  await invoke({ id, username: 'PLAYTESTER_1' });
  assert.deepEqual(f.writes, []);
  const devlevel = await invoke({ id, username }, 'devlevel');
  assert.match(devlevel.data.content, /now Level 50/);
  assert.equal(f.c.levelFromXp(JSON.parse(f.values.get(progressKey)).xp), 50);
  console.log('PASS /devlevel2 authorization, full reset, repeatability, unlocks, account isolation, and /devlevel');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
