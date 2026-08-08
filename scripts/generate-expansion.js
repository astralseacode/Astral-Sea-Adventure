const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const regions = [
  {
    id: "starfall-trench", name: "Starfall Trench", levels: [5, 10],
    enemies: [
      ["Starstone Lanternfish","Lanterns Below the Falling Sky","Meteor-Lure Angler","Fallen Lantern Basin"],
      ["Craterback Isopod","Craterback Descent","Craterback Matriarch","Impact-Shell Hollow"],
      ["Cometglass Shrimp","Cometglass Shardbeds","Shardclaw Colossus","Prismfall Scar"],
      ["Gravity-Skipping Ray","The Weightless Ravine","Orbitbreaker Ray","Zero-Tide Vault"],
      ["Emberstar Urchin","Emberstar Ventfield","Cinder-Crown Urchin","Ashen Constellation"],
      ["Nightshard Moray","Nightshard Fissures","Eclipse-Jaw Moray","Blackglass Maw"],
      ["Meteor Hermit","The Wandering Craters","Crater-Throne Hermit","Pilgrim's Impact"],
      ["Starlit Viperfish","Starlit Hunting Dark","Nova-Fang Viperfish","Gleaming Abyss"],
      ["Cosmic Vent Crab","Cosmic Ventworks","Superheated Ventlord","Forge of Blue Fire"],
      ["Shardwake Eel","Shardwake Channels","Riftcoil Eel","Splintercurrent Ring"],
      ["Deep-Orbit Nautilus","Deep-Orbit Spiral","Periapsis Nautilus","Celestial Coil"],
      ["Starstone Golem","Ruins of the Starstone Golem","Meteorheart Golem","Ruined Firmament"],
      ["Voidcurrent Skate","Voidcurrent Crossing","Eventide Skate","Currentless Expanse"],
      ["Crystalfang Snapper","Crystalfang Galleries","Diamond-Maw Snapper","Crystal Bite"],
      ["Falling-Light Medusa","Falling-Light Drift","Starshower Medusa","Rain of Silent Suns"],
      ["Astral Silt Stalker","Astral Silt Labyrinth","Siltveil Ambusher","Buried Starlight Court"],
      ["Meteor-Marked Lobster","Meteor-Marked Shelf","Impactclaw Tyrant","Craterclaw Arena"],
      ["Trench Aurora Wisp","Aurora Under the Trench","Polar-Flare Wisp","Curtain of the Deep"],
      ["Broken-Orbit Sentinel","The Broken-Orbit Ruins","Aphelion Sentinel","Shattered Orrery"],
      ["Star-Eater Slug","Star-Eater Grooves","Constellation Devourer","Gnawed Heavens"],
      ["Nebula Ink Squid","Nebula Ink Reaches","Cloudveil Krakenet","Violet Stormwell"],
      ["Comet-Tail Barracuda","Comet-Tail Run","Perseid Barracuda","The Blazing Course"],
      ["Gravitic Stonefish","Gravitic Deadfall","Masskeeper Stonefish","Heavywater Pit"],
      ["Celestial Ruin Walker","Celestial Ruin March","Firmament Warden","Temple of the Fallen Arc"],
      ["Darkstar Anemone","Darkstar Bloomfield","Umbra Bloom Sovereign","Sunless Corolla"],
      ["Meteorbone Prowler","Meteorbone Gravepath","Star-Skull Prowler","Ossuary of Impacts"],
      ["Riftlight Serpent","Riftlight Fault","Fault-Crowned Serpent","Radiant Fracture"],
      ["Trenchstar Behemoth","Trenchstar Depths","Abyssal Star Behemoth","Bedrock Constellation"],
      ["Celestial Core Keeper","The Buried Celestial Engine","Corewake Custodian","Engine of the Deep Sky"],
      ["Starfall Annex Grunt","The Starfall Annex","Starfall Annex Officer","Meteor Archive Command"],
    ],
    prompt: ["fractured starstone terraces", "meteor-lit trenches", "gravity-bent celestial ruins"],
    treasure: ["a sealed meteor-iron reliquary", "candies fused into a comet-glass seam", "a star chart coffer buried in luminous silt"],
    heal: ["warm light leaking from a dormant cosmic vent", "a pool calmed by orbiting star fragments"],
    lore: "Surviving records confirm that Moonlit Lab was only one annex in a network spanning the Astral Sea.",
  },
  {
    id: "whispering-kelp-forest", name: "Whispering Kelp Forest", levels: [10, 20],
    enemies: [
      ["Murmurleaf Minnow","Murmurleaf Paths","Chorus-Fin Schoolmother","Choirleaf Clearing"],
      ["Lanternvine Crab","Lanternvine Tangle","Glowroot Clawlord","Luminous Root Knot"],
      ["Whispercap Snail","Whispercap Hollows","Oracle-Shell Snail","Listening Mushroom Ring"],
      ["Veilpetal Ray","Veilpetal Glade","Veilpetal Grandwing","Curtained Moon Grove"],
      ["Rootcoil Eel","Rootcoil Channels","Elder Rootcoil","Heartroot Spiral"],
      ["Dewbell Jelly","Dewbell Canopy","Midnight Bell Medusa","Chiming Bower"],
      ["Briarfin Prowler","Briarfin Thickets","Thornwake Huntress","Briar Moon Den"],
      ["Hushwater Stagfish","Hushwater Trails","Crown-Antler Stagfish","Silent Hart Shrine"],
      ["Fae-Lure Angler","Fae-Lure Lanterns","Glamourmaw Angler","False-Light Chapel"],
      ["Mosscloak Octopus","Mosscloak Maze","Ancient Mosscloak","Green Masquerade"],
      ["Singing Vine Serpent","The Singing Vines","Canticle Serpent","Resonant Arbor"],
      ["Moonblossom Mantis","Moonblossom Garden","Lunar Petal Mantis","Silver Bloom Court"],
      ["Gossipcurrent Sprite","Gossipcurrent Forks","Rumor-Tide Sprite","Whisperwell"],
      ["Camouflage Grouper","The Vanishing Grove","Unseen Grovejaw","Mirror-Moss Hollow"],
      ["Shrinebark Guardian","Shrinebark Pilgrimage","First-Root Guardian","Old Bark Sanctuary"],
      ["Predatory Starflower","Starflower Hunting Beds","Devouring Starflower","Pollenmoon Pit"],
      ["Dreamsap Leech","Dreamsap Pools","Nightmare Sapmother","Sleeping Rootwell"],
      ["Kelpweave Spider","Kelpweave Galleries","Grand Loom Spider","Tide-Silk Rotunda"],
      ["Willowcurrent Nymph","Willowcurrent Bend","Weeping Current Nymph","Drowned Willow Shrine"],
      ["Bramblejaw Turtle","Bramblejaw Understory","Thicket-Shell Ancient","Thorned Shell Court"],
      ["Echo-Bark Woodfish","Echo-Bark Trunks","Resonant Timberfish","Hollow Song Chamber"],
      ["Moonmoth Nudibranch","Moonmoth Drift","Pale-Wing Moonmoth","Dustlight Bower"],
      ["Rootbound Effigy","Rootbound Shrine","Greenwood Idol","Knot of Old Oaths"],
      ["Sighing Reed Hunter","Sighing Reed Marsh","Reed-Crowned Hunter","Breathless Fen"],
      ["Glimmerpod Beetle","Glimmerpod Nursery","Radiant Podqueen","Emerald Nursery"],
      ["Ancient Grove Mimic","The Borrowed Grove","Many-Faced Grove Mimic","Imitation Heartwood"],
      ["Thornsong Siren","Thornsong Vale","Briar-Chorus Siren","Rose-Tide Amphitheater"],
      ["Whisperroot Colossus","Whisperroot Deeps","Forest-Heart Colossus","Primeval Root Cathedral"],
      ["Memory-Kelp Oracle","The Forest Remembers","Keeper of Green Memories","Recollection Grove"],
      ["Verdant Pursuit Grunt","The Verdant Pursuit Station","Verdant Pursuit Officer","Overgrown Search Command"],
    ],
    prompt: ["towering kelp columns threaded with murmuring currents", "living rootways beneath drifting fae lights", "moonlit fronds curling around forgotten shrines"],
    treasure: ["an offering basket hidden inside a living root", "candies wrapped in broad silver kelp", "a shrine coffer covered by harmless moss"],
    heal: ["restorative sap gathered in a folded leaf", "a tranquil grove pool scented with moonblossom"],
    lore: "Search ledgers show that successor teams hunted escaped experiments after the rebellion, but contain no record of Shizuki's recapture.",
  },
  {
    id: "leviathans-wake", name: "Leviathan's Wake", levels: [20, 30],
    enemies: [
      ["Wake-Riding Razorfish","Wake-Rider Crossing","Breaker-Fin Alpha","Whitewater Saddle"],
      ["Titanbone Crab","Titanbone Ribs","Ossuary Clawking","Colossal Ribcage"],
      ["Pressurejaw Eel","Pressurejaw Drop","Crushdepth Coil","Compression Vault"],
      ["Scale-Shelter Hermit","Scale-Shelter Wrecks","Titan-Scale Hermit","Armored Drift"],
      ["Currentbreaker Shark","Currentbreaker Run","Maelstrom Apex","Breaker Crown"],
      ["Bonegarden Urchin","Bonegarden Spines","Marrow-Crown Urchin","Ivory Thornfield"],
      ["Hullsplitter Lobster","Hullsplitter Graveyard","Dreadclaw Hullsplitter","Keelbreak Arena"],
      ["Wakefoam Medusa","Wakefoam Tempest","Stormbell Medusa","Foaming Thunderwell"],
      ["Deep-Scar Prowler","Deep-Scar Ravine","Scar-Marked Huntmaster","Ancient Wound"],
      ["Leviathan Scale Golem","The Walking Scale","Scale-Forged Colossus","Titanplate Foundry"],
      ["Riptide Hammerhead","Riptide Gauntlet","Breakerhead Patriarch","Hammer Current"],
      ["Wrecknest Moray","Wrecknest Passage","Keeljaw Moray","Crushed Fleet Nest"],
      ["Tectonic Barnacle","Tectonic Shelf","Quake-Crown Barnacle","Moving Bedrock"],
      ["Roarcurrent Siren","Roarcurrent Gorge","Tempest-Voice Siren","Howling Scar"],
      ["Abysslung Manta","Abysslung Expanse","Gravewing Manta","Voidspan"],
      ["Marrowlight Angler","Marrowlight Ossuary","Bone-Lantern Angler","Lit Skull Chapel"],
      ["Titanwake Crocodile","Titanwake Delta","Wakejaw Ancient","Flooded Fangbank"],
      ["Pressure Bloom Anemone","Pressure Bloom Shelf","Crushpetal Sovereign","Compressed Garden"],
      ["Shipgrave Scuttler","Shipgrave Maze","Fleet-Eater Scuttler","Admiral's Ruin"],
      ["Scarfin Barracuda","Scarfin Torrent","Rendwake Barracuda","Bloodless Rapids"],
      ["Colossus Remora","Colossus Trail","Titanbound Remora","Pilgrim Scale"],
      ["Thunderwake Squid","Thunderwake Storm","Storm-Ink Architeuthis","Electric Gyre"],
      ["Ancient Tooth Sentinel","The Fallen Fang","First-Tooth Sentinel","Fang of Ages"],
      ["Trench-Rending Worm","Riven Trench","Worldscar Worm","Split-Sea Chasm"],
      ["Leviathan Song Echo","The Last Leviathan Song","Primordial Voice","Resonance Grave"],
      ["Bone-Crown Behemoth","Bone-Crown March","Ossuary Behemoth","Crowned Skeleton Deep"],
      ["Wakeheart Elemental","Wakeheart Vortex","Heart of the Wake","Endless Current Core"],
      ["Titan-Scar Guardian","Titan-Scar Threshold","Scarbound Warden","Leviathan Seal"],
      ["Primeval Scale Revenant","The Scale That Remembers","Firstwake Revenant","Memory of the Colossus"],
      ["Behemoth Program Grunt","The Behemoth Program Hold","Behemoth Program Officer","Weaponization Command"],
    ],
    prompt: ["titanic ribs rising through violent crosscurrents", "pressure-scarred trenches beside wrecked hulls", "immense scales embedded in unstable coral shelves"],
    treasure: ["a strongbox torn from a century-old wreck", "candies trapped beneath a leviathan scale", "a pressure-sealed navigator's chest"],
    heal: ["a calm pocket sheltered by a colossal rib", "mineral-rich water rising through a titan scar"],
    lore: "Weapon logs reveal that the organization studied, altered, and attempted to direct leviathan-class creatures for later experiments.",
  },
  {
    id: "sunken-kings-throne", name: "Sunken King's Throne", levels: [30, 50],
    enemies: [
      ["Drowned Banner Guard","The Fallen Banner Way","Standard-Bearer Revenant","Hall of Torn Colors"],
      ["Crowncoin Mimic","Crowncoin Vaults","Royal Treasury Maw","Gilded Hunger"],
      ["Palace Lamprey","Palace Aqueducts","Crimson Court Lamprey","Royal Bloodwell"],
      ["Sealbound Squire","Sealbound Galleries","Oath-Sealed Knight","Gallery of Vows"],
      ["Mourning Courtesan","The Mourning Promenade","Last-Dance Courtesan","Ballroom Beneath the Tide"],
      ["Scepter Crab","Scepter Gardens","Regalia Clawlord","Scepter Conservatory"],
      ["Crownless Knight","Crownless Barracks","Helmless Castellan","Empty Helm Hall"],
      ["Royal Archive Wisp","The Drowned Archive","Grand Archivist Wisp","Scriptorium of Bubbles"],
      ["Thronewater Eel","Thronewater Conduits","Regent Coil","Sovereign Cistern"],
      ["Gilded Armorfish","Gilded Processional","Auric Platefish","Golden Review Court"],
      ["Sepulcher Manta","Sepulcher Cloisters","Funeral-Wing Manta","Royal Crypt Nave"],
      ["Broken Statue Walker","The Walking Statuary","Marble Tyrant","Sculptor's Tribunal"],
      ["Dynasty Coral Golem","Dynasty Coral Halls","Ancestral Reef Golem","Lineage Rotunda"],
      ["Chalice Jelly","Chalice Chapel","Sacramental Medusa","Sunken Communion"],
      ["Taxkeeper Octopus","Taxkeeper Offices","Exchequer Krakenet","Treasury Reckoning"],
      ["Regal Fang Moray","Regal Fang Canal","Crown-Fang Moray","King's Hunting Canal"],
      ["Haunted Herald","The Silent Heraldry","Last Royal Herald","Proclamation Hall"],
      ["Sealbreaker Lobster","Sealbreaker Vault","Grand Sealbreaker","Forbidden Reliquary"],
      ["Drowned Duelist","Drowned Lists","Champion of the Last Court","Tidal Tournament Floor"],
      ["Crownshadow Stalker","Crownshadow Arcade","Umbral Chamberlain","Shadowed Audience"],
      ["Royal Menagerie Beast","The Ruined Menagerie","King's Chimera","Menagerie Crown Cage"],
      ["Pearl-Throne Sentinel","Pearl-Throne Approach","Mother-of-Pearl Warden","Pearlescent Gate"],
      ["Usurper's Bladefish","The Usurper's Passage","Regicide Bladefish","Hall of the Broken Crown"],
      ["Oathchain Serpent","Oathchain Dungeons","High Gaoler Serpent","Chain-Oath Pit"],
      ["Forgotten Prince Revenant","The Forgotten Prince's Wing","Unremembered Heir","Nameless Nursery Throne"],
      ["Queen's Tear Elemental","The Queen's Tear","Sorrow-Tide Queen","Lamentation Basin"],
      ["Royal Seal Construct","The Seven Royal Seals","Covenant Engine","Sealheart Chamber"],
      ["Drowned Councilor","The Council in Silence","First Minister Revenant","Submerged Council Ring"],
      ["Thronebound Colossus","Thronebound Causeway","Kingdom's Last Colossus","Crownward Colonnade"],
      ["Crown Compact Grunt","The Crown Compact Embassy","Crown Compact Officer","Treaty Command Hall"],
    ],
    prompt: ["drowned palace colonnades guarded by broken royal seals", "haunted halls beneath drifting banners", "flooded courtyards lined with watchful stone nobility"],
    treasure: ["a modest coffer overlooked by the ruined treasury", "candies sealed inside a ceremonial chalice", "a guard stipend locked beneath fallen heraldry"],
    heal: ["clear water lingering in a consecrated font", "restorative royal salts stored in an intact cabinet"],
    lore: "Treaties and sealed correspondence show that the organization traded research and enforcement to ancient royal powers, though neither side appears to have trusted the other.",
  },
  {
    id: "astral-nexus", name: "Astral Nexus", levels: [50, 50],
    enemies: [
      ["Paradox Minnow","The Paradox Shoal","Contradiction Leviathan","Pool of Opposite Tides"],
      ["Geometry Eel","Impossible Angles","Euclidean Coilbreaker","The Unclosed Triangle"],
      ["Memoryglass Crab","Memoryglass Strand","Recollection Clawlord","Beach of Borrowed Yesterdays"],
      ["Portal-Skipping Ray","Portal-Skip Expanse","Horizonfold Ray","Many-Exit Vault"],
      ["Clocktide Jelly","Clocktide Drift","Hourless Medusa","Still Second Chamber"],
      ["Fracturefin Shark","Fractured Ocean","Reality-Bite Apex","Splitwater Arena"],
      ["Dream-Anchor Turtle","Dream-Anchor Mooring","Waking Anchorback","Harbor of Unmoored Sleep"],
      ["Starbelow Angler","Stars Beneath the Water","Under-Sun Angler","Inverted Firmament"],
      ["Fae Axis Sentinel","The Fae Axis","Axis Prime Sentinel","Crossroads of Silver Law"],
      ["Echo-of-Self Mimic","Hall of Other Selves","Unchosen Reflection","Mirror of Abandoned Paths"],
      ["Stormscript Squid","Stormscript Tempest","Living Equation Krakenet","Formula of Thunder"],
      ["Portalroot Serpent","Portalroot Network","Gate-Root Serpent","Worldtree Junction"],
      ["Constellation Automaton","Walking Constellations","Zodiac Engine","Mechanical Zodiac"],
      ["Yesterday's Revenant","The Returning Yesterday","Tomorrow's Ancestor","Chronology Crypt"],
      ["Voidflower Mantis","Voidflower Garden","Nothing-Bloom Mantis","Garden Outside Space"],
      ["Nexus Current Elemental","Convergent Currents","Sixfold Tideheart","Confluence Core"],
      ["Thoughtform Prowler","Thoughtform Maze","Fear-Made Huntress","Unspoken Labyrinth"],
      ["Astral Storm Roc","Astral Storm Islands","Firmament Roc","Eye of the Drowned Sky"],
      ["Phaseclaw Lobster","Phaseclaw Causeway","Between-State Clawlord","Half-Real Arena"],
      ["Memory Reef Warden","The Memory Reef","Archive-Reef Sovereign","Living Remembrance"],
      ["Gravity Choir Siren","Gravity Choir","Singularity Cantor","Mass-Song Amphitheater"],
      ["Foldspace Nautilus","Foldspace Spiral","Infinite-Chamber Nautilus","Room Within Its Shell"],
      ["Fae Ruin Architect","The Unbuilding Ruins","Last Architect Construct","Blueprint of Vanishing Stone"],
      ["Eventide Behemoth","Eventide Threshold","Endless Dusk Behemoth","Boundary Without Dawn"],
      ["Portal Grave Scavenger","Portal Graveyard","Dead-Gate Collector","Sepulcher of Exits"],
      ["Timeline Eater","The Gnawed Timeline","Epoch Devourer","Missing Century"],
      ["Nexus Crown Construct","Nexus Crown Array","Convergence Monarch","Crown of Six Currents"],
      ["First-Light Remnant","The First-Light Memory","Dawn Before the Sea","Origin Reflection"],
      ["Astral Convergence Warden","Convergence Threshold","Nexus Prime Warden","Heart-Crossing Seal"],
      ["Nexus Continuance Grunt","The Continuance Core","Nexus Continuance Officer","Central Continuance Command"],
    ],
    prompt: ["floating ocean fragments joined by impossible currents", "fae arches opening onto incompatible skies", "fractured realities where memories cast physical shadows"],
    treasure: ["a coffer arriving repeatedly from three different futures", "candies orbiting a stable point in folded space", "a construct cache labeled in an alphabet you briefly remember"],
    heal: ["a still moment where several restorative currents converge", "a memory of perfect rest made briefly tangible"],
    lore: "The Continuance Core links every annex to a century-spanning objective and identifies Subject Seven as uniquely viable, but its missing records still conceal who named Shizuki, why she survived, and what the final objective was.",
  },
];

const slug = (s) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const lerp = (a, b, i) => Math.round(a + (b - a) * i / 29);
const levelAt = (region, i) => region.levels[0] === region.levels[1] ? region.levels[0] : Math.round(region.levels[0] + (region.levels[1] - region.levels[0]) * i / 29);
const scaling = {
  "starfall-trench": [150,220,6,8,210,360,480,720,55,260,340,9,11,360,560,750,1050,90,95,145,45,60],
  "whispering-kelp-forest": [215,285,8,10,340,500,700,950,80,325,410,11,13,520,760,1000,1400,120,130,200,55,72],
  "leviathans-wake": [280,350,10,12,480,680,900,1250,110,400,485,13,15,720,1000,1350,1800,155,175,265,68,88],
  "sunken-kings-throne": [345,430,12,14,650,920,1200,1650,145,475,570,15,18,980,1350,1750,2350,200,230,350,85,110],
  "astral-nexus": [425,510,14,18,900,1300,1600,2300,190,565,680,18,22,1350,1850,2300,3200,260,300,450,105,135],
};
const layouts = [
  [["combat","treasure","healing"],["treasure","combat","empty"],["healing","treasure","combat"]],
  [["treasure","healing","combat"],["combat","empty","treasure"],["treasure","combat","healing"]],
  [["healing","combat","treasure"],["empty","treasure","combat"],["combat","healing","treasure"]],
  [["combat","empty","treasure"],["healing","combat","treasure"],["treasure","healing","combat"]],
  [["treasure","combat","healing"],["combat","treasure","empty"],["healing","combat","treasure"]],
  [["empty","treasure","combat"],["combat","healing","treasure"],["treasure","combat","healing"]],
];

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

for (const region of regions) {
  const manifest = [];
  const index = [];
  const s = scaling[region.id];
  region.enemies.forEach(([enemyName, adventureName, bossName, chamber], i) => {
    const number = i + 1;
    const enemyId = slug(enemyName);
    const bossId = `${slug(bossName)}-boss`;
    const adventureId = slug(adventureName);
    const level = levelAt(region, i);
    const normal = {
      id: enemyId, name: enemyName, region: region.id, level,
      hp: lerp(s[0],s[1],i), damageBonus: lerp(s[2],s[3],i), isBoss: false,
      reward: { candies: { min: lerp(s[4],s[5],i), max: lerp(s[6],s[7],i) }, xp: { min: lerp(s[4],s[5],i), max: lerp(s[4]+70,s[5]+100,i) } },
      defeatCandyLoss: lerp(s[8],s[8]+45,i),
    };
    const bossCandyMin = lerp(s[15],s[16],i);
    const boss = {
      id: bossId, name: bossName, region: region.id, level,
      hp: lerp(s[9],s[10],i), damageBonus: lerp(s[11],s[12],i), isBoss: true,
      reward: { candies: { min: bossCandyMin, max: Math.round(bossCandyMin * 1.4) }, xp: { min: lerp(s[13],s[14],i), max: lerp(s[14],s[14]+220,i) } },
      defeatCandyLoss: lerp(s[18],s[18]+70,i),
    };
    writeJson(path.join(root,"data","enemies",`${enemyId}.json`), normal);
    writeJson(path.join(root,"data","enemies","bosses",region.id,`${bossId}.json`), boss);
    index.push({ encounter: number, enemy: enemyId, recommendedLevel: level });
    const roomIds = [`${adventureId}-approach`,`${adventureId}-depths`,`${adventureId}-threshold`];
    const rooms = {};
    let treasureN = 0, healN = 0;
    const layout = layouts[i % layouts.length];
    for (let stage = 0; stage < 3; stage++) {
      const choices = {};
      ["left","right","forward"].forEach((direction, d) => {
        const type = layout[stage][d];
        const nextRoomId = stage === 2 ? "boss-antechamber" : roomIds[stage+1];
        if (type === "combat") choices[direction] = { type, nextRoomId, enemyId, message: `A shift in the current exposes ${enemyName}, which claims the ${direction} route through ${adventureName}.` };
        if (type === "treasure") { const n=treasureN++; const baseMin=lerp(s[19],s[20],i)+n*12; choices[direction]={type,nextRoomId,message:`Beyond the ${direction} route, you discover ${region.treasure[(i+n)%3]}.`,reward:{min:baseMin,max:baseMin+35+Math.floor(i/3)}}; }
        if (type === "healing") { const n=healN++; const amount=lerp(s[21],s[22],i)+n*5; choices[direction]={type,nextRoomId,healAmount:amount,message:`The ${direction} route reaches ${region.heal[(i+n)%2]}, restoring your strength.`,fullHpMessage:`The restorative refuge along the ${direction} route remains peaceful; you need no healing, but the discovery still teaches you something.`}; }
        if (type === "empty") choices[direction]={type,nextRoomId,message:number===30?`A berry cache sits beneath a terminal Shizuki renamed "Definitely_Not_Shizuki_${region.id}.txt." Its note reads: "If you're reading this, their dramatic security system lost again. You're welcome."`:`You find one of Shizuki's old trail caches beside a doodled map of ${adventureName}. A note says: "If you're reading this, the sensible route was probably somewhere else. This one has a Berry, though. You've got this."`,berries:1};
      });
      rooms[roomIds[stage]]={prompt:`${stage===0?"At the edge of":stage===1?"Deeper within":"Near the heart of"} ${adventureName}, ${region.prompt[(i+stage)%3]} divide into three uncertain routes.`,choices};
    }
    rooms["boss-antechamber"]={name:chamber,type:"boss-prompt",prompt:`A powerful guardian disturbs the water beyond the final threshold of ${chamber}.`};
    const final = number === 30;
    const adventure = {
      id: adventureId, number, name: adventureName, regionId: region.id, enemyId, recommendedLevel: level,
      introDiscord:`${adventureName} lies ahead, where ${region.prompt[i%3]} conceal the territory of ${enemyName}.`,
      introTwitch:`${adventureName} lies ahead amid ${region.prompt[i%3]}.`,
      startRoomId:roomIds[0], rooms,
      bossPromptDiscord:`You enter ${chamber}. ${final?"A uniformed figure bearing an old institutional rank waits beyond a sealed command dais.":"A vast silhouette moves behind the chamber's last veil."}\n\nA powerful guardian blocks the way. Its identity remains concealed.\nUse /yes to continue or /no to retreat for now.`,
      bossPromptTwitch:`${chamber}: A concealed guardian blocks the way. Use !yes to continue or !no to retreat.`,
      bossRetreatText:`You withdraw from ${chamber}. The hidden guardian remains beyond the threshold.`,
      boss:{enemyId:bossId,roomId:"boss",revealText:`The chamber's veil breaks. ${bossName} reveals itself!`},
      completionText:final?`${bossName} falls, exposing preserved records among later additions defaced with Shizuki's cheerful graffiti. ${region.lore} Shizuki's newest annotation reads: "Came back on my own. Added mustache. Left whenever I wanted." All 30 Adventures in ${region.name} are complete.`:`${bossName} yields, and the currents beyond ${chamber} open the next route through ${region.name}.`,
    };
    const file=`adventure-${String(number).padStart(2,"0")}-${adventureId}.json`;
    writeJson(path.join(root,"data","adventures",region.id,file), adventure);
    manifest.push({number,id:adventureId,name:adventureName,enemyId,bossEnemyId:bossId,file});
  });
  writeJson(path.join(root,"data","adventures",region.id,"manifest.json"),manifest);
  writeJson(path.join(root,"data","enemies",`${region.id}.json`),index);
}

console.log(`Generated ${regions.length * 30} Adventures, normal enemies, and bosses.`);
