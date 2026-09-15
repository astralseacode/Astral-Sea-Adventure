// Offline real-entry-point fixtures: local data, fake signatures, in-memory KV.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const fallback = 'The Astral Sea is unusually turbulent. Please try again shortly.';

async function runtime(source, { budget = 50, seed = 0x51ea } = {}) {
  const values = new Map(), errors = [], deliveries = [], rolls = [];
  let counts, armed = false, rejectWrite = null;
  const reset = () => { counts = { content: 0, followups: 0, reads: 0, writes: {}, deletes: {} }; };
  reset();
  const math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed / 4294967296; };
  const c = vm.createContext({ structuredClone, Response, Request, URL, TextEncoder,
    setTimeout: fn => fn(), Math: math,
    console: { log() {}, warn() {}, error: (...args) => errors.push(args) },
    fetch: async (url, options) => {
      if (String(url).startsWith('https://discord.com/api/')) {
        counts.followups++;
        assert(counts.content + counts.followups <= budget);
        deliveries.push(JSON.parse(options.body));
        return { ok: true, status: 200 };
      }
      counts.content++;
      if (counts.content + counts.followups > budget) throw Error('Too many subrequests.');
      const relative = String(url).split('/main/data/')[1];
      assert(relative, `Forbidden network: ${url}`);
      const file = path.join(root,'data',relative);
      return { ok: fs.existsSync(file), status: fs.existsSync(file)?200:404,
        json: async () => JSON.parse(fs.readFileSync(file,'utf8')) };
    },
  });
  vm.runInContext(source.replace('export default {','const workerExport = {'), c);
  c.verifyDiscordRequest = async () => true;
  c.randomInteger = (min,max) => rolls.length ? rolls.shift() : min + Math.floor(math.random()*(max-min+1));
  const key = 'backpack:discord:123456789';
  const env = { DISCORD_PUBLIC_KEY: 'offline', Backpack: {
    get: async key => { counts.reads++; return values.get(key) ?? null; },
    put: async (key,value,options) => {
      counts.writes[key]=(counts.writes[key]||0)+1;
      if (armed && rejectWrite) await rejectWrite(key,counts.writes[key],value);
      assert.equal(typeof value,'string');
      values.set(key,value);
    },
    delete: async key => { counts.deletes[key]=(counts.deletes[key]||0)+1; values.delete(key); },
  } };
  const progress = c.createEmptyProgress();
  Object.assign(progress,{xp:c.totalXpForLevel(50),mana:250,hp:200,restBufferType:'long'});
  progress.stats.focus=10;progress.stats.vitality=5;
  await c.savePlayerProgress(env,key,progress);
  const enemy = {id:'test-enemy',name:'Test Enemy',level:20,hp:1000,damageBonus:0,
    reward:{candies:{min:1,max:1},xp:{min:1,max:1}},defeatCandyLoss:0};
  await c.startCombatEncounter(env,key,c.getRegionById('moonlit-reef'),1,enemy,'discord');
  const worker = vm.runInContext('workerExport',c);
  const f = {c,env,key,values,errors,rolls,enemy,
    counts:()=>counts,
    limitWrites:handler=>{rejectWrite=handler;},
    state:()=>c.getCombatState(env,key),progress:()=>c.getPlayerProgress(env,key),
    editState:async change=>{const s=await f.state();change(s);await c.saveCombatState(env,key,s);},
    editProgress:async change=>{const p=await f.progress();change(p);await c.savePlayerProgress(env,key,p);},
    run:async (name,options=[],{cold=true, twitch=false}={})=>{
      reset(); errors.length=0; deliveries.length=0;
      if(cold)vm.runInContext('DATA_CACHE.clear()',c);
      const pending=[];armed=true;
      const start=Date.now();
      const request=twitch
        ? new Request(`https://offline.invalid/?user=test&action=${name}&args=${encodeURIComponent(options)}`)
        : new Request('https://offline.invalid/discord/interactions',{method:'POST',
          headers:{'X-Signature-Ed25519':'offline','X-Signature-Timestamp':'1'},
          body:JSON.stringify({type:2,application_id:'123456789',token:'offline-token',user:{id:'123456789'},data:{name,options}})});
      const response=await worker.fetch(request,env,{waitUntil:p=>pending.push(p)});
      const initialMs=Date.now()-start;
      await Promise.all(pending);armed=false;
      const text=await response.text();let payload;try{payload=JSON.parse(text);}catch{}
      return {content:(payload?.data?.content||text)+deliveries.map(d=>d.content).join(''),
        status:response.status,counts:structuredClone(counts),initialMs};
    },
  };
  reset();return f;
}
const spellOptions = value => [{name:'spell',value}];
const scenarios = [
  ['moonbeam','cast',spellOptions('moonbeam')],
  ['star spark','cast',spellOptions('star-spark')],
  ['jellyfish','cast',spellOptions('jelly')],
  ['Help!','cast',spellOptions('Help!')],
  ['conjure gun','cast',spellOptions('conjure gun')],
  ['attack','attack',[]],
  ['explore','explore',[],async f=>f.c.deleteCombatState(f.env,f.key)],
  ['adventure','adventure',[{name:'number',type:4,value:1}],async f=>f.c.deleteCombatState(f.env,f.key)],
  ['journal','journal',[]],['level/status','stats',[]],['inventory/profile','backpack',[]],
  ['victory/reward','attack',[],async f=>{await f.editState(s=>{s.enemy.hp=1;});f.rolls.push(20);}],
  ['defeat','attack',[],async f=>{await f.editState(s=>{s.playerHp=1;s.perkUses={'fae-intervention':1};s.enemy.damageBonus=200;});f.rolls.push(1,20);}],
  ['stim','stim',[],async f=>f.editState(s=>{s.playerHp=100;})],
  ['evocation','cast',spellOptions('evocation'),async f=>f.editProgress(p=>{p.mana=0;})],
  ['berries','cast',spellOptions('berries')],['familiar','cast',spellOptions('familiar')],
  ['echo','cast',spellOptions('echo')],['wake','cast',spellOptions('wake')],
  ['wake arrival','attack',[],async f=>{f.rolls.push(1,1);await f.c.performCast(f.env,f.key,'wake','discord');await f.editState(s=>{s.leviathansWake.stage=2;});}],
  ['Storyteller threshold','cast',spellOptions('Help!'),async f=>{await f.editState(s=>{s.enemy.hp=443;s.enemy.maxHp=443;});f.rolls.push(17,13);}],
  ['Familiar/Bond','attack',[],async f=>{await f.editState(s=>{s.familiar={id:'astral-dragonling',total:2,actions:0,serial:1,astralBond:'armed'};s.familiarSerial=1;});}],
  ['level-up unlock','attack',[],async f=>{await f.editProgress(p=>{p.xp=f.c.totalXpForLevel(50)-1;});await f.editState(s=>{s.enemy.hp=1;});f.rolls.push(20);}],
  ['adventure reward','left',[],async f=>{await f.c.deleteCombatState(f.env,f.key);await f.c.performAdventure(f.env,f.key,1,'discord');}],
  ['adventure berries','forward',[],async f=>{await f.c.deleteCombatState(f.env,f.key);await f.c.performAdventure(f.env,f.key,1,'discord');}],
  ['adventure combat start','right',[],async f=>{await f.c.deleteCombatState(f.env,f.key);await f.c.performAdventure(f.env,f.key,1,'discord');}],
  ['adventure victory','attack',[],async f=>{await f.c.deleteCombatState(f.env,f.key);await f.c.performAdventure(f.env,f.key,1,'discord');await f.c.performAdventureDirection(f.env,f.key,'right','discord');await f.editState(s=>{s.enemy.hp=1;});f.rolls.push(20);}],
];
async function measure(source, budget=10000) {
  const rows=[];
  for(const [label,name,options,setup] of scenarios){
    const f=await runtime(source,{budget});if(setup)await setup(f);
    const r=await f.run(name,options);
    rows.push({label,content:r.counts.content,followups:r.counts.followups,
      progress:r.counts.writes['progress:'+f.key]||0,allWrites:r.counts.writes,
      failed:r.content.includes(fallback),initialMs:r.initialMs});
  }
  return rows;
}
async function main() {
  const { build, collectContent, renderWorker } = require('./build-worker.cjs');
  build({check:true});
  const source = fs.readFileSync(path.join(root,'dist/worker.js'),'utf8');
  const rows = await measure(source,50);
  for (const row of rows) {
    assert.equal(row.failed,false,row.label);
    assert.equal(row.content,0,row.label);
    for (const count of Object.values(row.allWrites)) assert(count<=1,row.label);
  }
  for (const [label,name,options,setup] of scenarios) {
    const f=await runtime(source);if(setup)await setup(f);
    f.limitWrites(async (_key,count)=>{if(count>1)throw Error('KV PUT failed: 429');});
    const result=await f.run(name,options);
    assert(!result.content.includes(fallback),label);
  }

  const entries=collectContent();
  const allContent=await runtime(source);
  for(const [relative,expected] of Object.entries(entries)) {
    const actual=await allContent.c.fetchCachedJson(relative,
      `https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data/${relative}`);
    assert.equal(JSON.stringify(actual),expected,relative);
  }
  assert.equal(allContent.counts().content,0,'Every authored document is bundled without HTTP');
  assert.equal(renderWorker(),renderWorker(),'Build must be deterministic');
  const workerSource=fs.readFileSync(path.join(root,'worker.js'),'utf8');
  for(let i=0;i<100;i++) {
    const spell=JSON.parse(entries['spells/starspark.json']);
    spell.id=`future-${i}`;spell.aliases=[`future ${i}`];
    entries[`spells/future-${i}.json`]=JSON.stringify(spell);
    entries[`perks/future-${i}.json`]=entries['perks/astral-momentum.json'];
  }
  const scaled=await runtime(renderWorker(workerSource,entries));
  vm.runInContext('for(let i=0;i<100;i++) SPELL_FILES["future-"+i]="future-"+i+".json";',scaled.c);
  const scaledCast=await scaled.run('cast',spellOptions('moonbeam'));
  assert(!scaledCast.content.includes(fallback));
  for(let i=0;i<100;i++) await scaled.c.fetchCachedJson(`future:${i}`,
    `https://raw.githubusercontent.com/astralseacode/Astral-Sea-Adventure/main/data/perks/future-${i}.json`);
  assert.equal(scaled.counts().content,0);
  const definition=await scaled.c.getSpellDefinition('help');
  assert(Object.isFrozen(definition));assert(Object.isFrozen(definition.opening));
  try { definition.opening[0]='mutated'; } catch {}
  assert.notEqual((await scaled.c.getSpellDefinition('help')).opening[0],'mutated');

  const abort=await runtime(source);
  const original=[...abort.values];
  abort.c.resolveEnemyCombatResponse=async()=>{throw Error('Injected gameplay failure');};
  const aborted=await abort.run('cast',spellOptions('help'));
  assert(aborted.content.includes(fallback));
  assert.deepEqual([...abort.values],original);
  assert.equal(Object.keys(aborted.counts.writes).length,0,'No rollback reaches KV');

  const failed=await runtime(source);const before=[...failed.values];
  failed.limitWrites(async()=>{throw Error('KV PUT failed: 429');});
  const rejected=await failed.run('cast',spellOptions('help'));
  assert(rejected.content.includes(fallback));
  assert.deepEqual([...failed.values],before);
  assert.equal(Object.values(rejected.counts.writes).reduce((a,b)=>a+b,0),1);
  const failureLog=failed.errors.find(e=>e[0]==='Astral Sea runtime failure')[1];
  assert.equal(failureLog.committedKeyCount,0);
  assert.equal(failureLog.stage,'kv.progress.put');

  const partial=await runtime(source);
  partial.limitWrites(async key=>{if(key.startsWith('combat:'))throw Error('Injected later-key failure');});
  const partialResult=await partial.run('cast',spellOptions('help'));
  assert(partialResult.content.includes(fallback));
  assert.equal(partial.errors.find(e=>e[0]==='Astral Sea runtime failure')[1].committedKeyCount,1);
  assert(Object.values(partialResult.counts.writes).every(n=>n===1));

  // Reads after staged writes/deletes see the staged state, not eventual KV values.
  const view=await runtime(source);
  await view.c.withCommandPersistence(view.env,view.key,async env=>{
    await env.Backpack.put('test-counter','1');assert.equal(await env.Backpack.get('test-counter'),'1');
    await env.Backpack.put('test-counter','2');assert.equal(await env.Backpack.get('test-counter'),'2');
    await env.Backpack.delete('test-counter');assert.equal(await env.Backpack.get('test-counter'),null);
    await env.Backpack.put('test-counter','3');
  });
  assert.equal(view.values.get('test-counter'),'3');
  assert.equal(view.counts().writes['test-counter'],1);
  await Promise.all(Array.from({length:10},()=>view.c.withCommandPersistence(view.env,view.key,async env=>{
    const n=Number(await env.Backpack.get('test-counter'));
    await Promise.resolve();await env.Backpack.put('test-counter',String(n+1));
  })));
  assert.equal(view.values.get('test-counter'),'13','Command lock includes commit');
  const poisoned=await runtime(source);
  const actualGet=poisoned.env.Backpack.get;
  poisoned.env.Backpack.get=async key=>{if(key==='broken')throw Error('Injected KV read failure');return actualGet(key);};
  const poisonBefore=[...poisoned.values];
  await assert.rejects(poisoned.c.withCommandPersistence(poisoned.env,poisoned.key,async env=>{
    try { await env.Backpack.get('broken'); } catch {}
    await env.Backpack.put('otherwise-valid','never-commit');
  }),/Injected KV read failure/);
  assert.deepEqual([...poisoned.values],poisonBefore,'Caught storage errors still prevent commit');

  const twitch=await runtime(source);
  for(const [key,value] of [...twitch.values])twitch.values.set(key.replace('backpack:discord:123456789','backpack:test'),value);
  twitch.limitWrites(async(_key,n)=>assert(n<=1));
  const twitchCast=await twitch.run('cast','moonbeam',{twitch:true});
  assert(!twitchCast.content.includes(fallback));assert.equal(twitchCast.counts.content,0);
  assert.equal(twitchCast.counts.writes['progress:backpack:test'],1);
  const stress=await runtime(source);
  stress.limitWrites(async (_key,n)=>assert(n<=1));
  const spells=['help','moonbeam','jelly','star','tidal','gun','echo','familiar','elf blessing','mend','bubble','evocation','wake','falling star','berries','all or nothing'];
  let encounters=1;
  for(let i=0;i<1000;i++) {
    if(!(await stress.state())) {
      await stress.editProgress(p=>{p.hp=200;p.mana=250;p.restBufferType='long';});
      await stress.c.startCombatEncounter(stress.env,stress.key,stress.c.getRegionById('moonlit-reef'),1,{...stress.enemy,hp:443},'discord');
      encounters++;
    }
    if(i%17===0)await stress.editProgress(p=>{p.mana=300;});
    if(i%31===0)await stress.editState(s=>{s.enemy.hp=1;});
    const result=await stress.run(i%5===0?'attack':'cast',i%5===0?[]:spellOptions(spells[i%spells.length]));
    assert(!result.content.includes(fallback),`Generated Worker command ${i}`);
    assert.equal(result.counts.content,0);
    assert(Object.values(result.counts.writes).every(n=>n<=1));
    assert.equal(stress.errors.length,0);
  }
  console.log(`Free tier: ${rows.length} cold paths, zero content fetches, at most one write/key; +200 synthetic files remain at zero fetches.`);
  console.log('Persistence: discard, first-write failure, partial flush diagnostics, read-your-writes, serialized commands, and Twitch passed.');
  console.log(`Generated Worker stress: 1000 commands, ${encounters} encounters, zero exceptions, zero content requests, maximum one write/key/command.`);
  return rows;
}
module.exports={runtime,measure,scenarios,spellOptions,fallback,main};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
