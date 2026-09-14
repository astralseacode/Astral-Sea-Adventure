// Run: node scripts/test-discord-long-response.cjs. No network or live KV.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./test-leviathans-wake.cjs');

const plain = value => JSON.parse(JSON.stringify(value));
const limit = 1900;

async function deliveryFixture(content, ephemeral = false) {
  const f = await fixture(50);
  f.c.Response = Response;
  f.c.setTimeout = setTimeout;
  const calls = [];
  const pending = [];
  const errors = [];
  let resolutions = 0;
  f.c.console = { log: () => {}, error: (...args) => errors.push(args) };
  f.c.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return { ok: true, status: 200 };
  };
  f.c.handleDiscordInteractionCore = async () => {
    resolutions += 1;
    return f.c.discordMessage(content, ephemeral);
  };
  const request = new Request('https://offline.invalid/discord/interactions', {
    method: 'POST', body: JSON.stringify({
      type: 2, application_id: '123456789', token: 'offline-token',
    }),
  });
  const ctx = { waitUntil: promise => pending.push(promise) };
  const response = await f.c.handleDiscordInteraction(request, {}, ctx);
  await Promise.all(pending);
  return { f, response: await response.json(), calls, errors, resolutions, pending };
}

(async () => {
  const f = await fixture(50);
  const split = f.c.splitDiscordContent;
  for (const content of ['short', 'x'.repeat(limit), 'x'.repeat(limit + 1),
    'x'.repeat(5000), '🌌'.repeat(1300)]) {
    const chunks = plain(split(content));
    assert.equal(chunks.join(''), content);
    assert(chunks.every(chunk => chunk.length > 0 && chunk.length <= limit));
    if (content.length <= limit) assert.equal(chunks.length, 1);
    else assert(chunks.length > 1);
    assert(chunks.every(chunk => !/[\uD800-\uDBFF]$/.test(chunk)));
    assert(chunks.every(chunk => !/^[\uDC00-\uDFFF]/.test(chunk)));
  }
  const paragraphs = 'a'.repeat(1400) + '\n\n' + 'b'.repeat(700);
  assert.equal(split(paragraphs)[0], 'a'.repeat(1400) + '\n\n');
  const lines = 'a'.repeat(1400) + '\n' + 'b'.repeat(700);
  assert.equal(split(lines)[0], 'a'.repeat(1400) + '\n');
  const whitespace = 'a'.repeat(1400) + ' ' + 'b'.repeat(700);
  assert.equal(split(whitespace)[0], 'a'.repeat(1400) + ' ');
  assert.deepEqual(plain(split('🌌🌌', 2)), ['🌌', '🌌']);

  const short = await deliveryFixture('hello');
  assert.equal(short.response.data.content, 'hello');
  assert.equal(short.calls.length, 0);
  assert.equal(short.resolutions, 1);
  assert.equal(short.pending.length, 0);
  const exact = await deliveryFixture('x'.repeat(limit));
  assert.equal(exact.calls.length, 0);
  const above = await deliveryFixture('x'.repeat(limit + 1), true);
  assert.equal(above.response.type, 4);
  assert.equal(above.response.data.flags, 64);
  assert.deepEqual(plain(above.response.data.allowed_mentions), { parse: [] });
  assert.equal(above.calls.length, 1);
  assert.equal(above.resolutions, 1);
  assert.equal(above.calls[0].url,
    'https://discord.com/api/v10/webhooks/123456789/offline-token');
  assert.equal(above.calls[0].body.flags, 64);
  assert.deepEqual(above.calls[0].body.allowed_mentions, { parse: [] });
  assert.equal(above.response.data.content + above.calls[0].body.content,
    'x'.repeat(limit + 1));

  const definition = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
    'data/adventures/astral-nexus/adventure-30-heart-of-the-astral-sea.json'), 'utf8'));
  const boss = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
    'data/enemies/bosses/astral-nexus/heart-of-the-nexus-boss.json'), 'utf8'));
  const combat = await fixture(50);
  await combat.editState(state => {
    state.regionId = 'astral-nexus';
    state.encounterNumber = 30;
    state.enemy = { ...boss, hp: 1, maxHp: boss.hp };
    state.adventureContext = {
      adventureId: definition.id, adventureNumber: 30,
      roomId: 'open-horizon', nextRoomId: null, isBoss: true,
    };
  });
  combat.rolls.push(10);
  const victory = await combat.attack();
  assert.equal(victory.won, true);
  assert.equal(await combat.state(), null);
  assert(victory.message.includes(definition.completionText));
  assert.equal(definition.completionText.length, 2384);
  const writesAfterVictory = combat.writes.length;
  const delivered = await deliveryFixture(victory.message);
  const chunks = [delivered.response.data.content,
    ...delivered.calls.map(call => call.body.content)];
  assert.equal(chunks.join(''), victory.message);
  assert(chunks.every(chunk => chunk.length <= limit));
  assert.equal(delivered.resolutions, 1);
  assert.equal(combat.writes.length, writesAfterVictory);
  assert(delivered.calls.every(call =>
    JSON.stringify(call.body.allowed_mentions) === '{"parse":[]}'));

  const binaryReceipt = 'Shots: ' + Array.from({ length: 140 },
    (_, index) => index % 2).join(', ') + '\n\n140 shots resolved.';
  const synthetic = binaryReceipt + '\n\n' + victory.message;
  const long = await deliveryFixture(synthetic);
  const longChunks = [long.response.data.content,
    ...long.calls.map(call => call.body.content)];
  assert.equal(longChunks.join(''), synthetic);
  assert(longChunks.every(chunk => chunk.length <= limit));
  assert.equal(long.resolutions, 1);

  const failed = await fixture(50);
  failed.c.Response = Response;
  failed.c.setTimeout = setTimeout;
  const failures = [];
  const pending = [];
  let resolutionCount = 0;
  failed.c.console = { log: () => {}, error: (...args) => failures.push(args) };
  failed.c.fetch = async () => ({ ok: false, status: 503 });
  failed.c.handleDiscordInteractionCore = async () => {
    resolutionCount += 1;
    return failed.c.discordMessage('x'.repeat(limit + 1));
  };
  const failedRequest = new Request('https://offline.invalid/discord/interactions', {
    method: 'POST', body: JSON.stringify({ type: 2,
      application_id: '123456789', token: 'offline-token' }),
  });
  const failedResponse = await failed.c.handleDiscordInteraction(failedRequest,
    {}, { waitUntil: promise => pending.push(promise) });
  assert.equal((await failedResponse.json()).data.content.length, limit);
  await Promise.all(pending);
  assert.equal(resolutionCount, 1);
  assert.equal(failures.length, 1);

  console.log('Discord long-response regressions passed:',
    `final ${victory.message.length} chars → ${chunks.length} messages`,
    chunks.map(chunk => chunk.length).join(', '));
})().catch(error => { console.error(error); process.exitCode = 1; });
