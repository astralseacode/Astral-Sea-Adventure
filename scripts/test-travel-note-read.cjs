// Offline Travel Note display tests. No live KV or network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const values = new Map();
const writes = [];
const context = vm.createContext({ console, structuredClone, Math, fetch: () => { throw Error('network'); } });
vm.runInContext(source.replace('export default {', 'const workerExport = {'), context);
context.fetchCachedJson = async (key, url) => {
  const relative = url.split('/main/data/')[1];
  return JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8'));
};
const env = { Backpack: {
  get: async key => values.get(key) ?? null,
  put: async (key, value) => { writes.push(key); values.set(key, value); },
  delete: async key => { writes.push(key); values.delete(key); },
} };
const key = 'travel-notes-test';
async function main() {
  assert.equal(vm.runInContext('DISCORD_COMMANDS.filter(command => command.name === "read").length', context), 1);
  const progress = context.createEmptyProgress();
  progress.xp = context.totalXpForLevel(50);
  progress.currentRegion = 'astral-nexus';
  await context.savePlayerProgress(env, key, progress);
  const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/notes/astral-nexus.json'), 'utf8'));
  const empty = (await context.performReadJournal(env, key)).message;
  assert.equal((empty.match(/Continue exploring to find this note\./g) || []).length, notes.length);
  assert(!empty.includes(notes[0].title));
  assert(!empty.includes(notes[0].text));
  progress.notes[notes[0].id] = true;
  progress.notes[notes.at(-1).id] = true;
  await context.savePlayerProgress(env, key, progress);
  const before = writes.length;
  const journal = (await context.performReadJournal(env, key)).message;
  assert(writes.slice(before).every(key => key !== context.getProgressKey('travel-notes-test')));
  assert(journal.includes(`1. ${notes[0].title}\n${notes[0].text}`));
  assert(journal.includes(`${notes.length}. ${notes.at(-1).title}\n${notes.at(-1).text}`));
  assert(journal.indexOf('1. ') < journal.indexOf('2. ') && journal.indexOf('2. ') < journal.indexOf(`${notes.length}. `));
  assert.equal(context.splitDiscordContent(journal).join(''), journal);
  assert(context.splitDiscordContent(journal).length > 1);
  assert((await context.performReadNote(env, key, 'astral-nexus', 1, 'discord')).message.includes(notes[0].text));
  const exploreLog = JSON.parse(fs.readFileSync(path.join(root, 'data/explore/astral-nexus.json'), 'utf8'))[0];
  context.selectWeightedExplore = () => exploreLog;
  context.rollTravelNote = () => notes[1].id;
  context.randomInteger = minimum => minimum;
  const firstExplore = await context.performExplore(env, key, 'discord');
  assert(firstExplore.message.includes(exploreLog.message.replaceAll('{reward}', String(firstExplore.reward))));
  assert(firstExplore.message.includes(`Travel Note Discovered — Astral Nexus #2: ${notes[1].title}\n\n${notes[1].text}`));
  assert(!firstExplore.message.includes('Use /note'));
  assert.equal((await context.getPlayerProgress(env, key)).notes[notes[1].id], true);
  assert.equal(context.splitDiscordContent(firstExplore.message).join(''), firstExplore.message);
  const secondExplore = await context.performExplore(env, key, 'discord');
  assert(!secondExplore.message.includes('Travel Note Discovered'));
  assert(secondExplore.message.includes('Duplicate Travel Note'));
  context.rollTravelNote = () => null;
  const noNote = await context.performExplore(env, key, 'discord');
  assert(!noNote.message.includes('Travel Note'));
  values.set(context.getProgressKey(key), JSON.stringify({ ...progress, currentRegion: 'stale-region' }));
  assert.match((await context.performReadJournal(env, key)).message, /current region is unavailable/);
  console.log('PASS Travel Notes: journal, explore discovery and duplicate, canonical text, long delivery, malformed state, /note');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
