const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {fixture} = require('./test-leviathans-wake.cjs');
const {runtime} = require('./test-free-tier.cjs');
const {build} = require('./build-worker.cjs');

async function main() {
  build({check:true});
  const source = fs.readFileSync(path.join(__dirname,'../dist/worker.js'),'utf8');
  const root = await fixture(50);
  const artifact = await runtime(source);
  const canonical = Array.from(await root.c.formatLevelUpUnlocks(0,50));
  assert.equal(canonical.length,52);
  // Digest of the 52 verbatim approved paragraphs, joined by LF; not computed from implementation.
  assert.equal(crypto.createHash('sha256').update(canonical.join('\n')).digest('hex'),
    '540da3723a6c85fd5e985fec3fce32a4c7b2d25186c359f01c86f22db341a0c1');
  assert(canonical.includes('lvl 29 Passive 🌿 Fae Second Opinion: Missing with a qualifying offensive roll causes Fae Second Opinion to activate, granting +3 to your next offensive roll. Activates once per battle.'));
  for(const f of [root,artifact]) {
    for(let level=1;level<=50;level++) {
      const expected=canonical.filter(line=>line.startsWith(`lvl ${level} `));
      assert.equal(expected.length,[1,5].includes(level)?2:1);
      assert.deepEqual(Array.from(await f.c.formatLevelUpUnlocks(level-1,level)),expected);
      assert.equal((await f.c.formatLevelUpUnlocks(level,level)).length,0);
    }
    assert.deepEqual(Array.from(await f.c.formatLevelUpUnlocks(40,42)),canonical.slice(42,44));
    assert((await f.c.formatLevelUpUnlocks(41,42))[0].includes('🌊 Rising Power'));
    assert((await f.c.formatLevelUpUnlocks(43,44))[0].includes('🌌 Bond'));
    const familiar=await f.c.formatLevelUpUnlocks(29,30);
    assert.equal(familiar.length,1);
    assert(familiar[0].endsWith('before leaving to begin an adventure of its own.'));
    assert(!familiar[0].includes('\n'));
  }
  // Real victory crosses many levels, stressing the existing ordered Discord delivery.
  const player=await runtime(source);
  await player.editProgress(p=>{p.xp=player.c.totalXpForLevel(1);});
  const xp=player.c.totalXpForLevel(50);
  await player.editState(s=>{s.enemy.hp=1;s.enemy.reward.xp={min:xp,max:xp};});
  player.rolls.push(20);
  let executions=0;
  const attack=player.c.performAttack;
  player.c.performAttack=async(...args)=>{executions++;return attack(...args);};
  const result=await player.run('attack');
  assert.equal(executions,1);
  assert.equal(player.c.levelFromXp((await player.progress()).xp),50);
  const chunks=result.messages.map(message=>message.content);
  assert(chunks.length>1);
  assert.equal(chunks.join(''),result.content);
  assert(chunks.every(chunk=>chunk.length<=1900));
  for(const message of result.messages)assert.equal(JSON.stringify(message.allowed_mentions),'{"parse":[]}');
  let previous=-1;
  for(const entry of canonical.filter(line=>!line.startsWith('lvl 1 '))) {
    const index=result.content.indexOf(entry);
    assert(index>previous,entry);
    assert.equal(result.content.split(entry).length-1,1,entry);
    previous=index;
  }
  assert(!result.content.includes(canonical[0]));
  const repeat=await player.run('stats');
  assert(!repeat.content.includes('lvl 42 Passive'));
  assert(!/\p{Extended_Pictographic}/u.test(repeat.content));
  assert.equal(result.counts.content,0);
  assert(Object.values(result.counts.writes).every(count=>count<=1));
  const failed=await runtime(source);
  await failed.editProgress(p=>{p.xp=0;});
  await failed.editState(s=>{s.enemy.hp=1;s.enemy.reward.xp={min:xp,max:xp};});
  failed.rolls.push(20);
  let failedExecutions=0,attempts=0;
  const failedAttack=failed.c.performAttack;
  failed.c.performAttack=async(...args)=>{failedExecutions++;return failedAttack(...args);};
  failed.c.fetch=async()=>{attempts++;return {ok:false,status:503};};
  await failed.run('attack');
  assert.equal(failedExecutions,1);
  assert.equal(attempts,1);
  assert.equal(failed.c.levelFromXp((await failed.progress()).xp),50);
  assert.equal(await failed.state(),null);
  assert(failed.errors.length>0);
  console.log('Canonical unlocks: 52 exact entries, levels 1–50, duplicates, Familiar exclusion, emoji boundaries, multi-level victory and ordered Discord chunks passed.');
}
module.exports={main};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
