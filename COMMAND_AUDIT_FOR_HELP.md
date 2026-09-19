# Player command audit for future help

## Executive summary

The runtime declares 37 Discord slash commands. 36 are player-facing; /devlevel is a development-only command. The Twitch HTTP action router handles 34 player-facing names. All 34 Twitch names also have Discord slash counterparts. Discord alone exposes /read and /equip. There are no top-level command aliases in either router. Spell and region aliases are argument values, not command aliases.

Source of truth: `worker.js` `DISCORD_COMMANDS`, `handleDiscordInteractionCore`, `handleTwitchRequest`, and the command handlers. `/discord/schema` serves the local command definitions; `/discord/register` is a protected remote registration route and was not called. Twitch action names are selected by the `action` URL parameter supplied by StreamElements; the repository does not contain an independent StreamElements chat-command registration list. Thus the Twitch count is the locally handled action surface, not a verified remote chat configuration.

Key code anchors: `worker.js:644` (slash schema), `worker.js:1081` (Twitch action parser), `worker.js:1418` (Discord dispatcher), `worker.js:4442` (spell selection), `worker.js:7127` (shop), `worker.js:7201` (buy), `worker.js:7407` (Class Change), and `worker.js:8140` (`/read`).

## Complete inventories

Discord (36): /adventure, /left, /right, /forward, /yes, /no, /attack, /stim, /cast, /eat, /rest, /explore, /read, /daily, /gamble, /backpack, /stats, /vitality, /focus, /strength, /luck, /armor, /fae, /shop, /buy, /equip, /travel, /moonlit, /starfall, /whispering, /leviathan, /sunken, /astral, /journal, /notes, /note.

Twitch (34): !adventure, !left, !right, !forward, !yes, !no, !attack, !stim, !cast, !eat, !rest, !explore, !daily, !gamble, !backpack, !stats, !vitality, !focus, !strength, !luck, !armor, !fae, !shop, !buy, !travel, !moonlit, !starfall, !whispering, !leviathan, !sunken, !astral, !journal, !notes, !note.

There are no top-level command aliases. `/travel` and `!travel` accept short region arguments (`moonlit`, `starfall`, `whispering`, `leviathans`, `sunken`, `astral`) plus normalized region names/IDs. `!cast` accepts aliases declared in spell JSON; `/cast` presents 16 spell choices. These are option/argument aliases.

### Spell argument aliases for `!cast`

The 16 spell definitions contain 31 alias entries. The runtime matches spell IDs or aliases in `SPELL_FILES` order. These are not separate chat commands.

| Spell | Accepted alias values |
| --- | --- |
| Elf Blessing | `elf blessing`, `elf_blessing`, `blessing` |
| Star Spark | `star` |
| Jellyfish | `jelly` |
| Mend | `mend` |
| Moonbeam | `moonbeam` |
| Evocation | `evo`, `evocate` |
| Bubble | `bubble` |
| Echo | `astral echo`, `echo` |
| Falling Star | `falling star`, `falling`, `star` |
| Leviathan's Wake | `leviathan's wake`, `leviathans wake`, `leviathan`, `wake` |
| Berries | `berry`, `berries` |
| Familiar | `familiar` |
| All or Nothing | `all or nothing`, `allornothing` |
| Tidal Wave | `tidal wave`, `tidal`, `wave` |
| Conjure Gun | `conjure gun`, `gun` |
| Help! | `help`, `help!` |

`star` appears in both Star Spark and Falling Star definitions. Star Spark occurs first in `SPELL_FILES`, so `!cast star` resolves to Star Spark; the Falling Star use of `star` is shadowed. Use `!cast falling` or `!cast falling star` for Falling Star.

## Command-by-command behavior

Options in the Discord syntax below are sourced from the local slash schema. A square bracket denotes an optional argument. Each command has exactly one primary proposed help category. A combat-turn flag means the command can enter the combat action pipeline; individual spells vary.

| Category | Command and syntax | Twitch syntax | Purpose | Prerequisites and common rejection | Resource / turn effects |
| --- | --- | --- | --- | --- | --- |
| Adventure | `/adventure [number:<1–30>] [page:<1–5>]` | `!adventure [number | list <page>]` | List, start, or resume an Adventure in the saved travel region. | An unlocked Adventure number is required to start; another active Adventure blocks a new start. | Starts an Adventure or reads its objective; no combat turn. |
| Adventure | `/left` | `!left` | Choose the left path in an active Adventure. | Active Adventure, available left choice, and no ongoing fight or boss confirmation. | May grant a room reward or begin combat; no ordinary attack turn. |
| Adventure | `/right` | `!right` | Choose the right path in an active Adventure. | Active Adventure, available right choice, and no ongoing fight or boss confirmation. | May grant a room reward or begin combat; no ordinary attack turn. |
| Adventure | `/forward` | `!forward` | Choose the forward path in an active Adventure. | Active Adventure, available forward choice, and no ongoing fight or boss confirmation. | May grant a room reward or begin combat; no ordinary attack turn. |
| Adventure | `/yes` | `!yes` | Accept a pending challenge or Adventure boss. | Pending combat confirmation. | Starts the pending fight; no attack turn. |
| Adventure | `/no` | `!no` | Decline a pending challenge or Adventure boss. | Pending combat confirmation. | Cancels the pending fight; no attack turn. |
| Combat | `/attack` | `!attack` | Make one basic attack; an equipped weapon and matching class modify it. | Active enemy. Unarmed/default attack works without a weapon. | Consumes one combat turn; no Mana or Candy cost. |
| Combat | `/stim` | `!stim` | Fully restore HP with the once-per-battle Stim. | Active battle, Stim unused, HP below maximum; no arguments. | Consumes one combat turn; no item or Mana cost. |
| Spells | `/cast spell:<choice>` | `!cast <spell name or spell alias>` | Cast one selected spell, including the Help! combat spell. | Spell must be unlocked and valid for its context; combat/support restrictions vary by spell. | May cost Mana and consume a combat turn; spell-specific effects vary. |
| Items | `/eat berry` | `!eat [berry]` | Eat one Berry for up to 25 HP and 25 Mana. | Own a Berry, have missing HP or Mana; at most four Berries per Adventure. | Consumes one Berry; does not advance the combat turn. |
| Recovery | `/rest short | /rest long` | `!rest [short | long]` | Take a Short or Long Rest and restore resources with a temporary buffer. | No combat; cooldown must expire. Long Rest also requires no active Adventure. | No Candy/Mana cost or combat turn; Short Rest has a 20-minute cooldown and Long Rest a 60-minute cooldown. |
| Exploration | `/explore` | `!explore` | Resolve a travel exploration scene in the saved region. | Region must be available; exploration handler checks current activity. | Grants XP/Candies and may find a Berry or Travel Note; can level up. |
| Travel Notes | `/read` | — | Read the current-region Travel Journal with collected note text. | Valid saved travel region, or an active Adventure region. | Read-only; ephemeral Discord response. |
| Rewards | `/daily` | `!daily` | Claim a daily blessing of Star Candies. | Discord cooldown is checked locally; Twitch cooldown is delegated to StreamElements. | Adds Candies; no turn or item cost. |
| Rewards | `/gamble amount:<whole number>` | `!gamble <amount>` | Stake Star Candies in a 50/50 roulette. | Positive whole-number stake no greater than current balance. | Wins or loses the stake; no combat turn. |
| Player Info | `/backpack` | `!backpack` | View Star Candies and backpack/resource information. | Identified player. | Read-only; Discord response is ephemeral. |
| Player Info | `/stats` | `!stats` | View stats, resources, points, and active effects. | Identified player. | Read-only; Discord response is ephemeral. |
| Progression | `/vitality` | `!vitality` | Spend one Stat Point for +10 permanent maximum HP. | One unspent point; below Vitality rank cap. | Consumes one Stat Point; adjusts HP, including active combat/adventure state. |
| Progression | `/focus` | `!focus` | Spend one Stat Point for +10 permanent maximum Mana. | One unspent point; below Focus rank cap. | Consumes one Stat Point; adjusts Mana. |
| Progression | `/strength` | `!strength` | Spend one Stat Point for +1 player damage. | One unspent point; below Strength rank cap. | Consumes one Stat Point. |
| Progression | `/luck` | `!luck` | Spend one Stat Point for reward and Berry-drop bonuses. | One unspent point; below Luck rank cap. | Consumes one Stat Point. |
| Progression | `/armor` | `!armor` | Spend one Stat Point for incoming damage reduction. | One unspent point; below Armor rank cap. | Consumes one Stat Point. |
| Progression | `/fae` | `!fae` | Spend one Stat Point for an offensive spell-roll bonus. | One unspent point; below Fae rank cap. | Consumes one Stat Point. |
| Shop | `/shop` | `!shop` | View merchant inventory, ownership labels, and unlocked services. | Identified player. | Opens/refreshes a 10-minute shop session; no cost. |
| Shop | `/buy item:<choice> [quantity:<1–99>] [class:<choice>]` | `!buy berry [quantity] | !buy <weapon-id>` | Buy Berries or permanent weapons; Class Change is a shop service. | Active 10-minute shop session; sufficient Candies. Weapon duplicates, quantities, and in-combat purchase are rejected. Class Change requires unlocked/owned target and no combat. | Berry: 200 Candies each, quantity 1–99. Weapon: 20,000 once, first purchase unlocks class. Class Change: 50,000; equips target. |
| Weapons | `/equip weapon:<choice>` | — | Equip an owned permanent weapon. | Must own selected weapon and be outside combat. | Free; changes equipped weapon, not active class. |
| Exploration | `/travel region:<choice>` | `!travel <region>` | Set the saved region for future exploration and Adventure selection. | Player level must unlock target region; no active combat. | Changes currentRegion; no Candy cost or combat turn. |
| Completion | `/moonlit` | `!moonlit` | View Moonlit Reef Adventure and Travel Note completion. | Identified player. | Read-only. |
| Completion | `/starfall` | `!starfall` | View Starfall Trench completion. | Identified player. | Read-only. |
| Completion | `/whispering` | `!whispering` | View Whispering Kelp Forest completion. | Identified player. | Read-only. |
| Completion | `/leviathan` | `!leviathan` | View Leviathan's Wake completion. | Identified player. | Read-only. |
| Completion | `/sunken` | `!sunken` | View Sunken King's Throne completion. | Identified player. | Read-only. |
| Completion | `/astral` | `!astral` | View Astral Nexus completion. | Identified player. | Read-only. |
| Travel Notes | `/journal` | `!journal` | View collected Travel Note totals across all regions. | Identified player; locked regions are marked locked. | Read-only. |
| Travel Notes | `/notes region:<choice>` | `!notes [region]` | List collected and missing note numbers for a region. | Region chapter must be level-unlocked. | Read-only. |
| Travel Notes | `/note region:<choice> number:<number>` | `!note [region] <number>` | Read one previously discovered note by region and number. | Region chapter unlocked; specified note already discovered. | Read-only. |

## Discord / Twitch parity

Shared: all 34 Twitch action names listed above map to the same named Discord commands, though their options and messages differ. Discord-only: `/read` and `/equip`. Twitch-only: none in the local router. The six region completion names are separate commands; they share one completion handler. `/left`, `/right`, and `/forward` share the direction handler. The six stat commands share the allocation handler. Neither router has a top-level alias normalization step.

## Special explanations for future help

The routers close the 10-minute shop session when a command other than shop or buy runs. Shop itself has no blanket combat prohibition; weapon purchase and Class Change reject active combat, while Berry buying follows its separate branch.

- `/explore` resolves a travel scene in the saved region and may grant XP, Candies, Berries, or a Travel Note. `/adventure` lists/starts/resumes a structured Adventure in that region; directions advance its rooms. `/travel` changes the saved region after level gating.
- `/read` is a Discord-only current-region full Travel Journal view. `/journal` gives totals, `/notes` lists collected/missing numbers, and `/note` reads one discovered page. Twitch has the latter three, but no `!read`.
- `/shop` opens a 10-minute purchase session. `/buy item:Berry quantity:<1–99>` buys consumables. A weapon purchase costs 20,000 Candies once and the first unlocks a class. `/buy item:Class Change class:<target>` changes to an owned weapon class for 50,000 Candies and equips it; ambiguous legacy class initialization is free. Class Change appears in the shop only after class unlock. Twitch `!buy` can buy Berries or weapons through IDs, but its parser has no class-target slot.
- `/equip` is Discord-only, free, outside combat, and changes equipment without changing active class. Equipped weapons and matching class bonuses still affect Twitch `!attack`. There is no `/weapons`, `/class`, or separate weapon-inspection command. The current class is shown in first-purchase, advancement, and class-change receipts, but `/stats` does not explicitly display its title.
- `/cast` uses one required Discord spell choice, not separate spell slash commands. `Help!` is a combat spell selected through `/cast spell:Help!` or `!cast help`; it is not `/help` or `!help`.
- `/stim` is a once-per-battle, turn-consuming free heal. `/eat berry` consumes an owned Berry; `/rest` uses cooldowns and cannot be used during combat. The six stat names each spend one available Stat Point and may be used while fighting.

## Proposed primary /help categories

- **Adventure:** /adventure, /left, /right, /forward, /yes, /no
- **Combat:** /attack, /stim
- **Spells:** /cast
- **Items:** /eat
- **Recovery:** /rest
- **Exploration:** /explore, /travel
- **Travel Notes:** /read, /journal, /notes, /note
- **Rewards:** /daily, /gamble
- **Player Info:** /backpack, /stats
- **Progression:** /vitality, /focus, /strength, /luck, /armor, /fae
- **Shop:** /shop, /buy
- **Weapons:** /equip
- **Completion:** /moonlit, /starfall, /whispering, /leviathan, /sunken, /astral

## Exclusions and discrepancies

- `/devlevel` is registered and handled before the normal switch, but only signed Discord IDs in `DEV_USER_IDS` may run it. It must be omitted from player help. `/discord/register`, `/discord/schema`, `/health`, and the interactions endpoint are HTTP service routes, not player chat commands.
- `star` is a shadowed spell argument alias for Falling Star, as described above. No registered-but-unhandled or handled-but-unregistered Discord slash commands were found. No Twitch-only action name or dead top-level command alias was found. Neither `/help` nor `!help` is registered or handled. No dormant top-level help implementation was found.
- `scripts/test-stim.cjs` calls `invoke("help")` inside a Discord interaction test and expects `Level 1 — Stim`. The Discord router has no `help` case and the slash schema has no `/help`; its default reply is an unknown-command response. This is a stale test expectation. The prompt described it as a Twitch expectation, but the actual fixture sends a Discord interaction. It was not changed.
- Twitch `action=explore` is the HTTP router default when no action parameter is supplied. This does not establish a separate chat alias. The actual StreamElements command registration is outside this repository, so remote availability of each `!name` cannot be verified locally.

## Ambiguities and audit limits

- Twitch `!shop` displays Class Change after unlock, but the `!buy` router passes only an item and optional quantity to `performBuy`; it never supplies a target class. `!buy class-change` therefore reaches a target-selection rejection and the service is not usable from Twitch. Discord `/buy` is the working management surface. This is a player-visible parity gap, not a missing top-level command.

- `available_in_combat: null` in JSON means the handler is context-dependent or does not state a simple global combat prohibition; it is not a promise that all effects are available in a fight. Detailed spell eligibility and aliases live in spell JSON and are intentionally not counted as commands.
- No live Discord registration, Twitch configuration, KV, player data, or network service was queried. This is a static local-runtime audit.
