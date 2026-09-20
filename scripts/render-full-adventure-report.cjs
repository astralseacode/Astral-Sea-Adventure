// Render the reproducible summary section from raw seeded audit results.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'full-adventure-balance-results.json'),'utf8'));
const reportPath=path.join(root,'FULL_ADVENTURE_BALANCE_AUDIT.md');
const report=fs.readFileSync(reportPath,'utf8');
const p=x=>`${(100*x).toFixed(1)}%`;
const n=x=>x==null?'—':Number(x).toFixed(1);
const delta=(a,b)=>`${((b-a)*100).toFixed(1)} pp`;
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:null;
const lines=[];
const cells=data.byRegionLevel;
const regions=data.method.regions;
const names={'moonlit-reef':'Moonlit Reef','starfall-trench':'Starfall Trench',
  'whispering-kelp-forest':'Whispering Kelp Forest','leviathans-wake':"Leviathan's Wake",
  'sunken-kings-throne':"Sunken King's Throne",'astral-nexus':'Astral Nexus'};
const relevant=cells.filter(x=>x.checkpoint!=='intermediate');
lines.push(`**Coverage:** ${data.configurations} configurations × ${data.method.seedsPerConfig} seeds × 2 rulesets = ${data.adventures.toLocaleString()} initial Adventure attempts. ${new Set(data.configurationsDetail.map(x=>`${x.region}:${x.adventureNumber}`)).size} distinct authored Adventures were sampled from 186 in the repository. ${new Set(data.rows.filter(x=>x.path.length===3).map(x=>`${x.region}:${x.adventureNumber}:${x.path.map(y=>y.direction).join('/')}`)).size} distinct complete three-room direction paths were observed. No attempt hit an action cap (${data.caps.length} total).`);
lines.push('');
lines.push('### Completion, boss reach, and conditional boss wins');
lines.push('');
lines.push('| Region | Level | Started per ruleset | Current complete | Current boss reach | Current win given reach | 2-Stim complete | 2-Stim boss reach | 2-Stim win given reach | Completion change |');
lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for(const region of regions)for(const level of [...new Set(relevant.filter(x=>x.region===region).map(x=>x.level))]){
  const a=relevant.find(x=>x.region===region&&x.level===level&&x.ruleset==='current');
  const b=relevant.find(x=>x.region===region&&x.level===level&&x.ruleset==='second');
  lines.push(`| ${names[region]} | ${level} | ${a.started} | ${p(a.completionRate)} | ${p(a.bossReachRate)} | ${p(a.bossWinGivenReach)} | ${p(b.completionRate)} | ${p(b.bossReachRate)} | ${p(b.bossWinGivenReach)} | ${delta(a.completionRate,b.completionRate)} |`);
}
lines.push('');
lines.push('The level 1 comparison uses one Stim in both arms by design. The boss win column is conditional on reaching the boss; it is not the Adventure completion rate. Percentages include sampled paths with zero to three normal combats.');
lines.push('');
lines.push('### Resources and encounter burden');
lines.push('');
lines.push('| Region | Level | Ruleset | Mean boss HP | Mean boss Mana | Mean Berries at boss | Mean Stims used before/during boss | Mean Berries used before/during boss | Deaths normal/boss | Mean actions per encounter / Adventure |');
lines.push('|---|---:|---|---:|---:|---:|---:|---:|---:|---:|');
for(const region of regions)for(const level of [...new Set(relevant.filter(x=>x.region===region).map(x=>x.level))])for(const ruleset of ['current','second']){
  const a=relevant.find(x=>x.region===region&&x.level===level&&x.ruleset===ruleset);
  lines.push(`| ${names[region]} | ${level} | ${ruleset} | ${n(a.meanBossEntryHp)} | ${n(a.meanBossEntryMana)} | ${n(a.meanBossEntryBerriesRemaining)} | ${n(a.meanStimBeforeBoss)}/${n(a.meanStimDuringBoss)} | ${n(a.meanBerryBeforeBoss)}/${n(a.meanBerryDuringBoss)} | ${a.normalDeaths}/${a.bossDeaths} | ${n(a.meanEncounterActions)}/${n(a.meanTotalActions)} |`);
}
lines.push('');
lines.push('Stim availability at boss entry is 1 in every current run and 2 in every second-Stim level 5+ run, because the boss is a fresh combat. Starting HP/Mana are set by each configuration’s stat allocation and are in the raw rows. Victory HP/Mana, every encounter entry, restoration amounts, regional counters, and phase events are also recorded per run.');
lines.push('');
lines.push('### Starfall progression');
lines.push('');
lines.push('| Level | Ruleset | Complete | Boss reach | Win given reach | Normal/boss deaths | Boss HP/Mana/Berries | Mean Stims used | Mean Berries used |');
lines.push('|---:|---|---:|---:|---:|---:|---|---:|---:|');
for(const level of [5,6,7,8,9,10])for(const ruleset of ['current','second']){
  const a=cells.find(x=>x.region==='starfall-trench'&&x.level===level&&x.ruleset===ruleset);
  lines.push(`| ${level} | ${ruleset} | ${p(a.completionRate)} | ${p(a.bossReachRate)} | ${p(a.bossWinGivenReach)} | ${a.normalDeaths}/${a.bossDeaths} | ${n(a.meanBossEntryHp)}/${n(a.meanBossEntryMana)}/${n(a.meanBossEntryBerriesRemaining)} | ${n(a.meanStimUses)} | ${n(a.meanBerryUses)} |`);
}
lines.push('');
lines.push('Starfall level 10 includes three eligible Adventures; levels 5–9 use Adventure 1. Their rates therefore also reflect different Adventure coverage.');
lines.push('');
lines.push('### Entry-level diagnostics');
lines.push('');
for(const region of regions){
  const level=relevant.find(x=>x.region===region&&x.checkpoint==='entry').level;
  const current=data.rows.filter(x=>x.region===region&&x.level===level&&x.checkpoint==='entry'&&x.ruleset==='current');
  const second=data.rows.filter(x=>x.region===region&&x.level===level&&x.checkpoint==='entry'&&x.ruleset==='second');
  const deathCounts=new Map();for(const row of current)if(row.outcome==='death')deathCounts.set(row.deathEnemyName,(deathCounts.get(row.deathEnemyName)||0)+1);
  const deathList=[...deathCounts].sort((a,b)=>b[1]-a[1]).map(([name,count])=>`${name} ${count}`).join(', ')||'none';
  const c=relevant.find(x=>x.region===region&&x.level===level&&x.ruleset==='current');
  const s=relevant.find(x=>x.region===region&&x.level===level&&x.ruleset==='second');
  const bossRows=current.filter(x=>x.reachedBoss);
  const bossActions=mean(bossRows.map(x=>x.encounterActions.at(-1)));
  const victory=current.filter(x=>x.completed);
  lines.push(`- **${names[region]} level ${level}:** ${current.length} current attempts; ${c.normalDeaths} normal deaths and ${c.bossDeaths} boss deaths. Death enemies: ${deathList}. Mean boss-entry HP/Mana/Berries ${n(c.meanBossEntryHp)}/${n(c.meanBossEntryMana)}/${n(c.meanBossEntryBerriesRemaining)}. Mean player actions in the boss encounter among boss-reaching attempts: ${n(bossActions)}. Mean winning HP/Mana: ${n(mean(victory.map(x=>x.finalHp)))}/${n(mean(victory.map(x=>x.finalMana)))}. Player damage to normal enemies/bosses ${c.normalDamageToEnemy}/${c.bossDamageToEnemy}; enemy HP damage ${c.enemyHpDamageToPlayer}. Second Stim changes completion by ${delta(c.completionRate,s.completionRate)} and mean Stim use from ${n(c.meanStimUses)} to ${n(s.meanStimUses)} per attempt. Boss phase activations ${c.phaseActivations} current versus ${s.phaseActivations} second.`);
}
lines.push('');
lines.push('### Authored Adventure variation at mature checkpoints');
lines.push('');
lines.push('| Region | Level | Adventure | Boss | Current complete | Current boss reach | Second complete |');
lines.push('|---|---:|---|---|---:|---:|---:|');
for(const region of regions){
  const mature=relevant.find(x=>x.region===region&&x.checkpoint==='mature');
  for(const a of data.configurationsDetail.filter(x=>x.region===region&&x.level===mature.level&&x.checkpoint==='mature')){
    const c=data.byAdventure.find(x=>x.region===region&&x.level===mature.level&&x.adventureNumber===a.adventureNumber&&x.ruleset==='current');
    const s=data.byAdventure.find(x=>x.region===region&&x.level===mature.level&&x.adventureNumber===a.adventureNumber&&x.ruleset==='second');
    if(lines.some(x=>x.startsWith(`| ${names[region]} | ${mature.level} | ${a.adventureNumber} `)))continue;
    lines.push(`| ${names[region]} | ${mature.level} | ${a.adventureNumber} ${a.adventureName} | ${a.bossId} | ${p(c.completionRate)} | ${p(c.bossReachRate)} | ${p(s.completionRate)} |`);
  }
}
lines.push('');
const grand={};for(const rule of ['current','second']){
  const r=data.rows.filter(x=>x.ruleset===rule);
  grand[rule]={stim:r.reduce((a,x)=>a+x.stimHpRestored,0),berryHp:r.reduce((a,x)=>a+x.berryHpRestored,0),berryMana:r.reduce((a,x)=>a+x.berryManaRestored,0),evocation:r.reduce((a,x)=>a+x.evocation,0),fae:r.reduce((a,x)=>a+x.faeIntervention,0),phases:r.reduce((a,x)=>a+x.phaseActivations,0)};
}
lines.push(`Across all attempts, current/second total HP restored by Stim was ${grand.current.stim.toLocaleString()}/${grand.second.stim.toLocaleString()}, HP restored by Berries ${grand.current.berryHp.toLocaleString()}/${grand.second.berryHp.toLocaleString()}, and Mana restored by Berries ${grand.current.berryMana.toLocaleString()}/${grand.second.berryMana.toLocaleString()}. Evocation actions were ${grand.current.evocation}/${grand.second.evocation}; observed Fae Intervention events were ${grand.current.fae}/${grand.second.fae}; boss phase activation receipts were ${grand.current.phases}/${grand.second.phases}. Region-specific receipt counts and highest boss phase reached are in the raw JSON.`);
lines.push('');
const replace=report.replace(/<!-- RESULTS_START -->[\s\S]*?<!-- RESULTS_END -->/,
  `<!-- RESULTS_START -->\n${lines.join('\n')}\n<!-- RESULTS_END -->`);
fs.writeFileSync(reportPath,replace);
console.log(`Rendered ${data.adventures} attempts into ${reportPath}`);
