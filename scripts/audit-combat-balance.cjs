// Read-only audit: derives tables from canonical JSON and the reviewed combat roll table.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const write = (p, v) => fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + '\n');
const regions = ['moonlit-reef','starfall-trench','whispering-kelp-forest','leviathans-wake','sunken-kings-throne','astral-nexus'];
const rollDamage = r => r === 1 ? 0 : r <= 5 ? 5 : r <= 10 ? 10 : r <= 15 ? 15 : r <= 19 ? 20 : 30;
const mean = a => a.reduce((x,y)=>x+y,0)/a.length;
const median = a => { a=[...a].sort((x,y)=>x-y); return (a[(a.length-1)>>1]+a[a.length>>1])/2; };
const stats = a => ({min:Math.min(...a),max:Math.max(...a),mean:+mean(a).toFixed(3),median:median(a)});
const enemies=[];
for(const region of regions){
  const idx=read(`data/enemies/${region}/index.json`);
  const entries=new Map(idx.map(x=>[x.enemy,x]));
  const adventureEntries=new Map(read(`data/adventures/${region}/manifest.json`).flatMap(x=>[[x.enemyId,x],[x.bossEnemyId,x]]));
  for(const file of [
    ...fs.readdirSync(path.join(root,'data/enemies',region)).filter(x=>x.endsWith('.json')&&x!=='index.json').map(x=>`data/enemies/${region}/${x}`),
    ...fs.readdirSync(path.join(root,'data/enemies/bosses',region)).filter(x=>x.endsWith('.json')&&x!=='index.json').map(x=>`data/enemies/bosses/${region}/${x}`)
  ]){
      const e=read(file), bonus=e.damageBonus||0, entry=entries.get(e.id), adventure=adventureEntries.get(e.id);
      const distribution=Array.from({length:20},(_,i)=>{const base=rollDamage(i+1);return base?base+bonus:0});
      enemies.push({id:e.id,name:e.name,region,encounter:adventure?.number??entry?.encounter??null,adventure:adventure?.name??null,recommendedLevel:entry?.recommendedLevel??e.level,level:e.level,classification:e.isBoss?'boss':'normal',hp:e.hp,attackDie:'1d20',damageBonus:bonus,attackDamageRange:[Math.min(...distribution),Math.max(...distribution)],attackExpected:+mean(distribution).toFixed(3),attackDistribution:distribution,reward:e.reward,defeatCandyLoss:e.defeatCandyLoss,specialBehavior:null,source:file});
  }
}
write('balance-audit-enemies.json',{method:'worker.js getCombatRollResult and resolveEnemyCombatResponse; natural 1 misses, nonzero rolls add damageBonus; no armor',enemies});
const files=fs.readdirSync(path.join(root,'data/spells')).filter(x=>x.endsWith('.json'));
const spells=files.map(file=>({...read(`data/spells/${file}`),source:`data/spells/${file}`}));
const outcomes={};
const extra={};
for(const s of spells){
 let d=[];
 if(s.id==='star-spark') d=Array.from({length:12},(_,i)=>i===11?18:i+1);
 if(s.id==='jelly') for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)for(let c=1;c<=8;c++) d.push(a+b+c===24?35:a+b+c);
 if(s.id==='moonbeam') for(let a=1;a<=20;a++)for(let b=1;b<=20;b++){const high=Math.max(a,b);d.push((high===20?40:rollDamage(high))+3.5);}
 if(s.id==='falling-star')for(let a=1;a<=10;a++)for(let b=1;b<=10;b++)for(let c=1;c<=10;c++)for(let acc=1;acc<=20;acc++){const power=a+b+c;d.push(acc===1?0:acc<=9?Math.max(1,power-5):acc<=19?power:power+27);}
 if(s.id==='tidal-wave')for(let a=1;a<=12;a++)for(let b=1;b<=12;b++)for(let c=1;c<=12;c++){const n=a+b+c;d.push(n<=14?40:n<=19?50:n<=24?55:65);}
 if(s.id==='all-or-nothing')d=[0,25];
 if(s.id==='conjure-gun')d=[70];
 if(s.id==='leviathans-wake')d=[12,...Array(6).fill(22),...Array(6).fill(30),...Array(6).fill(40),55];
 if(s.id==='help')d=[0,0.5];
 if(s.id==='moonbeam'){
   let values=[];
   for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)for(let c=1;c<=6;c++)for(let f=1;f<=6;f++){
     const crit=Math.max(a,b)===20, align=c===f||c+f===7;
     values.push((crit?40:rollDamage(Math.max(a,b)))+c+f+(align?(crit?20:5):0)+(a===20&&b===20?75:0));
   }
   extra.moonbeam={level27Expected:+(mean(values)-75/400).toFixed(4),level46Expected:+mean(values).toFixed(4),baseCriticalProbability:39/400,alignmentProbability:12/36,fullMoonProbability:1/400};
 }
 if(s.id==='jelly'){
   const counts=[0,0,0,0,0];let masteryDamage=0;
   for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)for(let c=1;c<=8;c++){
     const n=a+b+c, k=n<=4?0:n<=8?1:n<=13?2:n<=17?3:4;counts[k]++;
     masteryDamage+=(n===24?35:n)+(k===3?8:k===4?12:0);
   }
   extra.jelly={masteryIIMoodProbabilities:counts.map(n=>n/512),masteryIIExpectedDamage:masteryDamage/512,perfectProbability:8/512};
 }
 if(s.id==='falling-star'){
   let total=0,count=0;
   for(let a=1;a<=10;a++)for(let b=1;b<=10;b++)for(let c=1;c<=10;c++)for(let acc=1;acc<=20;acc++){
     const power=a+b+c,match=a===b&&b===c?20:a===b||a===c||b===c?10:0,adj=power+match+(power===7?15:0);
     total+=acc===1?0:acc<=9?Math.max(1,adj-5):acc<=19?adj:adj+27;count++;
   }
   extra.fallingStar={meteorAlignmentExpectedDamage:total/count};
 }
 outcomes[s.id]={unlockLevel:s.requiredLevel,manaCost:s.manaCost,baseExpected:d.length?+mean(d).toFixed(4):null,baseRange:s.id==='conjure-gun'?[0,140]:s.id==='moonbeam'?[1,46]:d.length?[Math.min(...d),Math.max(...d)]:null,baseExpectedPerMana:d.length&&s.manaCost?+(mean(d)/s.manaCost).toFixed(4):null,interpretation:s.id==='help'?'fraction of current target HP':s.id==='conjure-gun'?'binomial mean; actual range 0–140':s.id==='leviathans-wake'?'delayed damage on second subsequent valid turn-consuming action':'before Strength, passives, and conditional mastery effects'};
}
write('balance-audit-spells.json',{spells,outcomes,extra});
const summary=regions.map(region=>{const e=enemies.filter(x=>x.region===region),n=e.filter(x=>x.classification==='normal'),b=e.filter(x=>x.classification==='boss');return {region,count:e.length,normalCount:n.length,bossCount:b.length,hp:stats(e.map(x=>x.hp)),attack:stats(e.map(x=>x.attackExpected)),normalHp:stats(n.map(x=>x.hp)),bossHp:stats(b.map(x=>x.hp)),normalAttack:stats(n.map(x=>x.attackExpected)),bossAttack:stats(b.map(x=>x.attackExpected))};});
console.log(JSON.stringify({enemyCount:enemies.length,spellCount:spells.length,summary,outcomes},null,2));
