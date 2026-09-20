// Seeded full-Adventure audit. Canonical Worker paths, in-memory KV, no network.
// Usage: node scripts/audit-full-adventures.cjs [region-id]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {fixture}=require('./test-leviathans-wake.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const artifact=fs.readFileSync(path.join(root,'dist/worker.js'),'utf8');
const originalStim='const STIM_USES_PER_BATTLE = 1;';
assert.equal(artifact.split(originalStim).length,2);
const secondStimArtifact=artifact.replace(originalStim,'const STIM_USES_PER_BATTLE = 2;');
const workerHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'worker.js'))).digest('hex');
const artifactHash=crypto.createHash('sha256').update(artifact).digest('hex');
const regions=['moonlit-reef','starfall-trench','whispering-kelp-forest',
  'leviathans-wake','sunken-kings-throne','astral-nexus'];
const levels=[[1,5],[5,10],[10,20],[20,30],[30,40],[40,50]];
const weapons=['sword-and-shield','daggers','axe','spear','hammer','bow'];
const classes=['Knight','Rogue','Berserker','Lancer','Vanguard','Ranger'];
const strategies=['weapon','spell','mixed','supported'];
const seedsPerConfig=Number(process.env.AUDIT_SEEDS||100);
const combatCap=80,totalCap=160;
assert(Number.isSafeInteger(seedsPerConfig)&&seedsPerConfig>0);
const spells=Object.fromEntries(fs.readdirSync(path.join(root,'data/spells'))
  .filter(x=>x.endsWith('.json')).map(x=>{const s=read(`data/spells/${x}`);return [s.id,s];}));
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return (b[(b.length-1)>>1]+b[b.length>>1])/2;};
const round=n=>n===null?null:+n.toFixed(3);
function hash32(text){return crypto.createHash('sha256').update(text).digest().readUInt32LE(0);}
function randomFrom(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function statAllocation(level,strategy){
  const order={weapon:['strength','vitality','armor','strength','focus','fae','luck'],
    spell:['focus','fae','vitality','armor','strength','focus','luck'],
    mixed:['vitality','strength','focus','armor','fae','luck'],
    supported:['vitality','armor','focus','fae','strength','luck']}[strategy];
  const caps={vitality:10,focus:10,strength:10,luck:10,armor:10,fae:5};
  const stats={vitality:0,focus:0,strength:0,luck:0,armor:0,fae:0};
  for(let spent=0;spent<level-1;){let changed=false;
    for(const stat of order)if(spent<level-1&&stats[stat]<caps[stat]){
      stats[stat]++;spent++;changed=true;}
    if(!changed)throw Error('Stat budget exhausted');
  }
  return stats;
}
function availableSpells(level){return ['star-spark','jelly','moonbeam','falling-star','tidal-wave','conjure-gun']
  .filter(id=>spells[id].requiredLevel<=level);}
function desiredSpell(level,turn){const list=availableSpells(level);return list.length?list[turn%list.length]:null;}
function berryReason(config,state,progress,turn,stage,berriesEaten,stimAvailable){
  const maxHp=100+config.stats.vitality*10,maxMana=100+config.stats.focus*10;
  const hpMissing=maxHp-state.playerHp,manaMissing=maxMana-progress.mana;
  const spell=config.strategy==='weapon'||(config.strategy==='mixed'&&turn%2===0)
    ?null:desiredSpell(levelFromProgress(config,progress),turn);
  const cost=spell?spells[spell].manaCost+5:0;
  const hp=state.playerHp<=maxHp*.5&&hpMissing>=15;
  const mana=Boolean(spell)&&manaMissing>=15&&progress.mana<cost&&progress.mana+25>=cost;
  const both=state.playerHp<=maxHp*.65&&progress.mana<=maxMana*.65&&
    hpMissing>=20&&manaMissing>=20;
  if(stage==='normal'&&berriesEaten>=2&&
    !(state.playerHp<=maxHp*.3&&!stimAvailable))return null;
  return both?'both':mana?'mana':hp?'hp':null;
}
function levelFromProgress(config,progress){return Math.max(config.level,progress.xpLevel||config.level);}
function eligibleAdventures(region,level,checkpoint){
  if(checkpoint==='entry'||checkpoint==='intermediate')return [1];
  const index=read(`data/enemies/${region}/index.json`);
  const eligible=index.filter(entry=>{
    const rec=entry.recommendedLevel;
    return !Number.isSafeInteger(rec)||rec<=level;
  }).map(entry=>entry.encounter);
  const sorted=[...new Set(eligible)].sort((a,b)=>a-b);
  assert(sorted.length>=1);
  return [...new Set([sorted[0],sorted[Math.floor((sorted.length-1)/2)],sorted.at(-1)])];
}
function configurations(region,regionIndex){
  const checkpoints=[{level:levels[regionIndex][0],kind:'entry'},
    {level:levels[regionIndex][1],kind:'mature'}];
  if(region==='starfall-trench')for(const level of [6,7,8,9])
    checkpoints.push({level,kind:'intermediate'});
  const configs=[];
  for(const {level,kind} of checkpoints){
    const adventureNumbers=eligibleAdventures(region,level,kind);
    if(kind==='mature')for(let a=0;a<adventureNumbers.length;a++)
      for(let p=0;p<strategies.length;p++){
        const strategy=strategies[p],ci=(a*4+p+regionIndex)%6;
        configs.push({region,level,checkpoint:kind,adventureNumber:adventureNumbers[a],
          strategy,className:level>=10?classes[ci]:'Classless',
          weaponId:level>=10?weapons[ci]:null,stats:statAllocation(level,strategy)});
      }
    else if(level>=10)for(let c=0;c<6;c++){
      const strategy=strategies[(c+regionIndex)%4];
      configs.push({region,level,checkpoint:kind,adventureNumber:1,strategy,
        className:classes[c],weaponId:weapons[c],stats:statAllocation(level,strategy)});
    } else for(const strategy of strategies)
      configs.push({region,level,checkpoint:kind,adventureNumber:1,strategy,
        className:'Classless',weaponId:null,stats:statAllocation(level,strategy)});
  }
  return configs;
}
function seedFor(config,trial){return hash32([config.region,config.level,config.adventureNumber,
  config.strategy,config.className,trial].join('|'));}
function directionFor(config,seed,roomIndex,keys){
  return keys[hash32(`${seed}|path|${roomIndex}`)%keys.length];
}
async function baseFixture(config){
  const f=await fixture(config.level,'discord',artifact);
  await f.c.deleteCombatState(f.env,f.key);
  await f.editProgress(p=>{
    p.stats={...config.stats};p.unspentStatPoints=0;p.statPointsGrantedThroughLevel=config.level;
    p.hp=100+config.stats.vitality*10;p.mana=100+config.stats.focus*10;
    p.berries=4;p.currentRegion=config.region;
    p.ownedWeapons=config.weaponId?[config.weaponId]:[];
    p.equippedWeapon=config.weaponId;p.activeClass=config.weaponId;
    p.classSystemUnlocked=Boolean(config.weaponId);
    p.combatProgress={...p.combatProgress,[config.region]:{highestUnlocked:config.adventureNumber}};
  });
  const start=await f.c.performAdventureUnlocked(f.env,f.key,String(config.adventureNumber),'discord');
  assert(!/locked|not available|already have/.test(start.message),start.message);
  const a=await f.c.getActiveAdventure(f.env,f.key);
  assert.equal(a.adventureNumber,config.adventureNumber);
  return {f,initial:[...f.values]};
}
function rowFor(config,seed,ruleset,adventureName){return{
  region:config.region,level:config.level,checkpoint:config.checkpoint,
  adventureNumber:config.adventureNumber,adventureName,className:config.className,
  weaponId:config.weaponId,strategy:config.strategy,seed,ruleset,outcome:null,
  startHp:100+config.stats.vitality*10,startMana:100+config.stats.focus*10,
  completed:0,reachedBoss:0,bossWonGivenReach:0,bossId:null,bossName:null,
  bossEntryHp:null,bossEntryMana:null,bossEntryBerriesRemaining:null,
  bossEntryStimAvailable:null,bossEntryStimUsedBefore:0,bossEntryBerryUsedBefore:0,
  finalHp:null,finalMana:null,deathEncounter:null,deathEnemyId:null,
  deathEnemyName:null,deathBoss:0,bossHpAtDeath:null,
  normalEncounters:0,totalEncounters:0,totalActions:0,enemyResponses:0,
  stimUses:0,stimBeforeBoss:0,stimDuringBoss:0,stimHpRestored:0,
  berryUses:0,berryBeforeBoss:0,berryDuringBoss:0,berryHpRestored:0,
  berryManaRestored:0,berryEvents:[],evocation:0,faeIntervention:0,
  encounterEntries:[],encounterActions:[],path:[],healingRoomHp:0,
  gentle:0,pressure:0,kelpRecovery:0,crushingWake:0,deepwaterHunger:0,
  royalGuard:0,kingsTax:0,throneResolve:0,realityShell:0,realityEcho:0,
  manaFracture:0,nexusAdaptation:0,phaseActivations:0,highestBossPhase:0,
  normalDamageToEnemy:0,bossDamageToEnemy:0,enemyHpDamageToPlayer:0,
  cap:null};}
function countReceipts(row,message){
  const mapping={gentle:/Gentle Current — \+\d+ attack damage/g,
    pressure:/Starfall Pressure — Next damaging attack drains/g,
    kelpRecovery:/Kelp Recovery — Restored/g,
    crushingWake:/Crushing Wake — Incoming/g,
    deepwaterHunger:/Deepwater Hunger — Next damaging attack drains/g,
    royalGuard:/Royal Guard — Spell damage reduced|Royal Guard — Reserved/g,
    kingsTax:/King's Tax — Additional \d+ Mana paid/g,
    throneResolve:/Throne's Resolve — Gained/g,
    realityShell:/Reality Shell: \+\d+ Protection/g,
    realityEcho:/Reality Echo — Repeated spell/g,
    manaFracture:/Mana Fracture — Drained/g,
    nexusAdaptation:/Nexus Adaptation — Increased/g,
    phaseActivations:/Boss Phase Activated:/g};
  for(const [key,re] of Object.entries(mapping))row[key]+=(message.match(re)||[]).length;
}
async function prepareAlt(config,initial){
  const f=await fixture(config.level,'discord',config.level>=5?secondStimArtifact:artifact);
  f.values.clear();for(const [k,v] of initial)f.values.set(k,v);
  assert.equal((await f.c.getActiveAdventure(f.env,f.key)).adventureNumber,config.adventureNumber);
  return f;
}
async function simulate(f,initial,config,trial,ruleset,definition){
  f.values.clear();for(const [k,v] of initial)f.values.set(k,v);
  f.rolls.length=0;f.writes.length=0;
  const seed=seedFor(config,trial),random=randomFrom(seed);
  f.math.random=random;
  f.c.randomInteger=(min,max)=>min+Math.floor(random()*(max-min+1));
  f.c.randomChoice=values=>values[f.c.randomInteger(0,values.length-1)];
  const stimLimit=ruleset==='second'&&config.level>=5?2:1;
  const row=rowFor(config,seed,ruleset,definition.name);
  let roomIndex=0,encounterIndex=0,turn=0,blessingUsed=false,
    familiarUsed=false,bubbleUsed=false,mendUsed=false,offenseSinceStim=true;
  let currentEncounter=null;
  const originalResponse=f.c.resolveEnemyCombatResponse;
  const originalDamage=f.c.damageCombatEnemy;
  f.c.resolveEnemyCombatResponse=async (...args)=>{
    const state=args[2],before=state.playerHp;
    row.enemyResponses++;
    const result=await originalResponse(...args);
    row.enemyHpDamageToPlayer+=Math.max(0,before-state.playerHp);
    return result;
  };
  f.c.damageCombatEnemy=(state,amount,pierce)=>{
    const dealt=originalDamage(state,amount,pierce);
    if(currentEncounter?.isBoss)row.bossDamageToEnemy+=dealt;
    else row.normalDamageToEnemy+=dealt;
    return dealt;
  };
  async function eat(stage,state,progress){
    if((await f.c.getActiveAdventure(f.env,f.key)).berriesEaten>=4)return false;
    const reason=berryReason(config,state,progress,turn,stage,row.berryUses,
      Boolean(state.stimUses!==undefined&&state.stimUses<stimLimit));
    if(!reason)return false;
    const beforeHp=state.playerHp,beforeMana=progress.mana,beforeRound=state.round;
    const berry=await f.c.performEat(f.env,f.key,'Audit','berry','discord');
    assert(Number.isSafeInteger(berry.healedAmount),'Rejected policy Berry');
    const afterState=await f.state();const afterAdventure=await f.c.getActiveAdventure(f.env,f.key);
    const afterProgress=await f.progress();
    assert.equal(afterAdventure.berriesEaten,row.berryUses+1);
    assert.equal(afterProgress.mana-beforeMana,berry.restoredMana);
    assert.equal((afterState?.playerHp??afterAdventure.playerHp)-beforeHp,berry.healedAmount);
    if(beforeRound!==undefined)assert.equal(afterState.round,beforeRound);
    row.berryUses++;row.berryHpRestored+=berry.healedAmount;
    row.berryManaRestored+=berry.restoredMana;
    if(stage==='boss')row.berryDuringBoss++;
    else row.berryBeforeBoss++;
    row.berryEvents.push({stage,encounter:encounterIndex,enemyId:currentEncounter?.enemyId||null,
      hpBefore:beforeHp,hpAfter:beforeHp+berry.healedAmount,
      manaBefore:beforeMana,manaAfter:beforeMana+berry.restoredMana,
      usesRemaining:4-row.berryUses,reason});
    return true;
  }
  for(let safety=0;safety<400;safety++){
    const adventure=await f.c.getActiveAdventure(f.env,f.key);
    const combat=await f.state();
    if(!adventure){row.outcome='complete';row.completed=1;const p=await f.progress();
      row.finalHp=p.hp;row.finalMana=p.mana;break;}
    if(row.totalActions>=totalCap){row.outcome='cap';row.cap='adventure';break;}
    if(combat){
      if(!currentEncounter){
        encounterIndex++;row.totalEncounters++;
        const isBoss=combat.adventureContext?.isBoss===true;
        if(isBoss){row.reachedBoss=1;row.bossId=combat.enemy.id;row.bossName=combat.enemy.name;
          row.bossEntryHp=combat.playerHp;row.bossEntryMana=(await f.progress()).mana;
          row.bossEntryBerriesRemaining=4-adventure.berriesEaten;
          row.bossEntryBerryUsedBefore=adventure.berriesEaten;
          row.bossEntryStimUsedBefore=row.stimBeforeBoss;
          row.bossEntryStimAvailable=stimLimit;}
        else row.normalEncounters++;
        currentEncounter={index:encounterIndex,enemyId:combat.enemy.id,
          enemyName:combat.enemy.name,isBoss,actions:0,startHp:combat.playerHp,
          startMana:(await f.progress()).mana,berryUsesAtStart:adventure.berriesEaten,
          stimAvailable:stimLimit};
        row.encounterEntries.push({...currentEncounter});
        turn=0;blessingUsed=false;familiarUsed=false;bubbleUsed=false;
        mendUsed=false;offenseSinceStim=true;
      }
      if(currentEncounter.actions>=combatCap){row.outcome='cap';row.cap='combat';break;}
      const progress=await f.progress();
      const activeLevel=f.c.levelFromXp(progress.xp);
      progress.xpLevel=activeLevel;
      const maxHp=100+config.stats.vitality*10;
      const critical=combat.playerHp<=Math.max(40,Math.floor(maxHp*.35));
      let result;
      if(critical&&combat.stimUses<stimLimit&&offenseSinceStim){
        const healed=maxHp-combat.playerHp;
        result=await f.c.performStimUnlocked(f.env,f.key,'discord','');
        assert(!/already used your Stim|full HP/.test(result.message));
        row.stimUses++;row.stimHpRestored+=healed;
        if(currentEncounter.isBoss)row.stimDuringBoss++;else row.stimBeforeBoss++;
        offenseSinceStim=false;
      }else{
        await eat(currentEncounter.isBoss?'boss':'normal',combat,progress);
        const state=await f.state(),p=await f.progress();
        if(config.strategy==='supported'&&!blessingUsed&&p.mana>=30){
          blessingUsed=true;result=await f.cast('elf_blessing');
        }else if(config.strategy==='supported'&&activeLevel>=30&&!familiarUsed&&p.mana>=30){
          familiarUsed=true;result=await f.cast('familiar');
        }else if(config.strategy==='supported'&&activeLevel>=8&&!bubbleUsed&&p.mana>=35){
          bubbleUsed=true;result=await f.cast('bubble');
        }else if(config.strategy==='supported'&&activeLevel>=4&&!mendUsed&&
          state.playerHp<maxHp*.6&&p.mana>=25){
          mendUsed=true;result=await f.cast('mend');
        }else if(activeLevel>=5&&config.strategy!=='weapon'&&p.mana<25&&
          p.evocationCooldownTurns===0){
          row.evocation++;result=await f.cast('evocation');
        }else{
          const spell=desiredSpell(activeLevel,turn);
          let desired='attack';
          if(config.strategy==='spell'||config.strategy==='supported')desired=spell||'attack';
          if(config.strategy==='mixed')desired=turn%2===0?'attack':spell||'attack';
          turn++;
          if(desired!=='attack'&&p.mana<spells[desired].manaCost+5)desired='attack';
          result=desired==='attack'?await f.attack():await f.cast(desired);
          offenseSinceStim=true;
        }
      }
      row.totalActions++;currentEncounter.actions++;
      countReceipts(row,result?.message||'');
      const next=await f.state();
      if(currentEncounter.isBoss&&next)
        row.highestBossPhase=Math.max(row.highestBossPhase,next.regionalEnemy?.phase||0);
      if(result?.won){
        row.encounterActions.push(currentEncounter.actions);
        if(currentEncounter.isBoss)row.bossWonGivenReach=1;
        currentEncounter=null;
      }else if(!next){
        row.outcome='death';row.deathEncounter=encounterIndex;
        row.deathEnemyId=currentEncounter.enemyId;
        row.deathEnemyName=currentEncounter.enemyName;
        row.deathBoss=+currentEncounter.isBoss;
        row.bossHpAtDeath=combat.enemy.hp;
        row.encounterActions.push(currentEncounter.actions);
        row.finalHp=0;row.finalMana=(await f.progress()).mana;break;
      }
      continue;
    }
    if(adventure.status==='awaiting-boss-confirmation'){
      const progress=await f.progress();
      const state={playerHp:adventure.playerHp};
      progress.xpLevel=f.c.levelFromXp(progress.xp);
      await eat('antechamber',state,progress);
      const before=await f.c.getActiveAdventure(f.env,f.key);
      const beforeMana=(await f.progress()).mana;
      const started=await f.c.confirmPendingCombatUnlocked(f.env,f.key,'discord');
      assert(!/already fighting|not found/i.test(started.message));
      const boss=await f.state();assert(boss?.adventureContext?.isBoss);
      assert.equal(boss.playerHp,before.playerHp);
      assert.equal((await f.progress()).mana,beforeMana);
      continue;
    }
    assert.equal(adventure.status,'awaiting-direction');
    const room=definition.rooms[adventure.currentRoomId];
    const keys=Object.keys(room.choices||{});assert.equal(keys.length,3);
    const direction=directionFor(config,seed,roomIndex++,keys);
    // Real player commands are more than two seconds apart; avoid duplicate-click guard.
    if(adventure.lastDirection===direction){
      adventure.lastDirectionAt=Date.now()-3000;
      await f.c.saveActiveAdventure(f.env,f.key,adventure);
    }
    const choice=room.choices[direction];
    const beforeHp=adventure.playerHp;
    const moved=await f.c.performAdventureDirectionUnlocked(f.env,f.key,direction,'discord');
    assert(!/path is unavailable|already being resolved/.test(moved.message),moved.message);
    row.path.push({roomId:adventure.currentRoomId,direction,type:choice.type,
      enemyId:choice.enemyId||null});
    if(choice.type==='healing')row.healingRoomHp+=
      Math.max(0,(await f.c.getActiveAdventure(f.env,f.key)).playerHp-beforeHp);
  }
  if(!row.outcome){row.outcome='cap';row.cap='safety';}
  assert(row.berryUses<=4);
  f.c.resolveEnemyCombatResponse=originalResponse;
  f.c.damageCombatEnemy=originalDamage;
  return row;
}
function aggregate(rows,keys){
  const groups=new Map();for(const row of rows){const key=JSON.stringify(keys.map(k=>row[k]));
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
  return [...groups].map(([key,items])=>{
    const values=JSON.parse(key),out=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
    const boss=items.filter(x=>x.reachedBoss),completed=items.filter(x=>x.completed);
    out.started=items.length;out.completed=completed.length;
    out.completionRate=round(completed.length/items.length);
    out.bossReached=boss.length;out.bossReachRate=round(boss.length/items.length);
    out.bossWinGivenReach=round(boss.length?completed.length/boss.length:0);
    out.normalDeaths=items.filter(x=>x.outcome==='death'&&!x.deathBoss).length;
    out.bossDeaths=items.filter(x=>x.deathBoss).length;
    out.caps=items.filter(x=>x.outcome==='cap').length;
    for(const [name,field,subset] of [
      ['bossEntryHp','bossEntryHp',boss],['bossEntryMana','bossEntryMana',boss],
      ['bossEntryBerriesRemaining','bossEntryBerriesRemaining',boss],
      ['bossEntryStimAvailable','bossEntryStimAvailable',boss],
      ['totalActions','totalActions',items],['encounterActions','encounterActions',items]]){
      const values=subset.flatMap(x=>Array.isArray(x[field])?x[field]:[x[field]]);
      out[`mean${name[0].toUpperCase()+name.slice(1)}`]=round(mean(values));
      out[`median${name[0].toUpperCase()+name.slice(1)}`]=median(values);
    }
    const numeric=['stimUses','stimBeforeBoss','stimDuringBoss','stimHpRestored',
      'berryUses','berryBeforeBoss','berryDuringBoss','berryHpRestored','berryManaRestored',
      'evocation','faeIntervention','enemyResponses','normalEncounters','totalEncounters',
      'gentle','pressure','kelpRecovery','crushingWake','deepwaterHunger',
      'royalGuard','kingsTax','throneResolve','realityShell','realityEcho',
      'manaFracture','nexusAdaptation','phaseActivations','normalDamageToEnemy',
      'bossDamageToEnemy','enemyHpDamageToPlayer','healingRoomHp'];
    for(const field of numeric){out[field]=items.reduce((a,x)=>a+x[field],0);
      out[`mean${field[0].toUpperCase()+field.slice(1)}`]=round(out[field]/items.length);}
    out.longestActions=Math.max(...items.map(x=>x.totalActions));
    out.highestBossPhase=[0,1,2,3].map(p=>items.filter(x=>x.highestBossPhase===p).length);
    return out;
  });
}
async function main(){
  const selected=process.argv[2]?[process.argv[2]]:regions;
  for(const r of selected)assert(regions.includes(r),`Unknown region ${r}`);
  const rows=[],descriptions=[];
  for(const region of selected){
    const configs=configurations(region,regions.indexOf(region))
      .slice(0,Number(process.env.AUDIT_CONFIG_LIMIT||1000));
    for(let ci=0;ci<configs.length;ci++){
      const config=configs[ci],definition=read(`data/adventures/${region}/`+
        read(`data/adventures/${region}/manifest.json`)[config.adventureNumber-1].file);
      const current=await baseFixture(config);
      const alt=await prepareAlt(config,current.initial);
      for(let trial=0;trial<seedsPerConfig;trial++){
        const a=await simulate(current.f,current.initial,config,trial,'current',definition);
        const b=await simulate(alt,current.initial,config,trial,'second',definition);
        assert.equal(a.seed,b.seed);
        assert.deepEqual(a.path.slice(0,Math.min(a.path.length,b.path.length)),
          b.path.slice(0,Math.min(a.path.length,b.path.length)));
        rows.push(a,b);
      }
      descriptions.push({region,level:config.level,checkpoint:config.checkpoint,
        adventureNumber:config.adventureNumber,adventureName:definition.name,
        normalEnemyId:definition.enemyId,bossId:definition.boss.enemyId,
        className:config.className,weaponId:config.weaponId,strategy:config.strategy,
        stats:config.stats});
      if((ci+1)%4===0)console.log(`${region}: ${ci+1}/${configs.length} configurations`);
    }
  }
  const result={method:{workerHash,artifactHash,seedsPerConfig,combatCap,totalCap,
    currentStimLimit:1,secondStimFromLevel:5,secondStimLimit:2,
    variant:'Audit-only replacement of STIM_USES_PER_BATTLE constant in VM source, including state validator; no production file edit',
    path:'Seeded direction choice among visible direction keys, independent of combat RNG; real direction/confirmation handlers',
    berries:'Four starting inventory Berries; real Adventure-wide 4-use cap; canonical performEat',
    policies:strategies,regions:selected},configurations:descriptions.length,
    adventures:rows.length,configurationsDetail:descriptions,
    byRegionLevel:aggregate(rows,['region','level','checkpoint','ruleset']),
    byAdventure:aggregate(rows,['region','level','adventureNumber','ruleset']),
    byStrategy:aggregate(rows,['region','level','strategy','ruleset']),
    caps:rows.filter(x=>x.outcome==='cap'),rows};
  const suffix=selected.length===1?`-${selected[0]}`:'';
  const output=path.join(root,`full-adventure-balance-results${suffix}.json`);
  fs.writeFileSync(output,JSON.stringify(result)+'\n');
  console.log(`Wrote ${output}: ${rows.length} Adventures, ${result.caps.length} caps`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
