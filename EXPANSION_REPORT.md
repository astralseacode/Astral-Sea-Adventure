# Astral Sea Adventure Content Expansion Report

Generated content: 150 Adventures, 150 normal enemies, and 150 bosses across five regions. Global totals are 180 of each including Moonlit Reef.

## Scaling model

| Region | Normal HP | Normal damage | Normal XP min | Boss HP | Boss damage | Boss XP min | Treasure per room | Healing |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Starfall Trench | 150-220 | +6-+8 | 210-360 | 260-340 | +9-+11 | 360-560 | 95-213 | 45-65 |
| Whispering Kelp Forest | 215-285 | +8-+10 | 340-500 | 325-410 | +11-+13 | 520-760 | 130-268 | 55-77 |
| Leviathan's Wake | 280-350 | +10-+12 | 480-680 | 400-485 | +13-+15 | 720-1000 | 175-333 | 68-93 |
| Sunken King's Throne | 345-430 | +12-+14 | 650-920 | 475-570 | +15-+18 | 980-1350 | 230-418 | 85-115 |
| Astral Nexus | 425-510 | +14-+18 | 900-1300 | 565-680 | +18-+22 | 1350-1850 | 300-518 | 105-140 |

Normal and boss values interpolate smoothly from each region's first to final Adventure, with modest per-entry variation from integer rounding. Bosses receive higher HP, damage, XP, Candy rewards, and defeat losses. Astral Nexus remains Level 50 throughout and increases stats instead of inventing Level 51+. Luck is not applied to XP.

Noncombat XP preserves Levels 1-5 and extends Levels 6-50 as `min = 18 + 3 * level`, `max = min + 10`, producing Level 6: 36-46 through Level 50: 168-178. Every treasure, healing, and Shizuki outcome uses centralized `applyXpAndStatPointProgression()`; combat directions defer XP to victory.

## Complete roster and level distribution

### Starfall Trench

| # | Level | Adventure | Normal enemy | Boss | Boss chamber |
|---:|---:|---|---|---|---|
| 1 | 5 | Lanterns Below the Falling Sky | Starstone Lanternfish | Meteor-Lure Angler | Fallen Lantern Basin |
| 2 | 5 | Craterback Descent | Craterback Isopod | Craterback Matriarch | Impact-Shell Hollow |
| 3 | 5 | Cometglass Shardbeds | Cometglass Shrimp | Shardclaw Colossus | Prismfall Scar |
| 4 | 6 | The Weightless Ravine | Gravity-Skipping Ray | Orbitbreaker Ray | Zero-Tide Vault |
| 5 | 6 | Emberstar Ventfield | Emberstar Urchin | Cinder-Crown Urchin | Ashen Constellation |
| 6 | 6 | Nightshard Fissures | Nightshard Moray | Eclipse-Jaw Moray | Blackglass Maw |
| 7 | 6 | The Wandering Craters | Meteor Hermit | Crater-Throne Hermit | Pilgrim's Impact |
| 8 | 6 | Starlit Hunting Dark | Starlit Viperfish | Nova-Fang Viperfish | Gleaming Abyss |
| 9 | 6 | Cosmic Ventworks | Cosmic Vent Crab | Superheated Ventlord | Forge of Blue Fire |
| 10 | 7 | Shardwake Channels | Shardwake Eel | Riftcoil Eel | Splintercurrent Ring |
| 11 | 7 | Deep-Orbit Spiral | Deep-Orbit Nautilus | Periapsis Nautilus | Celestial Coil |
| 12 | 7 | Ruins of the Starstone Golem | Starstone Golem | Meteorheart Golem | Ruined Firmament |
| 13 | 7 | Voidcurrent Crossing | Voidcurrent Skate | Eventide Skate | Currentless Expanse |
| 14 | 7 | Crystalfang Galleries | Crystalfang Snapper | Diamond-Maw Snapper | Crystal Bite |
| 15 | 7 | Falling-Light Drift | Falling-Light Medusa | Starshower Medusa | Rain of Silent Suns |
| 16 | 8 | Astral Silt Labyrinth | Astral Silt Stalker | Siltveil Ambusher | Buried Starlight Court |
| 17 | 8 | Meteor-Marked Shelf | Meteor-Marked Lobster | Impactclaw Tyrant | Craterclaw Arena |
| 18 | 8 | Aurora Under the Trench | Trench Aurora Wisp | Polar-Flare Wisp | Curtain of the Deep |
| 19 | 8 | The Broken-Orbit Ruins | Broken-Orbit Sentinel | Aphelion Sentinel | Shattered Orrery |
| 20 | 8 | Star-Eater Grooves | Star-Eater Slug | Constellation Devourer | Gnawed Heavens |
| 21 | 8 | Nebula Ink Reaches | Nebula Ink Squid | Cloudveil Krakenet | Violet Stormwell |
| 22 | 9 | Comet-Tail Run | Comet-Tail Barracuda | Perseid Barracuda | The Blazing Course |
| 23 | 9 | Gravitic Deadfall | Gravitic Stonefish | Masskeeper Stonefish | Heavywater Pit |
| 24 | 9 | Celestial Ruin March | Celestial Ruin Walker | Firmament Warden | Temple of the Fallen Arc |
| 25 | 9 | Darkstar Bloomfield | Darkstar Anemone | Umbra Bloom Sovereign | Sunless Corolla |
| 26 | 9 | Meteorbone Gravepath | Meteorbone Prowler | Star-Skull Prowler | Ossuary of Impacts |
| 27 | 9 | Riftlight Fault | Riftlight Serpent | Fault-Crowned Serpent | Radiant Fracture |
| 28 | 10 | Trenchstar Depths | Trenchstar Behemoth | Abyssal Star Behemoth | Bedrock Constellation |
| 29 | 10 | The Buried Celestial Engine | Celestial Core Keeper | Corewake Custodian | Engine of the Deep Sky |
| 30 | 10 | The Starfall Annex | Starfall Annex Grunt | Starfall Annex Officer | Meteor Archive Command |

Distribution: Level 5: 3; Level 6: 6; Level 7: 6; Level 8: 6; Level 9: 6; Level 10: 3.

### Whispering Kelp Forest

| # | Level | Adventure | Normal enemy | Boss | Boss chamber |
|---:|---:|---|---|---|---|
| 1 | 10 | Murmurleaf Paths | Murmurleaf Minnow | Chorus-Fin Schoolmother | Choirleaf Clearing |
| 2 | 10 | Lanternvine Tangle | Lanternvine Crab | Glowroot Clawlord | Luminous Root Knot |
| 3 | 11 | Whispercap Hollows | Whispercap Snail | Oracle-Shell Snail | Listening Mushroom Ring |
| 4 | 11 | Veilpetal Glade | Veilpetal Ray | Veilpetal Grandwing | Curtained Moon Grove |
| 5 | 11 | Rootcoil Channels | Rootcoil Eel | Elder Rootcoil | Heartroot Spiral |
| 6 | 12 | Dewbell Canopy | Dewbell Jelly | Midnight Bell Medusa | Chiming Bower |
| 7 | 12 | Briarfin Thickets | Briarfin Prowler | Thornwake Huntress | Briar Moon Den |
| 8 | 12 | Hushwater Trails | Hushwater Stagfish | Crown-Antler Stagfish | Silent Hart Shrine |
| 9 | 13 | Fae-Lure Lanterns | Fae-Lure Angler | Glamourmaw Angler | False-Light Chapel |
| 10 | 13 | Mosscloak Maze | Mosscloak Octopus | Ancient Mosscloak | Green Masquerade |
| 11 | 13 | The Singing Vines | Singing Vine Serpent | Canticle Serpent | Resonant Arbor |
| 12 | 14 | Moonblossom Garden | Moonblossom Mantis | Lunar Petal Mantis | Silver Bloom Court |
| 13 | 14 | Gossipcurrent Forks | Gossipcurrent Sprite | Rumor-Tide Sprite | Whisperwell |
| 14 | 14 | The Vanishing Grove | Camouflage Grouper | Unseen Grovejaw | Mirror-Moss Hollow |
| 15 | 15 | Shrinebark Pilgrimage | Shrinebark Guardian | First-Root Guardian | Old Bark Sanctuary |
| 16 | 15 | Starflower Hunting Beds | Predatory Starflower | Devouring Starflower | Pollenmoon Pit |
| 17 | 16 | Dreamsap Pools | Dreamsap Leech | Nightmare Sapmother | Sleeping Rootwell |
| 18 | 16 | Kelpweave Galleries | Kelpweave Spider | Grand Loom Spider | Tide-Silk Rotunda |
| 19 | 16 | Willowcurrent Bend | Willowcurrent Nymph | Weeping Current Nymph | Drowned Willow Shrine |
| 20 | 17 | Bramblejaw Understory | Bramblejaw Turtle | Thicket-Shell Ancient | Thorned Shell Court |
| 21 | 17 | Echo-Bark Trunks | Echo-Bark Woodfish | Resonant Timberfish | Hollow Song Chamber |
| 22 | 17 | Moonmoth Drift | Moonmoth Nudibranch | Pale-Wing Moonmoth | Dustlight Bower |
| 23 | 18 | Rootbound Shrine | Rootbound Effigy | Greenwood Idol | Knot of Old Oaths |
| 24 | 18 | Sighing Reed Marsh | Sighing Reed Hunter | Reed-Crowned Hunter | Breathless Fen |
| 25 | 18 | Glimmerpod Nursery | Glimmerpod Beetle | Radiant Podqueen | Emerald Nursery |
| 26 | 19 | The Borrowed Grove | Ancient Grove Mimic | Many-Faced Grove Mimic | Imitation Heartwood |
| 27 | 19 | Thornsong Vale | Thornsong Siren | Briar-Chorus Siren | Rose-Tide Amphitheater |
| 28 | 19 | Whisperroot Deeps | Whisperroot Colossus | Forest-Heart Colossus | Primeval Root Cathedral |
| 29 | 20 | The Forest Remembers | Memory-Kelp Oracle | Keeper of Green Memories | Recollection Grove |
| 30 | 20 | The Verdant Pursuit Station | Verdant Pursuit Grunt | Verdant Pursuit Officer | Overgrown Search Command |

Distribution: Level 10: 2; Level 11: 3; Level 12: 3; Level 13: 3; Level 14: 3; Level 15: 2; Level 16: 3; Level 17: 3; Level 18: 3; Level 19: 3; Level 20: 2.

### Leviathan's Wake

| # | Level | Adventure | Normal enemy | Boss | Boss chamber |
|---:|---:|---|---|---|---|
| 1 | 20 | Wake-Rider Crossing | Wake-Riding Razorfish | Breaker-Fin Alpha | Whitewater Saddle |
| 2 | 20 | Titanbone Ribs | Titanbone Crab | Ossuary Clawking | Colossal Ribcage |
| 3 | 21 | Pressurejaw Drop | Pressurejaw Eel | Crushdepth Coil | Compression Vault |
| 4 | 21 | Scale-Shelter Wrecks | Scale-Shelter Hermit | Titan-Scale Hermit | Armored Drift |
| 5 | 21 | Currentbreaker Run | Currentbreaker Shark | Maelstrom Apex | Breaker Crown |
| 6 | 22 | Bonegarden Spines | Bonegarden Urchin | Marrow-Crown Urchin | Ivory Thornfield |
| 7 | 22 | Hullsplitter Graveyard | Hullsplitter Lobster | Dreadclaw Hullsplitter | Keelbreak Arena |
| 8 | 22 | Wakefoam Tempest | Wakefoam Medusa | Stormbell Medusa | Foaming Thunderwell |
| 9 | 23 | Deep-Scar Ravine | Deep-Scar Prowler | Scar-Marked Huntmaster | Ancient Wound |
| 10 | 23 | The Walking Scale | Leviathan Scale Golem | Scale-Forged Colossus | Titanplate Foundry |
| 11 | 23 | Riptide Gauntlet | Riptide Hammerhead | Breakerhead Patriarch | Hammer Current |
| 12 | 24 | Wrecknest Passage | Wrecknest Moray | Keeljaw Moray | Crushed Fleet Nest |
| 13 | 24 | Tectonic Shelf | Tectonic Barnacle | Quake-Crown Barnacle | Moving Bedrock |
| 14 | 24 | Roarcurrent Gorge | Roarcurrent Siren | Tempest-Voice Siren | Howling Scar |
| 15 | 25 | Abysslung Expanse | Abysslung Manta | Gravewing Manta | Voidspan |
| 16 | 25 | Marrowlight Ossuary | Marrowlight Angler | Bone-Lantern Angler | Lit Skull Chapel |
| 17 | 26 | Titanwake Delta | Titanwake Crocodile | Wakejaw Ancient | Flooded Fangbank |
| 18 | 26 | Pressure Bloom Shelf | Pressure Bloom Anemone | Crushpetal Sovereign | Compressed Garden |
| 19 | 26 | Shipgrave Maze | Shipgrave Scuttler | Fleet-Eater Scuttler | Admiral's Ruin |
| 20 | 27 | Scarfin Torrent | Scarfin Barracuda | Rendwake Barracuda | Bloodless Rapids |
| 21 | 27 | Colossus Trail | Colossus Remora | Titanbound Remora | Pilgrim Scale |
| 22 | 27 | Thunderwake Storm | Thunderwake Squid | Storm-Ink Architeuthis | Electric Gyre |
| 23 | 28 | The Fallen Fang | Ancient Tooth Sentinel | First-Tooth Sentinel | Fang of Ages |
| 24 | 28 | Riven Trench | Trench-Rending Worm | Worldscar Worm | Split-Sea Chasm |
| 25 | 28 | The Last Leviathan Song | Leviathan Song Echo | Primordial Voice | Resonance Grave |
| 26 | 29 | Bone-Crown March | Bone-Crown Behemoth | Ossuary Behemoth | Crowned Skeleton Deep |
| 27 | 29 | Wakeheart Vortex | Wakeheart Elemental | Heart of the Wake | Endless Current Core |
| 28 | 29 | Titan-Scar Threshold | Titan-Scar Guardian | Scarbound Warden | Leviathan Seal |
| 29 | 30 | The Scale That Remembers | Primeval Scale Revenant | Firstwake Revenant | Memory of the Colossus |
| 30 | 30 | The Behemoth Program Hold | Behemoth Program Grunt | Behemoth Program Officer | Weaponization Command |

Distribution: Level 20: 2; Level 21: 3; Level 22: 3; Level 23: 3; Level 24: 3; Level 25: 2; Level 26: 3; Level 27: 3; Level 28: 3; Level 29: 3; Level 30: 2.

### Sunken King's Throne

| # | Level | Adventure | Normal enemy | Boss | Boss chamber |
|---:|---:|---|---|---|---|
| 1 | 30 | The Fallen Banner Way | Drowned Banner Guard | Standard-Bearer Revenant | Hall of Torn Colors |
| 2 | 31 | Crowncoin Vaults | Crowncoin Mimic | Royal Treasury Maw | Gilded Hunger |
| 3 | 31 | Palace Aqueducts | Palace Lamprey | Crimson Court Lamprey | Royal Bloodwell |
| 4 | 32 | Sealbound Galleries | Sealbound Squire | Oath-Sealed Knight | Gallery of Vows |
| 5 | 33 | The Mourning Promenade | Mourning Courtesan | Last-Dance Courtesan | Ballroom Beneath the Tide |
| 6 | 33 | Scepter Gardens | Scepter Crab | Regalia Clawlord | Scepter Conservatory |
| 7 | 34 | Crownless Barracks | Crownless Knight | Helmless Castellan | Empty Helm Hall |
| 8 | 35 | The Drowned Archive | Royal Archive Wisp | Grand Archivist Wisp | Scriptorium of Bubbles |
| 9 | 36 | Thronewater Conduits | Thronewater Eel | Regent Coil | Sovereign Cistern |
| 10 | 36 | Gilded Processional | Gilded Armorfish | Auric Platefish | Golden Review Court |
| 11 | 37 | Sepulcher Cloisters | Sepulcher Manta | Funeral-Wing Manta | Royal Crypt Nave |
| 12 | 38 | The Walking Statuary | Broken Statue Walker | Marble Tyrant | Sculptor's Tribunal |
| 13 | 38 | Dynasty Coral Halls | Dynasty Coral Golem | Ancestral Reef Golem | Lineage Rotunda |
| 14 | 39 | Chalice Chapel | Chalice Jelly | Sacramental Medusa | Sunken Communion |
| 15 | 40 | Taxkeeper Offices | Taxkeeper Octopus | Exchequer Krakenet | Treasury Reckoning |
| 16 | 40 | Regal Fang Canal | Regal Fang Moray | Crown-Fang Moray | King's Hunting Canal |
| 17 | 41 | The Silent Heraldry | Haunted Herald | Last Royal Herald | Proclamation Hall |
| 18 | 42 | Sealbreaker Vault | Sealbreaker Lobster | Grand Sealbreaker | Forbidden Reliquary |
| 19 | 42 | Drowned Lists | Drowned Duelist | Champion of the Last Court | Tidal Tournament Floor |
| 20 | 43 | Crownshadow Arcade | Crownshadow Stalker | Umbral Chamberlain | Shadowed Audience |
| 21 | 44 | The Ruined Menagerie | Royal Menagerie Beast | King's Chimera | Menagerie Crown Cage |
| 22 | 44 | Pearl-Throne Approach | Pearl-Throne Sentinel | Mother-of-Pearl Warden | Pearlescent Gate |
| 23 | 45 | The Usurper's Passage | Usurper's Bladefish | Regicide Bladefish | Hall of the Broken Crown |
| 24 | 46 | Oathchain Dungeons | Oathchain Serpent | High Gaoler Serpent | Chain-Oath Pit |
| 25 | 47 | The Forgotten Prince's Wing | Forgotten Prince Revenant | Unremembered Heir | Nameless Nursery Throne |
| 26 | 47 | The Queen's Tear | Queen's Tear Elemental | Sorrow-Tide Queen | Lamentation Basin |
| 27 | 48 | The Seven Royal Seals | Royal Seal Construct | Covenant Engine | Sealheart Chamber |
| 28 | 49 | The Council in Silence | Drowned Councilor | First Minister Revenant | Submerged Council Ring |
| 29 | 49 | Thronebound Causeway | Thronebound Colossus | Kingdom's Last Colossus | Crownward Colonnade |
| 30 | 50 | The Crown Compact Embassy | Crown Compact Grunt | Crown Compact Officer | Treaty Command Hall |

Distribution: Level 30: 1; Level 31: 2; Level 32: 1; Level 33: 2; Level 34: 1; Level 35: 1; Level 36: 2; Level 37: 1; Level 38: 2; Level 39: 1; Level 40: 2; Level 41: 1; Level 42: 2; Level 43: 1; Level 44: 2; Level 45: 1; Level 46: 1; Level 47: 2; Level 48: 1; Level 49: 2; Level 50: 1.

### Astral Nexus

| # | Level | Adventure | Normal enemy | Boss | Boss chamber |
|---:|---:|---|---|---|---|
| 1 | 50 | The Paradox Shoal | Paradox Minnow | Contradiction Leviathan | Pool of Opposite Tides |
| 2 | 50 | Impossible Angles | Geometry Eel | Euclidean Coilbreaker | The Unclosed Triangle |
| 3 | 50 | Memoryglass Strand | Memoryglass Crab | Recollection Clawlord | Beach of Borrowed Yesterdays |
| 4 | 50 | Portal-Skip Expanse | Portal-Skipping Ray | Horizonfold Ray | Many-Exit Vault |
| 5 | 50 | Clocktide Drift | Clocktide Jelly | Hourless Medusa | Still Second Chamber |
| 6 | 50 | Fractured Ocean | Fracturefin Shark | Reality-Bite Apex | Splitwater Arena |
| 7 | 50 | Dream-Anchor Mooring | Dream-Anchor Turtle | Waking Anchorback | Harbor of Unmoored Sleep |
| 8 | 50 | Stars Beneath the Water | Starbelow Angler | Under-Sun Angler | Inverted Firmament |
| 9 | 50 | The Fae Axis | Fae Axis Sentinel | Axis Prime Sentinel | Crossroads of Silver Law |
| 10 | 50 | Hall of Other Selves | Echo-of-Self Mimic | Unchosen Reflection | Mirror of Abandoned Paths |
| 11 | 50 | Stormscript Tempest | Stormscript Squid | Living Equation Krakenet | Formula of Thunder |
| 12 | 50 | Portalroot Network | Portalroot Serpent | Gate-Root Serpent | Worldtree Junction |
| 13 | 50 | Walking Constellations | Constellation Automaton | Zodiac Engine | Mechanical Zodiac |
| 14 | 50 | The Returning Yesterday | Yesterday's Revenant | Tomorrow's Ancestor | Chronology Crypt |
| 15 | 50 | Voidflower Garden | Voidflower Mantis | Nothing-Bloom Mantis | Garden Outside Space |
| 16 | 50 | Convergent Currents | Nexus Current Elemental | Sixfold Tideheart | Confluence Core |
| 17 | 50 | Thoughtform Maze | Thoughtform Prowler | Fear-Made Huntress | Unspoken Labyrinth |
| 18 | 50 | Astral Storm Islands | Astral Storm Roc | Firmament Roc | Eye of the Drowned Sky |
| 19 | 50 | Phaseclaw Causeway | Phaseclaw Lobster | Between-State Clawlord | Half-Real Arena |
| 20 | 50 | The Memory Reef | Memory Reef Warden | Archive-Reef Sovereign | Living Remembrance |
| 21 | 50 | Gravity Choir | Gravity Choir Siren | Singularity Cantor | Mass-Song Amphitheater |
| 22 | 50 | Foldspace Spiral | Foldspace Nautilus | Infinite-Chamber Nautilus | Room Within Its Shell |
| 23 | 50 | The Unbuilding Ruins | Fae Ruin Architect | Last Architect Construct | Blueprint of Vanishing Stone |
| 24 | 50 | Eventide Threshold | Eventide Behemoth | Endless Dusk Behemoth | Boundary Without Dawn |
| 25 | 50 | Portal Graveyard | Portal Grave Scavenger | Dead-Gate Collector | Sepulcher of Exits |
| 26 | 50 | The Gnawed Timeline | Timeline Eater | Epoch Devourer | Missing Century |
| 27 | 50 | Nexus Crown Array | Nexus Crown Construct | Convergence Monarch | Crown of Six Currents |
| 28 | 50 | The First-Light Memory | First-Light Remnant | Dawn Before the Sea | Origin Reflection |
| 29 | 50 | Convergence Threshold | Astral Convergence Warden | Nexus Prime Warden | Heart-Crossing Seal |
| 30 | 50 | The Continuance Core | Nexus Continuance Grunt | Nexus Continuance Officer | Central Continuance Command |

Distribution: Level 50: 30.

## Adventure 30 lore escalation

- Starfall Trench confirms Moonlit Lab belonged to a wider annex network.
- Whispering Kelp Forest shows successor teams searched for escaped experiments, without proving recapture.
- Leviathan's Wake reveals later weaponization research involving leviathan-class creatures.
- Sunken King's Throne reveals research-and-enforcement treaties with ancient royal powers.
- Astral Nexus links the annexes and Subject Seven to a century-spanning objective while preserving the central mysteries.

## Validation

- Five new manifests: exactly 30 ordered, gapless, unique entries each.
- Five new normal-enemy indexes: exactly 30 ordered non-boss entries each.
- All Adventure normal/boss references resolve; no cross-region duplicate IDs.
- Every new Adventure has three unnamed intermediate passages, nine choices, exactly 3 combat / 3 treasure / 2 healing / 1 Shizuki outcome, and one named boss chamber.
- Boss prompts conceal identity; reveal text names the boss only after confirmation. `/no` uses the unchanged checkpoint-preserving runtime path.
- Adventure 30 completion cannot unlock Adventure 31 under the unchanged capped progression helper.
- Long Rest remains at 50% and reads each region normal index; bosses are excluded by `isBoss`.
- All 562 JSON files parse successfully. Totals: 180 Adventures, 180 normal enemies, 180 bosses.
- Static Worker delimiter counts pass. Executable JavaScript validation was unavailable because no JavaScript runtime is installed.
- No deployment, command registration, Git operation, or remote Cloudflare action was performed.
