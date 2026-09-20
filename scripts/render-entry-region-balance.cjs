const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'entry-region-balance-results.json'),'utf8'));
const file=path.join(root,'ENTRY_REGION_BALANCE_INVESTIGATION.md');
const source=fs.readFileSync(file,'utf8');
const names={'starfall-trench':'Starfall Trench','whispering-kelp-forest':'Whispering Kelp Forest',
  'leviathans-wake':"Leviathan's Wake",'astral-nexus':'Astral Nexus'};
const fmt=x=>x==null?'—':Number(x).toFixed(1);
const pct=x=>`${(x*100).toFixed(1)}%`;
const desc=v=>v.phaseOff?'phase effects off':v.tanglingBossOff?'first-boss Tangling +5 off':
  v.tanglingReduction?`${v.hpPercent}% HP cut + first-boss Tangling +${5-v.tanglingReduction}`:
  v.id==='baseline'?'canonical':
  `${v.hpPercent?`${v.hpPercent}% HP cut`:''}${v.hpPercent&&v.damageBonusReduction?' + ':''}`+
  `${v.damageBonusReduction?`−${v.damageBonusReduction} damage bonus`:''}`;
const phase=x=>x.join('/');
const lines=[];
lines.push('### Entry sensitivity sweep');
lines.push('');
lines.push('The sweep holds each boss’s normal rooms and player policies fixed. Only the listed boss parameter changes. “Damage” means an integer reduction to the canonical flat damage bonus on a non-missed attack; it is not a percentage reduction to final HP damage.');
for(const region of Object.keys(data.selected)){
  lines.push('');lines.push(`#### ${names[region]}`);lines.push('');
  lines.push('| Audit-only boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Phase activations | In 30–45% band? |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---|');
  for(const cell of data.sweep.filter(x=>x.region===region)){
    const m=cell.metrics;
    lines.push(`| ${desc(cell.variant)} | ${m.attempts} | ${pct(m.completionRate)} | ${pct(m.bossReachRate)} | ${pct(m.bossWinGivenReach)} | ${m.normalDeaths}/${m.bossDeaths} | ${m.phaseActivations} | ${m.completionRate>=.3&&m.completionRate<=.45?'yes':'no'} |`);
  }
}
lines.push('');lines.push('### Selected candidates at unlock and later checkpoints');lines.push('');
const canonical={'starfall-trench':{hp:260,bonus:9},
  'whispering-kelp-forest':{hp:325,bonus:11},
  'leviathans-wake':{hp:400,bonus:13},'astral-nexus':{hp:565,bonus:18}};
lines.push('| Region | Selected variant | Boss HP (canonical → variant) | Flat damage bonus (canonical → variant) |');
lines.push('|---|---|---:|---:|');
for(const region of Object.keys(data.selected))for(const id of data.selected[region]){
  const cell=data.sweep.find(x=>x.region===region&&x.variant.id===id);
  const base=canonical[region],v=cell.variant;
  lines.push(`| ${names[region]} | ${desc(v)} | ${base.hp} → ${Math.round(base.hp*(1-v.hpPercent/100))} | +${base.bonus} → +${base.bonus-v.damageBonusReduction} |`);
}
lines.push('');
lines.push('These cells use the larger curve sample. The baseline is rerun with the same seeds. Later Adventure bosses are unchanged by an Adventure 1 boss-only injection; direct replay verified identical completion, seeds, and paths for those cells.');
for(const region of Object.keys(data.selected)){
  lines.push('');lines.push(`#### ${names[region]} progression`);lines.push('');
  lines.push('| Level | Adventure | Boss change | Attempts | Complete | Boss reach | Win given reach | Normal/boss deaths | Entry band confirmed? |');
  lines.push('|---:|---:|---|---:|---:|---:|---:|---:|---|');
  for(const cell of data.curves.filter(x=>x.region===region)){
    const m=cell.metrics;
    const target=cell.level===({'starfall-trench':5,'whispering-kelp-forest':10,
      'leviathans-wake':20,'astral-nexus':40})[region]&&cell.adventureNumber===1;
    lines.push(`| ${cell.level} | ${cell.adventureNumber} | ${desc(cell.variant)} | ${m.attempts} | ${pct(m.completionRate)} | ${pct(m.bossReachRate)} | ${pct(m.bossWinGivenReach)} | ${m.normalDeaths}/${m.bossDeaths} | ${target?(m.completionRate>=.3&&m.completionRate<=.45?'yes':'no'):'—'} |`);
  }
}
lines.push('');lines.push('### Boss-entry resources and combat exposure');lines.push('');
lines.push('The table uses the larger curve sample at each unlock level. Phase reach is the number of boss-reaching attempts that reached phases 1/2/3. Deaths by phase are deaths *while* phase 0/1/2/3 was active; this does not establish causation.');lines.push('');
lines.push('| Region | Change | Boss HP mean/median | Boss Mana mean/median | Berries at boss | Stims/Berries used per attempt | Mean encounter / total actions | Boss player actions / enemy responses | Player damage per boss action | Boss HP damage per response | Phase reach 1/2/3 | Deaths by phase 0/1/2/3 |');
lines.push('|---|---|---|---|---:|---|---|---|---:|---:|---|---|');
const unlock={'starfall-trench':5,'whispering-kelp-forest':10,
  'leviathans-wake':20,'astral-nexus':40};
for(const region of Object.keys(data.selected))for(const cell of data.curves.filter(x=>x.region===region&&x.level===unlock[region]&&x.adventureNumber===1)){
  const m=cell.metrics;
  lines.push(`| ${names[region]} | ${desc(cell.variant)} | ${fmt(m.meanBossEntryHp)}/${fmt(m.medianBossEntryHp)} | ${fmt(m.meanBossEntryMana)}/${fmt(m.medianBossEntryMana)} | ${fmt(m.meanBossEntryBerries)} | ${fmt(m.meanStimUses)}/${fmt(m.meanBerryUses)} | ${fmt(m.meanEncounterActions)}/${fmt(m.meanTotalActions)} | ${fmt(m.meanBossPlayerActions)}/${fmt(m.meanBossResponses)} | ${fmt(m.meanPlayerDamagePerBossAction)} | ${fmt(m.meanBossHpDamagePerResponse)} | ${phase(m.phaseReached.slice(1))} | ${phase(m.deathByCurrentPhase)} |`);
}
lines.push('');lines.push('### Build and policy spread at unlock');lines.push('');
lines.push('Each class uses its existing weapon. The sample rotates class and policy together, so class rates are descriptive and partly confounded by policy. Full per-policy and per-class counts are in the JSON.');
for(const region of Object.keys(data.selected)){
  lines.push('');lines.push(`**${names[region]}:**`);lines.push('');
  for(const cell of data.curves.filter(x=>x.region===region&&x.level===unlock[region]&&x.adventureNumber===1)){
    const m=cell.metrics;
    const policies=Object.entries(m.byPolicy).map(([k,v])=>`${k} ${v.completed}/${v.attempts} (${pct(v.completionRate)})`).join('; ');
    const classes=Object.entries(m.byClass).map(([k,v])=>`${k} ${v.completed}/${v.attempts} (${pct(v.completionRate)})`).join('; ');
    lines.push(`- ${desc(cell.variant)}: policies — ${policies}. Classes — ${classes}. Regional receipts: ${Object.entries(m.regional).filter(([,v])=>v>0).map(([k,v])=>`${k} ${v}`).join(', ')||'none recorded'}.`);
  }
}
lines.push('');
const caps=[...data.sweep,...data.curves].reduce((a,x)=>a+x.metrics.caps,0);
lines.push(`Across the reported sweep and curve cells there were ${caps} action-cap events. Mean per-encounter actions, total actions, player and enemy damage, boss response counts, phase reach, and regional receipt counts for every cell are in the JSON.`);
const rendered=source.replace(/<!-- RESULTS_START -->[\s\S]*?<!-- RESULTS_END -->/,
  `<!-- RESULTS_START -->\n${lines.join('\n')}\n<!-- RESULTS_END -->`);
fs.writeFileSync(file,rendered);
console.log(`Rendered ${data.sweep.length} sweep and ${data.curves.length} curve cells`);
