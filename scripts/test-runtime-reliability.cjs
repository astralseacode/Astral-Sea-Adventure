// Offline only. Real Discord handlers; local content, fake signatures, in-memory KV.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fixture } = require('./test-leviathans-wake.cjs');
const root = path.resolve(__dirname, '..');
const turbulence = 'The Astral Sea is unusually turbulent. Please try again shortly.';

async function discordFixture(seed = 12345) {
  const f = await fixture(50);
  const errors = [], pending = [], deliveries = [];
  Object.assign(f.c, { Response, Request, URL, setTimeout: fn => { fn(); },
    console: { log() {}, error: (...args) => errors.push(args) } });
  f.c.verifyDiscordRequest = async () => true;
  f.c.fetch = async (url, options) => {
    assert(String(url).startsWith('https://discord.com/api/'));
    deliveries.push(JSON.parse(options.body));
    return { ok: true, status: 200 };
  };
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  f.math.random = next;
  f.c.randomInteger = (min, max) => {
    const value = f.rolls.length ? f.rolls.shift() : min + Math.floor(next() * (max-min+1));
    assert(value >= min && value <= max);
    return value;
  };
  const backing = f.env.Backpack;
  const env = { DISCORD_PUBLIC_KEY: 'offline', Backpack: Object.fromEntries(
    ['get','put','delete'].map(method => [method, (key, ...args) =>
      backing[method](key.replace('backpack:discord:123456789', f.key), ...args)]),
  ) };
  const worker = vm.runInContext('workerExport', f.c);
  f.command = async (name, spell) => {
    const firstDelivery = deliveries.length;
    const response = await worker.fetch(new Request('https://offline.invalid/discord/interactions', {
      method: 'POST', headers: { 'X-Signature-Ed25519': 'offline', 'X-Signature-Timestamp': '1' },
      body: JSON.stringify({ type: 2, application_id: '123456789', token: 'offline-token',
        user: { id: '123456789' }, data: { name,
          ...(spell === undefined ? {} : { options: [{ name: 'spell', value: spell }] }) } }),
    }), env, { waitUntil: promise => pending.push(promise) });
    await Promise.all(pending.splice(0));
    const text = await response.text();
    let payload; try { payload = JSON.parse(text); } catch {}
    const content = (payload?.data?.content || text) + deliveries.slice(firstDelivery).map(d => d.content).join('');
    return { status: response.status, content, payload };
  };
  f.errors = errors; f.deliveries = deliveries; f.discordEnv = env;
  await f.editProgress(p => { p.stats.focus = 10; p.stats.vitality = 5; p.restBufferType = "long"; p.mana = 250; p.hp = 200; });
  await f.editState(s => { s.playerHp = 200; s.playerMaxHp = 200; });
  return f;
}

async function screenshot() {
  const names = ['help','help!','moonbeam','jelly','star','tidal','gun','echo','familiar','elf blessing','mend','bubble','evocation','wake'];
  for (const name of names) {
    const f = await discordFixture();
    await f.editState(s => { s.enemy.hp = 443; s.enemy.maxHp = 443; s.enemy.damageBonus = 15; });
    f.rolls.push(17,13);
    const cast = await f.command('cast','Help!');
    assert(cast.content.includes('Enemy HP removed: 221\nEnemy HP remaining: 222\nMana taken: 125\nMana remaining: 125'));
    assert(cast.content.includes('HP 170/200 \u00b7 MP 125/250 \u00b7 Enemy 222/443'));
    const next = await f.command('cast',name);
    assert(!next.content.includes(turbulence), name);
    assert.equal(f.errors.length, 0, name);
    if (name.startsWith('help')) assert(next.content.includes('already cast Help!'));
  }
  console.log('Screenshot: 14 subsequent spell inputs passed, including both repeat Help aliases.');
}

async function stress(iterations = 1000) {
  const f = await discordFixture(0x51EA);
  const spells = ['help','moonbeam','jelly','star','tidal','gun','echo','familiar','elf blessing','mend','bubble','evocation','wake','falling star','berries','all or nothing'];
  let victories = 0, encounters = 1, maximumStoredBytes = 0;
  for (let i = 0; i < iterations; i++) {
    if (!(await f.state())) {
      await f.editProgress(p => { p.hp = 200; p.mana = 250; });
      await f.c.startCombatEncounter(f.env,f.key,f.c.getRegionById('moonlit-reef'),1,
        { ...f.enemy, hp: 443 },'discord');
      encounters++;
    }
    // Local preparation supplies enough resources to keep exercising cast branches.
    if (i % 17 === 0) await f.editProgress(p => { p.mana = 300; });
    if (i % 31 === 0) await f.editState(s => { s.enemy.hp = 1; });
    const result = i % 5 === 0 ? await f.command('attack') : await f.command('cast',spells[i % spells.length]);
    assert(!result.content.includes(turbulence), `command ${i}: ${f.errors.map(e=>String(e.at(-1))).join('; ')}`);
    assert.equal(result.status, 200);
    for (const value of f.values.values()) {
      maximumStoredBytes = Math.max(maximumStoredBytes, new TextEncoder().encode(value).length);
    }
    if (!(await f.state())) victories++;
  }
  assert.equal(f.errors.length, 0);
  console.log(`Stress: ${iterations} sequential Discord commands, ${encounters} encounters, ${victories} completed battles; zero exceptions.`);
  console.log(`Largest stored fixture value: ${maximumStoredBytes} bytes.`);
}

async function platformProbes() {
  const { runtime, spellOptions } = require('./test-free-tier.cjs');
  const source = fs.readFileSync(path.join(root, 'dist/worker.js'), 'utf8');
  const f = await runtime(source, { budget: 50 });
  f.limitWrites(async (_key, count) => {
    if (count > 1) throw new Error('KV PUT failed: 429 Too Many Requests');
  });
  const result = await f.run('cast', spellOptions('moonbeam'));
  assert(!result.content.includes(turbulence));
  assert.equal(result.counts.content, 0);
  assert.equal(result.counts.writes['progress:' + f.key], 1);

  const failed = await runtime(source);
  failed.limitWrites(async () => { throw new Error('KV PUT failed: 429 Too Many Requests'); });
  const failure = await failed.run('cast', spellOptions('moonbeam'));
  assert(failure.content.includes(turbulence));
  assert.equal(Object.values(failure.counts.writes).reduce((a,b) => a+b, 0), 1);
  assert.equal(failed.errors.find(e => e[0] === 'Astral Sea runtime failure')[1].stage, 'kv.progress.put');
  console.log('Platform probes: cold cast uses zero fetches and one progress write; failed commit does not attempt rollback writes.');
}

async function diagnostics() {
  const f = await discordFixture();
  f.discordEnv.DISCORD_BOT_TOKEN = 'private-bot-secret';
  f.discordEnv.SETUP_SECRET = 'private-setup-secret';
  f.discordEnv.Backpack.get = async () => {
    throw new TypeError('Storage failed private-bot-secret private-setup-secret offline-token https://discord.com/api/webhooks/123456789/offline-token backpack:discord:123456789');
  };
  const result = await f.command('cast', 'moonbeam');
  assert.equal(result.payload.data.content, turbulence);
  const record = f.errors.find(e => e[0] === 'Astral Sea runtime failure')[1];
  assert.equal(record.errorName, 'TypeError');
  assert.equal(record.stage, 'kv.progress.get');
  assert.equal(record.command, 'cast');
  assert.equal(record.responseState, 'not-prepared');
  const serialized = JSON.stringify(record);
  for (const secret of ['private-bot-secret','private-setup-secret','offline-token','123456789','backpack:discord','https://discord.com']) assert(!serialized.includes(secret));
  assert(record.stack.includes('TypeError'));

  const malformed = await discordFixture();
  const get = malformed.discordEnv.Backpack.get;
  malformed.discordEnv.Backpack.get = (key, ...args) => key.startsWith('progress:')
    ? Promise.resolve('{"private-player-field": invalid}') : get(key, ...args);
  await malformed.command('cast','help');
  const normalization = malformed.errors.find(e => e[0] === 'Astral Sea runtime failure')[1];
  assert.equal(normalization.stage, 'state.progress.normalize');
  assert.equal(normalization.errorName, 'SyntaxError');
  assert(!JSON.stringify(normalization).includes('private-player-field'));

  const followup = await discordFixture();
  let runs = 0;
  followup.c.handleDiscordInteractionCore = async () => {
    runs++; return followup.c.discordMessage('x'.repeat(4000));
  };
  followup.c.fetch = async () => ({ ok: false, status: 503 });
  const delivered = await followup.command('cast','help');
  assert.equal(runs, 1);
  assert(!delivered.content.includes(turbulence));
  assert.equal(delivered.content.length, 1900);
  const deliveryRecord = followup.errors.find(e => e[0] === 'Astral Sea runtime failure')[1];
  assert.equal(deliveryRecord.stage, 'discord.followup.delivery');
  assert.equal(deliveryRecord.responseState, 'initial-prepared-followups-scheduled');
  console.log('Diagnostics: command/stage/message/stack, secret redaction, and follow-up failure without gameplay rerun passed.');
}

async function main() { await screenshot(); await stress(); await platformProbes(); await diagnostics(); }
module.exports = { main, discordFixture, screenshot, stress, platformProbes };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
