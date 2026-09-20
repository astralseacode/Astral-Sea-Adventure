// Offline release reset tests. Never invoke a live Discord command or KV namespace.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');

async function main() {
  const f = await fixture(50);
  f.c.Response = Response;
  f.c.verifyDiscordRequest = async () => true;
  const ids = ['715083178834133043', '1483714751208099912', '369312325397905418'];
  const commands = Array.from(vm.runInContext('DISCORD_COMMANDS', f.c));
  assert.equal(commands.filter(c => c.name === 'devlevel3').length, 1);
  assert.equal(commands.find(c => c.name === 'devlevel3').options, undefined);
  assert(!vm.runInContext('DISCORD_HELP_TEXT', f.c).includes('/devlevel3'));
  const invoke = async (id, username) => {
    const request = new Request('https://offline.invalid/discord/interactions', {
      method: 'POST', headers: { 'X-Signature-Ed25519': 'mock', 'X-Signature-Timestamp': 'mock' },
      body: JSON.stringify({ type: 2, data: { name: 'devlevel3' }, member: { user: { id, username } } }),
    });
    return (await f.c.handleDiscordInteractionCore(request,
      { ...f.env, DISCORD_PUBLIC_KEY: 'mock' })).json();
  };
  f.writes.length = 0;
  const unauthorized = await invoke('999999999999999999', 'outsider');
  assert.equal(unauthorized.data.content, 'This command is only available in development.');
  assert.equal(unauthorized.data.flags, 64);
  assert.deepEqual(f.writes, []);
  const tipKey = vm.runInContext('TIP_JAR_STATE_KEY', f.c);
  f.values.set(tipKey, JSON.stringify({ total: 12345, cooldownUntil: 67890 }));
  const otherKey = 'backpack:discord:999999999999999999';
  f.values.set(otherKey, 'another player');
  const xp = f.c.totalXpForLevel(20);
  assert.equal(xp, 43700);
  assert.equal(f.c.levelFromXp(xp), 20);
  assert.equal(f.c.levelFromXp(xp - 1), 19);
  const expected = f.c.createEmptyProgress();
  Object.assign(expected, { xp, unspentStatPoints: 19, statPointsGrantedThroughLevel: 20 });
  for (const [index, id] of ids.entries()) {
    const username = `release_tester_${index}`;
    const key = `backpack:discord:${id}`;
    const progressKey = `progress:${key}`;
    const dailyKey = `cooldown:discord:daily:${id}`;
    const cleared = [`combat:${key}`, `pending-combat:${key}`, `adventure:${key}`,
      `shop-session:${username}`, `cooldown:rest:${username}`, `cooldown:long-rest:${username}`];
    for (let run = 0; run < 2; run++) {
      const dirty = f.c.createEmptyProgress();
      Object.assign(dirty, {
        xp: f.c.totalXpForLevel(50), berries: 999, hp: 4, mana: 3,
        stats: { ...dirty.stats, vitality: 12, strength: 9 },
        unspentStatPoints: 28, statPointsGrantedThroughLevel: 50,
        ownedWeapons: ['moonlit-sword'], equippedWeapon: 'moonlit-sword',
        classSystemUnlocked: true, activeClass: 'moonlit-sword',
        discoveries: { 'astral-nexus': ['AN01'] }, notes: { 'astral-nexus-note-01': true },
        combatProgress: { 'astral-nexus': { highestUnlocked: 30 } },
        completedAdventures: { 'astral-nexus': [30] }, currentRegion: 'astral-nexus',
        lastRestAt: 123, lastLongRestAt: 456, evocationCooldownTurns: 7,
      });
      await f.c.savePlayerProgress(f.env, key, dirty);
      f.values.set(key, '55');
      f.values.set(dailyKey, '987654321');
      for (const stale of cleared) f.values.set(stale, 'stale');
      f.writes.length = 0;
      const result = await invoke(id, username);
      assert.equal(result.data.content,
        'Developer reset complete.\nLevel: 20\nStar Candies: 100,000');
      assert.equal(result.data.flags, 64);
      assert.deepEqual(JSON.parse(f.values.get(progressKey)), JSON.parse(JSON.stringify(expected)));
      assert.equal(f.values.get(key), '100000');
      assert.equal(f.values.get(dailyKey), '987654321');
      for (const stale of cleared) assert.equal(f.values.has(stale), false, stale);
      assert.equal(f.values.get(tipKey), JSON.stringify({ total: 12345, cooldownUntil: 67890 }));
      assert.equal(f.values.get(otherKey), 'another player');
      assert.deepEqual(f.writes.filter(([kind, target]) => kind === 'delete').map(([, target]) => target), cleared);
      assert.deepEqual(f.writes.filter(([kind]) => kind === 'put'), [['put', progressKey], ['put', key]]);
    }
  }
  assert.equal(f.c.getRegionForLevel(20).id, 'leviathans-wake');
  assert.equal(f.c.getRegionForLevel(30).id, 'sunken-kings-throne');
  assert.equal(f.c.getRegionForLevel(40).id, 'astral-nexus');
  const spells = await f.c.getSpellDefinitions();
  assert(spells.some(s => s.name === "Leviathan's Wake" && s.requiredLevel === 20));
  assert(spells.some(s => s.requiredLevel > 20));
  const level20Unlocks = Array.from(vm.runInContext('CANONICAL_LEVEL_UNLOCKS', f.c))
    .filter(line => Number(line.match(/^lvl (\d+) /)[1]) <= 20);
  assert(level20Unlocks.some(line => line.includes("Leviathan's Wake")));
  assert(!level20Unlocks.some(line => /^lvl (?:2[1-9]|[3-5]\d) /.test(line)));
  const level20Masteries = await f.c.getActiveMasteries(20);
  assert(level20Masteries.every(mastery => mastery.requiredLevel <= 20));
  assert(!level20Masteries.some(mastery => mastery.requiredLevel > 20));
  console.log('PASS /devlevel3 three authorized IDs, denial, scoped clean reset, Daily preservation, and repeatability');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
