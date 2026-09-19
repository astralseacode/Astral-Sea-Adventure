// Offline /explore combination and Discord delivery regressions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const logs = JSON.parse(fs.readFileSync(path.join(root, 'data/explore/moonlit-reef.json'), 'utf8'));
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/notes/moonlit-reef.json'), 'utf8'));

function count(text, part) { return text.split(part).length - 1; }

async function fixture({ berry, levelUp, luck, long } = {}) {
  const values = new Map();
  const writes = [];
  const random = Object.create(Math);
  random.random = () => berry ? 0 : 0.99;
  const followups = [];
  const c = vm.createContext({ console, structuredClone, Math: random, Request, Response,
    setTimeout, fetch: async (url, options) => {
      followups.push({ url, body: JSON.parse(options.body) });
      return { ok: true, status: 200 };
    } });
  vm.runInContext(source.replace('export default {', 'const workerExport = {'), c);
  c.fetchCachedJson = async (key, url) => {
    const relative = url.split('/main/data/')[1];
    assert(relative, `Unexpected content URL: ${url}`);
    return JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8'));
  };
  const authoredLog = long ? logs.find(entry => entry.message.length > 200) || logs[0] : logs[0];
  const log = long ? { ...authoredLog, xp: c.totalXpForLevel(20) - (c.totalXpForLevel(5) - 1) } : authoredLog;
  const note = long ? notes.reduce((best, item) => item.text.length > best.text.length ? item : best) : notes[0];
  c.selectWeightedExplore = () => log;
  c.rollTravelNote = () => note.id;
  c.randomInteger = minimum => minimum;
  const env = { Backpack: {
    get: async key => values.get(key) ?? null,
    put: async (key, value) => { writes.push(key); values.set(key, value); },
    delete: async key => { writes.push(key); values.delete(key); },
  } };
  const key = `combination-${berry}-${levelUp}-${luck}-${long}`;
  const progress = c.createEmptyProgress();
  progress.currentRegion = 'moonlit-reef';
  progress.xp = long ? c.totalXpForLevel(5) - 1
    : levelUp ? c.totalXpForLevel(5) - log.xp : c.totalXpForLevel(5);
  progress.berries = 3;
  if (luck) progress.stats.luck = 5;
  await c.savePlayerProgress(env, key, progress);
  const startingCandy = await c.getBackpackTotal(env, key);
  const startingXp = progress.xp;
  const startingWrites = writes.length;
  return { c, env, key, writes, startingWrites, startingXp, startingCandy,
    note, log, followups, berry, levelUp, luck, expectedLevel: long ? 20 : 5 };
}

async function verify(f, message, result) {
  const { c, env, key, writes, startingWrites, startingXp, startingCandy,
    note, log, berry, levelUp, luck, expectedLevel } = f;
  const saved = JSON.parse(await env.Backpack.get(c.getProgressKey(key)));
  const scene = log.message.replaceAll('{reward}', String(result.reward));
  const header = `Travel Note Discovered — Moonlit Reef #${note.number}: ${note.title}`;
  assert.equal(count(message, scene), 1, 'authored scene appears once');
  assert.equal(count(message, `+${result.earnedXp} XP`), 1, 'XP receipt appears once');
  assert.equal(saved.xp, startingXp + result.earnedXp, 'XP granted once');
  assert.equal(count(message, `Backpack: ${result.total} Star Candies`), 1);
  assert.equal(result.total, startingCandy + result.reward, 'candies granted once');
  assert.equal(await c.getBackpackTotal(env, key), result.total);
  assert.equal(count(message, header), 1);
  assert.equal(count(message, note.title), 1);
  assert.equal(count(message, note.text), 1);
  assert.equal(saved.notes[note.id], true);
  assert.equal(count(message, 'Use /note'), 0);
  assert(message.indexOf(scene) < message.indexOf('Backpack:'));
  assert(message.indexOf('Backpack:') < message.indexOf(header));
  assert(writes.slice(startingWrites).some(item => item === c.getProgressKey(key)),
    'exploration persists its final progress');
  if (berry) {
    assert.equal(saved.berries, 4);
    assert.equal(count(message, 'Found 1 Berry! Berries: 4'), 1);
    assert(message.indexOf('Found 1 Berry!') < message.indexOf(header));
  } else assert.equal(saved.berries, 3);
  if (luck) {
    const bonus = c.applyLuckToCandyReward(log.reward.min, saved).bonus;
    assert(bonus > 0);
    assert.equal(count(message, `Luck Bonus: +${bonus} Star Candies`), 1);
    assert.equal(result.reward, log.reward.min + bonus);
  }
  if (levelUp) {
    assert.equal(result.level, expectedLevel);
    assert.equal(c.levelFromXp(saved.xp), expectedLevel);
    assert.equal(count(message, `LEVEL UP! You reached Level ${expectedLevel}!`), 1);
    const unlocks = await c.formatLevelUpUnlocks(4, expectedLevel);
    assert(unlocks.length > 0);
    for (const unlock of unlocks) assert.equal(count(message, unlock), 1);
    assert(message.indexOf('LEVEL UP!') < message.indexOf(header));
  } else assert.equal(count(message, 'LEVEL UP!'), 0);
}

async function direct(options) {
  const f = await fixture(options);
  const result = await f.c.performExplore(f.env, f.key, 'discord');
  await verify(f, result.message, result);
  return result;
}

async function deliveredCombined() {
  const f = await fixture({ berry: true, levelUp: true, luck: true, long: true });
  let resolutionCount = 0;
  let result;
  f.c.handleDiscordInteractionCore = async () => {
    resolutionCount += 1;
    result = await f.c.performExplore(f.env, f.key, 'discord');
    return f.c.discordMessage(result.message);
  };
  const pending = [];
  const request = new Request('https://offline.invalid/discord/interactions', {
    method: 'POST', body: JSON.stringify({ type: 2, application_id: '123456789', token: 'offline-token' }),
  });
  const response = await f.c.handleDiscordInteraction(request, f.env,
    { waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
  const initial = await response.json();
  const delivered = initial.data.content + f.followups.map(item => item.body.content).join('');
  assert.equal(delivered, result.message);
  assert.equal(resolutionCount, 1);
  assert(f.followups.length > 0, 'combined receipt must exercise Discord follow-up delivery');
  assert(f.c.splitDiscordContent(result.message).every(chunk => chunk.length <= 1900));
  assert(f.followups.every(item => item.body.allowed_mentions.parse.length === 0));
  await verify(f, delivered, result);
}

(async () => {
  await direct({ berry: true, levelUp: false, luck: true });
  await direct({ berry: false, levelUp: true, luck: false });
  await deliveredCombined();
  console.log('PASS /explore note+Berry, note+Level 5, note+Berry+multi-unlock Discord follow-ups');
})().catch(error => { console.error(error); process.exitCode = 1; });
