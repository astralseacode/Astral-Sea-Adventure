// Paired boss phase A/B audit with four real /eat berry uses per Adventure.
// Usage: node scripts/audit-boss-phases-ab-berries.cjs [region-id]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const regions = ['moonlit-reef','starfall-trench','whispering-kelp-forest',
  'leviathans-wake','sunken-kings-throne','astral-nexus'];
const levelPairs = [[1,5],[5,10],[10,20],[20,30],[30,40],[40,50]];
const weapons = ['sword-and-shield','daggers','axe','spear','hammer','bow'];
const classNames = ['Knight','Rogue','Berserker','Lancer','Vanguard','Ranger'];
const strategies = ['weapon','spell','mixed','supported'];
const seedsPerConfig = Number(process.env.AUDIT_SEEDS || 100);
const actionCap = 80;
assert(Number.isSafeInteger(seedsPerConfig) && seedsPerConfig > 0);
const spellData = Object.fromEntries(fs.readdirSync(path.join(root,'data/spells'))
  .filter(x=>x.endsWith('.json')).map(x=>{const s=read(`data/spells/${x}`);return [s.id,s];}));
const roster = read('balance-audit-enemies.json').enemies;
const zeroBerryResults = read('boss-phase-ab-results.json');
const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'worker.js'))).digest('hex');
const artifact = fs.readFileSync(path.join(root,'dist/worker.js'),'utf8');
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
const median = a => {if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);return (b[(b.length-1)>>1]+b[b.length>>1])/2;};
const round = x => x===null?null:+x.toFixed(3);
const numericKeys = ['actions','responses','stim','evocation','faeIntervention','manaDrained',
  'berryUses','berryHpRestored','berryManaRestored','berryHpWasted','berryManaWasted',
  'berryHpTrigger','berryManaTrigger','berryBothTrigger','allFourUsed','winsAfterFour','deathsAfterFour',
  'pressureTriggers','zeroManaActions','lowManaActions','lowManaFallbacks','bossHealing',
  'deathAtZeroMana','deathWith50Mana','enemyHpDamage','wakeDeaths','wakeHpBefore','wakeHpAfter','wakeSupported',
  'gentleTriggers','gentleNominalBonus','crushingTriggers','crushingNominalBonus',
  'royalGuardTriggers','royalGuardPrevented','kingsTaxTriggers','kingsTaxPaid',
  'resolveTriggers','resolveProtection','shellFormations','shellProtection',
  'shellBlocked','protectionConsumed','protectionPierced','realityEchoTriggers',
  'nexusAdaptation5','nexusAdaptation10','capped'];

function statAllocation(level, strategy) {
  const budget=level-1;
  const orders={
    weapon:['strength','vitality','armor','strength','focus','fae','luck'],
    spell:['focus','fae','vitality','armor','strength','focus','luck'],
    mixed:['vitality','strength','focus','armor','fae','luck'],
    supported:['vitality','armor','focus','fae','strength','luck'],
  };
  const caps={vitality:10,focus:10,strength:10,luck:10,armor:10,fae:5};
  const stats={vitality:0,focus:0,strength:0,luck:0,armor:0,fae:0};
  for(let spent=0;spent<budget;) {
    let changed=false;
    for(const stat of orders[strategy]) if(spent<budget && stats[stat]<caps[stat]) {
      stats[stat]++;spent++;changed=true;
    }
    if(!changed) throw Error('Stat budget could not be allocated');
  }
  assert.equal(Object.values(stats).reduce((a,b)=>a+b,0),budget);
  return stats;
}
function bossesFor(region) {
  const all=roster.filter(x=>x.region===region&&x.classification==='boss')
    .sort((a,b)=>a.hp-b.hp||a.damageBonus-b.damageBonus||a.id.localeCompare(b.id));
  assert(all.length>=3);
  return [0.2,0.5,0.8].map((quantile,index)=>({
    ...all[Math.floor((all.length-1)*quantile)],selection:['lower-HP','median-HP','higher-HP'][index],
  }));
}
function configurations(region,index) {
  const bosses=bossesFor(region),levels=levelPairs[index];
  const out=[];
  for(let levelIndex=0;levelIndex<2;levelIndex++) {
    const level=levels[levelIndex];
    if(level<=5) for(let c=0;c<6;c++) {
      const strategy=strategies[(c+index+levelIndex)%4];
      out.push({region,level,levelBand:levelIndex?'mature':'entry',boss:bosses[c%3],
        className:'Classless',weaponId:null,strategy,stats:statAllocation(level,strategy)});
    }
    else for(let c=0;c<6;c++) {
      const strategy=strategies[(c+index+levelIndex)%4];
      out.push({region,level,levelBand:levelIndex?'mature':'entry',boss:bosses[c%3],
        className:classNames[c],weaponId:weapons[c],strategy,stats:statAllocation(level,strategy)});
    }
  }
  return out;
}
function seedFor(config,trial) {
  const key=`${config.region}|${config.level}|${config.boss.id}|${config.className}|${config.strategy}|${trial}`;
  return crypto.createHash('sha256').update(key).digest().readUInt32LE(0);
}
function rng(seed) {
  let state=seed>>>0;
  return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}
function offensiveSpells(level) {
  return ['star-spark','jelly','moonbeam','falling-star','tidal-wave','conjure-gun']
    .filter(id=>spellData[id].requiredLevel<=level);
}
function chooseSpell(level,turn) {
  const list=offensiveSpells(level);
  return list.length?list[turn%list.length]:null;
}
function berryReason(config,state,progress,turn) {
  const maxHp=100+config.stats.vitality*10;
  const maxMana=100+config.stats.focus*10;
  const hpMissing=maxHp-state.playerHp,manaMissing=maxMana-progress.mana;
  const intended=config.strategy==='weapon'||(config.strategy==='mixed'&&turn%2===0)
    ? null:chooseSpell(config.level,turn);
  const cost=intended?spellData[intended].manaCost+5:0;
  const hp=state.playerHp<=maxHp*.5&&hpMissing>=15;
  const mana=Boolean(intended)&&manaMissing>=15&&progress.mana<cost&&
    progress.mana+25>=cost;
  const both=hpMissing>=20&&manaMissing>=20;
  if(!hp&&!mana&&!both)return null;
  if(both)return 'both';
  return mana?'mana':'hp';
}
function metricRow(config,seed,enabled) {
  return {region:config.region,level:config.level,levelBand:config.levelBand,
    bossId:config.boss.id,boss:config.boss.name,bossHp:config.boss.hp,
    bossDamageBonus:config.boss.damageBonus,className:config.className,
    weaponId:config.weaponId,strategy:config.strategy,seed,phases:enabled?'on':'off',
    outcome:'',actions:0,responses:0,hpOnWin:null,manaOnWin:null,finalHp:null,
    finalMana:null,bossHpAtCap:null,highestPhase:0,phaseActions:[0,0,0,0],
    manaDrainedByPhase:[0,0,0,0],gentleBonusByPhase:[0,0,0,0],
    crushingBonusByPhase:[0,0,0,0],healingByPhase:[0,0,0,0],
    pressureTriggersByPhase:[0,0,0,0],guardPreventedByPhase:[0,0,0,0],
    taxPaidByPhase:[0,0,0,0],shellProtectionByPhase:[0,0,0,0],
    lowManaFallbacks:0,zeroManaActions:0,
    lowManaActions:0,deathAtZeroMana:0,deathWith50Mana:0,stim:0,evocation:0,
    berryUses:0,berryHpRestored:0,berryManaRestored:0,berryHpWasted:0,berryManaWasted:0,
    berryHpTrigger:0,berryManaTrigger:0,berryBothTrigger:0,allFourUsed:0,
    winsAfterFour:0,deathsAfterFour:0,berriesRemainingOnWin:null,berriesRemainingOnDeath:null,
    faeIntervention:0,manaDrained:0,pressureTriggers:0,bossHealing:0,
    enemyHpDamage:0,wakeDeaths:0,wakeHpBefore:0,wakeHpAfter:0,wakeSupported:0,
    gentleTriggers:0,gentleNominalBonus:0,crushingTriggers:0,crushingNominalBonus:0,
    royalGuardTriggers:0,royalGuardPrevented:0,kingsTaxTriggers:0,kingsTaxPaid:0,
    resolveTriggers:0,resolveProtection:0,shellFormations:0,shellProtection:0,
    shellBlocked:0,protectionConsumed:0,protectionPierced:0,realityEchoTriggers:0,
    nexusAdaptation5:0,nexusAdaptation10:0,capped:0};
}
function countReceipts(row,message,phase) {
  for(const m of message.matchAll(/Gentle Current — \+(\d+) attack damage/g)) {
    row.gentleTriggers++;row.gentleNominalBonus+=+m[1];
  }
  for(const m of message.matchAll(/Crushing Wake — Incoming \(\+(\d+) on hit\)/g)) {
    row.crushingTriggers++;row.crushingNominalBonus+=+m[1];
  }
  for(const m of message.matchAll(/Kelp Recovery — Restored (\d+) enemy HP/g)) row.bossHealing+=+m[1];
  for(const m of message.matchAll(/Royal Guard — Spell damage reduced by (\d+)/g)) {
    row.royalGuardTriggers++;row.royalGuardPrevented+=+m[1];
    row.guardPreventedByPhase[phase]+=+m[1];
  }
  for(const m of message.matchAll(/Royal Guard — Wake damage reduced by (\d+)/g)) {
    row.royalGuardPrevented+=+m[1];
    row.guardPreventedByPhase[phase]+=+m[1];
  }
  for(const m of message.matchAll(/King's Tax — Additional (\d+) Mana paid/g)) {
    row.kingsTaxTriggers++;row.kingsTaxPaid+=+m[1];
    row.taxPaidByPhase[phase]+=+m[1];
  }
  for(const m of message.matchAll(/Throne's Resolve — Gained (\d+) Protection/g)) {
    row.resolveTriggers++;row.resolveProtection+=+m[1];
  }
  for(const m of message.matchAll(/Reality Shell: \+(\d+) Protection/g)) {
    row.shellFormations++;row.shellProtection+=+m[1];
    row.shellProtectionByPhase[phase]+=+m[1];
  }
  row.realityEchoTriggers+=(message.match(/Reality Echo — Repeated spell/g)||[]).length;
  row.nexusAdaptation5+=(message.match(/Nexus Adaptation — Increased to \+5 damage/g)||[]).length;
  row.nexusAdaptation10+=(message.match(/Nexus Adaptation — Increased to \+10 damage/g)||[]).length;
  const pressure=(message.match(/Starfall Pressure — Next damaging attack drains/g)||[]).length;
  row.pressureTriggers+=pressure;row.pressureTriggersByPhase[phase]+=pressure;
}
async function prepare(config) {
  const f=await fixture(config.level,'discord',artifact);
  const enemy=read(config.boss.source);
  assert.equal(enemy.isBoss,true);
  await f.editProgress(p=>{
    p.stats={...config.stats};
    p.unspentStatPoints=0;p.statPointsGrantedThroughLevel=config.level;
    p.hp=100+config.stats.vitality*10;
    p.mana=100+config.stats.focus*10;
    p.berries=4;
    p.ownedWeapons=config.weaponId?[config.weaponId]:[];
    p.equippedWeapon=config.weaponId;
    p.activeClass=config.weaponId;
    p.classSystemUnlocked=Boolean(config.weaponId);
  });
  await f.c.startCombatEncounter(f.env,f.key,f.c.getRegionById(config.region),1,enemy,'discord');
  const definition=await f.c.getAdventureDefinition(config.region,1);
  const now=Date.now();
  await f.c.saveActiveAdventure(f.env,f.key,{
    version:1,regionId:config.region,adventureNumber:1,adventureId:definition.id,
    name:definition.name,currentRoomId:definition.boss.roomId,status:'boss-combat',
    visitedRooms:[definition.boss.roomId],completedRooms:[],collectedRewards:[],
    berriesEaten:0,playerHp:100+config.stats.vitality*10,
    playerMaxHp:100+config.stats.vitality*10,startedAt:now,updatedAt:now,
  });
  assert.equal((await f.progress()).berries,4);
  assert.equal((await f.c.getActiveAdventure(f.env,f.key)).berriesEaten,0);
  const initial=[...f.values];
  const originalAdvance=f.c.advanceBossPhase;
  const originalFinish=f.c.finishRegionalEnemyDamage;
  const originalHit=f.c.resolveRegionalEnemyHit;
  const originalResponse=f.c.resolveEnemyCombatResponse;
  const originalBegin=f.c.beginRegionalEnemyResponse;
  const originalAction=f.c.recordRegionalPlayerAction;
  const originalDamage=f.c.damageCombatEnemy;
  const originalRecovery=f.c.finishRegionalEnemyResponse;
  return {f,initial,originalAdvance,originalFinish,originalHit,originalResponse,
    originalBegin,originalAction,originalDamage,originalRecovery};
}
async function battle(prepared,config,trial,enabled) {
  const {f,initial,originalAdvance,originalFinish,originalHit,originalResponse,
    originalBegin,originalAction,originalDamage,originalRecovery}=prepared;
  f.values.clear();for(const [key,value] of initial)f.values.set(key,value);
  f.writes.length=0;f.rolls.length=0;
  const seed=seedFor(config,trial),random=rng(seed),row=metricRow(config,seed,enabled);
  f.math.random=random;
  f.c.randomInteger=(min,max)=>min+Math.floor(random()*(max-min+1));
  f.c.randomChoice=values=>values[f.c.randomInteger(0,values.length-1)];
  f.c.advanceBossPhase=enabled?originalAdvance:()=>{};
  f.c.finishRegionalEnemyDamage=enabled?originalFinish:(s,hpBefore)=>{
    if(s.regionId!=='sunken-kings-throne')return;
    const state=f.c.getRegionalEnemyState(s),enemy=s.enemy;
    if(!state.resolveUsed&&enemy.hp>0&&hpBefore*4>=enemy.maxHp&&enemy.hp*4<enemy.maxHp){
      state.resolveUsed=true;enemy.protection=(enemy.protection||0)+20;
      f.c.regionalEnemyReceipt(s,"Throne's Resolve — Gained 20 Protection.");
    }
  };
  f.c.resolveRegionalEnemyHit=(s,response,damage,progress)=>{
    const before=progress.mana,phase=s.regionalEnemy?.phase||0;
    originalHit(s,response,damage,progress);
    const drained=before-progress.mana;
    row.manaDrained+=drained;
    if(response.pressure)row.manaDrainedByPhase[phase]+=drained;
  };
  f.c.resolveEnemyCombatResponse=async (...args)=>{
    row.responses++;
    const state=args[2],wake=state.regionId==='leviathans-wake'&&
      (state.regionalEnemy?.responses||0)===2;
    const before=state.playerHp;
    const supported=wake&&f.c.getCombatProtection(state)>0;
    const result=await originalResponse(...args);
    if(wake){row.wakeHpBefore+=before;row.wakeHpAfter+=state.playerHp;
      row.wakeDeaths+=+(state.playerHp<=0);row.wakeSupported+=+supported;}
    return result;
  };
  f.c.beginRegionalEnemyResponse=(s,natural)=>{
    const phase=s.regionalEnemy?.phase||0;
    const before=s.regionalEnemy?.responses||0;
    const gentle=s.regionalEnemy?.gentle===true;
    const response=originalBegin(s,natural);
    if(s.regionId==='moonlit-reef'&&gentle&&natural!==1)
      row.gentleBonusByPhase[phase]+=phase?[0,7,9,12][phase]:5;
    if(s.regionId==='leviathans-wake'&&before===2&&natural!==1) {
      const value=phase? [0,18,20,25][phase]:15;
      row.crushingBonusByPhase[phase]+=value;
    }
    return response;
  };
  f.c.recordRegionalPlayerAction=(s,kind,id,successful)=>{
    const phase=s.regionalEnemy?.phase||0;
    const shell=phase&&s.regionId==='astral-nexus'&&successful&&
      (kind==='attack'||kind==='spell')?f.c.bossPhase(s):null;
    const blocked=Boolean(shell&&((s.regionalEnemy.shellActions+1)%shell.cadence===0)&&
      (s.enemy.protection||0)>0);
    originalAction(s,kind,id,successful);
    if(blocked)row.shellBlocked++;
  };
  f.c.damageCombatEnemy=(s,amount,pierce=0)=>{
    const before=s.enemy.protection||0;
    const dealt=originalDamage(s,amount,pierce);
    row.enemyHpDamage+=dealt;
    const spent=Math.max(0,before-(s.enemy.protection||0));
    row.protectionConsumed+=spent;
    row.protectionPierced+=Math.min(before,pierce||0,Math.max(0,amount||0));
    return dealt;
  };
  f.c.finishRegionalEnemyResponse=s=>{
    const before=s.enemy.hp,phase=s.regionalEnemy?.phase||0;
    originalRecovery(s);
    row.healingByPhase[phase]+=Math.max(0,s.enemy.hp-before);
  };
  let turn=0,blessingUsed=false,familiarUsed=false,bubbleUsed=false,mendUsed=false;
  for(let step=0;step<actionCap;step++) {
    let state=await f.state();if(!state)break;
    let progress=await f.progress();
    const maxHp=100+config.stats.vitality*10;
    const stimNeeded=state.playerHp<=Math.max(40,Math.floor(maxHp*.35))&&!state.stimUses;
    // /eat berry is non-turn-consuming; Stim takes priority at critical HP.
    if(!stimNeeded&&row.berryUses<4){
      const reason=berryReason(config,state,progress,turn);
      if(reason){
        const beforeRound=state.round,beforeHp=state.playerHp,beforeMana=progress.mana;
        const beforeInventory=progress.berries;
        const berry=await f.c.performEat(f.env,f.key,'Audit','berry','discord');
        assert(Number.isSafeInteger(berry.healedAmount),'Berry policy attempted a rejected use');
        state=await f.state();progress=await f.progress();
        const adventure=await f.c.getActiveAdventure(f.env,f.key);
        row.berryUses++;
        row.berryHpRestored+=berry.healedAmount;
        row.berryManaRestored+=berry.restoredMana;
        row.berryHpWasted+=25-berry.healedAmount;
        row.berryManaWasted+=25-berry.restoredMana;
        row[`berry${reason[0].toUpperCase()+reason.slice(1)}Trigger`]++;
        assert(row.berryUses<=4&&adventure.berriesEaten===row.berryUses);
        assert.equal(state.round,beforeRound,'Berry consumed the combat turn');
        assert.equal(state.playerHp-beforeHp,berry.healedAmount);
        assert.equal(progress.mana-beforeMana,berry.restoredMana);
        assert.equal(progress.berries,beforeInventory-1);
        assert(berry.healedAmount>=0&&berry.healedAmount<=25);
        assert(berry.restoredMana>=0&&berry.restoredMana<=25);
      }
    }
    const phase=state.regionalEnemy?.phase||0;
    row.highestPhase=Math.max(row.highestPhase,phase);
    row.phaseActions[phase]++;
    if(state.perkUses?.['fae-intervention'])row.faeIntervention=1;
    row.finalHp=state.playerHp;row.finalMana=progress.mana;
    if(progress.mana===0)row.zeroManaActions++;
    if(progress.mana<20)row.lowManaActions++;
    let result;
    if(state.playerHp<=Math.max(40,Math.floor(maxHp*.35))&&!state.stimUses){
      row.stim++;result=await f.c.performStimUnlocked(f.env,f.key,'discord','');
    } else if(config.strategy==='supported'&&!blessingUsed&&progress.mana>=30){
      blessingUsed=true;result=await f.cast('elf_blessing');
    } else if(config.strategy==='supported'&&config.level>=30&&!familiarUsed&&progress.mana>=30){
      familiarUsed=true;result=await f.cast('familiar');
    } else if(config.strategy==='supported'&&config.level>=8&&!bubbleUsed&&progress.mana>=35){
      bubbleUsed=true;result=await f.cast('bubble');
    } else if(config.strategy==='supported'&&config.level>=4&&!mendUsed&&
      state.playerHp<maxHp*.6&&progress.mana>=25){
      mendUsed=true;result=await f.cast('mend');
    } else if(config.level>=5&&config.strategy!=='weapon'&&progress.mana<25&&
      progress.evocationCooldownTurns===0){
      row.evocation++;result=await f.cast('evocation');
    } else {
      const spell=chooseSpell(config.level,turn);
      let desired='attack';
      if(config.strategy==='spell'||config.strategy==='supported')desired=spell||'attack';
      if(config.strategy==='mixed')desired=turn%2===0?'attack':spell||'attack';
      turn++;
      if(desired!=='attack'&&progress.mana<spellData[desired].manaCost+5){
        row.lowManaFallbacks++;desired='attack';
      }
      result=desired==='attack'?await f.attack():await f.cast(desired);
    }
    row.actions++;
    countReceipts(row,result?.message||'',phase);
    const next=await f.state();
    if(next)row.highestPhase=Math.max(row.highestPhase,next.regionalEnemy?.phase||0);
    if(result?.won){
      row.outcome='win';const p=await f.progress();row.hpOnWin=p.hp;
      row.manaOnWin=p.mana;row.finalHp=p.hp;row.finalMana=p.mana;break;
    }
    if(!next){
      row.outcome='death';const p=await f.progress();row.finalMana=p.mana;
      row.deathAtZeroMana=+(p.mana===0);row.deathWith50Mana=+(p.mana>=50);break;
    }
  }
  if(!row.outcome){
    row.outcome='cap';row.capped=1;const s=await f.state(),p=await f.progress();
    row.bossHpAtCap=s?.enemy.hp??null;row.finalHp=s?.playerHp??null;row.finalMana=p.mana;
  }
  row.allFourUsed=+(row.berryUses===4);
  row.winsAfterFour=+(row.outcome==='win'&&row.berryUses===4);
  row.deathsAfterFour=+(row.outcome==='death'&&row.berryUses===4);
  if(row.outcome==='win')row.berriesRemainingOnWin=4-row.berryUses;
  if(row.outcome==='death')row.berriesRemainingOnDeath=4-row.berryUses;
  return row;
}
function aggregate(rows,groupKeys) {
  const groups=new Map();
  for(const row of rows){const key=JSON.stringify(groupKeys.map(k=>row[k]));
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
  return [...groups].map(([key,items])=>{
    const values=JSON.parse(key),out=Object.fromEntries(groupKeys.map((k,i)=>[k,values[i]]));
    const wins=items.filter(x=>x.outcome==='win');
    out.battles=items.length;out.wins=wins.length;out.deaths=items.filter(x=>x.outcome==='death').length;
    out.caps=items.filter(x=>x.outcome==='cap').length;
    out.winRate=round(wins.length/items.length);
    out.meanActions=round(mean(items.map(x=>x.actions)));
    out.medianActions=median(items.map(x=>x.actions));
    out.meanResponses=round(mean(items.map(x=>x.responses)));
    out.medianResponses=median(items.map(x=>x.responses));
    out.meanHpOnWin=round(mean(wins.map(x=>x.hpOnWin)));
    out.medianHpOnWin=median(wins.map(x=>x.hpOnWin));
    out.meanManaOnWin=round(mean(wins.map(x=>x.manaOnWin)));
    out.medianManaOnWin=median(wins.map(x=>x.manaOnWin));
    out.meanBerries=round(mean(items.map(x=>x.berryUses)));
    out.medianBerries=median(items.map(x=>x.berryUses));
    out.berryDistribution=[0,1,2,3,4].map(n=>items.filter(x=>x.berryUses===n).length);
    out.meanBerriesRemainingOnWin=round(mean(wins.map(x=>x.berriesRemainingOnWin)));
    out.meanBerriesRemainingOnDeath=round(mean(items.filter(x=>x.outcome==='death')
      .map(x=>x.berriesRemainingOnDeath)));
    out.phase3Reached=items.filter(x=>x.highestPhase===3).length;
    out.phaseActions=[0,1,2,3].map(p=>items.reduce((a,x)=>a+x.phaseActions[p],0));
    for(const field of ['manaDrainedByPhase','gentleBonusByPhase','crushingBonusByPhase',
      'healingByPhase','pressureTriggersByPhase','guardPreventedByPhase',
      'taxPaidByPhase','shellProtectionByPhase'])
      out[field]=[0,1,2,3].map(p=>items.reduce((a,x)=>a+x[field][p],0));
    for(const field of numericKeys)out[field]=items.reduce((a,x)=>a+x[field],0);
    out.longestBattle=Math.max(...items.map(x=>x.actions));
    return out;
  }).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
function pairSummary(rows,groupKeys){
  const a=aggregate(rows,[...groupKeys,'phases']);
  const grouped=new Map();for(const row of a){const key=JSON.stringify(groupKeys.map(k=>row[k]));
    if(!grouped.has(key))grouped.set(key,{});grouped.get(key)[row.phases]=row;}
  return [...grouped].map(([key,pair])=>{
    assert(pair.on&&pair.off,'Unpaired aggregate');
    const keys=JSON.parse(key),base=Object.fromEntries(groupKeys.map((k,i)=>[k,keys[i]]));
    return {...base,off:pair.off,on:pair.on,
      winDelta:round(pair.on.winRate-pair.off.winRate),
      actionsDelta:round(pair.on.meanActions-pair.off.meanActions),
      responsesDelta:round(pair.on.meanResponses-pair.off.meanResponses),
      hpOnWinDelta:pair.on.meanHpOnWin===null||pair.off.meanHpOnWin===null?null:
        round(pair.on.meanHpOnWin-pair.off.meanHpOnWin),
      manaOnWinDelta:pair.on.meanManaOnWin===null||pair.off.meanManaOnWin===null?null:
        round(pair.on.meanManaOnWin-pair.off.meanManaOnWin)};
  });
}
async function main(){
  const selected=process.argv[2]?[process.argv[2]]:regions;
  for(const region of selected)assert(regions.includes(region),`Unknown region ${region}`);
  const all=[];
  for(const region of selected){
    const configs=configurations(region,regions.indexOf(region))
      .slice(0,Number(process.env.AUDIT_CONFIG_LIMIT || 1000));
    for(let ci=0;ci<configs.length;ci++){
      const config=configs[ci],prepared=await prepare(config);
      for(let trial=0;trial<seedsPerConfig;trial++){
        const off=await battle(prepared,config,trial,false);
        const on=await battle(prepared,config,trial,true);
        assert.equal(off.seed,on.seed);
        assert.equal(off.bossId,on.bossId);
        all.push(off,on);
      }
      if((ci+1)%6===0)console.log(`${region}: ${ci+1}/${configs.length} configurations`);
    }
  }
  assert.equal(zeroBerryResults.method.sourceHash,sourceHash,'Production source changed since zero-Berry audit');
  const oldConfigs=new Map(zeroBerryResults.byConfiguration.map(x=>[
    [x.region,x.level,x.bossId,x.className,x.strategy].join('|'),x]));
  const newConfigs=pairSummary(all,['region','level','bossId','className','strategy']);
  for(const config of newConfigs){
    const key=[config.region,config.level,config.bossId,config.className,config.strategy].join('|');
    assert(oldConfigs.has(key)&&oldConfigs.get(key).off.battles>=seedsPerConfig,
      `Matrix differs from zero-Berry audit: ${key}`);
  }
  if(selected.length===regions.length)assert.equal(newConfigs.length,72);
  const oldRows=new Map(zeroBerryResults.rows.map(x=>[
    [x.region,x.level,x.bossId,x.className,x.strategy,x.seed,x.phases].join('|'),x]));
  for(const row of all){
    const key=[row.region,row.level,row.bossId,row.className,row.strategy,row.seed,row.phases].join('|');
    assert(oldRows.has(key),`Unpaired zero-Berry row: ${key}`);
  }
  const newRegionLevel=pairSummary(all,['region','level','levelBand']);
  const oldRegionLevel=new Map(zeroBerryResults.byRegionLevel.map(x=>[
    `${x.region}|${x.level}`,x]));
  const berryComparison=newRegionLevel.map(x=>{
    const old=oldRegionLevel.get(`${x.region}|${x.level}`);
    return {region:x.region,level:x.level,zeroBerryOff:old.off.winRate,
      zeroBerryOn:old.on.winRate,fourBerryOff:x.off.winRate,fourBerryOn:x.on.winRate,
      zeroBerryPhaseDelta:old.winDelta,fourBerryPhaseDelta:x.winDelta,
      offBerryImprovement:round(x.off.winRate-old.off.winRate),
      onBerryImprovement:round(x.on.winRate-old.on.winRate)};
  });
  const result={method:{sourceHash,seedsPerConfig,actionCap,regions:selected,
    levelPairs:Object.fromEntries(regions.map((r,i)=>[r,levelPairs[i]])),
    rng:'SHA-256 configuration/trial to uint32, then LCG 1664525/1013904223; reset before both arms',
    off:'Simulation-only no-op phase advancement plus baseline 20-Protection Throne Resolve; all normal regional perks stay active',
    classRule:'Classless through level 5; at level 10+ one owned/equipped matching permanent weapon and class, assumed previously purchased',
    statRule:'Exactly level-1 allocated points, cyclic strategy priority, per-stat caps enforced',
    actionCapMeaning:'80 turn-consuming/normal commands; /eat berry does not count toward this cap',
    berryRule:'Four starting inventory Berries, active Adventure at 0/4 uses; Stim priority at critical HP; otherwise HP <=50% with >=15 missing, both HP/Mana >=20 missing, or +25 Mana restores intended spell affordability; canonical performEat used'},
    bosses:Object.fromEntries(selected.map(r=>[r,bossesFor(r).map(x=>({id:x.id,name:x.name,
      hp:x.hp,damageBonus:x.damageBonus,selection:x.selection}))])),
    configurations:all.length/(2*seedsPerConfig),battles:all.length,
    byRegionLevel:newRegionLevel,
    zeroVsFour:berryComparison,
    byRegionLevelStrategy:pairSummary(all,['region','level','strategy']),
    byRegionClass:pairSummary(all,['region','className']),
    byBoss:pairSummary(all,['region','level','bossId']),
    byConfiguration:newConfigs,
    caps:all.filter(x=>x.outcome==='cap'),rows:all};
  const suffix=selected.length===1?`-${selected[0]}`:'';
  const output=path.join(root,`boss-phase-ab-berry-results${suffix}.json`);
  fs.writeFileSync(output,JSON.stringify(result)+'\n');
  console.log(`Wrote ${output}: ${all.length} battles, ${result.caps.length} caps`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
