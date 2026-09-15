// Execute the exact upload artifact with real content loaders and offline KV/Discord.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {build, collectContent} = require('./build-worker.cjs');
const {runtime, scenarios, spellOptions, fallback} = require('./test-free-tier.cjs');
const root = path.resolve(__dirname, '..');

async function main() {
  build({check:true});
  const source = fs.readFileSync(path.join(root,'dist/worker.js'),'utf8');
  const entries = collectContent();
  const f = await runtime(source,{accountId:'987654321'});
  const observed = new Map();
  const originalLoader = f.c.fetchCachedJson;
  // Observe real family loaders; do not replace their content or URL construction.
  f.c.fetchCachedJson = async (key,url) => {
    const relative = String(url).split('/main/data/')[1];
    assert(Object.hasOwn(entries,relative),`Unknown runtime URL: ${url}`);
    const result = await originalLoader(key,url);
    assert.equal(JSON.stringify(result),entries[relative],relative);
    observed.set(relative,key);
    return result;
  };
  await f.c.getSpellDefinitions();
  await f.c.getMasteryDefinitions();
  await f.c.getPerkDefinitions();
  const regions = vm.runInContext('REGIONS',f.c);
  for(const region of regions) {
    for(const input of [region.id,region.name,`  ${region.name.toUpperCase()}  `]) {
      assert.equal(f.c.normalizeRegionInput(input).id,region.id);
    }
    await f.c.getRegionMetadata(region.id);
    await f.c.getRegionNotes(region.id);
    await f.c.loadRegionLogs(region);
    await f.c.getRegionCombatEntries(region.id);
    const manifest = await f.c.getAdventureManifest(region.id);
    for(const entry of manifest) {
      await f.c.getAdventureDefinition(region.id,entry.number);
      await f.c.getEnemyDefinition(entry.enemyId);
      await f.c.getEnemyDefinition(entry.bossEnemyId);
    }
  }
  assert.equal(Object.keys(entries).length,621);
  assert.deepEqual([...observed.keys()].sort(),Object.keys(entries).sort(),
    'Every source document must be reached by a real game-family loader');
  assert.equal(f.counts().content,0);
  const categories = {};
  for(const relative of observed.keys()) {
    const category = relative.startsWith('enemies/bosses/')?'bosses':relative.split('/')[0];
    categories[category]=(categories[category]||0)+1;
  }

  const receipts=[];
  for(const region of regions) {
    for(const activeAdventure of [false,true]) {
      const player=await runtime(source,{accountId:'987654321'});
      await player.c.deleteCombatState(player.env,player.key);
      await player.editProgress(p=>{p.currentRegion=region.id;});
      if(activeAdventure) await player.c.performAdventure(player.env,player.key,1,'discord');
      const stored=JSON.parse(player.values.get('progress:'+player.key));
      const direct=await player.progress();
      const staged=await player.c.withCommandPersistence(player.env,player.key,
        env=>player.c.getPlayerProgress(env,player.key));
      assert.equal(stored.currentRegion,region.id);
      assert.equal(direct.currentRegion,region.id);
      assert.deepEqual(staged,direct);
      assert.equal(await player.state(),null);
      const startingState=[...player.values];
      for(const command of ['shop','attack','adventure','cast']) {
        const result=await player.run(command,command==='cast'?spellOptions('moonbeam'):[]);
        assert.equal(result.status,200);
        assert.equal(result.counts.content,0);
        assert.equal(player.errors.length,0);
        assert(!result.content.includes(fallback));
        if(command==='shop') assert.match(result.content,/Berry[\s\S]*Star Candies/);
        if(command==='adventure') {
          assert(result.content.includes(region.name+' Adventures'));
          assert(!result.content.includes('not available'));
        }
        if(command==='attack') assert.equal(result.content,activeAdventure
          ? "There isn't an enemy to attack right now. Continue your Adventure by choosing /left, /right, or /forward."
          : 'You are not currently in an Adventure. Start one with /adventure.');
        if(command==='cast') assert.equal(result.content,activeAdventure
          ? "There isn't an enemy to cast Moonbeam at yet."
          : 'You are not currently in an Adventure. Start one with /adventure.');
        receipts.push({region:region.id,activeAdventure,command});
      }
      if(region.id==='moonlit-reef' && activeAdventure) {
        // Negative control: an upload of root source reproduces the reported pattern.
        const wrong=await runtime(fs.readFileSync(path.join(root,'worker.js'),'utf8'),
          {initialize:false,accountId:'987654321'});
        for(const [key,value] of startingState)wrong.values.set(key,value);
        assert.match((await wrong.run('shop')).content,/Items for Sale/);
        assert.match((await wrong.run('attack')).content,/There isn't an enemy to attack/);
        assert.equal((await wrong.run('adventure')).content,
          'Adventures are not available in Moonlit Reef right now.');
        await assert.rejects(wrong.c.getRegionCombatEntries('moonlit-reef'),
          /Missing bundled game content: enemies\/moonlit-reef\/index.json/);
        assert.equal((await wrong.run('cast',spellOptions('moonbeam'))).content,fallback);
        const diagnostic=wrong.errors.find(e=>e[0]==='Astral Sea runtime failure')[1];
        assert.equal(diagnostic.stage,'content.bundle');
        assert.equal(diagnostic.errorMessage,
          'Missing bundled game content: spells/elf-blessing.json. Rebuild dist/worker.js.');
      }
    }
  }
  for(const [label,command,options,setup] of scenarios) {
    const player=await runtime(source);if(setup)await setup(player);
    const result=await player.run(command,options);
    assert(!result.content.includes(fallback),label);
    assert.equal(player.errors.length,0,label);
    assert.equal(result.counts.content,0,label);
    assert(Object.values(result.counts.writes).every(count=>count<=1),label);
    if(label==='journal') assert.match(result.content,/Shizuki's Travel Journal/);
    if(label==='explore') assert.match(result.content,/\+\d+ XP/);
    if(label==='adventure reward') assert.match(result.content,/You gain \d+ XP/);
    if(label==='victory/reward' || label==='level-up unlock') {
      assert.match(result.content,/defeated!/);
      assert.equal(await player.state(),null);
    }
    if(label==='level-up unlock') {
      assert.match(result.content,/Level Up: Level 50/);
      assert.equal(player.c.levelFromXp((await player.progress()).xp),50);
    }
    if(label==='Storyteller threshold') {
      assert.match(result.content,/Storyteller Activated!/);
      const state=await player.state();
      assert.equal(state.storytellerChapter,1);
      assert.equal(state.helpUsed,true);
      assert.equal(state.enemy.hp,222);
    }
  }
  console.log('Artifact smoke: 48 sequence commands across all 6 regions, 27 architecture scenarios, root-upload negative control passed.');
  console.log('Real family loaders: 621/621 documents matched source; zero content requests. '+JSON.stringify(categories));
  return {categories,sequenceCommands:receipts.length};
}
module.exports={main};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
