// Read-only runtime audit. Writes only the two command-audit artifacts.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const context = vm.createContext({ console, structuredClone, Math });
vm.runInContext(source.replace('export default {', 'const workerExport = {'), context);
const registered = JSON.parse(JSON.stringify(vm.runInContext('DISCORD_COMMANDS', context)));
const twitchRouter = source.slice(source.indexOf('async function handleTwitchRequest('), source.indexOf('async function handleDiscordInteraction('));
const discordRouter = source.slice(source.indexOf('switch (commandName)'), source.indexOf('async function handleDiscordRegistration('));
const cases = text => [...text.matchAll(/case "([^"]+)":/g)].map(match => match[1]);
const twitchNames = [...new Set(cases(twitchRouter))];
const discordNames = [...new Set(cases(discordRouter))];
const spellFiles = vm.runInContext('SPELL_FILES', context);
const spellAliases = Object.entries(spellFiles).map(([id,file]) => {
  const spell = JSON.parse(fs.readFileSync(path.join(root,'data/spells',file),'utf8'));
  return { id, name:spell.name, aliases:spell.aliases };
});
const aliasOwners = new Map();
for (const spell of spellAliases) for (const alias of spell.aliases) {
  aliasOwners.set(alias,[...(aliasOwners.get(alias)||[]),spell.id]);
}
const shadowedSpellAliases = [...aliasOwners].filter(([,owners])=>owners.length>1)
  .map(([alias,owners])=>({alias,resolves_to:owners[0],shadowed_for:owners.slice(1)}));
const playerDiscord = registered.filter(command => command.name !== 'devlevel');
const expectedTwitch = playerDiscord.map(command => command.name).filter(name => !['read','equip'].includes(name));
const missingTwitch = expectedTwitch.filter(name => !twitchNames.includes(name));
const extraTwitch = twitchNames.filter(name => !expectedTwitch.includes(name));
const missingDiscord = playerDiscord.map(command => command.name).filter(name => !discordNames.includes(name));
const extraDiscord = discordNames.filter(name => !registered.some(command => command.name === name));
if (playerDiscord.length !== 36 || twitchNames.length !== 34 || missingTwitch.length || extraTwitch.length || missingDiscord.length || extraDiscord.length) {
  throw new Error(JSON.stringify({ playerDiscord: playerDiscord.length, twitch: twitchNames.length, missingTwitch, extraTwitch, missingDiscord, extraDiscord }));
}
// Descriptions below summarize the actual handler checks; option schemas come from DISCORD_COMMANDS.
const facts = {
  adventure: ['Adventure', 'List, start, or resume an Adventure in the saved travel region.', 'An unlocked Adventure number is required to start; another active Adventure blocks a new start.', 'Starts an Adventure or reads its objective; no combat turn.','/adventure [number:<1–30>] [page:<1–5>]','!adventure [number | list <page>]'],
  left: ['Adventure', 'Choose the left path in an active Adventure.', 'Active Adventure, available left choice, and no ongoing fight or boss confirmation.', 'May grant a room reward or begin combat; no ordinary attack turn.','/left','!left'],
  right: ['Adventure', 'Choose the right path in an active Adventure.', 'Active Adventure, available right choice, and no ongoing fight or boss confirmation.', 'May grant a room reward or begin combat; no ordinary attack turn.','/right','!right'],
  forward: ['Adventure', 'Choose the forward path in an active Adventure.', 'Active Adventure, available forward choice, and no ongoing fight or boss confirmation.', 'May grant a room reward or begin combat; no ordinary attack turn.','/forward','!forward'],
  yes: ['Adventure', 'Accept a pending challenge or Adventure boss.', 'Pending combat confirmation.', 'Starts the pending fight; no attack turn.','/yes','!yes'],
  no: ['Adventure', 'Decline a pending challenge or Adventure boss.', 'Pending combat confirmation.', 'Cancels the pending fight; no attack turn.','/no','!no'],
  attack: ['Combat', 'Make one basic attack; an equipped weapon and matching class modify it.', 'Active enemy. Unarmed/default attack works without a weapon.', 'Consumes one combat turn; no Mana or Candy cost.','/attack','!attack'],
  stim: ['Combat', 'Fully restore HP with the once-per-battle Stim.', 'Active battle, Stim unused, HP below maximum; no arguments.', 'Consumes one combat turn; no item or Mana cost.','/stim','!stim'],
  cast: ['Spells', 'Cast one selected spell, including the Help! combat spell.', 'Spell must be unlocked and valid for its context; combat/support restrictions vary by spell.', 'May cost Mana and consume a combat turn; spell-specific effects vary.','/cast spell:<choice>','!cast <spell name or spell alias>'],
  eat: ['Items', 'Eat one Berry for up to 25 HP and 25 Mana.', 'Own a Berry, have missing HP or Mana; at most four Berries per Adventure.', 'Consumes one Berry; does not advance the combat turn.','/eat berry','!eat [berry]'],
  rest: ['Recovery', 'Take a Short or Long Rest and restore resources with a temporary buffer.', 'No combat; cooldown must expire. Long Rest also requires no active Adventure.', 'No Candy/Mana cost or combat turn; Short Rest has a 20-minute cooldown and Long Rest a 60-minute cooldown.','/rest short | /rest long','!rest [short | long]'],
  explore: ['Exploration', 'Resolve a travel exploration scene in the saved region.', 'Region must be available; exploration handler checks current activity.', 'Grants XP/Candies and may find a Berry or Travel Note; can level up.','/explore','!explore'],
  read: ['Travel Notes', 'Read the current-region Travel Journal with collected note text.', 'Valid saved travel region, or an active Adventure region.', 'Read-only; ephemeral Discord response.','/read',null],
  daily: ['Rewards', 'Claim a daily blessing of Star Candies.', 'Discord cooldown is checked locally; Twitch cooldown is delegated to StreamElements.', 'Adds Candies; no turn or item cost.','/daily','!daily'],
  gamble: ['Rewards', 'Stake Star Candies in a 50/50 roulette.', 'Positive whole-number stake no greater than current balance.', 'Wins or loses the stake; no combat turn.','/gamble amount:<whole number>','!gamble <amount>'],
  backpack: ['Player Info', 'View Star Candies and backpack/resource information.', 'Identified player.', 'Read-only; Discord response is ephemeral.','/backpack','!backpack'],
  stats: ['Player Info', 'View stats, resources, points, and active effects.', 'Identified player.', 'Read-only; Discord response is ephemeral.','/stats','!stats'],
  vitality: ['Progression', 'Spend one Stat Point for +10 permanent maximum HP.', 'One unspent point; below Vitality rank cap.', 'Consumes one Stat Point; adjusts HP, including active combat/adventure state.','/vitality','!vitality'],
  focus: ['Progression', 'Spend one Stat Point for +10 permanent maximum Mana.', 'One unspent point; below Focus rank cap.', 'Consumes one Stat Point; adjusts Mana.','/focus','!focus'],
  strength: ['Progression', 'Spend one Stat Point for +1 player damage.', 'One unspent point; below Strength rank cap.', 'Consumes one Stat Point.','/strength','!strength'],
  luck: ['Progression', 'Spend one Stat Point for reward and Berry-drop bonuses.', 'One unspent point; below Luck rank cap.', 'Consumes one Stat Point.','/luck','!luck'],
  armor: ['Progression', 'Spend one Stat Point for incoming damage reduction.', 'One unspent point; below Armor rank cap.', 'Consumes one Stat Point.','/armor','!armor'],
  fae: ['Progression', 'Spend one Stat Point for an offensive spell-roll bonus.', 'One unspent point; below Fae rank cap.', 'Consumes one Stat Point.','/fae','!fae'],
  shop: ['Shop', 'View merchant inventory, ownership labels, and unlocked services.', 'Identified player.', 'Opens/refreshes a 10-minute shop session; no cost.','/shop','!shop'],
  buy: ['Shop', 'Buy Berries or permanent weapons; Class Change is a shop service.', 'Active 10-minute shop session; sufficient Candies. Weapon duplicates, quantities, and in-combat purchase are rejected. Class Change requires unlocked/owned target and no combat.', 'Berry: 200 Candies each, quantity 1–99. Weapon: 20,000 once, first purchase unlocks class. Class Change: 50,000; equips target.','/buy item:<choice> [quantity:<1–99>] [class:<choice>]','!buy berry [quantity] | !buy <weapon-id>'],
  equip: ['Weapons', 'Equip an owned permanent weapon.', 'Must own selected weapon and be outside combat.', 'Free; changes equipped weapon, not active class.','/equip weapon:<choice>',null],
  travel: ['Exploration', 'Set the saved region for future exploration and Adventure selection.', 'Player level must unlock target region; no active combat.', 'Changes currentRegion; no Candy cost or combat turn.','/travel region:<choice>','!travel <region>'],
  moonlit: ['Completion', 'View Moonlit Reef Adventure and Travel Note completion.', 'Identified player.', 'Read-only.','/moonlit','!moonlit'],
  starfall: ['Completion', 'View Starfall Trench completion.', 'Identified player.', 'Read-only.','/starfall','!starfall'],
  whispering: ['Completion', 'View Whispering Kelp Forest completion.', 'Identified player.', 'Read-only.','/whispering','!whispering'],
  leviathan: ['Completion', "View Leviathan's Wake completion.", 'Identified player.', 'Read-only.','/leviathan','!leviathan'],
  sunken: ['Completion', "View Sunken King's Throne completion.", 'Identified player.', 'Read-only.','/sunken','!sunken'],
  astral: ['Completion', 'View Astral Nexus completion.', 'Identified player.', 'Read-only.','/astral','!astral'],
  journal: ['Travel Notes', 'View collected Travel Note totals across all regions.', 'Identified player; locked regions are marked locked.', 'Read-only.','/journal','!journal'],
  notes: ['Travel Notes', 'List collected and missing note numbers for a region.', 'Region chapter must be level-unlocked.', 'Read-only.','/notes region:<choice>','!notes [region]'],
  note: ['Travel Notes', 'Read one previously discovered note by region and number.', 'Region chapter unlocked; specified note already discovered.', 'Read-only.','/note region:<choice> number:<number>','!note [region] <number>'],
};
const readOnly = new Set(['read','backpack','stats','moonlit','starfall','whispering','leviathan','sunken','astral','journal','notes','note']);
const combatOnly = new Set(['attack','stim']);
const outsideOnly = new Set(['equip','travel','rest','explore']);
const turn = new Set(['attack','stim','cast']);
const records = playerDiscord.map(command => {
  const name=command.name, fact=facts[name];
  if(!fact)throw new Error(`Missing audit facts for ${name}`);
  const options=command.options||[];
  return {
    name, surface:twitchNames.includes(name)?['Discord','Twitch']:['Discord'], aliases:[], category:fact[0],
    syntax:{discord:fact[4],...(fact[5]?{twitch:fact[5]}:{})}, purpose:fact[1],
    required_options:options.filter(option=>option.required).map(option=>({name:option.name,type:option.type,choices:option.choices||[],min_value:option.min_value,max_value:option.max_value})),
    optional_options:options.filter(option=>!option.required).map(option=>({name:option.name,type:option.type,choices:option.choices||[],min_value:option.min_value,max_value:option.max_value})),
    prerequisites:[fact[2]], costs:[fact[3]], consumes_turn:turn.has(name), read_only:readOnly.has(name),
    available_in_combat:combatOnly.has(name)?true:outsideOnly.has(name)?false:null,
    available_outside_combat:combatOnly.has(name)?false:true,
    registration_status:'Discord registered', handler_status:'Discord handled'+(twitchNames.includes(name)?'; Twitch action handled':''),
    notes:name==='cast'?'Spell choices and aliases are arguments, not separate commands.':
      name==='buy'?'Class Change uses the optional class choice; Twitch has no target-class argument, so Class Change is Discord-managed.':
      name==='read'?'Discord-only current-region full journal view.':
      name==='equip'?'Discord-only management; equipped weapon still affects Twitch !attack.':'',
  };
});
records.find(record=>record.name==='cast').argument_aliases=spellAliases;
const audit={ source:'worker.js DISCORD_COMMANDS, Discord interaction switch, Twitch action switch',
  counts:{discord_registered:registered.length,discord_player:records.length,twitch_player:twitchNames.length,command_aliases:0,spell_alias_entries:spellAliases.reduce((count,spell)=>count+spell.aliases.length,0)},
  discrepancies:{registered_but_unhandled:missingDiscord,handled_but_unregistered:extraDiscord,twitch_only:extraTwitch,discord_only:['read','equip']},
  shadowed_spell_aliases:shadowedSpellAliases,
  excluded:[{name:'devlevel',surface:['Discord'],reason:'Registered development-only command; signed user ID allowlist. Exclude from player help.'},
    {name:'help',surface:[],reason:'No /help or !help command is registered or dispatched. Help! is a /cast spell choice.'}],
  commands:records };
fs.writeFileSync(path.join(root,'command-audit-for-help.json'),JSON.stringify(audit,null,2)+'\n');
const byCategory=Object.groupBy(records,record=>record.category);
const lines=['# Player command audit for future help','',
  '## Executive summary','',
  `The runtime declares ${registered.length} Discord slash commands. ${records.length} are player-facing; /devlevel is a development-only command. The Twitch HTTP action router handles ${twitchNames.length} player-facing names. All ${twitchNames.length} Twitch names also have Discord slash counterparts. Discord alone exposes /read and /equip. There are no top-level command aliases in either router. Spell and region aliases are argument values, not command aliases.`, '',
  'Source of truth: `worker.js` `DISCORD_COMMANDS`, `handleDiscordInteractionCore`, `handleTwitchRequest`, and the command handlers. `/discord/schema` serves the local command definitions; `/discord/register` is a protected remote registration route and was not called. Twitch action names are selected by the `action` URL parameter supplied by StreamElements; the repository does not contain an independent StreamElements chat-command registration list. Thus the Twitch count is the locally handled action surface, not a verified remote chat configuration.','',
  'Key code anchors: `worker.js:644` (slash schema), `worker.js:1081` (Twitch action parser), `worker.js:1418` (Discord dispatcher), `worker.js:4442` (spell selection), `worker.js:7127` (shop), `worker.js:7201` (buy), `worker.js:7407` (Class Change), and `worker.js:8140` (`/read`).','',
  '## Complete inventories','',
  `Discord (${records.length}): ${records.map(record=>'/'+record.name).join(', ')}.`, '',
  `Twitch (${twitchNames.length}): ${twitchNames.map(name=>'!'+name).join(', ')}.`, '',
  'There are no top-level command aliases. `/travel` and `!travel` accept short region arguments (`moonlit`, `starfall`, `whispering`, `leviathans`, `sunken`, `astral`) plus normalized region names/IDs. `!cast` accepts aliases declared in spell JSON; `/cast` presents 16 spell choices. These are option/argument aliases.','',
  '### Spell argument aliases for `!cast`','',
  `The 16 spell definitions contain ${spellAliases.reduce((count,spell)=>count+spell.aliases.length,0)} alias entries. The runtime matches spell IDs or aliases in \`SPELL_FILES\` order. These are not separate chat commands.`, '',
  '| Spell | Accepted alias values |','| --- | --- |',
  ...spellAliases.map(spell=>`| ${spell.name} | ${spell.aliases.map(alias=>'\`'+alias+'\`').join(', ')} |`), '',
  '`star` appears in both Star Spark and Falling Star definitions. Star Spark occurs first in `SPELL_FILES`, so `!cast star` resolves to Star Spark; the Falling Star use of `star` is shadowed. Use `!cast falling` or `!cast falling star` for Falling Star.','',
  '## Command-by-command behavior','',
  'Options in the Discord syntax below are sourced from the local slash schema. A square bracket denotes an optional argument. Each command has exactly one primary proposed help category. A combat-turn flag means the command can enter the combat action pipeline; individual spells vary.','',
  '| Category | Command and syntax | Twitch syntax | Purpose | Prerequisites and common rejection | Resource / turn effects |',
  '| --- | --- | --- | --- | --- | --- |'];
for(const record of records){const fact=facts[record.name];lines.push(`| ${record.category} | \`${fact[4]}\` | ${fact[5]?`\`${fact[5]}\``:'—'} | ${fact[1]} | ${fact[2]} | ${fact[3]} |`);}
lines.push('','## Discord / Twitch parity','',
  'Shared: all 34 Twitch action names listed above map to the same named Discord commands, though their options and messages differ. Discord-only: `/read` and `/equip`. Twitch-only: none in the local router. The six region completion names are separate commands; they share one completion handler. `/left`, `/right`, and `/forward` share the direction handler. The six stat commands share the allocation handler. Neither router has a top-level alias normalization step.','',
  '## Special explanations for future help','',
  'The routers close the 10-minute shop session when a command other than shop or buy runs. Shop itself has no blanket combat prohibition; weapon purchase and Class Change reject active combat, while Berry buying follows its separate branch.','',
  '- `/explore` resolves a travel scene in the saved region and may grant XP, Candies, Berries, or a Travel Note. `/adventure` lists/starts/resumes a structured Adventure in that region; directions advance its rooms. `/travel` changes the saved region after level gating.','- `/read` is a Discord-only current-region full Travel Journal view. `/journal` gives totals, `/notes` lists collected/missing numbers, and `/note` reads one discovered page. Twitch has the latter three, but no `!read`.','- `/shop` opens a 10-minute purchase session. `/buy item:Berry quantity:<1–99>` buys consumables. A weapon purchase costs 20,000 Candies once and the first unlocks a class. `/buy item:Class Change class:<target>` changes to an owned weapon class for 50,000 Candies and equips it; ambiguous legacy class initialization is free. Class Change appears in the shop only after class unlock. Twitch `!buy` can buy Berries or weapons through IDs, but its parser has no class-target slot.','- `/equip` is Discord-only, free, outside combat, and changes equipment without changing active class. Equipped weapons and matching class bonuses still affect Twitch `!attack`. There is no `/weapons`, `/class`, or separate weapon-inspection command. The current class is shown in first-purchase, advancement, and class-change receipts, but `/stats` does not explicitly display its title.','- `/cast` uses one required Discord spell choice, not separate spell slash commands. `Help!` is a combat spell selected through `/cast spell:Help!` or `!cast help`; it is not `/help` or `!help`.','- `/stim` is a once-per-battle, turn-consuming free heal. `/eat berry` consumes an owned Berry; `/rest` uses cooldowns and cannot be used during combat. The six stat names each spend one available Stat Point and may be used while fighting.','',
  '## Proposed primary /help categories','');
for(const [category,items] of Object.entries(byCategory))lines.push(`- **${category}:** ${items.map(item=>'/'+item.name).join(', ')}`);
lines.push('','## Exclusions and discrepancies','',
  '- `/devlevel` is registered and handled before the normal switch, but only signed Discord IDs in `DEV_USER_IDS` may run it. It must be omitted from player help. `/discord/register`, `/discord/schema`, `/health`, and the interactions endpoint are HTTP service routes, not player chat commands.','- `star` is a shadowed spell argument alias for Falling Star, as described above. No registered-but-unhandled or handled-but-unregistered Discord slash commands were found. No Twitch-only action name or dead top-level command alias was found. Neither `/help` nor `!help` is registered or handled. No dormant top-level help implementation was found.','- `scripts/test-stim.cjs` calls `invoke("help")` inside a Discord interaction test and expects `Level 1 — Stim`. The Discord router has no `help` case and the slash schema has no `/help`; its default reply is an unknown-command response. This is a stale test expectation. The prompt described it as a Twitch expectation, but the actual fixture sends a Discord interaction. It was not changed.','- Twitch `action=explore` is the HTTP router default when no action parameter is supplied. This does not establish a separate chat alias. The actual StreamElements command registration is outside this repository, so remote availability of each `!name` cannot be verified locally.','',
  '## Ambiguities and audit limits','',
  '- Twitch `!shop` displays Class Change after unlock, but the `!buy` router passes only an item and optional quantity to `performBuy`; it never supplies a target class. `!buy class-change` therefore reaches a target-selection rejection and the service is not usable from Twitch. Discord `/buy` is the working management surface. This is a player-visible parity gap, not a missing top-level command.','',
  '- `available_in_combat: null` in JSON means the handler is context-dependent or does not state a simple global combat prohibition; it is not a promise that all effects are available in a fight. Detailed spell eligibility and aliases live in spell JSON and are intentionally not counted as commands.','- No live Discord registration, Twitch configuration, KV, player data, or network service was queried. This is a static local-runtime audit.','');
fs.writeFileSync(path.join(root,'COMMAND_AUDIT_FOR_HELP.md'),lines.join('\n'));
console.log(`Audited ${records.length} Discord player commands and ${twitchNames.length} Twitch actions.`);
