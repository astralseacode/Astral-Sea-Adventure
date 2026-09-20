// Offline regression for authored Adventure separators and Starfall room flow.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');

const root = path.resolve(__dirname, '..');
const adventureRoot = path.join(root, 'data', 'adventures');
const roomSeparator = /-{10,}\s*(?:ROOM\s*\d+|BOSS\s*[—–-])[^\n]*-{10,}/i;
const rawSeparator = /(?:#{10,}|-{20,}|={20,})/;
const plain = value => JSON.parse(JSON.stringify(value));

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.name.endsWith('.json')) {
      const adventure = JSON.parse(fs.readFileSync(file, 'utf8'));
      function check(value) {
        if (typeof value === 'string') {
          assert(!roomSeparator.test(value), file);
          assert(!rawSeparator.test(value), file);
        } else if (Array.isArray(value)) value.forEach(check);
        else if (value && typeof value === 'object') Object.values(value).forEach(check);
      }
      check(adventure);
    }
  }
}

async function main() {
  scan(adventureRoot);
  const f = await fixture(5);
  const key = 'presentation-player';
  const p = f.c.createEmptyProgress();
  p.xp = f.c.totalXpForLevel(5);
  p.currentRegion = 'starfall-trench';
  await f.c.savePlayerProgress(f.env, key, p);
  const definition = await f.c.getAdventureDefinition('starfall-trench', 1);
  const original = plain(definition);
  assert.equal(original.rooms[original.startRoomId].choices.right.reward.min, 145);
  assert.equal(original.rooms[original.startRoomId].choices.right.reward.max, 180);
  const start = await f.c.performAdventure(f.env, key, 1, 'discord');
  assert(start.message.includes(original.introDiscord));
  assert(start.message.includes(original.rooms[original.startRoomId].prompt));
  assert(start.message.includes('Choose /left, /right, /forward.'));
  assert(!roomSeparator.test(start.message));
  const first = await f.c.performAdventureDirection(f.env, key, 'right', 'discord');
  assert(first.message.includes('recover 145 Star Candies'));
  assert(first.message.includes(original.rooms[original.rooms[original.startRoomId].choices.right.nextRoomId].prompt));
  assert(!roomSeparator.test(first.message));
  const second = await f.c.performAdventureDirection(f.env, key, 'forward', 'discord');
  assert(second.message.includes('find 1 Berry'));
  assert(second.message.includes(original.rooms['lanterns-below-the-falling-sky-threshold'].prompt));
  assert(!roomSeparator.test(second.message));
  assert.equal((await f.c.getPlayerProgress(f.env, key)).berries, 1);
  const third = await f.c.performAdventureDirection(f.env, key, 'left', 'discord');
  assert(third.message.includes(original.bossPromptDiscord));
  assert(!roomSeparator.test(third.message));
  const preBoss = await f.c.getActiveAdventure(f.env, key);
  assert.equal(preBoss.status, 'awaiting-boss-confirmation');
  assert.deepEqual(Array.from(preBoss.completedRooms),
    ['lanterns-below-the-falling-sky-approach', 'lanterns-below-the-falling-sky-depths',
      'lanterns-below-the-falling-sky-threshold']);
  const boss = await f.c.confirmPendingCombat(f.env, key, 'discord');
  assert(boss.message.includes(original.boss.revealText));
  const combat = await f.c.getCombatState(f.env, key);
  assert.equal(combat.enemy.name, 'Meteor Lure Angler');
  assert.equal(combat.enemy.hp, 260);
  assert.equal(combat.enemy.damageBonus, 9);
  combat.enemy.hp = 0;
  combat.playerHp = 58;
  const victory = await f.c.resolveCombatVictory(f.env, key, combat, 20, 260, 'discord');
  assert(victory.message.includes(original.completionText));
  assert(victory.message.includes('HP 58/100'));
  assert(!rawSeparator.test(victory.message));
  assert.equal(await f.c.getActiveAdventure(f.env, key), null);
  const chunks = f.c.splitDiscordContent(victory.message + '\n'.repeat(1800) + victory.message);
  assert(Array.from(chunks).every(chunk => chunk.length <= 1900));
  assert.equal(Array.from(chunks).join(''), victory.message + '\n'.repeat(1800) + victory.message);
  console.log('PASS 186 Adventure content files, Starfall room flow/rewards/boss, completion, HUD, and splitting');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
