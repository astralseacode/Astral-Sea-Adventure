// Deterministic analytical and seeded damage audit. No network or live state.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const c = vm.createContext({ console, structuredClone, Math });
vm.runInContext(fs.readFileSync(path.join(root, 'worker.js'), 'utf8')
  .replace('export default {', 'const workerExport = {'), c);
const weapons = ['sword-and-shield', 'daggers', 'axe', 'spear', 'hammer', 'bow'];
const nice = id => ({ 'sword-and-shield': 'Sword and Shield' })[id] || id[0].toUpperCase() + id.slice(1);
const rollsFor = id => id === 'daggers' || id === 'bow' ? 2 : 1;
const allRolls = id => {
  const result = [];
  for (let a = 1; a <= 20; a++) {
    if (rollsFor(id) === 1) result.push([a]);
    else for (let b = 1; b <= 20; b++) result.push([a, b]);
  }
  return result;
};
let seed = 20260919;
function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
function die() { return 1 + Math.floor(random() * 20); }
function representative(region, boss) {
  const dir = path.join(root, 'data/enemies', boss ? 'bosses' : '', region);
  const rows = fs.readdirSync(dir).filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')))
    .sort((a, b) => a.hp - b.hp);
  return rows[Math.floor(rows.length / 2)];
}
function trial(enemy, weapon, strategy, throne) {
  let hp = enemy.hp, protection = 0, shieldGranted = false, turns = 0;
  while (hp > 0 && turns < 100) {
    const choice = strategy[turns % strategy.length];
    let damage, pierce = 0;
    if (choice === 'weapon') {
      const rolls = Array.from({ length: rollsFor(weapon) }, die);
      const result = c.resolveWeaponAttack(weapon, rolls, 9, protection, 'discord');
      damage = result.damage; pierce = result.pierceProtection;
    } else damage = { default: 21.3, Moonbeam: 30, 'Tidal Wave': 61.5, 'Conjure Gun': 79 }[choice];
    protection = Math.max(0, protection - pierce);
    const absorbed = Math.min(protection, damage);
    protection -= absorbed;
    hp -= damage - absorbed;
    if (throne && !shieldGranted && hp > 0 && hp < enemy.hp * 0.25) {
      protection += 20;
      shieldGranted = true;
    }
    turns++;
  }
  return turns;
}
const strategies = {
  'spell-heavy': ['Tidal Wave', 'Moonbeam', 'Conjure Gun'],
  varied: ['Moonbeam', 'weapon', 'Tidal Wave'],
  'weapon-heavy': ['weapon', 'weapon', 'Moonbeam'],
  'resource-starved': ['weapon'],
};
const lines = ['# Weapon balance audit', '',
  '## Exact attack table expectations', '',
  'Computed by enumerating all 20 rolls, or all 400 ordered pairs for Daggers and Bow. Damage includes Strength once on a successful attack.', '',
  '| Weapon | Strength 0 | Strength +5 | Strength +9 | Miss | Other utility |',
  '| --- | ---: | ---: | ---: | ---: | --- |'];
for (const id of weapons) {
  const rolls = allRolls(id);
  const mean = strength => rolls.reduce((sum, r) => sum +
    c.resolveWeaponAttack(id, r, strength, 0, 'discord').damage, 0) / rolls.length;
  const miss = rolls.filter(r => c.resolveWeaponAttack(id, r, 0, 0, 'discord').damage === 0).length / rolls.length;
  const utility = id === 'sword-and-shield' ? '7.5 Protection per attack on average'
    : id === 'hammer' ? '1.75 pending Stagger reduction per attack on average'
    : id === 'spear' ? 'Pierces up to 10 enemy Protection on a hit'
    : id === 'bow' ? 'Higher of two natural rolls'
    : id === 'daggers' ? 'Two independent hits, one action' : '25% natural miss range';
  lines.push(`| ${nice(id)} | ${mean(0).toFixed(2)} | ${mean(5).toFixed(2)} | ${mean(9).toFixed(2)} | ${(miss * 100).toFixed(2)}% | ${utility} |`);
}
lines.push('', 'At +9 Strength, default /attack was previously estimated at about 21.3 expected damage. The earlier audit targets for Moonbeam, Tidal Wave, and Conjure Gun were about 30, 61.5, and 79 respectively. Weapon expectations are higher than default /attack and lower than the two stronger spells. These comparisons use the prior published estimates, not a new spell rebalance.', '',
  '## Seeded representative damage scenarios', '',
  'Seed: 20260919. Each cell below is mean player actions over 200 trials. The examples use median-HP normal and boss definitions from each region. Strength is +9. Sunken King’s Throne grants one 20 Protection shield below 25% HP, matching the regional perk threshold; Spear uses its piercing rule. Spell actions use the prior approximate damage figures, so these are directional damage comparisons. They do not simulate Mana costs, enemy turns, survival, spell rolls, Familiar, or all regional effects.', '',
  '| Region / enemy | HP | Rotation | No weapon* | Sword | Daggers | Axe | Spear | Hammer | Bow |',
  '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const region of ['sunken-kings-throne', 'astral-nexus']) {
  for (const boss of [false, true]) {
    const enemy = representative(region, boss);
    for (const [name, strategy] of Object.entries(strategies)) {
      const cells = [];
      for (const weapon of [null, ...weapons]) {
        let total = 0;
        for (let trialIndex = 0; trialIndex < 200; trialIndex++) {
          const sequence = weapon ? strategy : strategy.map(action => action === 'weapon' ? 'default' : action);
          total += trial(enemy, weapon || 'bow', sequence, region === 'sunken-kings-throne');
        }
        cells.push((total / 200).toFixed(1));
      }
      lines.push(`| ${region} ${boss ? 'boss' : 'normal'}: ${enemy.name} | ${enemy.hp} | ${name} | ${cells.join(' | ')} |`);
    }
  }
}
lines.push('', '*The no-weapon column is a coarse expected-damage baseline for mixed rotations; the weapon columns use seeded natural rolls. In spell-heavy rows, all columns are the same rotation.', '',
  '## Findings and limits', '',
  '- Hammer has the highest raw expected damage at +9 Strength (38.65); Axe is close (37.75) but misses 25% of the time. Both remain below the cited Tidal Wave and Conjure Gun estimates.',
  '- Daggers and Bow almost never miss (0.25%). Bow has slightly higher expected damage; Daggers keep the two-hit identity while counting as one player action.',
  '- Sword and Shield has the lowest weapon damage but adds Protection. Spear is modest against unshielded enemies and gains its intended role against Throne Protection.',
  '- No approved weapon table was rebalanced. The seeded model is not a complete combat simulation and cannot establish survival or Mana-efficiency rankings. No weapon is clearly useless or dominant from raw damage alone.',
  '- Weapon tiers use natural dice results. Existing basic-attack roll status effects still trigger once, but their numerical roll modifiers do not move the weapon’s natural damage or miss bracket. The default unarmed /attack keeps its original modifier behavior.', '');
fs.writeFileSync(path.join(root, 'WEAPON_BALANCE_REPORT.md'), lines.join('\n'));
console.log('Wrote WEAPON_BALANCE_REPORT.md');
