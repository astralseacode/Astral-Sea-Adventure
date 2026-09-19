// Offline exact-table and seeded damage audit for class specialization.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const c = vm.createContext({ console, structuredClone, Math });
vm.runInContext(fs.readFileSync(path.join(root,'worker.js'),'utf8').replace('export default {','const workerExport = {'),c);
const data = vm.runInContext('CLASS_DATA',c);
const ids = Object.keys(data);
const regions = ['moonlit-reef','starfall-trench','whispering-kelp-forest','leviathans-wake','sunken-kings-throne','astral-nexus'];
function rolls(id) {
  const result=[];
  for(let a=1;a<=20;a++) if(id==='daggers'||id==='bow') for(let b=1;b<=20;b++) result.push([a,b]); else result.push([a]);
  return result;
}
const lines=['# Class specialization balance audit','','Exact means enumerate all ordered natural roll outcomes at +9 Strength. Class damage is added once to the matching weapon primary attack after base damage and Strength, before enemy Protection. Side effects are separate.','','| Region | Class title | No class dmg | Class dmg | Added | Avg Protection / action | Stagger / proc | Piercing |','| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |'];
for(let tier=0;tier<6;tier++) for(const id of ids) {
  const options=rolls(id);
  const base=options.reduce((s,r)=>s+c.resolveWeaponAttack(id,r,9,20,'discord').damage,0)/options.length;
  const selected=options.map(r=>c.resolveWeaponAttack(id,r,9,20,'discord',tier));
  const average=selected.reduce((s,x)=>s+x.damage,0)/selected.length;
  const defense=id==='sword-and-shield' ? (selected.reduce((s,x)=>s+x.protection,0)/selected.length).toFixed(2) : '—';
  const stagger=id==='hammer' ? `${data[id].stagger[tier][0]} on 15–19; ${data[id].stagger[tier][1]} on 20` : '—';
  const pierce=id==='spear' ? data[id].pierce[tier] : '—';
  lines.push(`| ${regions[tier]} | ${data[id].titles[tier]} | ${base.toFixed(2)} | ${average.toFixed(2)} | +${(average-base).toFixed(2)} | ${defense} | ${stagger} | ${pierce} |`);
}
lines.push('','## Endgame effects','','- Nexus Paladin: +5 damage and +5 Protection on successful Sword and Shield attacks; restores up to 3 HP once per successful attack (95% natural hit chance), even if enemy Protection absorbs damage.','- Nexus Phantom: +4 base damage, +4 when both Daggers hit (90.25% probability), and +6 when both natural dice are 15+ (9% probability).','- Worldbreaker: +5 base damage, +15 on natural 20 (5% probability), and one pending +5 Warbringer Fury after a miss; Fury is stateful and omitted from the static mean.','- Horizon Dragoon: +4 base damage, 15 Piercing, and +5 when enemy Protection exists at attack start; the table assumes 20 starting Protection.','- Titan Vanguard: +4 base damage, Stagger of 7 or 12 on natural 15–19 or 20; after a Stagger is consumed, gain 5 Protection.','- Horizon Hunter: +5 base damage, +8 when both dice are 15+ except double 20 grants +15 instead. Double 20 probability is 0.25%.','',
'## Seeded representative damage scenarios','',
'Seed: 20260919, 200 trials per cell. Median-HP normal and boss definitions in Sunken King\'s Throne and Astral Nexus. Each turn uses a natural weapon roll or fixed approximate spell damage (Moonbeam 30, Tidal Wave 61.5, Conjure Gun 79). The Throne model grants 20 enemy Protection below 25% HP. It models attack damage and Spear Piercing, but omits enemy turns, Mana, survival, Familiar, and the full regional perk state machine. The combat regression tests cover regional action classification.','',
'| Region / enemy | HP | Rotation | Unclassed actions | Matched class actions |','| --- | ---: | --- | ---: | ---: |');
let seed=20260919;
const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const die=()=>1+Math.floor(random()*20);
function representative(region,boss) {
  const dir=path.join(root,'data/enemies',boss?'bosses':'',region);
  const entries=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync(path.join(dir,x),'utf8'))).sort((a,b)=>a.hp-b.hp);
  return entries[Math.floor(entries.length/2)];
}
function trial(enemy,id,tier,rotation,throne) {
  let hp=enemy.hp, shield=0, granted=false, actions=0;
  while(hp>0&&actions<100) {
    const action=rotation[actions%rotation.length];
    let damage,pierce=0;
    if(action==='weapon') {
      const dice=id==='daggers'||id==='bow'?[die(),die()]:[die()];
      const attack=c.resolveWeaponAttack(id,dice,9,shield,'discord',tier);
      damage=attack.damage;pierce=attack.pierceProtection;
    } else damage={Moonbeam:30,'Tidal Wave':61.5,'Conjure Gun':79}[action];
    shield=Math.max(0,shield-pierce);
    const absorbed=Math.min(shield,damage);shield-=absorbed;hp-=damage-absorbed;
    if(throne&&!granted&&hp>0&&hp<enemy.hp*.25){shield+=20;granted=true;}
    actions++;
  }
  return actions;
}
for(const region of regions.slice(4)) for(const boss of [false,true]) {
  const enemy=representative(region,boss);
  for(const id of ids) for(const [label,rotation] of Object.entries({varied:['Moonbeam','weapon','Tidal Wave'],heavy:['weapon','weapon','Moonbeam'],starved:['weapon']})) {
    const results=[];
    for(const tier of [null,regions.indexOf(region)]) {
      let sum=0;for(let i=0;i<200;i++)sum+=trial(enemy,id,tier,rotation,region==='sunken-kings-throne');
      results.push((sum/200).toFixed(1));
    }
    lines.push(`| ${region} ${boss?'boss':'normal'}: ${enemy.name} / ${data[id].name} | ${enemy.hp} | ${label} | ${results.join(' | ')} |`);
  }
}
lines.push('','## Economy and interpretation','','Class Change costs 50,000 Candies, 2.5 times one 20,000-Candy weapon and about 42% of all six weapons combined (120,000). It is a substantial repeatable late-game sink. This audit does not model Candy earnings, so it cannot establish how quickly repeated swaps become affordable.','',
'All six classes improve matching attacks. Worldbreaker and Titan Vanguard have the highest damage potential while Knight and Lancer trade some damage for defense or anti-Protection utility. The fixed class tables do not suggest a clearly useless class. Spell-heavy rotations remain faster in this damage model; no class or spell values were rebalanced.');
fs.writeFileSync(path.join(root,'CLASS_SPECIALIZATION_BALANCE_REPORT.md'),lines.join('\n')+'\n');
console.log('Wrote CLASS_SPECIALIZATION_BALANCE_REPORT.md');
