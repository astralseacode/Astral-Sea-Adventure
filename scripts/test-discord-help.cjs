// Offline Discord /help schema, complete delivery, and read-only regression.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname,'..');
const audit = JSON.parse(fs.readFileSync(path.join(root,'command-audit-for-help.json'),'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));
function request(user='123456789') {
  return new Request('https://offline.invalid/discord/interactions',{
    method:'POST',headers:{'X-Signature-Ed25519':'mock','X-Signature-Timestamp':'mock'},
    body:JSON.stringify({type:2,application_id:'987654321',token:'offline-help-token',
      user:{id:user,username:'helper'},data:{name:'help'}}),
  });
}
async function main() {
  const f=await fixture(40);
  f.c.Response=Response;
  f.c.verifyDiscordRequest=async()=>true;
  const commands=plain(vm.runInContext('DISCORD_COMMANDS',f.c));
  assert.equal(commands.filter(command=>command.name==='help').length,1);
  assert.equal(commands.length,40);
  assert.equal(commands.filter(command=>!['devlevel','devlevel2'].includes(command.name)).length,38);
  assert.equal(commands.find(command=>command.name==='help').options,undefined);
  const source=vm.runInContext('DISCORD_HELP_TEXT',f.c);
  assert(source.length>1900);
  assert(source.startsWith('Astral Sea Adventure: Help\n\nEvery command currently available to you is listed below.'));
  assert(source.endsWith('New here? Start with /explore.'));
  assert(!source.includes('—'));
  assert(!source.includes('-'));
  for(const {name} of audit.commands) {
    const lines=source.split('\n').filter(line=>line.startsWith(`/${name}: `));
    assert.equal(lines.length,1,`/${name}`);
  }
  for(const heading of ['Adventure','Combat & Spells','Items & Recovery','Exploration & Travel','Rewards','Player Info','Stat Progression','Shop & Weapons','Region Completion','Journal & Travel Notes']) {
    assert(source.includes(`\n\n${heading}\n\n`),heading);
  }
  for(const exact of [
    '/battle: Battle a random enemy from your current region. That enemy may come with modifiers. You might even encounter something special',
    '/buy: Buy Berries, weapons, and secrets.',
    '/read: Read all Travel Notes in your current region at once. Undiscovered pages tell you to keep exploring.',
    '/stim: Fully restore your HP once per battle. Using Stim consumes your combat turn.',
    '/equip: Equip a permanent weapon you own. Equipping is free and cannot be done during combat.',
    'Moonlit Reef: Starting region','Starfall Trench: Level 5','Whispering Kelp Forest: Level 10',
    "Leviathan's Wake: Level 20","Sunken King's Throne: Level 30",'Astral Nexus: Level 40',
    '20 minute cooldown','60 minute cooldown','10 minute shop session',
  ]) assert(source.includes(exact),exact);
  assert.equal(source.split('\n').find(line=>line.startsWith('/battle: ')),
    '/battle: Battle a random enemy from your current region. That enemy may come with modifiers. You might even encounter something special');
  assert(source.includes('simultaneous tips may not count correctly.'));
  assert(!source.split('\n').find(line=>line.startsWith('/battle: ')).includes('Wishpocket'));
  for(const forbidden of ['/devlevel','/devlevel2','/discord/register','/discord/schema','/health','/class ','/classchange','/weapons','Astral Nexus: Level 50']) {
    assert(!source.includes(forbidden),forbidden);
  }
  assert(!source.includes('/help: Cast'));
  const chunks=plain(f.c.splitDiscordContent(source));
  assert(chunks.length>1);
  assert(chunks.every(chunk=>chunk.length<=1900));
  assert.equal(chunks.join(''),source);

  const beforeValues=[...f.values];
  const beforeWrites=f.writes.length;
  const beforeCombat=plain(await f.state());
  const direct=await (await f.c.handleDiscordInteractionCore(request(),{...f.env,DISCORD_PUBLIC_KEY:'mock'})).json();
  assert.equal(direct.data.content,source);
  assert.equal(direct.data.flags,64);
  assert.deepEqual([...f.values],beforeValues);
  assert.equal(f.writes.length,beforeWrites);
  assert.deepEqual(plain(await f.state()),beforeCombat);
  const noProfile=await (await f.c.handleDiscordInteractionCore(request('555555555'),{...f.env,DISCORD_PUBLIC_KEY:'mock'})).json();
  assert.equal(noProfile.data.content,source);
  assert.equal(f.writes.length,beforeWrites);

  const followups=[];const pending=[];let resolutions=0;
  const originalCore=f.c.handleDiscordInteractionCore;
  f.c.handleDiscordInteractionCore=async(...args)=>{resolutions++;return originalCore(...args);};
  f.c.fetch=async(url,options)=>{followups.push({url,body:JSON.parse(options.body)});return {ok:true,status:200};};
  f.c.setTimeout=setTimeout;
  const response=await f.c.handleDiscordInteraction(request(),{...f.env,DISCORD_PUBLIC_KEY:'mock'},
    {waitUntil:promise=>pending.push(promise)});
  await Promise.all(pending);
  const initial=await response.json();
  assert.equal(initial.data.flags,64);
  assert.equal(resolutions,1);
  assert.equal(followups.length,chunks.length-1);
  assert.equal(initial.data.content+followups.map(item=>item.body.content).join(''),source);
  assert(followups.every(item=>item.body.flags===64));
  assert.equal(f.writes.length,beforeWrites);
  assert.deepEqual(plain(await f.state()),beforeCombat);
  assert.equal((await f.state()).round,beforeCombat.round);

  await f.c.deleteCombatState(f.env,f.key);
  const outsideWrites=f.writes.length;
  const outside=await (await f.c.handleDiscordInteractionCore(request(),{...f.env,DISCORD_PUBLIC_KEY:'mock'})).json();
  assert.equal(outside.data.content,source);
  assert.equal(f.writes.length,outsideWrites);
  const shopIdentity=f.c.getDiscordRestIdentity(await request().json());
  await f.c.performShop(f.env,f.key,shopIdentity,'discord');
  const sessionKey=f.c.getShopSessionKey(shopIdentity);
  const sessionBefore=f.values.get(sessionKey);
  const shopWrites=f.writes.length;
  await f.c.handleDiscordInteractionCore(request(),{...f.env,DISCORD_PUBLIC_KEY:'mock'});
  assert.equal(f.values.get(sessionKey),sessionBefore);
  assert.equal(f.writes.length,shopWrites);
  await f.c.performAdventure(f.env,f.key,'1','discord');
  const adventureBefore=plain(await f.c.getActiveAdventure(f.env,f.key));
  const adventureWrites=f.writes.length;
  await f.c.handleDiscordInteractionCore(request(),{...f.env,DISCORD_PUBLIC_KEY:'mock'});
  assert.deepEqual(plain(await f.c.getActiveAdventure(f.env,f.key)),adventureBefore);
  assert.equal(f.writes.length,adventureWrites);
  f.c.Response=Response;
  const twitchHelp=await f.c.handleTwitchRequest(new URL('https://offline.invalid/?user=helper&action=help'),f.env);
  assert.equal(await twitchHelp.text(),'Unknown command.');
  console.log('Discord /help schema, approved content, complete split delivery, and read-only state passed.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
