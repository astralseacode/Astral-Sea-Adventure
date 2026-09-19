// Offline weapon tables, shop, equipment, and combat integration.
const assert = require('node:assert/strict');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));

async function main() {
  const f = await fixture(50);
  const tables = {
    'sword-and-shield': [[1,0,0],[2,15,5],[5,15,5],[6,20,5],[10,20,5],[11,25,10],[15,25,10],[16,30,10],[19,30,10],[20,40,15]],
    axe: [[1,0],[5,0],[6,30],[10,30],[11,40],[15,40],[16,50],[19,50],[20,70]],
    spear: [[1,0],[2,20],[6,20],[7,25],[12,25],[13,30],[17,30],[18,35],[19,35],[20,45]],
    hammer: [[1,0,0],[3,0,0],[4,25,0],[8,25,0],[9,35,0],[14,35,0],[15,45,5],[19,45,5],[20,60,10]],
    bow: [[1,0],[2,20],[9,20],[10,25],[14,25],[15,30],[19,30],[20,40]],
  };
  for (const [id, cases] of Object.entries(tables)) {
    for (const [roll, base, sideEffect = 0] of cases) {
      const result = f.c.resolveWeaponAttack(id, id === 'bow' ? [1, roll] : [roll], 9, 0, 'discord');
      assert.equal(result.damage, base ? base + 9 : 0, `${id} ${roll}`);
      if (id === 'sword-and-shield') assert.equal(result.protection, sideEffect);
      if (id === 'hammer') assert.equal(result.stagger, sideEffect);
    }
  }
  for (const [rolls, base] of [[[1,1],0],[[1,14],14],[[14,19],32],[[20,20],50]]) {
    const result = f.c.resolveWeaponAttack('daggers', rolls, 9, 0, 'discord');
    assert.equal(result.damage, base ? base + 9 : 0);
    assert(result.message.includes(`Rolls: ${rolls.join(' / ')}`));
  }
  assert.equal(f.c.resolveWeaponAttack('bow', [11,18], 9, 0, 'discord').damage, 39);
  assert.equal(f.c.resolveWeaponAttack('bow', [1,1], 9, 0, 'discord').damage, 0);
  assert.equal(f.c.resolveWeaponAttack('spear', [18], 9, 20, 'discord').pierceProtection, 10);
  assert.equal(f.c.resolveWeaponAttack('spear', [18], 9, 6, 'discord').pierceProtection, 6);
  assert.equal(f.c.resolveWeaponAttack('spear', [18], 9, 0, 'discord').pierceProtection, 0);

  await f.c.deleteCombatState(f.env, f.key);
  await f.c.saveBackpackTotal(f.env, f.key, 150000);
  const identity = 'weapon-shop-test';
  const noSession = await f.c.performBuy(f.env, f.key, 'axe', null, identity, 'discord');
  assert.match(noSession.message, /shop/i);
  const shop = await f.c.performShop(f.env, f.key, identity, 'discord');
  for (const item of ['Berry','Sword and Shield','Daggers','Axe','Spear','Hammer','Bow']) assert(shop.message.includes(item));
  assert(shop.message.includes('20,000 Star Candies · Permanent'));
  const invalidQuantity = await f.c.performBuy(f.env, f.key, 'axe', 99, identity, 'discord');
  assert.match(invalidQuantity.message, /quantity empty/i);
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 150000);
  const purchaseQuotes = {
    'sword-and-shield': '"Excellent choice. Very responsible. Disturbingly responsible, actually."',
    daggers: '"Two blades! Twice the pointy. That\'s how it works."',
    axe: '"I\'m legally required to tell you not to swing this near the shop."',
    spear: '"Long, pointy, and conveniently keeps problems far away."',
    hammer: '"If something survives the first hit, hit it again. My advice."',
    bow: '"Excellent! Now you can miss things from farther away."',
  };
  const equipFlavor = {
    'sword-and-shield': ['Sword and Shield', 'A little safer. Probably.'],
    daggers: ['Daggers', 'Two blades means twice as many chances to make a bad decision.'],
    axe: ['Axe', 'Subtlety has officially left the adventure.'],
    spear: ['Spear', 'Problems are much nicer when they stay at spear length.'],
    hammer: ['Hammer', 'Some problems require careful thinking. This is not one of those problems.'],
    bow: ['Bow', 'Distance has been added to your list of excuses.'],
  };
  const owned = [];
  for (const id of ['sword-and-shield','daggers','axe','spear','hammer','bow']) {
    const bought = await f.c.performBuy(f.env, f.key, id, null, identity, 'discord');
    assert.equal(bought.totalPrice, 20000);
    assert(bought.message.startsWith(`${purchaseQuotes[id]}\n\n`), id);
    owned.push(id);
    const progress = await f.progress();
    assert.deepEqual(plain(progress.ownedWeapons), owned);
    assert.equal(progress.equippedWeapon, 'sword-and-shield');
  }
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 30000);
  const duplicate = await f.c.performBuy(f.env, f.key, 'axe', null, identity, 'discord');
  assert.match(duplicate.message, /already own/);
  assert.equal(await f.c.getBackpackTotal(f.env, f.key), 30000);
  assert.match((await f.c.performShop(f.env, f.key, identity, 'discord')).message, /Sword and Shield\n[^\n]+\n20,000 Star Candies · Equipped/);
  const candiesBeforeEquip = await f.c.getBackpackTotal(f.env, f.key);
  const progressBeforeEquip = plain(await f.progress());
  for (const [id, [name, flavor]] of Object.entries(equipFlavor)) {
    assert.equal((await f.c.performEquip(f.env, f.key, id)).message,
      `You've equipped your ${name}.\n\n${flavor}`);
    const after = plain(await f.progress());
    assert.equal(after.equippedWeapon, id);
    assert.deepEqual({ ...after, equippedWeapon: null }, { ...progressBeforeEquip, equippedWeapon: null });
    assert.equal(await f.c.getBackpackTotal(f.env, f.key), candiesBeforeEquip);
  }
  const berry = await f.c.performBuy(f.env, f.key, 'berry', 2, identity, 'discord');
  assert.equal(berry.totalPrice, 400);
  assert(!Object.values(purchaseQuotes).some(quote => berry.message.includes(quote)));
  assert.match(berry.message, /Berr/);
  assert.equal((await f.progress()).berries, 2);
  await f.c.startCombatEncounter(f.env, f.key, f.c.getRegionById('moonlit-reef'), 1, f.enemy, 'discord');
  assert.equal((await f.c.performEquip(f.env, f.key, 'axe')).message,
    'Finish the current fight before changing weapons.');
  f.rolls.push(11,18,1);
  const bow = await f.c.performAttack(f.env, f.key, 'discord');
  assert(bow.message.includes('Rolls: 11 / 18'));
  assert(bow.message.includes('Kept: 18'));
  assert.equal((await f.state()).enemy.hp, 970);

  const poor = await fixture(1);
  await poor.c.deleteCombatState(poor.env, poor.key);
  await poor.c.saveBackpackTotal(poor.env, poor.key, 15844);
  assert.equal((await poor.c.performEquip(poor.env, poor.key, 'spear')).message,
    'You do not own Spear. Visit /shop to buy it.');
  await poor.c.performShop(poor.env, poor.key, 'poor-shop', 'discord');
  const short = await poor.c.performBuy(poor.env, poor.key, 'spear', null, 'poor-shop', 'discord');
  assert.equal(short.shortfall, 4156);
  assert(short.message.includes('4,156'));
  assert.equal(await poor.c.getBackpackTotal(poor.env, poor.key), 15844);
  poor.values.set(poor.c.getShopSessionKey('poor-shop'), String(Date.now() - 11 * 60 * 1000));
  assert.match((await poor.c.performBuy(poor.env, poor.key, 'spear', null, 'poor-shop', 'discord')).message, /shop/i);
  assert.deepEqual(plain((await poor.progress()).ownedWeapons), []);
  assert.equal((await poor.progress()).equippedWeapon, null);

  const spear = await fixture(30);
  await spear.editProgress(p => { p.ownedWeapons = ['spear']; p.equippedWeapon = 'spear'; p.stats.strength = 9; });
  await spear.editState(s => { s.regionId = 'sunken-kings-throne'; s.enemy.protection = 20; });
  spear.rolls.push(18,1);
  const pierced = await spear.c.performAttack(spear.env, spear.key, 'discord');
  assert(pierced.message.includes('Pierced 10 Protection'));
  assert.equal((await spear.state()).enemy.hp, 966);
  assert.equal((await spear.state()).enemy.protection, 0);

  const unarmed = await fixture(50);
  unarmed.rolls.push(17,1);
  const defaultAttack = await unarmed.c.performAttack(unarmed.env, unarmed.key, 'discord');
  assert(!defaultAttack.message.includes('Sword and Shield'));
  assert.equal((await unarmed.progress()).equippedWeapon, null);

  const twitch = await fixture(50);
  await twitch.editProgress(p => { p.ownedWeapons = ['bow']; p.equippedWeapon = 'bow'; });
  twitch.rolls.push(11,18,1);
  const twitchAttack = await twitch.c.performAttack(twitch.env, twitch.key, 'twitch');
  assert(twitchAttack.message.includes('Rolls: 11 / 18'));
  assert.equal((await twitch.state()).enemy.hp, 970);

  const hammer = await fixture(20);
  await hammer.editProgress(p => { p.ownedWeapons = ['hammer']; p.equippedWeapon = 'hammer'; });
  hammer.rolls.push(20,1);
  const miss = await hammer.c.performAttack(hammer.env, hammer.key, 'discord');
  assert(miss.message.includes('Stagger: next successful enemy attack -10 damage'));
  assert.equal((await hammer.state()).stagger, 10);
  hammer.rolls.push(1,9);
  const staggered = await hammer.c.performAttack(hammer.env, hammer.key, 'discord');
  assert(staggered.message.includes('Stagger reduces enemy damage by 10'));
  assert.equal((await hammer.state()).stagger, undefined);

  const shield = await fixture(20);
  await shield.editProgress(p => { p.ownedWeapons = ['sword-and-shield']; p.equippedWeapon = 'sword-and-shield'; });
  shield.rolls.push(17,1);
  await shield.c.performAttack(shield.env, shield.key, 'discord');
  assert.equal((await shield.state()).berryEffects.protection, 10);
  shield.rolls.push(1,9);
  const absorbed = await shield.c.performAttack(shield.env, shield.key, 'discord');
  assert(absorbed.message.includes('Protection absorbs'));
  assert.equal((await shield.state()).playerHp, 100);

  const nexus = await fixture(50);
  await nexus.editProgress(p => { p.ownedWeapons = ['daggers']; p.equippedWeapon = 'daggers'; });
  await nexus.editState(s => { s.regionId = 'astral-nexus';
    const regional = nexus.c.getRegionalEnemyState(s);
    regional.lastSpell = 'moonbeam'; regional.actions = 2; regional.streak = 1; });
  nexus.rolls.push(14,19,1);
  const daggers = await nexus.c.performAttack(nexus.env, nexus.key, 'discord');
  assert(daggers.message.includes('Rolls: 14 / 19'));
  const regional = (await nexus.state()).regionalEnemy;
  assert.equal(regional.actions, 3);
  assert.equal(regional.lastSpell, null);
  assert.equal(regional.streak, 0);
  assert.equal(regional.spells, 0);
  assert.equal(regional.adaptation, 5);

  const familiarDaggers = await fixture(30);
  await familiarDaggers.editProgress(p => { p.ownedWeapons = ['daggers']; p.equippedWeapon = 'daggers'; });
  familiarDaggers.rolls.push(1,1,0);
  await familiarDaggers.cast('familiar');
  familiarDaggers.rolls.push(14,19,1);
  await familiarDaggers.c.performAttack(familiarDaggers.env, familiarDaggers.key, 'discord');
  assert.equal((await familiarDaggers.state()).familiar.actions, 1);
  console.log('Weapon tables, shop purchases, singleton ownership, equip, Berry, and Bow combat passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
