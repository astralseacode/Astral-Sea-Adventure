// Deterministic class tables, migration, shop service, and shared attack path.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
const weapons = ['sword-and-shield', 'daggers', 'axe', 'spear', 'hammer', 'bow'];
const titles = [
  ['Wayward Knight','Shieldbearer','Warden','Bulwark','Crown Guardian','Nexus Paladin'],
  ['Cutpurse','Twinblade','Shadowblade','Nightstalker','Kingsbane','Nexus Phantom'],
  ['Raider','Marauder','Reaver','Ravager','Warbringer','Worldbreaker'],
  ['Spearhand','Lancer','Dragoon','Wavepiercer','Crownlance','Horizon Dragoon'],
  ['Bruiser','Breaker','Mauler','Juggernaut','Siegebreaker','Titan Vanguard'],
  ['Scout','Marksman','Sharpshooter','Deadeye','Royal Huntsman','Horizon Hunter'],
];
const levels = [1,5,10,20,30,50];
async function main() {
  const f = await fixture(1);
  assert.equal(f.c.classAdvancement(f.c.createEmptyProgress()),null);
  const classData = vm.runInContext('CLASS_DATA', f.c);
  for (let tier = 0; tier < 6; tier++) {
    for (let index = 0; index < 6; index++) {
      const id = weapons[index];
      assert.equal(classData[id].titles[tier], titles[index][tier]);
      const p = f.c.createEmptyProgress(); p.xp = f.c.totalXpForLevel(levels[tier]); p.activeClass = id;
      assert.equal(f.c.classTitle(p), titles[index][tier]);
      assert(f.c.classAdvancement(p).startsWith(`Class Advancement — ${titles[index][tier]}`));
      const rolls = id === 'daggers' || id === 'bow' ? [20,20] : [20];
      const normal = f.c.resolveWeaponAttack(id, rolls, 9, 20, 'discord');
      const specialized = f.c.resolveWeaponAttack(id, rolls, 9, 20, 'discord', tier);
      assert(specialized.damage > normal.damage, `${id} tier ${tier}`);
      assert(specialized.message.includes(classData[id].name));
      if (id === 'sword-and-shield') assert.equal(specialized.protection - normal.protection, [2,3,3,4,4,5][tier]);
      if (id === 'spear') assert.equal(specialized.pierceProtection, [10,10,12,12,15,15][tier]);
      if (id === 'hammer') assert.equal(specialized.stagger, [10,10,11,11,12,12][tier]);
    }
  }
  assert.equal(f.c.resolveWeaponAttack('daggers',[1,1],9,0,'discord',5).damage,0);
  assert.equal(f.c.resolveWeaponAttack('daggers',[14,19],9,0,'discord',5).damage,49);
  assert.equal(f.c.resolveWeaponAttack('daggers',[15,19],9,0,'discord',5).damage,55);
  assert.equal(f.c.resolveWeaponAttack('axe',[20],9,0,'discord',5,true).damage,104);
  assert.equal(f.c.resolveWeaponAttack('spear',[18],9,20,'discord',5).damage,53);
  assert.equal(f.c.resolveWeaponAttack('spear',[18],9,0,'discord',5).damage,48);
  assert.equal(f.c.resolveWeaponAttack('bow',[20,20],9,0,'discord',5).damage,69);
  assert.equal(f.c.resolveWeaponAttack('bow',[15,19],9,0,'discord',5).damage,52);

  await f.c.deleteCombatState(f.env, f.key);
  await f.c.saveBackpackTotal(f.env, f.key, 150000);
  assert(!((await f.c.performShop(f.env,f.key,'classes','discord')).message.includes('Class Change')));
  const first = await f.c.performBuy(f.env,f.key,'sword-and-shield',null,'classes','discord');
  assert(first.message.includes('Class Unlocked — Wayward Knight'));
  assert.equal((await f.progress()).activeClass,'sword-and-shield');
  assert((await f.c.performShop(f.env,f.key,'classes','discord')).message.includes('Class Change'));
  await f.c.performBuy(f.env,f.key,'bow',null,'classes','discord');
  assert.equal((await f.progress()).activeClass,'sword-and-shield');
  assert.equal((await f.c.getBackpackTotal(f.env,f.key)),110000);
  assert((await f.c.performBuy(f.env,f.key,'class-change',null,'classes','discord','bow')).message.includes('Class Changed — Scout'));
  assert.equal((await f.c.getBackpackTotal(f.env,f.key)),60000);
  const noSession = await f.c.performBuy(f.env,f.key,'class-change',null,'another-session','discord','sword-and-shield');
  assert.match(noSession.message,/shop/i);
  assert.equal((await f.c.getBackpackTotal(f.env,f.key)),60000);
  await f.c.startCombatEncounter(f.env,f.key,f.c.getRegionById('moonlit-reef'),1,f.enemy,'discord');
  const inCombat = await f.c.performBuy(f.env,f.key,'class-change',null,'classes','discord','sword-and-shield');
  assert.match(inCombat.message,/Finish the current fight/);
  assert.equal((await f.c.getBackpackTotal(f.env,f.key)),60000);
  await f.c.deleteCombatState(f.env,f.key);
  assert.equal((await f.progress()).equippedWeapon,'bow');
  assert.equal((await f.progress()).activeClass,'bow');
  assert((await f.c.performBuy(f.env,f.key,'class-change',null,'classes','discord','bow')).message.includes('already a Ranger'));
  assert((await f.c.performBuy(f.env,f.key,'class-change',null,'classes','discord','axe')).message.includes('do not own'));
  assert.equal((await f.c.getBackpackTotal(f.env,f.key)),60000);
  const late = await fixture(50);
  await late.c.deleteCombatState(late.env,late.key);
  await late.c.saveBackpackTotal(late.env,late.key,20000);
  await late.c.performShop(late.env,late.key,'late','discord');
  assert((await late.c.performBuy(late.env,late.key,'bow',null,'late','discord')).message.includes('Class Unlocked — Horizon Hunter'));
  const migration = await fixture(30);
  await migration.editProgress(p => { p.ownedWeapons=['axe','bow']; p.equippedWeapon='bow'; p.activeClass=null; });
  assert.equal((await migration.progress()).activeClass,'bow');
  await migration.editProgress(p => { p.ownedWeapons=['axe','bow']; p.equippedWeapon=null; p.activeClass=null; });
  assert.equal((await migration.progress()).activeClass,null);
  await migration.c.deleteCombatState(migration.env,migration.key);
  await migration.c.performShop(migration.env,migration.key,'migration','discord');
  const initialized = await migration.c.performBuy(migration.env,migration.key,'class-change',null,'migration','discord','bow');
  assert.equal(initialized.totalPrice,0);
  assert.equal((await migration.progress()).activeClass,'bow');
  await migration.editProgress(p => { p.ownedWeapons=['axe']; p.equippedWeapon=null; p.activeClass=null; });
  assert.equal((await migration.progress()).activeClass,'axe');
  const fury = await fixture(50);
  await fury.editProgress(p => { p.ownedWeapons=['axe']; p.equippedWeapon='axe'; p.activeClass='axe'; });
  fury.rolls.push(1,1);
  await fury.attack();
  assert.equal((await fury.state()).warbringerFury,true);
  fury.rolls.push(5,1);
  await fury.attack();
  assert.equal((await fury.state()).warbringerFury,true);
  fury.rolls.push(6,1);
  assert((await fury.attack()).message.includes('+5 Warbringer Fury'));
  assert.equal((await fury.state()).warbringerFury,undefined);
  const paladin = await fixture(50);
  await paladin.editProgress(p => { p.ownedWeapons=['sword-and-shield']; p.equippedWeapon='sword-and-shield'; p.activeClass='sword-and-shield'; });
  await paladin.editState(s => { s.playerHp=90; s.enemy.protection=100; });
  paladin.rolls.push(17,1);
  assert((await paladin.attack()).message.includes('Restored 3 HP'));
  assert.equal((await paladin.state()).playerHp,93);
  paladin.rolls.push(1,1);
  await paladin.attack();
  assert.equal((await paladin.state()).playerHp,93);
  const titan = await fixture(50);
  await titan.editProgress(p => { p.ownedWeapons=['hammer']; p.equippedWeapon='hammer'; p.activeClass='hammer'; });
  titan.rolls.push(20,1);
  await titan.attack();
  assert.equal((await titan.state()).stagger,12);
  assert.equal((await titan.state()).berryEffects?.protection,undefined);
  titan.rolls.push(6,20,20);
  const titanResult = await titan.attack(); assert(titanResult.message.includes('Titan Vanguard gains 5 Protection'));
  assert.equal((await titan.state()).berryEffects.protection,5);
  const twitch = await fixture(50,'twitch');
  await twitch.editProgress(p => { p.ownedWeapons=['bow']; p.equippedWeapon='bow'; p.activeClass='bow'; p.stats.strength=9; });
  twitch.rolls.push(20,20,1);
  const attack = await twitch.attack();
  assert(attack.message.includes('69 dmg'));
  assert.equal((await twitch.state()).enemy.hp,931);
  console.log('Class titles, all tiers, shop service, migration, and Twitch attack passed.');
}
main().catch(error => { console.error(error); process.exitCode=1; });
