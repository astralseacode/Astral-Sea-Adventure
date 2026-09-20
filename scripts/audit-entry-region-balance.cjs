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
const seedsPerConfig=Number(process.env.AUDIT_SEEDS||60);
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
  const originalEnemy=f.c.getEnemyDefinition;
  f.c.getEnemyDefinition=async id=>{
    const enemy=await originalEnemy(id);
    if(id!==config.bossId)return enemy;
    const adjusted=structuredClone(enemy);
    adjusted.hp=Math.max(1,Math.round(enemy.hp*(1-(config.variant.hpPercent||0)/100)));
    adjusted.damageBonus=Math.max(0,enemy.damageBonus-(config.variant.damageBonusReduction||0));
    return adjusted;
  };
  if(config.variant.phaseOff)f.c.bossPhase=()=>null;
  const tanglingReduction=config.variant.tanglingBossOff?5:
    (config.variant.tanglingReduction||0);
  if(tanglingReduction){
    assert.equal(config.region,'whispering-kelp-forest');
    const originalBegin=f.c.beginRegionalEnemyResponse;
    f.c.beginRegionalEnemyResponse=(state,roll)=>{
      const suppress=state.enemy.id===config.bossId&&roll!==1&&
        f.c.getCombatProtection(state)===0;
      const response=originalBegin(state,roll);
      if(suppress)response.bonus-=tanglingReduction;
      return response;
    };
  }
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
  variantId:config.variant.id,
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
  bossResponses:0,bossHpDamageToPlayer:0,deathPhase:null,
  bossResponsePhases:[0,0,0,0],
  stimUses:0,stimBeforeBoss:0,stimDuringBoss:0,stimHpRestored:0,
  berryUses:0,berryBeforeBoss:0,berryDuringBoss:0,berryHpRestored:0,
  berryManaRestored:0,berryEvents:[],evocation:0,faeIntervention:0,
  encounterEntries:[],encounterActions:[],path:[],healingRoomHp:0,
  gentle:0,pressure:0,kelpRecovery:0,tanglingKelp:0,crushingWake:0,deepwaterHunger:0,
  royalGuard:0,kingsTax:0,throneResolve:0,realityShell:0,realityEcho:0,
  manaFracture:0,nexusAdaptation:0,phaseActivations:0,highestBossPhase:0,
  normalDamageToEnemy:0,bossDamageToEnemy:0,enemyHpDamageToPlayer:0,
  cap:null};}
function countReceipts(row,message){
  const mapping={
    gentle:/Gentle Current.{0,8}\+\d+ attack damage/g,
    pressure:/Starfall Pressure.{0,8}Drained \d+ Mana/g,
    kelpRecovery:/Kelp Recovery.{0,8}Restored \d+ enemy HP/g,
    tanglingKelp:/Tangling Kelp.{0,8}No Protection/g,
    crushingWake:/Crushing Wake.{0,8}Incoming/g,
    deepwaterHunger:/Deepwater Hunger.{0,8}Drained \d+ Mana/g,
    royalGuard:/Royal Guard.{0,8}(?:Spell damage reduced|Reserved)/g,
    kingsTax:/King's Tax.{0,8}Additional \d+ Mana paid/g,
    throneResolve:/Throne's Resolve.{0,8}Gained/g,
    realityShell:/Reality Shell: \+\d+ Protection/g,
    realityEcho:/Reality Echo.{0,8}Repeated spell/g,
    manaFracture:/Mana Fracture.{0,8}Drained/g,
    nexusAdaptation:/Nexus Adaptation.{0,8}Increased/g,
    phaseActivations:/Boss Phase Activated:/g};
  for(const [key,re] of Object.entries(mapping))row[key]+=(message.match(re)||[]).length;
}async function prepareAlt(config,initial){
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
    if(currentEncounter?.isBoss){
      row.bossResponses++;
      row.bossHpDamageToPlayer+=Math.max(0,before-state.playerHp);
      row.bossResponsePhases[Math.min(3,state.regionalEnemy?.phase||0)]++;
    }
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
        if(currentEncounter.isBoss)row.deathPhase=combat.regionalEnemy?.phase||0;
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
// Each variation changes the definition returned to this offline VM for one boss ID.
// Normal enemies and every other Adventure remain canonical.
const targets={
  'starfall-trench':{level:5,bossId:'meteor-lure-angler-boss'},
  'whispering-kelp-forest':{level:10,bossId:'chorus-fin-schoolmother-boss'},
  'leviathans-wake':{level:20,bossId:'breaker-fin-alpha-boss'},
  'astral-nexus':{level:40,bossId:'contradiction-leviathan-boss'},
};
function variants(region){
  const out=[{id:'baseline',hpPercent:0,damageBonusReduction:0}];
  for(const amount of [5,10,15,20,25,30,35,40,...(region==='starfall-trench'?[50,60]:[])])
    out.push({id:`hp-${amount}`,hpPercent:amount,damageBonusReduction:0});
  for(const amount of [1,2,3,4,5,6])
    out.push({id:`damage-minus-${amount}`,hpPercent:0,damageBonusReduction:amount});
  for(const [hp,damage] of [[5,1],[10,1],[10,2],[15,2],[20,2],[20,3],[25,3],[30,4]])
    out.push({id:`hp-${hp}-damage-minus-${damage}`,hpPercent:hp,damageBonusReduction:damage});
  out.push({id:'phase-effects-off',hpPercent:0,damageBonusReduction:0,phaseOff:true});
  return out;
}
function sampleMetrics(rows){
  const wins=rows.filter(x=>x.completed),boss=rows.filter(x=>x.reachedBoss);
  const val=(field,list=rows)=>round(mean(list.map(x=>x[field]).filter(x=>x!==null)));
  const phases=[0,1,2,3].map(i=>boss.filter(x=>x.highestBossPhase>=i).length);
  const phaseDeaths=[0,1,2,3].map(i=>boss.filter(x=>x.deathBoss&&x.deathPhase===i).length);
  const bossActions=boss.map(x=>x.encounterActions.at(-1));
  const bossPlayerActions=boss.map(x=>x.totalActions-(x.encounterActions.slice(0,-1).reduce((a,b)=>a+b,0)));
  return {attempts:rows.length,completed:wins.length,completionRate:round(wins.length/rows.length),
    bossReached:boss.length,bossReachRate:round(boss.length/rows.length),
    bossWinGivenReach:round(boss.length?wins.length/boss.length:0),
    normalDeaths:rows.filter(x=>x.outcome==='death'&&!x.deathBoss).length,
    bossDeaths:rows.filter(x=>x.deathBoss).length,caps:rows.filter(x=>x.cap).length,
    meanBossEntryHp:val('bossEntryHp',boss),medianBossEntryHp:median(boss.map(x=>x.bossEntryHp)),
    meanBossEntryMana:val('bossEntryMana',boss),medianBossEntryMana:median(boss.map(x=>x.bossEntryMana)),
    meanBossEntryBerries:val('bossEntryBerriesRemaining',boss),
    meanStimUses:val('stimUses'),meanBerryUses:val('berryUses'),
    meanEncounterActions:round(mean(rows.flatMap(x=>x.encounterActions))),
    meanTotalActions:val('totalActions'),meanBossPlayerActions:round(mean(bossActions)),
    meanBossResponses:val('bossResponses',boss),
    meanPlayerDamagePerBossAction:round(bossPlayerActions.reduce((a,b)=>a+b,0)
      ?boss.reduce((a,x)=>a+x.bossDamageToEnemy,0)/bossPlayerActions.reduce((a,b)=>a+b,0):0),
    meanBossHpDamagePerResponse:round(boss.reduce((a,x)=>a+x.bossHpDamageToPlayer,0)
      /Math.max(1,boss.reduce((a,x)=>a+x.bossResponses,0))),
    phaseReached:phases,deathByCurrentPhase:phaseDeaths,
    phaseActivations:rows.reduce((a,x)=>a+x.phaseActivations,0),
    regional:{pressure:rows.reduce((a,x)=>a+x.pressure,0),
      kelpRecovery:rows.reduce((a,x)=>a+x.kelpRecovery,0),
      tanglingKelp:rows.reduce((a,x)=>a+x.tanglingKelp,0),
      crushingWake:rows.reduce((a,x)=>a+x.crushingWake,0),
      deepwaterHunger:rows.reduce((a,x)=>a+x.deepwaterHunger,0),
      realityShell:rows.reduce((a,x)=>a+x.realityShell,0),
      realityEcho:rows.reduce((a,x)=>a+x.realityEcho,0),
      manaFracture:rows.reduce((a,x)=>a+x.manaFracture,0),
      nexusAdaptation:rows.reduce((a,x)=>a+x.nexusAdaptation,0)},
    meanNormalDamageToEnemy:val('normalDamageToEnemy'),
    meanBossDamageToEnemy:val('bossDamageToEnemy'),
    meanEnemyHpDamageToPlayer:val('enemyHpDamageToPlayer'),
    byPolicy:Object.fromEntries(strategies.map(s=>{const r=rows.filter(x=>x.strategy===s);
      return [s,{attempts:r.length,completed:r.filter(x=>x.completed).length,
        completionRate:round(r.filter(x=>x.completed).length/r.length)}];})),
    byClass:Object.fromEntries([...new Set(rows.map(x=>x.className))].map(s=>{
      const r=rows.filter(x=>x.className===s);
      return [s,{attempts:r.length,completed:r.filter(x=>x.completed).length,
        completionRate:round(r.filter(x=>x.completed).length/r.length)}];})),
  };
}
async function runCell(region,level,adventureNumber,variant,seedCount){
  const base=configurations(region,regions.indexOf(region));
  let configs=base.filter(x=>x.level===level&&x.adventureNumber===adventureNumber);
  if(!configs.length){
    const kind=level===targets[region].level?'entry':'intermediate';
    const entry=base.filter(x=>x.checkpoint==='entry');
    configs=entry.map(x=>({...x,level,checkpoint:kind,stats:statAllocation(level,x.strategy),
      className:x.className,weaponId:x.weaponId}));
  }
  const manifest=read(`data/adventures/${region}/manifest.json`);
  const definition=read(`data/adventures/${region}/${manifest[adventureNumber-1].file}`);
  const all=[];
  for(const raw of configs){
    const config={...raw,variant,bossId:targets[region].bossId};
    const {f,initial}=await baseFixture(config);
    for(let trial=0;trial<seedCount;trial++){
      const row=await simulate(f,initial,config,trial,'current',definition);
      all.push(row);
    }
  }
  return {region,level,adventureNumber,adventureName:definition.name,
    bossId:targets[region].bossId,variant,configurations:configs.length,
    seedCount,metrics:sampleMetrics(all),rows:all};
}
function selectCandidates(cells){
  const eligible=cells.filter(x=>x.variant.id!=='baseline'&&!x.variant.phaseOff);
  const category=x=>x.variant.hpPercent&&x.variant.damageBonusReduction?'combined'
    :x.variant.hpPercent?'hp':'damage';
  const magnitude=x=>(x.variant.hpPercent||0)/5+(x.variant.damageBonusReduction||0)*2;
  const chosen=[];
  for(const kind of ['hp','damage','combined']){
    const family=eligible.filter(x=>category(x)===kind);
    const inBand=family.filter(x=>x.metrics.completionRate>=.3&&x.metrics.completionRate<=.45);
    if(inBand.length){
      inBand.sort((a,b)=>magnitude(a)-magnitude(b));chosen.push(inBand[0]);
    }else{
      family.sort((a,b)=>Math.abs(a.metrics.completionRate-.375)-
        Math.abs(b.metrics.completionRate-.375));
      if(family.length)chosen.push(family[0]);
    }
  }
  return chosen;
}
async function main(){
  if(process.argv[2]==='supplement-kelp-combinations'){
    const output=path.join(root,'entry-region-balance-results.json');
    const result=JSON.parse(fs.readFileSync(output,'utf8'));
    const region='whispering-kelp-forest';
    for(const [hp,tangling] of [[15,5],[20,5],[20,3],[25,3]]){
      const variant={id:`hp-${hp}-boss-tangling-minus-${tangling}`,
        hpPercent:hp,damageBonusReduction:0,tanglingReduction:tangling};
      const sweep=await runCell(region,10,1,variant,result.method.sweepSeeds);
      result.sweep.push({...sweep,rows:undefined});
      for(const [level,adventureNumber] of [[10,1],[15,1],[20,1],[20,15],[20,30]]){
        const cell=await runCell(region,level,adventureNumber,variant,result.method.curveSeeds);
        result.curves.push({...cell,rows:undefined});
        console.log(`${variant.id} L${level} A${adventureNumber}: ${cell.metrics.completed}/${cell.metrics.attempts}`);
      }
      result.selected[region].push(variant.id);
    }
    result.method.kelpCombinedDiagnostic='Boss-only Tangling +5 reduced by 3 or 5 after canonical regional response; normal enemies unchanged.';
    fs.writeFileSync(output,JSON.stringify(result)+'\n');
    return;
  }
  if(process.argv[2]==='supplement-kelp-perk'){
    const output=path.join(root,'entry-region-balance-results.json');
    const result=JSON.parse(fs.readFileSync(output,'utf8'));
    const region='whispering-kelp-forest';
    const variant={id:'boss-tangling-off',hpPercent:0,
      damageBonusReduction:0,tanglingBossOff:true};
    const sweep=await runCell(region,10,1,variant,result.method.sweepSeeds);
    result.sweep.push({...sweep,rows:undefined});
    for(const [level,adventureNumber] of [[10,1],[15,1],[20,1],[20,15],[20,30]]){
      const cell=await runCell(region,level,adventureNumber,variant,result.method.curveSeeds);
      result.curves.push({...cell,rows:undefined});
      console.log(`Kelp no boss Tangling L${level} A${adventureNumber}: ${cell.metrics.completed}/${cell.metrics.attempts}`);
    }
    result.selected[region].push(variant.id);
    result.method.kelpPerkDiagnostic='Offline boss-only response wrapper removes Tangling Kelp +5 bonus when no Protection; normal enemies unchanged. Canonical receipt text still emits and is not used to quantify suppression.';
    fs.writeFileSync(output,JSON.stringify(result)+'\n');
    return;
  }
  if(process.argv[2]==='repair-regional-telemetry'){
    const output=path.join(root,'entry-region-balance-results.json');
    const result=JSON.parse(fs.readFileSync(output,'utf8'));
    for(const region of ['whispering-kelp-forest','astral-nexus']){
      for(const old of result.sweep.filter(x=>x.region===region)){
        const cell=await runCell(region,old.level,old.adventureNumber,
          old.variant,result.method.sweepSeeds);
        assert.equal(cell.metrics.completed,old.metrics.completed);
        assert.equal(cell.metrics.bossReached,old.metrics.bossReached);
        old.metrics=cell.metrics;
      }
      for(const old of result.curves.filter(x=>x.region===region)){
        const cell=await runCell(region,old.level,old.adventureNumber,
          old.variant,result.method.curveSeeds);
        assert.equal(cell.metrics.completed,old.metrics.completed);
        assert.equal(cell.metrics.bossReached,old.metrics.bossReached);
        old.metrics=cell.metrics;
      }
      result.method.regionalTelemetry='Counts actual Starfall drains, Kelp healing/no-Protection hits, Wake crush/hunger, and Nexus shell/fracture/adaptation/Echo receipts across full Adventures.';
      fs.writeFileSync(output,JSON.stringify(result)+'\n');
      console.log(`${region}: repaired regional counters with identical outcomes`);
    }
    return;
  }
  if(process.argv[2]==='supplement-nexus'){
    const output=path.join(root,'entry-region-balance-results.json');
    const result=JSON.parse(fs.readFileSync(output,'utf8'));
    const region='astral-nexus',seedCount=result.method.curveSeeds;
    for(const variant of [
      {id:'hp-15',hpPercent:15,damageBonusReduction:0},
      {id:'hp-10-damage-minus-1',hpPercent:10,damageBonusReduction:1}]){
      assert(!result.selected[region].includes(variant.id));
      for(const [level,adventureNumber] of [[40,1],[45,1],[50,1],[50,15],[50,30]]){
        const cell=await runCell(region,level,adventureNumber,variant,seedCount);
        result.curves.push({...cell,rows:undefined});
        console.log(`${variant.id} L${level} A${adventureNumber}: ${cell.metrics.completed}/${cell.metrics.attempts}`);
      }
      result.selected[region].push(variant.id);
    }
    result.method.supplement='Validated next-smallest Nexus HP-only and combined variants after boundary misses in main curve sample.';
    fs.writeFileSync(output,JSON.stringify(result)+'\n');
    return;
  }
  const selected=process.argv[2]?[process.argv[2]]:Object.keys(targets);
  for(const region of selected)assert(targets[region],`Unknown target ${region}`);
  const sweepSeeds=Number(process.env.AUDIT_SWEEP_SEEDS||seedsPerConfig);
  const curveSeeds=Number(process.env.AUDIT_CURVE_SEEDS||seedsPerConfig);
  const result={method:{workerHash,artifactHash,sweepSeeds,curveSeeds,
    currentStimUsesPerBattle:1,berryCap:4,entryTarget:[.3,.45],
    injection:'Offline VM getEnemyDefinition override only for each Adventure 1 boss; normal enemies canonical. Phase-off diagnosis overrides bossPhase in VM only.',
    pairedSeeds:'Original full-adventure seedFor and directionFor, independent path seed stream'},
    sweep:[],curves:[],selected:{}};
  for(const region of selected){
    const t=targets[region],cells=[];
    for(const variant of variants(region)){
      const cell=await runCell(region,t.level,1,variant,sweepSeeds);
      result.sweep.push({...cell,rows:undefined});cells.push(cell);
      console.log(`${region} ${variant.id}: ${(100*cell.metrics.completionRate).toFixed(1)}% (${cell.metrics.completed}/${cell.metrics.attempts})`);
    }
    const chosen=selectCandidates(cells);
    result.selected[region]=chosen.map(x=>x.variant.id);
    const later=region==='starfall-trench'?[6,7,8,9,10]
      :region==='whispering-kelp-forest'?[15,20]
        :region==='leviathans-wake'?[25,30]:[45,50];
    for(const variant of [{id:'baseline',hpPercent:0,damageBonusReduction:0},...chosen.map(x=>x.variant)]){
      for(const level of [t.level,...later]){
        const cell=await runCell(region,level,1,variant,curveSeeds);
        result.curves.push({...cell,rows:undefined});
      }
    }
    // The boss-only override cannot affect Adventures 15/30. Retest one sample
    // for each with the override present to verify this assumption directly.
    const mature=levels[regions.indexOf(region)][1];
    const sample=configurations(region,regions.indexOf(region))
      .filter(x=>x.checkpoint==='mature').map(x=>x.adventureNumber);
    for(const adventureNumber of [...new Set(sample)].filter(x=>x!==1)){
      const baseline=await runCell(region,mature,adventureNumber,
        {id:'baseline',hpPercent:0,damageBonusReduction:0},curveSeeds);
      result.curves.push({...baseline,rows:undefined});
      for(const candidate of chosen){
        const altered=await runCell(region,mature,adventureNumber,candidate.variant,curveSeeds);
        assert.deepEqual(altered.rows.map(x=>[x.completed,x.seed,x.path]),
          baseline.rows.map(x=>[x.completed,x.seed,x.path]));
        result.curves.push({...altered,rows:undefined});
      }
    }
    console.log(`${region}: selected ${result.selected[region].join(', ')||'none'}`);
  }
  const output=path.join(root,'entry-region-balance-results.json');
  fs.writeFileSync(output,JSON.stringify(result)+'\n');
  console.log(`Wrote ${output}: ${result.sweep.length} sweep cells, ${result.curves.length} curve cells`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
