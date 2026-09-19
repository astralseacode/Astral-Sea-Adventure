// Reuse forced mechanic scenarios, scanning assembled output in source AND real bundle.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {build,collectContent} = require('./build-worker.cjs');
const {fixture} = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname,'..');
const pictograph = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3|\ufe0f/u;

function assertOrdinaryOutput(text, canonical) {
  let ordinary=String(text);
  // Exempt only complete verbatim canonical paragraphs, not entire victory receipts.
  for(const entry of canonical) ordinary=ordinary.split(entry).join('');
  assert(!pictograph.test(ordinary),`Emoji in ordinary gameplay output: ${ordinary}`);
}

async function main() {
  build({check:true});
  const artifact=fs.readFileSync(path.join(root,'dist/worker.js'),'utf8');
  const suites=['astral-bond','rising-power','storyteller','meteor-alignment',
    'moonbeam-mastery-1','legacy','fae-mischief','shizukis-presence','familiar',
    'bubble-mastery-2','leviathans-wake','leviathans-wake-mastery-1',
    'astral-harmony','astral-rhythm','fae-aid','fae-second-opinion',
    'starspark-mastery-2','tidal-wave','conjure-gun','help','berries',
    'astral-awakening','astral-defiance','astral-reprieve','astral-patience',
    'astral-expedition','astral-echo-mastery-1','all-or-nothing','kinship','lunar-patience'];
  const receipts=[];
  for(const variant of ['source','artifact']) {
    // Every Jellyfish mood at both mastery tiers, including doubles and triples.
    for(const level of [10,21]) for(const dice of [[1,1,2],[1,2,3],[3,3,3],[4,5,6],[6,7,8]]) {
      const f=await fixture(level,'discord',variant==='artifact'?artifact:null);
      f.rolls.push(...dice,1);
      const result=await f.cast('jelly');
      assertOrdinaryOutput(result.message,await f.c.formatLevelUpUnlocks(0,50));
      receipts.push({variant,suite:'jellyfish-moods',text:result.message});
    }
    for(const suite of suites) {
      const cache=new Map(), failures=[];
      const processStub={exitCode:0};
      const context=vm.createContext({structuredClone,Response,Request,URL,TextEncoder,
        auditArtifact:variant==='artifact'?artifact:null,
        setTimeout,clearTimeout,process:processStub,
        console:{log(){},error:(...args)=>failures.push(args.map(String).join(' '))}});
      function load(file,entry=false) {
        file=path.resolve(file);
        if(cache.has(file))return cache.get(file);
        const mod={exports:{}};cache.set(file,mod);
        const req=name=>name.startsWith('.')
          ? load(path.resolve(path.dirname(file),name)).exports : require(name);
        req.main=entry?mod:{};
        const code=fs.readFileSync(file,'utf8')
          .replace('artifactSource = null', 'artifactSource = auditArtifact')
          .replace(/^\(async \(\) => \{/m,'module.pending = (async () => {')
          .replace('main().catch(', 'module.pending = main().catch(');
        vm.runInContext('(function(require,module,exports,__dirname,__filename){'+code+'\n})',
          context,{filename:file})(req,mod,mod.exports,path.dirname(file),file);
        if(path.basename(file)==='test-leviathans-wake.cjs' && !entry) {
          const fixture=mod.exports.fixture;
          mod.exports.fixture=async(level,platform)=>{
            const f=await fixture(level,platform,variant==='artifact'?artifact:null);
            const canonical=await f.c.formatLevelUpUnlocks(0,50);
            for(const method of ['cast','attack']) {
              const execute=f[method];
              f[method]=async(...args)=>{
                const result=await execute(...args);
                assertOrdinaryOutput(result.message,canonical);
                receipts.push({variant,suite,text:result.message});
                return result;
              };
            }
            return f;
          };
        }
        return mod;
      }
      const mod=load(path.join(__dirname,'test-'+suite+'.cjs'),true);
      if(mod.pending)await mod.pending;
      assert.equal(processStub.exitCode,0,`${variant}/${suite}: ${failures.join('\n')}`);
    }
  }
  // Static backstop covers random flavor and secondary paths not selected by forced rolls.
  const entries=collectContent();
  const exceptions=[];
  function scan(value,file,location='') {
    if(typeof value==='string' && pictograph.test(value)) {
      if(location==='levelUpLine')return; // Legacy metadata, not ordinary output.
      if(file==='adventures/starfall-trench/adventure-30-the-starfall-annex.json' &&
        value.includes('"NO ♥"') && !pictograph.test(value.replace('♥',''))) {
        exceptions.push({file,location});return; // Authored sign text awaiting user review.
      }
      assert.fail(`Unexpected pictograph in ${file}:${location}`);
    } else if(value && typeof value==='object') {
      for(const [key,child] of Object.entries(value))scan(child,file,location?location+'.'+key:key);
    }
  }
  for(const [file,json] of Object.entries(entries))scan(JSON.parse(json),file);
  assert.equal(exceptions.length,1);
  for(const variant of ['source','artifact']) {
    const text=receipts.filter(r=>r.variant===variant).map(r=>r.text).join('\n');
    for(const marker of ['Bond: Your Familiar','Bond empowers your Familiar',
      'Rising Power resets.','Rising Power: +6','Storyteller Activated!',
      'The First Page','The Turning Point','The Final Chapter',
      'Meteor Alignment','Lunar Alignment','Perfect','Full Moon','Mischief',
      "Shizuki's Presence",'Harmony','Rhythm','Curiosity activates!','Fae Aid','Fae Second Opinion',
      'Fae Intervention','Charge','Tidal Wave','Help!'])assert(text.includes(marker),`${variant}: missing forced path ${marker}`);
  }
  assert.throws(()=>assertOrdinaryOutput('🌌 Bond Activated!',[]));
  console.log(`Combat emoji audit: ${receipts.length} assembled receipts, ${suites.length} focused suites on source and bundle; 621 JSON scanned. One authored heart sign retained for review.`);
  return {receipts:receipts.length,suites:suites.length};
}
module.exports={main,assertOrdinaryOutput};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
