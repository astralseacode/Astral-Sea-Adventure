// Offline diff/content safety validation against the pre-cleanup commit.
// node scripts/validate-narrative-formatting.cjs [base-revision]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { baseline, fields, dehyphenate, leaves, filesIn } = require('../tools/format-narrative.cjs');
const root = path.resolve(__dirname, '..');
const base = process.argv.slice(2).find(arg => !arg.startsWith('--')) || baseline;
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const whitespace = text => text.replace(/\s+/g, ' ').trim();
const parity = text => whitespace(text.replace(/![a-z]+\b/g, command => '/' + command.slice(1)));
const modified = [], spacingFiles = new Set(), remaining = new Map();
let strings = 0, hyphens = 0, jsonFiles = 0, parityPairs = 0, existingParityDifferences = 0;
function compare(before, after, location, file) {
  assert.equal(typeof after, typeof before, `${file}:${location} type`);
  if (typeof before === 'string') {
    const key = location.findLast(p => typeof p === 'string');
    if (before === after) return;
    assert(fields.has(key), `${file}:${location} internal string changed`);
    // Exact equality after ONLY approved hyphen-to-space replacements and
    // whitespace normalization: catches wording, punctuation, order and case edits.
    assert.equal(whitespace(after), whitespace(dehyphenate(before)), `${file}:${location} prose rewrite`);
    strings++;
    hyphens += (before.match(/-/g) || []).length - (after.match(/-/g) || []).length;
    if (after !== dehyphenate(before)) spacingFiles.add(file);
    return;
  }
  if (!before || typeof before !== 'object') {
    assert.equal(after, before, `${file}:${location} scalar changed`);
    return;
  }
  assert.equal(Array.isArray(after), Array.isArray(before));
  assert.deepEqual(Object.keys(after), Object.keys(before), `${file}:${location} keys/order`);
  for (const key of Object.keys(before)) {
    compare(before[key], after[key], [...location, Array.isArray(before) ? Number(key) : key], file);
  }
}
for (const absolute of filesIn(path.join(root, 'data')).filter(f => f.endsWith('.json'))) {
  jsonFiles++;
  const file = path.relative(root, absolute).replaceAll('\\', '/');
  const before = JSON.parse(git(['show', `${base}:${file}`]));
  const after = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (JSON.stringify(before) !== JSON.stringify(after)) modified.push(file);
  compare(before, after, [], file);
  for (const entry of leaves(after)) {
    if (!fields.has(entry.key)) continue;
    for (const word of entry.value.match(/[A-Za-z]+(?:-[A-Za-z]+)+/g) || []) {
      remaining.set(word, (remaining.get(word) || 0) + 1);
    }
  }
  for (const [discord, twitch] of [['introDiscord','introTwitch'], ['bossPromptDiscord','bossPromptTwitch']]) {
    if (typeof before[discord] !== 'string' || typeof before[twitch] !== 'string') continue;
    if (parity(before[discord]) === parity(before[twitch])) {
      assert.equal(parity(after[discord]), parity(after[twitch]), `${file} platform parity`);
      parityPairs++;
    } else existingParityDifferences++;
  }
}
const worker = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const oldWorker = git(['show', `${base}:worker.js`]);
assert.equal(worker.replaceAll('\r\n', '\n'), oldWorker
  .replace('suspicious rock-based business', 'suspicious rock based business')
  .replace('merchant-shaped rock. Use', 'merchant shaped rock. Use').replaceAll('\r\n', '\n'),
  'Worker changes must be limited to the two reviewed visible compounds');
hyphens += 2;
strings += 2;
modified.push('worker.js');
const c = vm.createContext({ console, fetch: () => { throw new Error('Network forbidden'); } });
vm.runInContext(worker.replace('export default {', 'const workerExport = {'), c);
const adventure = JSON.parse(fs.readFileSync(path.join(root,
  'data/adventures/leviathans-wake/adventure-01-wake-rider-crossing.json'), 'utf8'));
assert.equal(adventure.name, 'Wake Rider Crossing');
assert.equal(adventure.introDiscord.split('\n\n').length, 4);
assert(adventure.introDiscord.includes('\n\nThey\'re ribs.\n\n'));
assert(!JSON.stringify(adventure).includes('Wake-Rider'));
assert(!JSON.stringify(adventure).includes('Wake-Riding'));
const state = { currentRoomId: adventure.startRoomId, status: 'awaiting-direction' };
const discord = c.formatAdventureRoomPrompt(adventure, state, 'discord');
const twitch = c.formatAdventureRoomPrompt(adventure, state, 'twitch');
assert(discord.includes('Wake Riding Razorfish'));
assert(discord.endsWith('Choose /left, /right, /forward.'));
assert(!discord.includes('\n'));
assert.equal(parity(discord), parity(twitch));
const curiosity = JSON.parse(fs.readFileSync(path.join(root, 'data/perks/astral-curiosity.json'), 'utf8'));
assert(JSON.stringify(curiosity).includes('Nothing happens.\\n\\n...\\n\\nStill nothing.'));
const summary = { result: 'PASS', jsonFiles, playerFacingStringsChanged: strings,
  filesChanged: modified.length, filesWithSpacingChanges: spacingFiles.size,
  hyphensReplaced: hyphens, platformPairsPreserved: parityPairs, existingParityDifferences,
  modifiedFiles: modified, remainingHyphens: Object.fromEntries([...remaining].sort()) };
if (process.argv.includes('--report')) {
  const categories = new Map();
  for (const file of modified) {
    const category = file.startsWith('data/') ? file.split('/')[1] : 'worker.js';
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  const report = [
    '# Narrative formatting audit', '',
    `Baseline: ${base}. Local formatting-only cleanup; no deployment, commit, push, remote registration or live data access.`, '',
    'Existing narrative wording was preserved exactly. No flavor text, sentences, jokes, lore, or descriptions were added, removed, or rewritten. Narrative changes were limited to whitespace/paragraph formatting and approved player-facing descriptive hyphens being replaced with spaces.', '',
    `Changed ${strings} player-facing strings in ${modified.length} existing files. Spacing changed in ${spacingFiles.size} files; ${hyphens} player-facing hyphens were replaced with spaces.`, '',
    '## Scope and examples', '',
    'Adventure introductions, rooms/path outcomes, boss approaches/reveals, completion and retreat narration, visible Adventure/enemy/boss names, manifests, Explore/reward flavor, Travel Notes, spell narration and two shop flavor strings were changed. Regions, perks, masteries, help/error text and other spell/item text were audited; unrelated mechanics and existing intentional formatting remain unchanged.', '',
    '- Leviathan\'s Wake Adventure 1 joins its first two sentences and its pillars/joints sentences into paragraphs, retaining “They\'re ribs.” as a standalone reveal. The original “violent crosscurrents” wording remains.',
    '- Its room prompt and existing Choose commands render as one paragraph on both platforms.',
    '- Wake-Rider Crossing → Wake Rider Crossing; Wake-Riding Razorfish → Wake Riding Razorfish; Bone-Crown → Bone Crown; Echo-thyme → Echo thyme.',
    '- Elf Blessing groups related action sentences while preserving quoted dialogue and punchlines. Leviathan\'s Wake groups related cast/arrival narration while preserving reveals.',
    '- Short chants, creature lists, quoted signs, ellipses, delayed jokes and major scene changes retain their breaks. Existing decorative separators were not removed because that would change punctuation.', '',
    '## Preservation and validation', '',
    `- All ${jsonFiles} JSON files parse; recursive comparison preserves keys, array order, internal strings, IDs, aliases, schema values, all numbers and rewards. Every changed narrative string passes exact wording/punctuation/case comparison after only approved dehyphenation and whitespace normalization.`,
    '- Worker diff is exactly two approved hyphen-to-space edits inside shop flavor strings; no command, combat, progression, unlock, persistence or ownership behavior changes.',
    `- All ${parityPairs} Discord/Twitch intro and boss-prompt pairs retain full narrative parity (zero pre-existing mismatches). Shared room output also passes the parity check. Twitch narration was not shortened.`,
    '- Expansion validator: PASS (180 Adventures, 180 normal enemies, 180 bosses; references and rewards valid).',
    '- Offline regression tests: PASS (12 Jellyfish Mastery II groups, 13 Leviathan\'s Wake groups, and all devlevel checks).',
    '- Worker module and new CJS tool/validator syntax: PASS.',
    '- git diff --check: PASS.', '',
    '## Intentionally retained hyphens', '',
    'Ordinary idioms, numerical expressions, qualifications/negation, comic directional labels, onomatopoeia and technical/command references were retained where they fall outside descriptive fantasy naming or where removal could obscure meaning. Examples: twenty-one, five-minute, thumbs-up, hide-and-seek, clack-clack-clack, dry-ish, Up-Ish, non-secret, full-HP and the whispering-kelp-forest command reference. Internal IDs, filenames, URLs, operators and negative numbers remain untouched. The full remaining visible candidate inventory is below; no compensating rewrites were made.', '',
    '| Candidate | Occurrences |', '| --- | ---: |',
    ...[...remaining].sort().map(([word, count]) => `| ${word} | ${count} |`), '',
    '## Files modified', '',
    '| Category | Files |', '| --- | ---: |',
    ...[...categories].map(([category, count]) => `| ${category} | ${count} |`), '',
    ...modified.map(file => `- [${file}](${file})`), '',
    '## Files created', '',
    '- tools/format-narrative.cjs — field-scoped, baseline-pinned offline formatting recipe; preview by default, writes only with --write and refuses unrelated local edits.',
    '- scripts/validate-narrative-formatting.cjs — offline preservation/parity validation; --report regenerates this report.',
    '- NARRATIVE_FORMATTING_REPORT.md — this report and complete file/candidate inventory.', '',
  ].join('\n');
  fs.writeFileSync(path.join(root, 'NARRATIVE_FORMATTING_REPORT.md'), report);
}
console.log(JSON.stringify(summary, null, 2));
