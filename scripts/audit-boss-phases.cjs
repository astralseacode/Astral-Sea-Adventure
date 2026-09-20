// Seeded local smoke balance audit through the real combat runtime.
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const regions = ['moonlit-reef','starfall-trench','whispering-kelp-forest',
  'leviathans-wake','sunken-kings-throne','astral-nexus'];
const levels = [5,10,20,30,40,50];
const policies = {
  weapon: ['attack'],
  spell: ['star-spark'],
  varied: ['attack','star-spark','moonbeam'],
  mixed: ['conjure-gun','attack','star-spark','attack'],
};
const median = values => { const a=[...values].sort((x,y)=>x-y); return a.length ? (a[(a.length-1)>>1]+a[a.length>>1])/2 : null; };
const mean = values => values.length ? +(values.reduce((a,b)=>a+b,0)/values.length).toFixed(2) : null;
const rows = [];

async function run(region, level, target, policy, trial) {
  const f = await fixture(level);
  const enemy = read(target.source);
  await f.editProgress(p => {
    let points=level-1;
    for(const [stat,cap] of [['vitality',10],['strength',10],['armor',10],['focus',10],['fae',5]]) {
      const spend=Math.min(points,cap); p.stats[stat]=spend; points-=spend;
    }
    p.hp=100+p.stats.vitality*10; p.mana=100+p.stats.focus*10;
    if(level>=20) {p.ownedWeapons=['sword-and-shield'];p.equippedWeapon='sword-and-shield';
      p.activeClass='sword-and-shield';p.classSystemUnlocked=true;}
  });
  await f.c.startCombatEncounter(f.env,f.key,f.c.getRegionById(region),1,enemy,'discord');
  let seed = (Math.imul(trial+1, 0x9e3779b9) ^ (region.length * 16777619) ^ policy.length) >>> 0;
  const random = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  f.math.random=random;
  f.c.randomInteger=(min,max)=>min+Math.floor(random()*(max-min+1));
  f.c.randomChoice=values=>values[f.c.randomInteger(0,values.length-1)];
  const metrics={region,level,boss:target.name,policy,trial,win:false,death:false,actions:0,
    responses:0,hpOnWin:null,manaOnWin:null,manaDrained:0,bossHealing:0,
    bossProtection:0,crushingWake:0,royalGuard:0,kingsTax:0,realityShell:0,
    realityEcho:0,faeIntervention:0,stim:0,evocation:0,highestPhase:0,
    phaseActions:[0,0,0,0]};
  const originalHit=f.c.resolveRegionalEnemyHit;
  f.c.resolveRegionalEnemyHit=(s,r,d,p)=>{const before=p.mana; originalHit(s,r,d,p);
    metrics.manaDrained+=before-p.mana;};
  const originalResponse=f.c.resolveEnemyCombatResponse;
  f.c.resolveEnemyCombatResponse=async (...args)=>{metrics.responses++;return originalResponse(...args);};
  let turn=0, bubbleUsed=false, familiarUsed=false;
  for (let step=0;step<60;step++) {
    const state=await f.state(); if (!state) break;
    const progress=await f.progress();
    const phase=state.regionalEnemy?.phase||0;
    metrics.highestPhase=Math.max(metrics.highestPhase,phase);
    metrics.phaseActions[phase]++;
    if (state.perkUses?.['fae-intervention']) metrics.faeIntervention=1;
    let result;
    if (state.playerHp<=55 && !state.stimUses) {
      metrics.stim++; result=await f.c.performStimUnlocked(f.env,f.key,'discord','');
    } else if (policy==='mixed' && !bubbleUsed && progress.mana>=55 && level>=20) {
      bubbleUsed=true; result=await f.cast('bubble');
    } else if (policy==='varied' && !familiarUsed && progress.mana>=65 && level>=20) {
      familiarUsed=true; result=await f.cast('familiar');
    } else if (progress.mana<25 && progress.evocationCooldownTurns===0 && policy!=='weapon') {
      metrics.evocation++; result=await f.cast('evocation');
    } else {
      let choice=policies[policy][turn++%policies[policy].length];
      if (choice==='conjure-gun' && level<20) choice='star-spark';
      if (choice==='moonbeam' && level<10) choice='star-spark';
      result=choice==='attack'||progress.mana<40 ? await f.attack() : await f.cast(choice);
    }
    metrics.actions++;
    const text=result?.message||'';
    for (const [key,pattern] of Object.entries({crushingWake:/Crushing Wake — Incoming/g,
      royalGuard:/Royal Guard — Spell damage reduced|Royal Guard — Reserved/g,
      kingsTax:/King's Tax — Additional \d+ Mana paid/g,
      realityShell:/Reality Shell: \+\d+ Protection/g,
      realityEcho:/Reality Echo — Repeated spell/g})) metrics[key]+=(text.match(pattern)||[]).length;
    for(const m of text.matchAll(/Kelp Recovery — Restored (\d+) enemy HP/g))
      metrics.bossHealing+=Number(m[1]);
    for(const m of text.matchAll(/Reality Shell: \+(\d+) Protection/g))
      metrics.bossProtection+=Number(m[1]);
    for(const m of text.matchAll(/Throne's Resolve — Gained (\d+) Protection/g))
      metrics.bossProtection+=Number(m[1]);
    const next=await f.state();
    if (next) {
      metrics.highestPhase=Math.max(metrics.highestPhase,next.regionalEnemy?.phase||0);
    }
    if (result?.won) {
      metrics.win=true; const p=await f.progress(); metrics.hpOnWin=p.hp;
      metrics.manaOnWin=p.mana; break;
    }
    if (!next) {metrics.death=true;break;}
  }
  return metrics;
}
async function main() {
  const roster=read('balance-audit-enemies.json').enemies;
  for(let i=0;i<regions.length;i++) {
    const bosses=roster.filter(e=>e.region===regions[i]&&e.classification==='boss').sort((a,b)=>a.hp-b.hp);
    const target=bosses[Math.floor(bosses.length/2)];
    for(const policy of Object.keys(policies)) for(let trial=0;trial<2;trial++)
      rows.push(await run(regions[i],levels[i],target,policy,trial));
    console.log(`Audited ${regions[i]}`);
  }
  const summary=regions.map(region=>{const r=rows.filter(x=>x.region===region),wins=r.filter(x=>x.win);
    return {region,boss:r[0].boss,trials:r.length,winRate:+(wins.length/r.length).toFixed(3),
      meanActions:mean(r.map(x=>x.actions)),medianActions:median(r.map(x=>x.actions)),
      meanResponses:mean(r.map(x=>x.responses)),meanHpOnWin:mean(wins.map(x=>x.hpOnWin)),
      meanManaOnWin:mean(wins.map(x=>x.manaOnWin)),deaths:r.filter(x=>x.death).length,
      phase3Reached:r.filter(x=>x.highestPhase===3).length,
      meanPhaseActions:[0,1,2,3].map(p=>mean(r.map(x=>x.phaseActions[p]))),
      ...Object.fromEntries(['manaDrained','bossHealing','bossProtection','crushingWake',
        'royalGuard','kingsTax','realityShell','realityEcho','faeIntervention','stim','evocation']
        .map(key=>[key,r.reduce((a,x)=>a+x[key],0)]))};});
  fs.writeFileSync(path.join(root,'boss-phase-simulations.json'),
    JSON.stringify({seed:'LCG 1664525/1013904223; two trials per policy',policies,summary,rows},null,2)+'\n');
  console.log(JSON.stringify(summary));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
