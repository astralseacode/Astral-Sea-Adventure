// Offline Astral Nexus region-gate integration checks. No network or live KV.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname, '..');
async function main() {
  const f = await fixture(39);
  await f.c.deleteCombatState(f.env,f.key);
  const region = f.c.getRegionById('astral-nexus');
  const metadata = await f.c.getRegionMetadata('astral-nexus');
  assert.equal(region.level,40);
  assert.equal(metadata.levelRequirement,40);
  for (const [level,expected] of [[39,'sunken-kings-throne'],[40,'astral-nexus'],[50,'astral-nexus']]) {
    assert.equal(f.c.getRegionForLevel(level).id,expected);
  }
  for (const [weapon,title] of Object.entries({
    'sword-and-shield':'Nexus Paladin',daggers:'Nexus Phantom',axe:'Worldbreaker',
    spear:'Horizon Dragoon',hammer:'Titan Vanguard',bow:'Horizon Hunter',
  })) {
    const progress=f.c.createEmptyProgress();
    progress.xp=f.c.totalXpForLevel(40);progress.activeClass=weapon;
    assert.equal(f.c.classTitle(progress),title);
  }
  assert.match((await f.c.performTravel(f.env,f.key,'astral-nexus')).message,/unlocks at Level 40/);
  assert.equal((await f.progress()).currentRegion,'moonlit-reef');
  assert.match((await f.c.performRegionCompletion(f.env,f.key,region)).message,/not been unlocked/);
  assert.match((await f.c.performNotesList(f.env,f.key,'astral-nexus')).message,/not been unlocked/);
  assert.match((await f.c.performReadNote(f.env,f.key,'astral-nexus',1,'discord')).message,/not been unlocked/);
  assert.match((await f.c.performJournal(f.env,f.key,'discord')).message,/Astral Nexus: Locked/);
  const beforeUnlockExplore=await f.c.performExplore(f.env,f.key,'discord');
  assert.equal(beforeUnlockExplore.region,'Moonlit Reef');

  await f.editProgress(p=>{p.xp=f.c.totalXpForLevel(40);});
  assert.match((await f.c.performTravel(f.env,f.key,'astral-nexus')).message,/traveled to Astral Nexus/);
  assert.equal((await f.progress()).currentRegion,'astral-nexus');
  assert.match((await f.c.performJournal(f.env,f.key,'discord')).message,/Astral Nexus: 0\/30/);
  assert.match((await f.c.performNotesList(f.env,f.key,'astral-nexus')).message,/Astral Nexus Notes: 0\/30/);
  assert.match((await f.c.performReadNote(f.env,f.key,'astral-nexus',1,'discord')).message,/has not been discovered/);
  const completion = await f.c.performRegionCompletion(f.env,f.key,region);
  assert(!/not been unlocked/.test(completion.message));
  assert.equal(completion.completedNotes,0);
  assert.equal(completion.totalAdventures,30);
  const adventureList = await f.c.performAdventure(f.env,f.key,'','discord');
  assert.match(adventureList.message,/Astral Nexus/);
  const adventure = await f.c.performAdventure(f.env,f.key,'1','discord');
  assert.match(adventure.message,/Adventure 1/);
  await f.c.clearActiveAdventure(f.env,f.key);
  const journal = await f.c.performReadJournal(f.env,f.key);
  assert.match(journal.message,/Astral Nexus/);
  const explore = await f.c.performExplore(f.env,f.key,'discord');
  assert.match(explore.message,/Astral Nexus|explored/i);
  assert.equal(explore.region,'Astral Nexus');

  const twitch = await fixture(40);
  twitch.c.Response=Response;
  await twitch.c.deleteCombatState(twitch.env,twitch.key);
  const twitchKey='backpack:viewer';
  await twitch.c.savePlayerProgress(twitch.env,twitchKey,{...twitch.c.createEmptyProgress(),xp:twitch.c.totalXpForLevel(40)});
  const twitchResponse=await twitch.c.handleTwitchRequest(new URL('https://local.test/?user=viewer&action=travel&region=astral'),twitch.env);
  assert.match(await twitchResponse.text(),/traveled to Astral Nexus/);
  assert.equal((await twitch.c.getPlayerProgress(twitch.env,twitchKey)).currentRegion,'astral-nexus');
  const twitch39=await fixture(39);
  twitch39.c.Response=Response;
  await twitch39.c.deleteCombatState(twitch39.env,twitch39.key);
  await twitch39.c.savePlayerProgress(twitch39.env,twitchKey,{...twitch39.c.createEmptyProgress(),xp:twitch39.c.totalXpForLevel(39)});
  const lockedTwitch=await twitch39.c.handleTwitchRequest(new URL('https://local.test/?user=viewer&action=travel&region=astral'),twitch39.env);
  assert.match(await lockedTwitch.text(),/unlocks at Level 40/);
  const max=await fixture(50);
  await max.c.deleteCombatState(max.env,max.key);
  assert.match((await max.c.performTravel(max.env,max.key,'astral-nexus')).message,/traveled to Astral Nexus/);

  const classFixture=await fixture(39);
  await classFixture.c.deleteCombatState(classFixture.env,classFixture.key);
  await classFixture.editProgress(p=>{p.xp=classFixture.c.totalXpForLevel(40)-1;p.currentRegion='sunken-kings-throne';p.ownedWeapons=['sword-and-shield'];p.equippedWeapon='sword-and-shield';p.activeClass='sword-and-shield';});
  const advance=await classFixture.c.performExplore(classFixture.env,classFixture.key,'discord');
  assert.match(advance.message,/Region Unlocked: Astral Nexus/);
  assert.match(advance.message,/Class Advancement — Nexus Paladin/);
  assert.equal((advance.message.match(/Class Advancement — Nexus Paladin/g)||[]).length,1);
  assert.equal(classFixture.c.classTitle(await classFixture.progress()),'Nexus Paladin');
  const next=await classFixture.c.performExplore(classFixture.env,classFixture.key,'discord');
  assert(!next.message.includes('Class Advancement — Nexus Paladin'));

  const noClass=await fixture(39);
  await noClass.c.deleteCombatState(noClass.env,noClass.key);
  await noClass.editProgress(p=>{p.xp=noClass.c.totalXpForLevel(40)-1;p.currentRegion='sunken-kings-throne';});
  const plainAdvance=await noClass.c.performExplore(noClass.env,noClass.key,'discord');
  assert.match(plainAdvance.message,/Region Unlocked: Astral Nexus/);
  assert(!plainAdvance.message.includes('Class Advancement'));
  const late=await fixture(40);
  await late.c.deleteCombatState(late.env,late.key);
  await late.c.saveBackpackTotal(late.env,late.key,20000);
  await late.c.performShop(late.env,late.key,'late-40','discord');
  assert.match((await late.c.performBuy(late.env,late.key,'bow',null,'late-40','discord')).message,/Class Unlocked — Horizon Hunter/);
  const worker=fs.readFileSync(path.join(root,'worker.js'),'utf8');
  const regionData=fs.readFileSync(path.join(root,'data/regions/astral-nexus.json'),'utf8');
  assert(!/Astral Nexus.{0,80}(Level 50|levelRequirement"\s*:\s*50)/i.test(worker+'\n'+regionData));
  const help=JSON.parse(fs.readFileSync(path.join(root,'data/spells/help.json'),'utf8'));
  assert.equal(help.requiredLevel,50);
  assert.equal(f.c.getRegionForLevel(50).id,'astral-nexus');
  console.log('Astral Nexus Level 39/40/50 gates, travel, content, notes, completion, and class advancement passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
