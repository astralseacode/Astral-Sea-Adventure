// Offline, field-scoped formatting audit. Preview: node tools/format-narrative.cjs
// Apply reviewed whitespace/house-style changes: add --write.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
// Pin this one-time cleanup so rerunning it cannot regroup already formatted prose.
const baseline = 'b22d5ecde30ba1a468e35b16939010bc98a3da2c';
const fields = new Set(`name title displayName intro introDiscord introTwitch prompt
message fullHpMessage bossPromptDiscord bossPromptTwitch bossRetreatText revealText
completionText text description activationLine activationLines ancientFlavor arrival
bubble cast combined criticalFlavor criticalText duplicateCastLine echoActivationLine
flavor followUp fullHpLine fullManaLine highPowerNaturalOneFlavor line lines mend
narration naturalTwentyFlavor recastScenes successScenes tripleLines warning`.split(/\s+/));
// Reviewed visible fantasy names and physical/descriptive compounds only.
// IDs, aliases, filenames, references, numbers and all other schema fields are excluded.
const compounds = new Set(`Archive-Reef Between-State Bone-Crown Bone-Lantern Breaker-Fin
Briar-Chorus Broken-Orbit Chorus-Fin Cinder-Crown Comet-Tail Crater-Throne Crown-Antler
Crown-Caged Crown-Fang Dead-Gate Deep-Orbit Deep-Scar Diamond-Maw Dream-Anchor Echo-Bark
Echo-Crowned Eclipse-Jaw Fae-Lure Falling-Light False-Light Fault-Crowned Fear-Made
First-Light First-Root Fleet-Eater Forest-Heart Fractured-Angle Funeral-Wing Gate-Root
Gravity-Skipping Half-Real Heart-Crossing Impact-Shell Infinite-Chamber Last-Dance
Many-Exit Many-Faced Marrow-Crown Mass-Song Master-Chef Memory-Kelp Meteor-Lure
Meteor-Marked Mirror-Moss Mirror-Self Mother-of-Pearl Nothing-Bloom Nova-Fang Oath-Sealed
Oracle-Shell Pale-Wing Pearl-Throne Polar-Flare Portal-Skip Portal-Skipping Quake-Crown
Reality-Bite Reed-Crowned Reef-Rune Rose-Tide Rumor-Tide Scale-Forged Scale-Shelter
Scar-Marked Seven-Seal Sky-Ruin Sorrow-Tide Split-Sea Standard-Bearer Star-Eater
Star-Skull Storm-Ink Tempest-Voice Thicket-Shell Tide-Silk Titan-Scale Titan-Scar
Trench-Rending Under-Sun Wake-Rider Wake-Riding Wrong-Way Zero-Tide
bell-shaped berry-shaped blade-like blue-white bone-lined bone-shaped bramble-shell
bramble-shells Briar-like bubble-shaped child-sized comet-bright comet-coral comet-tailed
crescent-shaped crown-shaped Current-root Deep-sea eel-shaped Fae-touched flower-covered
flower-lined foam-covered Fossil-like fossil-shaped glass-finned glass-like glass-lined
glass-smooth Glimmer-sized gold-covered golem-shaped half-buried Half-woven ink-filled
ivory-colored jaw-shaped Keeper-root kelp-silk knife-fish lantern-covered Lanternfish-shaped
leaf-tag Leviathan-made Leviathan-rib Leviathan-shaped many-wound meteor-iron Mineral-rich
moon-carved moon-shaped moon-shell Moray-sized moss-covered mushroom-covered pearl-covered
pearl-light pearl-lined pressure-light Pressure-scarred pressure-sealed razor-thin reef-lined
scar-covered sea-foam Sentry-salve shell-brambles shell-clad shell-lined silver-fin
silver-white skull-shaped slow-moving slow-turning space-bone star-chart star-lit
star-shaped stone-covered Stone-like sunset-shadow thorn-armored thorn-covered
thorn-free thorn-lined thorn-vines trench-wide upward-drifting vent-cooked watch-rune
water-preserved white-haired wreck-lined merchant-shaped rock-based
Definitely-Not-Berry Screams-A-Lot Echo-thyme`.toLowerCase().split(/\s+/));
const dehyphenate = text => text.replace(/[A-Za-z]+(?:-[A-Za-z]+)+/g, word =>
  compounds.has(word.toLowerCase()) || compounds.has(word.toLowerCase().replace(/s$/, ''))
    ? word.replace(/-/g, ' ') : word);

// Join only reviewed boundaries (zero-based paragraph indices) in introductions.
// Remaining boundaries retain reveals, dialogue, punchlines and scene changes.
const introJoins = {
  'leviathans-wake': {
    1:[0,2], 2:[0], 3:[0], 5:[0], 6:[0], 7:[0], 8:[0], 11:[], 12:[0],
    13:[0], 14:[0], 15:[0], 17:[0], 18:[0], 19:[0], 20:[0], 21:[0],
    22:[0], 23:[0], 24:[0], 26:[0], 28:[0], 30:[1,2,4,6],
  },
  'sunken-kings-throne': {
    1:[3], 2:[0,1], 4:[0], 5:[0], 6:[0], 10:[0], 11:[0], 12:[0],
    14:[0], 15:[0], 16:[0], 17:[0], 19:[0,1,2], 20:[0], 21:[0],
    22:[0], 23:[0], 24:[0,1], 26:[0], 27:[0], 28:[1,2,3,5], 29:[0,1],
    30:[0,5,6,9],
  },
  'astral-nexus': {
    1:[0,3], 2:[0], 3:[0], 4:[0], 5:[0,1], 6:[0], 7:[0], 9:[0],
    11:[0], 12:[1], 13:[0], 15:[1], 16:[1,2,4], 18:[0,1], 19:[0],
    20:[0,1], 21:[1], 22:[0], 23:[0], 25:[0,1], 27:[0], 28:[2,3,4],
    29:[1,2,4,5], 30:[1,2,3,6,8,9,13,14],
  },
};
const choiceJoins = new Set([
  'astral-nexus/3/memoryglass-strand-approach/left',
  'leviathans-wake/1/wake-rider-crossing-depths/left',
  'starfall-trench/3/cometglass-shardbeds-threshold/left',
  'whispering-kelp-forest/5/rootcoil-channels-approach/right',
  'whispering-kelp-forest/18/kelpweave-galleries-depths/left',
]);
function joinParagraphs(text, boundaries) {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((p, i) => (i ? boundaries.includes(i - 1) ? ' ' : '\n\n' : '') + p).join('');
}
function format(text, key, location, document, file) {
  if (!fields.has(key)) return text;
  let result = dehyphenate(text);
  // Long single lines are source hard wraps. Preserve short chants, signs,
  // lists, quoted beats and all existing double-line paragraph boundaries.
  result = result.replace(/([^\n]+)\n(?!\n)/g, (match, line, offset, whole) => {
    const next = whole.slice(offset + match.length);
    return line.length >= 45 && !/[:'"”’—]$/.test(line) && !/^[#*\-\n]/.test(next)
      ? `${line} ` : match;
  }).replace(/\n{3,}/g, '\n\n');
  if (key === 'introDiscord' || key === 'introTwitch') {
    result = joinParagraphs(result, introJoins[document.regionId]?.[document.number] || []);
  }
  if (key === 'message' && location[0] === 'rooms' &&
      choiceJoins.has(`${document.regionId}/${document.number}/${location[1]}/${location[3]}`)) {
    result = joinParagraphs(result, [0]);
  }
  if (file === 'data/spells/leviathans-wake.json') {
    const tier = location[0] === 'creatureTiers' ? location[1] : -1;
    const joins = { '0/cast':[0], '0/warning':[0], '0/arrival':[0],
      '1/cast':[0], '1/warning':[0], '1/arrival':[0], '2/arrival':[0],
      '3/cast':[0], '3/warning':[0,2], '3/arrival':[0],
      '4/arrival':[1], '-1/bubble':[0], '-1/mend':[0] };
    result = joinParagraphs(result, joins[`${tier}/${key}`] || []);
  }
  if (file === 'data/spells/elf-blessing.json' && location[0] === 'successScenes') {
    const joins = {0:[0], 1:[0,3], 2:[0], 3:[0], 4:[0]};
    result = joinParagraphs(result, joins[location[1]] || []);
  }
  return result;
}
function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function leaves(value, location = [], result = []) {
  if (typeof value === 'string') result.push({ value, location, key: location.findLast(p => typeof p === 'string') });
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, [...location, Array.isArray(value) ? Number(k) : k], result);
  }
  return result;
}
function main() {
  const changes = [];
  for (const absolute of filesIn(path.join(root, 'data')).filter(f => f.endsWith('.json'))) {
    const file = path.relative(root, absolute).replaceAll('\\', '/');
    const current = fs.readFileSync(absolute, 'utf8');
    const source = execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8' });
    const document = JSON.parse(source);
    const values = leaves(document);
    let index = 0;
    // Replace individual value tokens, preserving indentation, keys, escape style,
    // line endings and every non-string token in the source file.
    const updated = source.replace(/"(?:[^"\\]|\\.)*"/g, (token, offset) => {
      if (/^\s*:/.test(source.slice(offset + token.length))) return token;
      const entry = values[index++];
      if (!entry || entry.value !== JSON.parse(token)) throw new Error(`Token mismatch: ${file}`);
      const next = format(entry.value, entry.key, entry.location, document, file);
      if (next === entry.value) return token;
      changes.push({ file, path: entry.location.join('.'), before: entry.value, after: next });
      let encoded = JSON.stringify(next);
      // Keep existing Unicode escape spellings (e.g. escaped apostrophes).
      for (const escape of new Set(token.match(/\\u[0-9a-fA-F]{4}/g) || [])) {
        const ch = JSON.parse(`"${escape}"`);
        if (ch !== '"' && ch !== '\\' && !/\s/.test(ch)) encoded = encoded.replaceAll(ch, escape);
      }
      return encoded;
    });
    const lf = text => text.replaceAll('\r\n', '\n');
    if (lf(current) !== lf(source) && lf(current) !== lf(updated)) throw new Error(`Unrelated local edits: ${file}`);
    if (process.argv.includes('--write') && lf(updated) !== lf(current)) {
      fs.writeFileSync(absolute, current.includes('\r\n') ? lf(updated).replaceAll('\n', '\r\n') : updated);
    }
  }
  console.log(JSON.stringify(changes, null, 2));
}
if (require.main === module) main();
module.exports = { baseline, fields, compounds, dehyphenate, leaves, filesIn };
