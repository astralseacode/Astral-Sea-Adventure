// Deterministic, offline policy comparison through the actual combat runtime.
// Run after build: node scripts/audit-regional-enemy-perks.cjs [samples=100]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { setup } = require('./test-regional-enemy-perks.cjs');
const root = path.resolve(__dirname, '..');
const artifact = fs.readFileSync(path.join(root, 'dist/worker.js'), 'utf8');
const samples = Number(process.argv[2] || 100);
if (!Number.isSafeInteger(samples) || samples < 1) throw Error('Positive integer samples required');
const roster = JSON.parse(fs.readFileSync(path.join(root, 'balance-audit-enemies.json'), 'utf8')).enemies;
const spells = JSON.parse(fs.readFileSync(path.join(root, 'balance-audit-spells.json'), 'utf8')).outcomes;
if (roster.length !== 360 || Object.keys(spells).length !== 16) throw Error('Unexpected baseline audit coverage');
const normals = roster.filter(e => e.region === 'astral-nexus' && e.classification === 'normal').sort((a,b) => a.hp-b.hp);
const bosses = roster.filter(e => e.region === 'astral-nexus' && e.classification === 'boss').sort((a,b) => a.hp-b.hp);
const targets = [normals[Math.floor(normals.length/2)], bosses.find(e => e.name === 'Horizonfold Ray'), bosses.at(-1)];
const policies = {
  varied: ['conjure-gun', 'tidal-wave', 'moonbeam', 'jelly'],
  moonbeam: ['moonbeam'], tidal: ['tidal-wave'], gun: ['conjure-gun'],
  spellSpellAttack: ['conjure-gun', 'tidal-wave', 'attack'],
  attackHeavy: ['attack', 'attack', 'moonbeam'], attackOnly: ['attack'],
};
const round = n => Math.round(n * 100) / 100;
async function measure(target, policy, armor, enabled) {
  const f = await setup('astral-nexus', 50, artifact);
  await f.editProgress(p => { p.stats.vitality = 5; p.stats.strength = 9; p.stats.armor = armor; p.stats.fae = armor ? 5 : 0; p.hp = 150; });
  await f.editState(s => { s.playerHp = 150; s.playerMaxHp = 150;
    s.enemy = { ...s.enemy, ...JSON.parse(fs.readFileSync(path.join(root, target.source), 'utf8')), maxHp: target.hp }; });
  if (!enabled) vm.runInContext('for (const p of Object.values(REGIONAL_ENEMY_PERKS)) for (const key of Object.keys(p)) p[key] = false;', f.c);
  const initial = [...f.values];
  let seed, m;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296; };
  f.math.random = random;
  f.c.randomInteger = (min,max) => min + Math.floor(random() * (max-min+1));
  // Some randomChoice calls select mechanical Curiosity outcomes, not just text.
  // Preserve all runtime randomness, including those weighted resource events.
  f.c.randomChoice = values => values[f.c.randomInteger(0, values.length - 1)];
  const originalHit = f.c.resolveRegionalEnemyHit;
  f.c.resolveRegionalEnemyHit = (s,r,d,p) => {
    m.damage += d; const before = p.mana;
    originalHit(s,r,d,p); m.drained += before - p.mana;
  };
  const originalResponse = f.c.resolveEnemyCombatResponse;
  f.c.resolveEnemyCombatResponse = async (...args) => { m.responses++; return originalResponse(...args); };
  const originalRecovery = f.c.recordRegionalManaRecovery;
  f.c.recordRegionalManaRecovery = (s,n) => { if (n > 0 && s?.enemy.hp > 0) m.recovered += n; originalRecovery(s,n); };
  const totals = { wins:0, commands:0, responses:0, damage:0, drained:0, recovered:0,
    evocations:0, stims:0, interventions:0, winnerHp:0, winnerMana:0, timeouts:0 };
  for (let trial = 0; trial < samples; trial++) {
    seed = (Math.imul(trial + 1, 0x9e3779b9) ^ 0x51ea2026) >>> 0;
    f.values.clear(); for (const [k,v] of initial) f.values.set(k,v);
    f.rolls.length = 0;
    m = {commands:0,responses:0,damage:0,drained:0,recovered:0,evocations:0,stims:0,interventions:0};
    let turn = 0, won = false, lastHp = 0, lastMana = 0;
    // No support spam: one Blessing and Familiar opener; no recast Familiar or Berries.
    if (policy !== 'attackOnly') { await f.cast('blessing'); await f.cast('familiar'); m.commands += 2; }
    for (let step = 0; step < 100; step++) {
      let s = await f.state(); if (!s) break;
      let p = await f.progress();
      lastHp = s.playerHp; lastMana = p.mana;
      if (s.perkUses?.['fae-intervention']) m.interventions = 1;
      let result;
      if (s.playerHp <= 60 && !s.stimUses) {
        m.stims++; m.commands++;
        result = await f.c.performStimUnlocked(f.env, f.key, 'discord', '');
      } else {
        if (policy !== 'attackOnly' && !s.bubble && p.mana >= 45) {
          await f.cast('bubble'); m.commands++;
          s = await f.state(); p = await f.progress();
        }
        if (policy !== 'attackOnly' && !s.mend && s.playerHp < 100 && p.mana >= 50) {
          await f.cast('mend'); m.commands++;
          s = await f.state(); p = await f.progress();
        }
        const desired = policies[policy][turn % policies[policy].length];
        if (policy !== 'attackOnly' && p.mana < 40 && p.evocationCooldownTurns === 0) {
          m.evocations++; m.commands++; result = await f.cast('evocation');
        } else {
          const cost = desired === 'attack' ? 0 : spells[desired].manaCost;
          m.commands++;
          result = desired === 'attack' || p.mana < cost ? await f.attack() : await f.cast(desired);
          turn++;
        }
      }
      if (result?.won) { won = true; const p = await f.progress(); lastHp = p.hp; lastMana = p.mana; break; }
      if (step === 99) totals.timeouts++;
    }
    if (won) { totals.wins++; totals.winnerHp += lastHp; totals.winnerMana += lastMana; }
    for (const key of Object.keys(m)) totals[key] += m[key];
  }
  const result = { target:target.name, hp:target.hp, baseExpectedEnemyDamage:target.attackExpected,
    policy, player:{hp:150,mana:200,strength:9,armor,fae:armor?5:0}, regionalPerks:enabled, samples,
    winPercent:round(totals.wins*100/samples), meanCommands:round(totals.commands/samples),
    meanEnemyResponses:round(totals.responses/samples), meanIncomingDamage:round(totals.damage/samples),
    meanManaDrained:round(totals.drained/samples), meanCombatManaRecovered:round(totals.recovered/samples),
    meanEvocations:round(totals.evocations/samples), meanStims:round(totals.stims/samples),
    interventionPercent:round(totals.interventions*100/samples),
    winnerMeanHpAfterRewards:totals.wins?round(totals.winnerHp/totals.wins):null,
    winnerMeanManaAfterRewards:totals.wins?round(totals.winnerMana/totals.wins):null,timeouts:totals.timeouts };
  console.log(`${target.name} armor=${armor} ${policy} perks=${enabled}: ${result.winPercent}% wins`);
  return result;
}
(async () => {
  const rows=[];
  for (const target of targets) for (const armor of [0,10]) for (const policy of Object.keys(policies)) for (const enabled of [false,true]) {
    rows.push(await measure(target,policy,armor,enabled));
  }
  fs.writeFileSync(path.join(root,'regional-enemy-perks-simulations.json'),JSON.stringify({
    seed:'(imul(trial + 1, 0x9e3779b9) XOR 0x51ea2026) >>> 0; LCG 1664525/1013904223', samplesPerScenario:samples,
    runtimeSha256:crypto.createHash('sha256').update(artifact).digest('hex'),
    methodology:'Actual built runtime, local in-memory KV. Fixed policies, paired dispersed seeds; all random selections seeded, including Curiosity and cosmetic choices; no future-roll knowledge. Wins include post-victory resource rewards. Not an optimal-play or population win-rate claim.', rows,
  },null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
