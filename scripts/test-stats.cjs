const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');

const cases = [
  ['sword-and-shield', 'Nexus Paladin', 'Sword and Shield'],
  ['daggers', 'Nexus Phantom', 'Daggers'],
  ['axe', 'Worldbreaker', 'Axe'],
  ['spear', 'Horizon Dragoon', 'Spear'],
  ['hammer', 'Titan Vanguard', 'Hammer'],
  ['bow', 'Horizon Hunter', 'Bow'],
];

async function check(f, expectedSpecialization, expectedWeapon) {
  const before = [...f.values];
  const writes = f.writes.length;
  for (const platform of ['discord', 'twitch']) {
    const message = (await f.c.performStats(f.env, f.key, 'stats-test', platform)).message;
    assert(message.includes(`Specialization: ${expectedSpecialization}`));
    assert(message.includes(`Equipped Weapon: ${expectedWeapon}`));
    assert(!message.includes('Specialization: Knight'));
    assert(!message.includes('sword-and-shield'));
    if (platform === 'discord') {
      assert(message.includes(`Specialization: ${expectedSpecialization}\nEquipped Weapon: ${expectedWeapon}\n\n**Resources**`));
      for (const text of ['Level:', 'XP:', 'Unspent Stat Points:', '**Resources**', 'HP:', 'Mana:', '**Permanent Stats**', 'Vitality:', 'Focus:', 'Strength:', 'Luck:', 'Armor:', 'Fae Affinity:', '**Rest Status**']) {
        assert(message.includes(text), text);
      }
    } else {
      for (const text of ['Level ', 'XP ', 'Points:', 'HP ', 'Mana ', 'Vitality ', 'Focus ', 'Strength ', 'Luck ', 'Armor ', 'Fae ']) {
        assert(message.includes(text), text);
      }
    }
  }
  assert.deepEqual([...f.values], before, 'stats changed saved state');
  assert.equal(f.writes.length, writes, 'stats wrote to KV');
}

async function main() {
  for (const [id, title, weapon] of cases) {
    const f = await fixture(50);
    await f.editProgress(p => { p.ownedWeapons = [id]; p.activeClass = id; p.equippedWeapon = id; p.classSystemUnlocked = true; });
    await check(f, title, weapon);
  }
  const early = await fixture(1);
  await early.editProgress(p => { p.ownedWeapons = ['sword-and-shield']; p.activeClass = 'sword-and-shield'; p.equippedWeapon = 'sword-and-shield'; p.classSystemUnlocked = true; });
  await check(early, 'Wayward Knight', 'Sword and Shield');

  const empty = await fixture(1);
  await check(empty, 'None', 'None');

  const mismatch = await fixture(50);
  await mismatch.editProgress(p => { p.ownedWeapons = ['sword-and-shield', 'bow']; p.activeClass = 'sword-and-shield'; p.equippedWeapon = 'bow'; p.classSystemUnlocked = true; });
  await check(mismatch, 'Nexus Paladin', 'Bow');
  assert.equal((await mismatch.progress()).activeClass, 'sword-and-shield');
  assert.equal((await mismatch.progress()).equippedWeapon, 'bow');

  const unequipped = await fixture(50);
  await unequipped.editProgress(p => { p.ownedWeapons = ['sword-and-shield']; p.activeClass = 'sword-and-shield'; p.equippedWeapon = null; p.classSystemUnlocked = true; });
  await check(unequipped, 'Nexus Paladin', 'None');
  console.log('PASS stats presentation on Discord and Twitch');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
